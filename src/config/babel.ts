import type { TransformOptions, PluginItem } from '@babel/core'
import type { EntireConfig } from '..'

export default function Babel(config: EntireConfig): TransformOptions {
  let presets: PluginItem[] = [
    '@babel/preset-env',
    '@babel/preset-react',
    // typescript
    [
      '@babel/preset-typescript',
      {
        isTSX: true,
        allExtensions: true,
        allowNamespaces: true,
      },
    ],
  ]
  let plugins = [
    // Stage 0
    '@babel/plugin-proposal-function-bind',

    // Stage 1
    '@babel/plugin-proposal-export-default-from',
    ['@babel/plugin-proposal-pipeline-operator', { proposal: 'minimal' }],
    '@babel/plugin-proposal-do-expressions',

    // Stage 2
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    '@babel/plugin-proposal-function-sent',
    '@babel/plugin-proposal-throw-expressions',

    // Stage 3
    '@babel/plugin-syntax-import-meta',
    ['@babel/plugin-proposal-class-properties', { loose: false }],
    ['@babel/plugin-proposal-nullish-coalescing-operator', { loose: false }],

    // Stage 4
    ['@babel/plugin-proposal-optional-chaining', { loose: false }],

    config.useCoverage && ['istanbul'],
  ].filter(Boolean) as PluginItem[]

  return {
    presets,
    plugins,
  }
}
