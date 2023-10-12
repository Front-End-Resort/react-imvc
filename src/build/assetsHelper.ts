import fg from 'fast-glob'
import path from 'path'
import crypto from 'crypto';
import fs from 'fs-extra'

import { EntireConfig } from '..'

export const getStaticFiles = async (dir: string) => {
    const files = await fg([
        // match all non-js/ts/jsx/tsx files
        `**/!(*.@(js|ts|jsx|tsx))`,
        // match all files in lib
        `lib/**/*`,
    ], {
        cwd: dir
    })
    return files.map(file => file.replaceAll(path.sep, '/'))
}

/**
 * get html/css/javascript in target dir
 */
export const getHtmlCssJsFiles = async (dir: string) => {
    const files = await fg([`**/*.@(html|css|js)`], {
        cwd: dir
    })

    return files.map(file => file.replaceAll(path.sep, '/'))
}

/**
 * get static assets which are not js/ts/jsx/tsx files in cwd
 * will merge into webpack assets.json
 * @param dir 
 * @returns 
 */
export const getStaticAssets = async (dir: string) => {
    const files = await getStaticFiles(dir)
    const assets = {} as Record<string, string>

    for (const file of files) {
        assets[file] = file
    }

    return assets
}

export const revStaticAssets = async (dir: string) => {
    const files = await getStaticFiles(dir)

    const manifest = {} as Record<string, string>

    await Promise.all(files.map(async filePath => {
        const fullFilePath = path.join(dir, filePath)
        const fileContent = await fs.readFile(fullFilePath)
        const revFilePath = await getHashFilename(filePath, fileContent)
        const fullRevFilePath = path.join(dir, revFilePath)

        await Promise.all([
            fs.writeFile(fullRevFilePath, fileContent),
            fs.remove(fullFilePath)
        ])

        manifest[filePath] = revFilePath
    }))

    const htmlCssJsFiles = await getHtmlCssJsFiles(dir)

    await Promise.all(htmlCssJsFiles.map(async filePath => {
        const fullFilePath = path.join(dir, filePath)
        const fileContent = await fs.readFile(fullFilePath, 'utf-8')
        const revFileContent = replace(fileContent, manifest)

        if (fileContent !== revFileContent) {
            await fs.writeFile(fullFilePath, revFileContent)
        }
    }))

    return manifest
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



function escapeStringRegexp(string: string) {
    // reference: https://github.com/sindresorhus/escape-string-regexp/blob/main/index.js
    // Escape characters with special meaning either inside or outside character sets.
    // Use a simple backslash escape when it’s always valid, and a `\xnn` escape when the simpler form would be disallowed by Unicode patterns’ stricter grammar.
    return string
        .replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
        .replace(/-/g, '\\x2d');
}

type Manifest = Record<string, string>;

export function replace(contents: string, manifest: Manifest) {
    let newContents = contents;
    for (const [originalPath, revisionPath] of Object.entries(manifest)) {
        const regexp = new RegExp(`(?<![\\w-])${escapeStringRegexp(originalPath)}(?![\\w.])`, 'g');

        newContents = newContents.replace(regexp, revisionPath);
    }

    return newContents;
}

function modifyFilename(inputPath: string, modifier: (filename: string, extension: string) => string): string {
    const fileExtension = path.extname(inputPath);
    return path.join(path.dirname(inputPath), modifier(path.basename(inputPath, fileExtension), fileExtension));
}

export function revPath(path: string, hash: string) {
    return modifyFilename(path, (filename, fileExtension) => `${filename}-${hash}${fileExtension}`);
}

export default function revisionHash(data: string | Buffer): string {
    return crypto.createHash('md5').update(data).digest('hex').slice(0, 10);
}

export function getHashFilename(originalPath: string, contents: Buffer | string): string {
    const revHash = revisionHash(contents)

    const newPath = modifyFilename(originalPath, (filename, extension) => {
        const extIndex = filename.lastIndexOf('.');

        filename = extIndex === -1 ?
            revPath(filename, revHash) :
            revPath(filename.slice(0, extIndex), revHash) + filename.slice(extIndex);

        return filename + extension;
    });

    return newPath.replaceAll(path.sep, '/')

}