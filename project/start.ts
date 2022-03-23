process.env.NODE_ENV = 'development'
import start from '../src/start'
import { Config } from '../src'
import config from './imvc.config'
const PORT: number = 3333
const ROOT = __dirname
const newConfig: Config = {
  ...config,
  root: ROOT, // 项目根目录
  port: PORT, // server 端口号
}

async function main() {
  await start({ config: newConfig })
  console.log('started')
}

main()
