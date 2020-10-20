import fs from 'fs'
import vm from 'vm'
import path from 'path'
import configBabel from './babel'
import defaultConfig from './config.defaults'
import {
  isAbsolutePath,
  getClearFilePath,
  compareObject,
  getKeys,
} from '../util'
import { TransformOptions, transformFileSync } from '@babel/core'
import type { Options, EntireConfig, Config } from '..'

export { default as defaultConfig } from './config.defaults'
export const getBabelConfig = configBabel

enum Extension {
  JS = 'js',
  TS = 'ts',
  JSX = 'jsx',
  TSX = 'tsx',
  JSON = 'json',
  INVALID = 'invalid',
}

let preOptions: Options = {}
let configCache: EntireConfig = defaultConfig

export default function getConfig(
  options: Options = {},
  shouldCompile: boolean = process.env.NODE_ENV !== 'production'
): EntireConfig {
  const canUseCache = compareObject(preOptions, options)
  if (canUseCache) {
    return configCache
  }
  preOptions = options
  return (configCache = constructConfig(options, shouldCompile))
}

function constructConfig(
  options: Options,
  shouldCompile: boolean
): EntireConfig {
  let config: Config | null = null
  switch (typeof options.config) {
    case 'object':
      config = options.config
      break
    case 'string':
      config = shouldCompile
        ? requireConfig(path.resolve(options.config))
        : require(path.resolve(options.config))
      break
  }
  return Object.assign({}, defaultConfig, config)
}

function requireConfig(filePath: string): EntireConfig {
  const clearFilePath = getClearFilePath(filePath)
  const [finalFilePath, ets] = getFileInfo(clearFilePath)
  if (ets === Extension.INVALID) {
    throw new Error(`The config path: ${filePath} is incorrect`)
  }
  if (ets === Extension.JSON) {
    return require(finalFilePath)
  }
  const babelConfig: TransformOptions = {
    ...configBabel(),
    filenameRelative: finalFilePath,
  }
  const result = transformFileSync(finalFilePath, babelConfig)
  if (result && result.code) {
    try {
      return runCode(result.code, createContext(finalFilePath))
    } catch (e) {
      throw e
    }
  } else {
    throw new Error(`The file: ${filePath} has syntax error`)
  }
}

function createContext(filepath: string): vm.Context {
  const dir = path.dirname(filepath)
  const module = { exports: {} }
  const virtualRequire = (filePath: string) => {
    if (!isAbsolutePath(filePath)) {
      return requireConfig(path.resolve(dir, filePath))
    } else {
      return require(filePath)
    }
  }
  return vm.createContext({
    ...global,
    global,
    console,
    process,
    __filename: filepath,
    __dirname: dir,
    exports: module.exports,
    require: virtualRequire,
    module: module,
  })
}

function getFileInfo(filePath: string): [string, Extension] {
  const clearFilePath = getClearFilePath(
    filePath,
    getKeys(Extension).map((key) => Extension[key])
  )
  let finalFilePath: string = filePath
  let extension: Extension = Extension.INVALID
  getKeys(Extension).some((etsKey) => {
    let ets = Extension[etsKey]
    if (fs.existsSync(`${clearFilePath}.${ets}`)) {
      finalFilePath = `${clearFilePath}.${ets}`
      extension = ets
      return true
    }
    return false
  })
  return [finalFilePath, extension]
}

function runCode(sourceCode: string, context: vm.Context) {
  sourceCode = sourceCode.replace('"use strict";', '')
  return Function(`
    "use strict";
    return(function({
      process,
      __filename,
      __dirname,
      exports,
      require,
      module
    }){
      ${sourceCode}
      return exports.default
    })
  `)()(context)
}
