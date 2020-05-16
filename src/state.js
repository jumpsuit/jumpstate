import {
  dispatch
} from './middleware'
import {
  addAction
} from './actions'

export default function (...args) {
  // Detect Optional Config Object
  const isSandboxed = args.length > 1
  let sandboxName = isSandboxed ? args[0] : undefined
  const actions = isSandboxed ? args[1] : args[0]

  // Checks
  if (isSandboxed && (typeof sandboxName !== 'string' || !sandboxName.length)) {
    throw new Error('Sandboxed states names must be a valid string')
  }

  // set the current state to the initial value
  const initialState = actions.initial
  delete actions.initial

  const namedActions = {}

  let currentState

  const reducerWithActions = (state, action = {}) => {
    if (namedActions[action.type]) {
      // For namespaced actions, look for the prefixedAction
      currentState = namedActions[action.type](state, action.payload)
    } else {
      // If the store already has a stored previous state, use that
      // Otherwise, fallback to the user-provided initial state
      currentState = state || initialState
    }
    return currentState
  }

  reducerWithActions.getState = () => {
    return currentState
  }

  reducerWithActions.actionCreators = {}
  reducerWithActions.actionTypes = {}

  // Loop through the actions and proxy them to do awesome stuff
  Object.keys(actions).forEach((actionName) => {
    const resolvedActionName = sandboxName ? `${sandboxName}_${actionName}` : actionName

    // Keep a reference to the original action for the reducer to reference
    namedActions[resolvedActionName] = actions[actionName]

    // Create the actionCreator
    const actionCreator = (payload, ext = {}) => {
      const getMeta = ({ type, payload, ...meta }) => meta
      return {
        type: resolvedActionName,
        payload,
        getMeta(ext)
      }
    }

    // Attach the action creator to the reducer's actionCreator List
    reducerWithActions.actionCreators[actionName] = actionCreator

    // Attach the action type to the reducer's actionType List
    reducerWithActions.actionTypes[actionName] = resolvedActionName

    // Create a shorthand action dispather method
    const actionMethod = (payload) => {
      const action = actionCreator(payload)
      // Otherwise, proxy the action through the attached redux dispatcher
      return dispatch(action)
    }

    // Attach the shorthand method to the reducer
    reducerWithActions[actionName] = actionMethod

    // Add the shorthand action and the actionCreator to the global Actions and ActionCreators list
    addAction(actionName, actionMethod, actionCreator, sandboxName)

    // makes actions available directly when testing with an _ prefix
    /* istanbul ignore if  */
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'testing') {
      reducerWithActions[`_${actionName}`] = actions[actionName]
    }
  })

  return reducerWithActions
}
