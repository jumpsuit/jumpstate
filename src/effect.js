import { getState, dispatch } from './middleware'
import { addEffect, removeAction } from './actions'

export const EffectRegistry = {}
const effectPromises = {}
const guidv4 = () => {
  function s4 () { return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
}

export default function (name, callback) {
  // Make sure the action name is a valid string
  if (typeof name !== 'string') {
    throw new Error('Named effects require a valid string as the name eg. Effect("myAction", () => {...})')
  }

  const callbackWrapper = (action) => {
    const { payload, _jumpstateTimestamp } = action
    const response = callback(payload, getState, dispatch)
    if (_jumpstateTimestamp) {
      Promise.resolve(response)
        .then(effectPromises[_jumpstateTimestamp].resolve)
        .catch(effectPromises[_jumpstateTimestamp].reject)
        .then(() => {
          delete effectPromises[_jumpstateTimestamp]
        })
    }
  }

  EffectRegistry[name] = callbackWrapper

  const actionCreator = (payload, ext = {}) => {
    const getMeta = ({ type, payload, ...meta }) => meta
    return {
      type: name,
      payload,
      getMeta(ext)
    }
  }

  const eventDispatcher = (payload) => {
    const _jumpstateTimestamp = guidv4()
    return new Promise((resolve, reject) => {
      effectPromises[_jumpstateTimestamp] = { resolve, reject }
      dispatch(actionCreator(payload, { _jumpstateTimestamp }))
    })
  }

  eventDispatcher.actionCreator = actionCreator

  addEffect(name, eventDispatcher, actionCreator)

  eventDispatcher.cancel = () => {
    delete EffectRegistry[name]
    removeAction(name)
  }

  return eventDispatcher
}
