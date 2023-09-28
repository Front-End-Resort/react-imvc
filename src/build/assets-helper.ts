import fg from 'fast-glob'
import path from 'path'
import { EntireConfig } from '..'

export const getStaticFiles = async (cwd: string) => {
    const files = await fg([
        // match all non-js/ts/jsx/tsx files
        `**/!(*.@(js|ts|jsx|tsx))`,
        // match all files in lib
        `lib/**/*`,
    ], {
        cwd
    })
    return files
}

/**
 * get static assets which are not js/ts/jsx/tsx files in cwd
 * will merge into webpack assets.json
 * @param cwd 
 * @returns 
 */
export const getStaticAssets = async (cwd: string) => {
    const files = await getStaticFiles(cwd)
    const assets = {} as Record<string, string>

    for (const file of files) {
        assets[file] = file
    }

    return assets
}

export function getAssets(stats: Record<string, any>): Record<string, string> {
    return Object.keys(stats).reduce((result, assetName) => {
        let value = stats[assetName]
        result[assetName] = Array.isArray(value) ? value[0] : value
        return result
    }, {} as Record<string, string>)
}


export function readAssets(config: EntireConfig): Record<string, any> {
    let result
    // 生产模式直接用编译好的资源表
    let assetsPathList = [
        // 在 publish 目录下启动
        path.join(config.root, config.static, config.assetsPath),
        // 在项目根目录下启动
        path.join(config.root, config.publish, config.static, config.assetsPath),
    ]

    while (assetsPathList.length) {
        try {
            let itemPath = assetsPathList.shift()
            if (itemPath) {
                result = require(itemPath)
            }
        } catch (error) {
            // ignore error
        }
    }

    if (!result) {
        throw new Error('找不到 webpack 资源表 assets.json')
    }

    return getAssets(result)
}
