import { getState, dispatch } from './middleware'
import Actions, { addAction, removeAction } from './actions'

export const EffectRegistry = {}

export default function (name, callback) {
  // Make sure the action name is a valid string
  if (typeof name !== 'string') {
    throw new Error('Named effects require a valid string as the name eg. Effect("myAction", () => {...})')
  }

  // Make sure the name is unique
  if (Actions[name]) {
    throw new Error(`An action called "${name}" already exists! Please pick another name for this effect!`)
  }

  const callbackWrapper = (payload) => {
    callback(payload, getState, dispatch)
  }

  EffectRegistry[name] = callbackWrapper

  const eventDispatcher = (payload) => {
    return dispatch({
      type: name,
      payload
    })
  }

  addAction(name, eventDispatcher)

  eventDispatcher.cancel = () => {
    delete EffectRegistry[name]
    removeAction(name)
  }

  return eventDispatcher
}
