import { dispatch, getState } from './middleware'
import { addAction } from './actions'

export const EffectRegistry = []

export default function (...args) {
  const isNamedAction = args.length > 1
  const actionName = args[0]
  const effectFn = isNamedAction ? args[1] : args[0]
  if (isNamedAction && typeof actionName !== 'string') {
    throw new Error('Named Jumpsuit effects require a string as the name eg. Effect("MY_ACTION", () => {...})')
  }

  const effect = (action) => {
    if (isNamedAction) {
      if (actionName !== action.type) {
        return
      }
      return effectFn(action.payload, getState, dispatch)
    }
    return effectFn(action, getState, dispatch)
  }

  EffectRegistry.push(effect)

  if (isNamedAction) {
    const effectMethod = (...payload) => {
      return dispatch({
        type: actionName,
        payload: payload
      })
    }

    addAction(actionName, effectMethod)

    return effectMethod
  }
}
