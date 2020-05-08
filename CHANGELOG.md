# CHANGELOG

## 3.0.1

* **perf**: replace query-string of querystring
* **ci**: remove babel-plugin-dynamic-import-node dependence
* **style**: remove @babel/plugin-syntax-dynamic-import dependence, it defaultly installed in @babel/preset-env

## 3.0.0

* **refactor**: support for [Typescript](http://www.typescriptlang.org/docs/home.html)(More details are in [guidance of migration](./doc/MIGRATION.md)).

* **feat**: Props of *View* changed from `{ state, actions, handlers }` to `{ state, ctrl }`.

* **fix**: Hooks should be used with clear type of `state, actions, ctrl`.

* **feat**: Support to write `imvc.config.ts` with TypeScript. But it's syntax supported is stable, You can't add support syntax by any way.

* **feat**: Set webpackConfig.resolve.modules to default config.

* **feat**: Don't stop render when catch error which throwed while preloading css file. It will render the DOM without style and console error message at terminal.

### Note

* Don't change or override the type of attribute is `BaseState`, it will happen unpredictable error.

* Both `shouldComponentCreate` and `componentWillCreate` is support both `sync` and `async` two mode programming. But when you extends Controller and overwrite these two method it's mode will be settled. If these are some mix usage. you must fix it by choose one mode(suggest `async`).

* The default view file extension is 'js'. If you want to use other extension file, please add in config.(eg.view.tsx)

* Props of `View` have changed from `state, handlers, actions` to `state, ctrl`.

## 2.7.5（2020/1/8）

* **fix**: deprecated: 废弃 imvc.config 的 initialState 配置，它会导致浏览器端误判已经做过 SSR，跳过 getInitialState 等生命周期。可以通过 initialState.js 这种模块方式去共享状态。

## 2.7.4（2019/12/4）

* **feat**: fallback to non-style page when preload css failed

## 2.7.3（2019/12/4）

* **style**: remove non-ascii characters in controller.js
* **fix**: reset webpackConfig.resolve.modules to default config

## 2.7.1（2019/9/27）

* **fix**: gulp empty task error
* **fix**: fixed gulp task bug

## 2.7.0（2019/9/27）

* **feat**: 支持禁用 gulp 任务

## 2.6.7（2019/9/4）

* **fix**: 'fetch is not a function' Error

## 2.6.6（2019/9/3）（不稳定）

* **feat**: Error Handling 支持异步生命周期的处理
* **feat**: 为保护性复制功能加开关
* **feat**: 支持使用者手动传入自定义的fetch方法替换window.fetch和node*fetch

## 2.6.5（2019/8/15）

* **fix**: 修正cookieParser传参

## 2.6.4（2019/8/1）

* **fix**: Forwarder 没有静态属性，antd 报错

## 2.6.3（2019/7/31）

* **fix**: 🐛 process not exiting after test （Mocha Won't Force Exit）
* **fix**: remove unnessarry removing proxyHandler

## 2.6.2（2019/7/24）

* **feat**: 支持外露resetScrollOnMount实现自动滚动至顶部可配置

## 2.6.1（2019/7/17）

* **feat**: 增加 `ctr.fetch` 的 options 参数，options.timeoutErrorFormatter，支持自定义超时错误信息
* **perf**: 升级 morgan 版本，解决安全隐患。

## 2.6.0（2019/7/1）

* **perf**: 升级 create*app 到 v1.0.0，跟 react*imvc v1.x 的 create*app v0.8.x 依赖做明确的版本区分
* **feat**: 新增 api `ctrl.renderView（ReactComponent）`，只在客户端生效，可以在 `componentWillCreate` 及之后的生命周期方法里执行

## 2.5.12（2019/6/25）

* **feat**: src/lib/es5 目录不进行 babel，直接 uglify

## 2.5.11（2019/6/25）

* **fix**: 错误捕获跟 KeepAlive 不兼容

## 2.5.10（2019/6/18）

* **fix**: 劫持 React.createElement 的时机修改为 render 前，并在 render 后重置回去，防止内存泄漏

## 2.5.9（2019/6/14）

* **fix**: gulp/webpack 配置问题

## 2.5.8（2019/6/14）

* **fix**: 全局错误捕获，导致 KeepAlive 失效的问题

## 2.5.7（2019/6/12）

* **feat**: 支持组件层面忽略错误代理控制

## 2.5.6（2019/6/12）

* **fix**: build异常直接退出

## 2.5.5（2019/5/31）

* **fix**: 增加initialstate 保护性复制

## 2.5.4（2019/5/30）

* **fix**: ErrorBoundary 的缓存应该跟着每个 controller 实例，否则 controller.reload 时会错误的使用上一个 ctrl 实例

## 2.5.3（2019/5/28）

* **fix**: ErrorBoundary 没有传递 ref 的问题

## 2.5.2（2019/5/28）

* **fix**: controller.preload 为空f报错

## 2.5.1（2019/5/27）

* **fix**: getViewFallback 返回 null 导致请求永远挂起
* **fix**: SSR 出错时，preload 未正确获取

## 2.5.0（2019/5/24）

* **feat**: 增加全局错误捕获的机制

## 2.4.3（2019/5/10）

* **fix**: bug in controller.reload()

## 2.4.2（2019/4/11）

* **fix**: clear view cache before render

## 2.4.1（2019/2/13）

* **feat**: change hooks-api

## 2.4.0（2019/2/9）

* **feat**: 增加对 `typescript` 的支持
* **refactor**: `util` 模块用 `typescript` 重构

## 2.3.0（2019/2/8）

* **feat**: 增加对 `react*hooks` 的支持
  * `useCtrl` 获取当前 controller 的实例
  * `useModel` 获取当前的 global state
  * `useActions` 获取当前的 actions 对象
* **feat**: 默认设置 config.routes 为 routes

## 2.2.1（2019/1/23）

* **fix**: redirect fail continue render

## 2.2.0（2019/1/23）

* **perf**: 优化 `controller.redirect`
  * 支持在更多生命周期里调用，如 `getInitialState`, `shouldComponentCreate`, `componentWillCreate` 等
  * 使用 `throw` 语句模拟浏览器跳转时中断代码执行的效果
* **feat**: add server-bundle-mode supports

## 2.1.0（2019/1/19）

* **feat**: change sourcemap config in dev env pr
* **refactor**: 升级 gulp 套件到 v4.x 版本
* **feat**: 支持打包出 `server*bundle.js`

```javascript
// imvc.config.js
{
  useServerBundle: true, // 开启 serverBundle 模式
  serverBundleName: 'server.bunlde.js', // 如需修改 serverBundle 的文件名，配置该字段
}
```

## 2.0.6（2018/12/13）

* **feat**: support renderMode config

## 2.0.5（2018/12/11）

* **fix**: XSS problem

## 2.0.4（2018/11/20）

* **fix**: bug in controller.reload

## 2.0.3（2018/11/20）

* **feat**: add webpackLogger config
* **fix**: single component context bug in keep-alive mode
* **fix**: cache key
* **feat**: add keep-alive-on-push support

## 2.0.2（2018/11/9）

* **feat**: Drop console.log in production code

## 2.0.1（2018/11/7）

* **fix**: set-up-server-dev

## 2.0.0（2018/11/5）

* **perf**: upgrade react webpack babel
* **feat**: solve many problems
* **feat**: support server side hot module replacement
* **fix**: Style component;
* **fix**: test script

## 1.6.2（2019/5/28）

* **fix**: create-app 更新导致不兼容 react-imvc v.1x

## 1.6.1（2019/4/11）

* **fix**: clear view cache before render

## 1.6.0（2018/10/24）

* **feat**: add prefetch support

## 1.5.2（2018/8/11）

* **feat**: add polyfill and json-loader

## 1.5.1（2018/7/6）

* **feat**: 虚拟目录对大小写不敏感

## 1.5.0（2018/6/7）

* **feat**: add HMR support
* **feat**: 支持通过 res.locals.layoutView 动态确定 layoutView
* **feat**: 默认不开启开发阶段的系统提示

## 1.4.8（2018/3/26）

* **feat**: add node-notifier

## 1.4.7（2018/3/21）

* **feat**: webpack代码分割时路径统一化
* **style**: fixed typo
* **feat**: Update index.js

## 1.4.6（2018/1/26）

* **fix**: gulp copy regexp

## 1.4.5（2018/1/24）

* **feat**: 支持拷贝 lib 目录时，顺便 babel 编译一下 ES6 代码

## 1.4.4（2018/1/10）

* **fix**: webpack plugins bug

## 1.4.3（2018/1/9）

* *feat*: disable hsts by default

## 1.4.2（2017/12/22）

* **feat**: 去掉 react render 的 log 日志
* **perf**: 优化 cacheView 中间件
* **feat**: 删除 location.key 以支持浏览器 304 检测
* **feat**: 支持传 express.staitc 的 options 参数
* **fix**: Input 组件 onFocus 事件不触发的 bug

## 1.4.1（2017/12/8）

* **feat**: 支持配置 webpack loaders
* **feat**: 支持 controller 实例的 restapi 属性覆盖全局 restapi 配置

## 1.4.0（2017/12/5）

* **feat**: 去掉自定义的简陋 logger，适配 redux dev tools
* **feat**: 只在生产环境开启 redux，避免 store 无限增长打来内存泄露问题

## 1.3.8（2017/11/24）

* **feat**: 支持手动调用 res.renderPage 渲染 imvc 页面

## 1.3.7（2017/11/17）

* **fix**: 处理自定义 router 拿不到完整的 client appSettings 的问题

## 1.3.6（2017/11/7）

* **feat**: 支持 controller.SSR 作为异步方法，动态判断是否需要服务端渲染

## 1.3.5（2017/11/3）

* **fix**: 解决 Link 组件 SSR 和 CSR 在有 basename 时不匹配的问题

## 1.3.4（2017/10/31）

* **perf**: optimize publicPath handler
* **feat**: remove wrapRender
* **perf**: optimize mock route
* **perf**: reset webpack compile assets position

## 1.3.3（2017/10/28）

* **perf**: 优化 Link 组件
* **feat**: 新增 NavLink 组件

## 1.3.2（2017/10/21）

* **feat**: 取消默认美化 html 输出
* **perf**: update babel cofnig
* **fix**: 解决重新无刷新加载当前 url 时，没有从头走一遍生命周期过程的问题，添加 reload 方法

## 1.3.1（2017/10/10）

* **feat**: 优化 connect 高阶组件，去掉 PureComponent 机制

## 1.3.0（2017/10/5）

* **feat**: 新增两个生命周期方法：getFinalActions && stateDidReuse
* **feat**: 允许关闭 logger

## 1.1.1（2017/9/27）

* **feat**: change action name of PAGE_DID_BACK
* **perf**: 优化 attachLogger 的时机

## 1.1.0（2017/9/26）

* **perf**: 优化 KeepAlive 的实现
* **feat**: 为组件空 div 添加 css class 名
* **perf**: 优化 Style 组件，避免重复渲染同一份样式
* **feat**: 优化 KeepAlive 的实现，支持恢复滚动条位置

## 1.0.7（2017/9/12）

* **feat**: only call getInitialState once
* **feat**: 支持自定义 gulp src 配置，优化生成静态入口的 log 输出
* **fix**: uglify options pass the wrong way

## 1.0.6（2017/9/9）

* **feat**: add controller.post method

## 1.0.5（2017/9/6）

* **feat**: set default config.routes = ''
* **perf**: remove error handler from resolve custome config

## 1.0.4（2017/9/5）

* **feat**: default clost staticEntry and server routes

## 1.0.3（2017/9/1）

* **feat**: remove log

## 1.0.2（2017/9/1）

* **feat**: remove BaseView Component

## 1.0.1（2017/9/1）

* **feat**: add PAGE_DID_BACK default action
* **feat**: add componentDidFirstMount
* **feat**: add restore

## 1.0.0
