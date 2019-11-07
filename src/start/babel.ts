import configBabel from '../config/babel'

require('@babel/register')({
  ...configBabel(true),
  extensions: ['.es6', '.es', '.jsx', '.js', '.mjs', '.ts', '.tsx']
})

import start from './index'
export default start
