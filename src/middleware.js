import { EffectRegistry } from './effect'
import { HookRegistry } from './hook'

const warningFn = () => {
  console.warn(`It looks like you're trying to use Jumpstate without the middleware! For Jumpstate to work, you need to run CreateJumpstateMiddleware() and apply it as middleware to your Redux Store.`)
}
let resolvedDispatch = warningFn
let resolvedGetState = warningFn

export let dispatch = (...args) => {
  return resolvedDispatch(...args)
}
export let getState = (...args) => {
  return resolvedGetState(...args)
}

export default function createMiddleware (options) {
  return (stateUtils) => {
    resolvedDispatch = stateUtils.dispatch
    resolvedGetState = stateUtils.getState
    return (next) => {
      return action => {
        const result = next(action)
        if (EffectRegistry[action.type]) {
          EffectRegistry[action.type](action)
        }
        HookRegistry.forEach(effect => effect(action))
        return result
      }
    }
  }
}
