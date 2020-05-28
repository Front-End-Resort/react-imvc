import vm from 'vm'
import path from 'path'
import MFS from 'memory-fs'
import webpack from 'webpack'
import notifier from 'node-notifier'
import webpackDevMiddleware from 'webpack-dev-middleware'
import nodeExternals from 'webpack-node-externals'
import createWebpackConfig from './createWebpackConfig'
import { getExternals, matchExternals } from './util'
import type { NextHandleFunction } from 'connect'
import type { EntireConfig } from '..'

export function setupClient(config: EntireConfig): {
	compiler: webpack.Compiler,
	middleware: webpackDevMiddleware.WebpackDevMiddleware & NextHandleFunction
} {
	let clientConfig = createWebpackConfig(config)
	let compiler = webpack(clientConfig)
	let middleware = webpackDevMiddleware(compiler, {
		publicPath: config.staticPath,
		stats: config.webpackLogger,
		serverSideRender: true,
		reporter: (middlewareOptions, options) => {
			reporter(middlewareOptions, options)
			if (config.notifier) {
				notifier.notify({
					title: 'React-IMVC',
					message: 'Webpack 编译结束'
				})
			}
		}
	})
	return {
		middleware,
		compiler
	}
}

interface SetupServerOptions {
	handleHotModule: (value: any) => void
}

export function setupServer(
	config: EntireConfig,
	options: SetupServerOptions
): void {
	let serverConfig = createWebpackConfig(config, true)

	serverConfig.entry = {
		routes: path.join(config.root, config.src)
	}

	// in order to ignore built-in modules like path, fs, etc.
	serverConfig.target = 'node'
	// in order to ignore all modules in node_modules folder
	serverConfig.externals = [nodeExternals()]

	if (!serverConfig.output) {
		serverConfig.output = {
			filename: 'routes.js',
			libraryTarget: 'commonjs2'
		}
	} else {
		serverConfig.output.filename = 'routes.js'
		serverConfig.output.libraryTarget = 'commonjs2'
	}
	delete serverConfig.optimization
	
	let externals = getExternals(config)
	let serverCompiler = webpack(serverConfig)
	let mfs = new MFS()
	let outputPath = path.join(
		serverConfig.output.path as string,
		serverConfig.output.filename as string
	)
	serverCompiler.outputFileSystem = mfs
	serverCompiler.watch({}, (err, stats) => {
		if (err) throw err
		let currentStats = stats.toJson()
		currentStats.errors.forEach(err => console.error(err))
		currentStats.warnings.forEach(err => console.warn(err))
		let sourceCode: string = mfs.readFileSync(outputPath, 'utf-8')
		let defaultModuleResult = Symbol('default-module-result')
		let virtualRequire = (modulePath: string) => {
			if (matchExternals(externals, modulePath)) {
				return require(modulePath)
			}
			let filePath = modulePath
			if (
				serverConfig.output !== void 0
					&& typeof serverConfig.output.path === 'string'
			) {
				filePath = path.join(serverConfig.output.path, modulePath)
			}
			let sourceCode = ''
			let moduleResult = defaultModuleResult

			try {
				sourceCode = mfs.readFileSync(filePath, 'utf-8')
			} catch (_) {
				/**
				 * externals 和 mfs 里没有这个文件
				 * 它可能是 node.js 原生模块
				 */
				moduleResult = require(modulePath)
			}

			if (sourceCode) {
				moduleResult = runCode(sourceCode)
			}

			if (moduleResult === defaultModuleResult) {
				throw new Error(`${modulePath} not found in server webpack compiler`)
			}

			return moduleResult
		}

		let runCode = (sourceCode: string) => {
			return vm.runInThisContext(`
				(function(require) {
					var module = {exports: {}}
									var factory = function(require, module, exports) {
											${sourceCode}
									}
									try {
											factory(require, module, module.exports)
									} catch(error) {
											return null
									}
									return module.exports
				})
			`)(virtualRequire)
		}

		// 构造一个 commonjs 的模块加载函数，拿到 newModule
		let newModule = runCode(sourceCode)

		if (newModule) {
			options.handleHotModule(newModule.default || newModule)
		}
	})
}

export function reporter(
	middlewareOptions: webpackDevMiddleware.Options,
	options: webpackDevMiddleware.ReporterOptions
): void {
	const { log, state, stats } = options
	if (state) {
		const displayStats = middlewareOptions.stats !== false
		const statsString = stats ? stats.toString(middlewareOptions.stats) : ''

		if (displayStats && statsString.trim().length) {
			if (stats && stats.hasErrors()) {
				log.error(statsString)
			} else if (stats && stats.hasWarnings()) {
				log.warn(statsString)
			} else {
				log.info(statsString)
			}
		}

		let message = 'Compiled successfully.'

		if (stats && stats.hasErrors()) {
			message = 'Failed to compile.'
		} else if (stats && stats.hasWarnings()) {
			message = 'Compiled with warnings.'
		}
		log.info(message)
	} else {
		log.info('Compiling...')
	}
}
