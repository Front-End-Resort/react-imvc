import "core-js/stable"
import "regenerator-runtime/runtime"
import "../polyfill"
import React from 'react'
import ReactDOM from "react-dom"
import createApp from "create-app/client"
import Controller from '../controller'
import { getFlatList } from "../util"
// @ts-ignore
import $routes from "@routes"
import {
  LoadController,
  ControllerConstructor,
  HistoryLocation,
  Context,
  ViewEngine,
  Controller as BaseController
} from "create-app/client"
import { BaseState, AppSettings, Preload, Module } from ".."

declare global {
  interface Window {
    __INITIAL_STATE__: (BaseState & { [k: string]: any }) | undefined | undefined
    __PUBLIC_PATH__: string
    __APP_SETTINGS__: AppSettings
  }
}

declare let __webpack_public_path__: string

__webpack_public_path__ = window.__PUBLIC_PATH__ + "/"
const __APP_SETTINGS__: AppSettings = window.__APP_SETTINGS__

function getModule(module: any) {
  return module.default || module
}
function webpackLoader(
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

let shouldHydrate = !!window.__INITIAL_STATE__

function render(
  view: React.ReactElement | string | undefined | null
): void
function render(
  view: React.ReactElement | string | undefined | null,
  controller: Controller<any, any>
): void
function render(
  view: React.ReactElement | string | undefined | null,
  controller: Controller<any, any> | null,
  container?: Element | null
): void
function render(
  view: React.ReactElement | string | undefined | null,
  controller?: Controller<any, any> | null,
  container?: Element | null
): void {
  if (!view) return

  if (typeof view === 'string') {
    view = React.createElement(
      React.Fragment,
      null,
      view
    )
  }
  
  try {
    if (container) {
      if (shouldHydrate) {
        shouldHydrate = false
        ReactDOM.hydrate(view, container)
      } else {
        ReactDOM.render(view, container)
      }
    }
  } catch (error) {
    if (!controller) throw error

    if (controller.errorDidCatch) {
      controller.errorDidCatch(error, "view")
    }

    if (controller.getViewFallback) {
      render(controller.getViewFallback(), null, container)
    } else {
      throw error
    }
  }
}
const viewEngine: ViewEngine<React.ReactElement, BaseController>
  = { render }

const routes = getFlatList(
  Array.isArray($routes) ? $routes : Object.values($routes)
)

const appSettings: AppSettings = {
  hashType: "hashbang",
  container: "#root",
  ...__APP_SETTINGS__,
  context: {
    preload: {},
    ...__APP_SETTINGS__.context,
    isClient: true,
    isServer: false
  },
  loader: webpackLoader,
  routes,
  viewEngine
}

/**
 * 动态收集服务端预加载的内容
 */
const preload: Preload = {}
Array.from(document.querySelectorAll("[data-preload]")).forEach(elem => {
  let name = elem.getAttribute("data-preload")
  let content = elem.textContent || elem.innerHTML
  if (name) {
    preload[name] = content
  }
})
if (typeof appSettings.context !== "undefined") {
  appSettings.context.preload = preload
}

const app = createApp(appSettings)
app.start()

// 热更新
if (typeof module !== "undefined" && (module as Module).hot) {
  if ((module as Module).hot) {
    let hot = (module as Module).hot
    if (hot && hot.accept) {
      hot.accept()
    }
  }
}
