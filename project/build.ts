process.env.NODE_ENV = 'production'
import build from '../src/build'
import { Config } from '../src/'

let PORT = 3333
const ROOT = __dirname
const config: Config = {
  root: ROOT, // 项目根目录
  port: PORT, // server 端口号
  routes: 'routes', // 服务端路由目录
  layout: 'Layout.tsx', // 自定义 Layout
  publish: '../publish'
  // bundleAnalyzer: true,
  // staticEntry: 'index.html',
}

async function main() {
  await build({ config })
}

main()
