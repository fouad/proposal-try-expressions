import wrapTryAwait from '@babel/helper-try-await'
import { declare } from '@babel/helper-plugin-utils'
import { addNamed } from '@babel/helper-module-imports'
import { types as t } from '@babel/core'

export default declare((api, options) => {
  api.assertVersion(7)

  const { method, module } = options

  if (method && module) {
    return {
      name: 'transform-try-await',

      visitor: {
        Function(path, state) {
          if (!path.node.async || path.node.generator) return

          let wrapAsync = state.methodWrapper
          if (wrapAsync) {
            wrapAsync = t.cloneNode(wrapAsync)
          } else {
            wrapAsync = state.methodWrapper = addNamed(path, method, module)
          }

          wrapTryAwait(path, { wrapAsync })
        }
      }
    }
  }

  return {
    name: 'transform-try-await',

    visitor: {
      TryExpression(path, state) {
        if (!path.node.async || path.node.generator) return

        wrapTryAwait(path, {
          wrapAsync: state.addHelper('tryAwait')
        })
      }
    }
  }
})
