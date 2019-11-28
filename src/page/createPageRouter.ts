import { Router } from 'express'
import path from 'path'
import fs from 'fs'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import createApp, {
  HistoryLocation,
  Context,
  LoadController,
  ControllerConstructor,
  Route,
  ViewEngineRender
} from 'create-app/server'
import { getFlatList, getClearFilePath, str2ab } from '../util'
import {
  EntireConfig,
  AppSettings,
  Req
} from '..'
import Controller from '../controller'

function getModule(module: any) {
  return module.default || module
}
function commonjsLoader(
  controller: LoadController,
  location?: HistoryLocation,
  context?: Context
): ControllerConstructor | Promise<ControllerConstructor> {
  return (
    controller(
      location,
      context
    ) as Promise<ControllerConstructor>
  ).then(getModule)
}

/**
 * controller 里会劫持 React.createElement
 * server side 场景缺乏恢复机制
 * 因此在这里特殊处理，在渲染完后，恢复 React.createElement
 */
const createElement = React.createElement

function renderToNodeStream(
  view: React.ReactElement | string | undefined | null,
  controller?: Controller<any, any>
): Promise<ArrayBuffer> {
  if (typeof view === 'string') {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      resolve(str2ab(view))
    })
  }
  if (view === undefined || view === null) {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      resolve(str2ab(''))
    })
  }

  return new Promise<ArrayBuffer>((resolve, reject) => {
    let stream = ReactDOMServer.renderToNodeStream(view)
    let buffers: Uint8Array[] = []
    stream.on('data', chunk => buffers.push(chunk))
    stream.on('end', () => {
      React.createElement = createElement
      resolve(Buffer.concat(buffers))
    })
    stream.on('error', error => {
      if (!controller) {
        React.createElement = createElement
        return reject(error)
      }

      if (controller.errorDidCatch) {
        controller.errorDidCatch(error, 'view')
      }

      if (controller.getViewFallback) {
        let fallbackView = controller.getViewFallback('view')
        renderToNodeStream(fallbackView).then(resolve, reject)
      } else {
        React.createElement = createElement
        reject(error)
      }
    })
  })
}

function renderToString(
  view: React.ReactElement | string | undefined | null,
  controller?: Controller<any, any>
): string {
  if (typeof view === 'string') {
    return view
  }
  if (view === undefined || view === null) {
    return ''
  }

  try {
    return ReactDOMServer.renderToString(view)
  } catch (error) {
    if (!controller) throw error

    if (controller.errorDidCatch) {
      controller.errorDidCatch(error, 'view')
    }

    if (controller.getViewFallback) {
      let fallbackView = controller.getViewFallback()
      return renderToString(fallbackView)
    } else {
      throw error
    }
  } finally {
    React.createElement = createElement
  }
}

const renderers = {
  renderToNodeStream,
  renderToString
}

function getRightPath(filePath: string): string {
  const extensions = ['js', 'jsx', 'ts', 'tsx']
  let finalFilePath: string = filePath
  let clearFilePath = getClearFilePath(filePath, extensions)

  extensions.some((ets) => {
    if (fs.existsSync(`${clearFilePath}.${ets}`)) {
      finalFilePath = `${clearFilePath}.${ets}`
      return true
    }
    return false
  })

  return finalFilePath
}

export default function createPageRouter(options: EntireConfig) {
  let config = Object.assign({}, options)
  let routes: Route[] = []

  if (config.useServerBundle) {
    routes = require(path.join(config.root, config.serverBundleName))
  } else {
    routes = require(path.join(config.root, config.src))
  }

  if (!Array.isArray(routes)) {
    routes = Object.values(routes)
  }
  routes = getFlatList(routes)

  let router = Router()
  let render: ViewEngineRender<React.ReactElement, Controller<any, any>>
    = renderers[config.renderMode] || renderToNodeStream
  let serverAppSettings: AppSettings = {
    loader: commonjsLoader,
    routes: routes,
    viewEngine: { render },
    context: {
      isClient: false,
      isServer: true
    }
  }
  let app = createApp(serverAppSettings)
  let layoutView = config.layout
    ? getRightPath(path.resolve(config.root, config.routes, config.layout)) 
    : path.join(__dirname, 'view')

  // 纯浏览器端渲染模式，用前置中间件拦截所有请求
  if (config.SSR === false) {
    router.all('*', (req, res) => {
      res.render(layoutView)
    })
  } else if (config.NODE_ENV === 'development') {
    // 带服务端渲染模式的开发环境，需要动态编译 src/routes
    let setupDevEnv = require('../build/setup-dev-env')
    setupDevEnv.setupServer(config, {
      handleHotModule: ($routes: any[] | object) => {
        const routes = getFlatList(
          Array.isArray($routes) ? $routes : Object.values($routes)
        )
        app = createApp({
          ...serverAppSettings,
          routes
        })
      }
    })
  }

  // handle page
  router.all('*', async (req: Req, res, next) => {
    let { basename, serverPublicPath, publicPath } = req
    let context = {
      basename,
      serverPublicPath,
      publicPath,
      restapi: config.serverRestapi || config.restapi || '',
      ...config.context,
      preload: {},
      isServer: true,
      isClient: false,
      req,
      res
    }

    try {
      let result = await app.render(req.url, context)
      let content = result.content
      let controller = result.controller as Controller<{}, {}>
      /**
       * 如果没有返回 content
       * 不渲染内容，controller 可能通过 context.res 对象做了重定向或者渲染
       */
      if (!content) {
        return
      }

      // content 可能是异步渲染的
      content = await content

      let initialState = controller.store.getState()
      let htmlConfigs = initialState.html
      let data = {
        ...htmlConfigs,
        content,
        initialState
      }

      if (controller.destroy) {
        controller.destroy()
      }
      
      // 支持通过 res.locals.layoutView 动态确定 layoutView
      res.render(res.locals.layoutView || layoutView, data)
    } catch (error) {
      if (config.NODE_ENV !== 'production') {
        console.log(error)
      }
      
      next(error)
    }
  })

  return router
}
