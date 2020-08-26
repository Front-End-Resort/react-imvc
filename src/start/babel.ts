import configBabel from '../config/babel'

process.env.NODE_ENV = process.env.NODE_ENV || 'development'

require('@babel/register')({
  ...configBabel(),
  extensions: ['.es6', '.es', '.jsx', '.js', '.mjs', '.ts', '.tsx'],
})

import start from './index'
export default start
