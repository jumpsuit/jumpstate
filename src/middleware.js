import { EffectRegistry } from './effect'

const warningFn = () => {
  console.warn(`It looks like you\'re trying to use Jumpstate without the middleware! For Jumpstate to work, you need to run CreateJumpstateMiddleware() and apply it as middleware to your Redux Store.`)
}

export let dispatch = warningFn
export let getState = warningFn

export default function createMiddleware (options) {
  return (stateUtils) => {
    // If we haven't lifted the stores dispatcher yet, do it just this once
    if (dispatch === warningFn) {
      dispatch = stateUtils.dispatch
      getState = stateUtils.getState
    }
    return (next) => {
      return action => {
        const result = next(action)
        EffectRegistry.forEach(effect => effect(action))
        return result
      }
    }
  }
}
