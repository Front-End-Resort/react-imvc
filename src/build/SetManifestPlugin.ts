import { getCompilerHooks } from 'webpack-manifest-plugin'
import type { Compiler } from 'webpack'

export type SetManifestPluginOptions = {}

const defaults: SetManifestPluginOptions = {}

class SetManifestPlugin {
  options: SetManifestPluginOptions
  assets: object
  constructor(opts?: SetManifestPluginOptions) {
    this.options = Object.assign({}, defaults, opts)
    this.assets = {}
  }

  apply(compiler: Compiler) {
    const { beforeEmit } = getCompilerHooks(compiler)

    beforeEmit.tap('BatmanPlugin', (manifest: Record<string, string>) => {
      this.assets = manifest
      return manifest
    })

    compiler.hooks.done.tap('SetManifestPlugin', (stats) => {
      // @ts-ignore
      stats.assets = this.assets
    })
  }
}

export default SetManifestPlugin
