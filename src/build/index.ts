import fs from 'fs'
import del from 'del'
import gulp from 'gulp'
import path from 'path'
import webpack from 'webpack'
import start from '../start'
import getConfig from '../config'
import createGulpTask from './createGulpTask'
import createWebpackConfig from './createWebpackConfig'
import type { Options, EntireConfig, AppSettings } from '..'

import 'core-js/stable'
import 'regenerator-runtime/runtime'

export default function build(options: Options): Promise<EntireConfig | void> {
  const config = getConfig(options, true)
  const delPublicPgs = () => delPublish(path.join(config.root, config.publish))
  const startGulpPgs = () => startGulp(config)
  const startWebpackPgs = () =>
    Promise.all(
      [
        startWebpackForClient(config),
        config.useServerBundle && startWebpackForServer(config),
      ].filter(Boolean)
    )
  const startStaticEntryPgs = () => startStaticEntry(config)
  const errorHandler = (error: Error) => {
    console.error(error)
    process.exit(1)
  }
  const finalHandler = () => {
    console.log('build successfully!')
    process.exit(0)
  }

  return Promise.resolve()
    .then(delPublicPgs)
    .then(startGulpPgs)
    .then(startWebpackPgs)
    .then(startStaticEntryPgs)
    .catch(errorHandler)
    .finally(finalHandler)
}

function delPublish(folder: string): Promise<string[]> {
  console.log(`delete publish folder: ${folder}`)
  return del(folder)
}

function startWebpackForClient(
  config: EntireConfig
): Promise<EntireConfig | boolean> {
  let webpackConfig = createWebpackConfig(config, false)
  return new Promise((resolve, reject) => {
    webpack(webpackConfig, (error, stats) => {
      if (error) {
        reject(error)
      } else {
        if (config.webpackLogger) {
          console.log(
            '[webpack:client:build]',
            stats.toString(config.webpackLogger)
          )
        }
        resolve()
      }
    })
  })
}

function startWebpackForServer(config: EntireConfig): Promise<EntireConfig> {
  let webpackConfig = createWebpackConfig(config, true)
  return new Promise((resolve, reject) => {
    webpack(webpackConfig, (error, stats) => {
      if (error) {
        reject(error)
      } else {
        if (config.webpackLogger) {
          console.log(
            '[webpack:server:build]',
            stats.toString(config.webpackLogger)
          )
        }
        resolve()
      }
    })
  })
}

function startGulp(config: EntireConfig): Promise<EntireConfig> {
  return new Promise((resolve, reject) => {
    gulp.task('default', createGulpTask(config))

    let taskFunction: gulp.TaskFunction = (error) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    }
    gulp.series('default')(taskFunction)
  })
}

async function startStaticEntry(
  config: EntireConfig
): Promise<EntireConfig | void> {
  if (!config.staticEntry) {
    return
  }
  console.log(`start generating static entry file`)

  let appSettings: AppSettings = {
    ...config.appSettings,
    type: 'createHashHistory',
  }
  let staticEntryconfig: EntireConfig = {
    ...config,
    root: path.join(config.root, config.publish),
    // 默认当前文件夹
    publicPath: config.publicPath || '.',
    appSettings,
    SSR: false,
  }

  let { server } = await start({
    config: staticEntryconfig,
  })

  let url = `http://localhost:${config.port}/__CREATE_STATIC_ENTRY__`
  console.log(`fetching url:${url}`)
  let response = await fetch(url)
  let html = await response.text()
  let staticEntryPath = path.join(
    config.root,
    config.publish,
    config.static,
    config.staticEntry
  )

  server.close(() => console.log('finish generating static entry file'))

  return new Promise<EntireConfig>((resolve, reject) => {
    type ErrorCallback = (err: NodeJS.ErrnoException | null) => void

    let callback: ErrorCallback = (error) => {
      error ? reject(error) : resolve()
    }
    fs.writeFile(staticEntryPath, html, callback)
  })
}
