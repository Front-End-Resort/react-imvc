import Controller from '../controller'
import express from 'express'

export interface Global extends NodeJS.Global {
  controller: Controller
  __webpack_public_path__: string
}

export interface WindowNative extends Window {
  controller: Controller
  __CUSTOM_LAYOUT__: string
  __PUBLIC_PATH__: string
  __APP_SETTINGS__: object
}


export interface Req extends express.Request {
  basename?: string
  serverPublicPath?: string
  publicPath?: string
}

export interface Res extends express.Response {
  sendResponse: express.Send
}

export interface RequestHandler extends express.RequestHandler {
  (req: Req, res: Res, next: express.NextFunction): any
}