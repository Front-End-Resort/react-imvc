import React from 'react'
import { Location, Context } from '../../../src/'
import Controller from '../../../src/controller'
import { Style } from '../../../src/component'
import useCtrl from '../../../src/hook/useCtrl'
import commonStyle from "./common.scss"
import testSassFromPkg from 'test-pkg/dist/style.scss'
import testCssFromPkg from 'test-pkg/dist/test-css.css'
import testImgFromPkg from 'test-pkg/dist/react.png'

console.log('test', {
  commonStyle,
  testSassFromPkg,
  testCssFromPkg,
  testImgFromPkg
})

export default class StyleController extends Controller<{}, {}> {
  // SSR = false // enable server side rendering
  View = View
  preload = {
    css: '/style/preload.css',
    common: commonStyle,
    testSassFromPkg,
    testCssFromPkg
  }
  constructor(location: Location, context: Context) {
    super(location, context)
  }

  handleClick = () => {
    this.store.actions.UPDATE_INPUT_VALUE({
      count: this.store.getState().count + 1,
    })
  }
}

function View() {
  const ctrl = useCtrl<StyleController>()

  return (
    <div id="style">
      <Style name="css" />
      <Style name="common" />
      <Style name="testSassFromPkg" />
      <Style name="testCssFromPkg" />
      <div className="style">
      </div>
      <img src={ctrl.context.publicPath + testImgFromPkg} />
    </div>
  )
}
