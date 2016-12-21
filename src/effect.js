import { getState, dispatch } from './middleware'
import Actions, { addAction, removeAction } from './actions'

export const EffectRegistry = {}
const effectPromises = {}

export default function (name, callback) {
  // Make sure the action name is a valid string
  if (typeof name !== 'string') {
    throw new Error('Named effects require a valid string as the name eg. Effect("myAction", () => {...})')
  }

  const callbackWrapper = (action) => {
    const { payload, ts } = action
    Promise.resolve(callback(payload, getState, dispatch))
      .then(effectPromises[ts].resolve)
      .catch(effectPromises[ts].reject)
  }

  EffectRegistry[name] = callbackWrapper

  const eventDispatcher = (payload) => {
    const ts = Date.now()
    return new Promise((resolve, reject) => {
      effectPromises[ts] = { resolve, reject }
      dispatch({
        type: name,
        payload,
        ts
      })
    })
  }

  addAction(name, eventDispatcher)

  eventDispatcher.cancel = () => {
    delete EffectRegistry[name]
    removeAction(name)
  }

  return eventDispatcher
}
