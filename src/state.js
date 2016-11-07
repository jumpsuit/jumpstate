import { dispatch } from './middleware'
import { addAction } from './actions'

export const StateDefaults = {
  autoAssign: true
}

export default function (...args) {
  // Detect Optional Config Object
  const hasConfig = args.length > 1
  let userConfig = hasConfig ? args[0] : {}
  const actions = hasConfig ? args[1] : args[0]

  // Detect string name in place of config
  if (typeof userConfig === 'string') {
    userConfig = {
      name: userConfig
    }
  }

  let stateName
  if (userConfig.name) {
    stateName = userConfig.name.split('')
    stateName = stateName[0].toUpperCase() + stateName.slice(1).join('')
  }

  const config = Object.assign({}, StateDefaults, userConfig)

  // Checks
  if (typeof config.name === 'string' && !config.name.length) {
    throw new Error('States require a name when defined with a config')
  }

  // set the current state to the initial value
  const initialState = actions.initial
  delete actions.initial

  const namedActions = {}

  const reducerWithActions = (state = initialState, action = {}) => {
    // If action doesn't exist, return the cached current state
    if (!action) {
      return state
    }
    if (namedActions[action.type]) {
      // For namespaced actions, look for the prefixedAction
      const nextState = namedActions[action.type](state, action.payload)
      // If autoAssign is on, extend the state to avoid mutation
      return config.autoAssign ? Object.assign({}, state, nextState) : nextState
    } else {
      // All other cases, just return the current state
      return state
    }
  }

  // Loop through the actions and proxy them to do awesome stuff
  Object.keys(actions).forEach((actionName) => {
    const resolvedActionName = stateName ? `${config.name}_${actionName}` : actionName

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
    if (!stateName) {
      addAction(actionName, actionMethod)
    }

    // makes actions available directly when testing with an _ prefix
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'testing') {
      reducerWithActions[`_${actionName}`] = actions[actionName]
    }
  })

  return reducerWithActions
}
