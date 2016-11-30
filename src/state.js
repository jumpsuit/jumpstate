import { dispatch } from './middleware'
import { addAction } from './actions'

export default function (...args) {
  // Detect Optional Config Object
  const isSandboxed = args.length > 1
  let sandboxName = isSandboxed ? args[0] : undefined
  const actions = isSandboxed ? args[1] : args[0]

  // Checks
  if (sandboxName && typeof sandboxName === 'string' && !sandboxName.length) {
    throw new Error('Sandboxed states names must be a valid string')
  }

  // set the current state to the initial value
  const initialState = actions.initial
  delete actions.initial

  const namedActions = {}

  let currentState = initialState

  const reducerWithActions = (state, action = {}) => {
    if (namedActions[action.type]) {
      // For namespaced actions, look for the prefixedAction
      const nextState = namedActions[action.type](state, action.payload)
      // Extend the state to avoid mutation
      return Object.assign({}, state, nextState)
    }
    // If redux already has a stored previous state, use that
    // Otherwise, fallback to the user-provided state
    return state || currentState
  }

  // Loop through the actions and proxy them to do awesome stuff
  Object.keys(actions).forEach((actionName) => {
    const resolvedActionName = sandboxName ? `${sandboxName}_${actionName}` : actionName

    // Keep a reference to the original action for the reducer to reference
    namedActions[resolvedActionName] = actions[actionName]

    // Create a namespaced action
    const actionMethod = (payload) => {
      const action = {
        type: resolvedActionName,
        payload
      }
      // Otherwise, proxy the action through the attached redux dispatcher
      return dispatch(action)
    }

    // Attach the method to the reducer
    reducerWithActions[actionName] = actionMethod

    // If global, add the actionMethod to the global Actions list
    if (!sandboxName) {
      addAction(actionName, actionMethod)
    }

    // makes actions available directly when testing with an _ prefix
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'testing') {
      reducerWithActions[`_${actionName}`] = actions[actionName]
    }
  })

  return reducerWithActions
}
