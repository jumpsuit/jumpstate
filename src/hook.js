import { getState, dispatch } from './middleware'

export const HookRegistry = []

export default function (callback) {
  const callbackWrapper = (action) => {
    callback(action, getState, dispatch)
  }

  HookRegistry.push(callbackWrapper)

  const returnMethod = () => {
    callbackWrapper()
  }

  returnMethod.cancel = () => {
    HookRegistry.splice(HookRegistry.indexOf(callbackWrapper), 1)
  }

  return callbackWrapper
}
