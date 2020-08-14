import path from 'path'
import type { Configuration, RuleSetCondition } from 'webpack'
import type { EntireConfig } from '..'

export function getExternals(config: EntireConfig): string[] {
  let dependencies: string[] = []

  let list: string[] = [
    path.resolve('package.json'),
    path.join(__dirname, '../../package.json'),
    path.join(config.root, '../package.json')
  ]

  while (true) {
    let item = list.shift()
    if (item === void 0) {
      break
    }

    try {
      let pkg = require(item)
      if (pkg.dependencies) {
        dependencies = dependencies.concat(Object.keys(pkg.dependencies))
      }
      if (pkg.devDependencies) {
        dependencies = dependencies.concat(Object.keys(pkg.devDependencies))
      }
    } catch (error) {
      // ignore error
    }
  }

  let map: Record<string, boolean> = {}
  dependencies = dependencies.filter(name => {
    if (map[name]) {
      return false
    }
    map[name] = true
    return true
  })

  return dependencies
}

export function matchExternals(
  externals: string[],
  modulePath: string
): boolean {
  for (let i = 0; i < externals.length; i++) {
    if (modulePath.startsWith(externals[i])) {
      return true
    }
  }
  return false
}



export function fixRuleSetCondition(test: RuleSetCondition): RuleSetCondition {
  if (isRegExp(test)) {
		const str = test.toString()
    return RegExp(str.slice(1, str.length - 1))
  } else if (typeof test === 'string') {
    return test + ''
  } else if (isFunction(test)) {
    return function(path) {
      return test(path)
    }
  } else if (isArray(test)) {
    return Array.from(test).map(fixRuleSetCondition)
  } else if (isObject(test)) {
		let newTest: RuleSetCondition = {}
    if (test.and) {
      newTest.and = Array.from(test.and).map(fixRuleSetCondition)
    }
    if (test.exclude) {
      newTest.exclude = fixRuleSetCondition(test.exclude)
    }
    if (test.include) {
      newTest.include = fixRuleSetCondition(test.include)
    }
    if (test.not) {
      newTest.not = Array.from(test.not).map(fixRuleSetCondition)
    }
    if (test.or) {
      newTest.or = Array.from(test.or).map(fixRuleSetCondition)
    }
    if (test.test) {
      newTest.test = fixRuleSetCondition(test.test)
    }
    
    return newTest
  } else {
    return test
  }
}

export function fixWebpackConfig(config: Configuration) {
  if (config.module) {
    config.module.rules = config.module.rules.map((rule) => {
      if (rule.test) {
        rule.test = fixRuleSetCondition(rule.test)
      }
      return rule
    })
  }
  return config
}

function isRegExp(input: any): input is RegExp {
  return Object.prototype.toString.call(input) === '[object RegExp]'
}

function isFunction(input: any): input is Function {
  return Object.prototype.toString.call(input) === '[object Function]'
}

function isArray(input: any): input is Array<any> {
  Array.isArray
  return Object.prototype.toString.call(input) === '[object Array]'
}

function isObject(input: any): input is Function {
  return Object.prototype.toString.call(input) === '[object Object]'
}
