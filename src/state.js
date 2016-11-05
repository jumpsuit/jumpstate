import Utils from './utils'
import { dispatch } from './middleware'
import { addAction, addStateAction } from './actions'

export const StateDefaults = {
  autoAssign: true,
  detached: false,
  actionCreator: false
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

  const config = Object.assign({
    name: Utils.shortID()
  }, StateDefaults, userConfig)

  // Checks
  if (typeof config.name === 'string' && !config.name.length) {
    throw new Error('States require a name when defined with a config')
  }

  // set the current state to the initial value
  let currentState = actions.initial || null
  delete actions.initial

  const namespacedMethods = {}

  const reducerWithActions = (state = currentState, action = {}) => {
    // If action doesn't exist, return the cached current state
    if (!action) {
      return currentState
    }
    let nextState
    if (namespacedMethods[action.type]) {
      // For namespaced actions, look for the prefixedAction
      nextState = namespacedMethods[action.type](state, action.payload)
    } else if (actions[action.type]) {
      // For namespaced actions, look for the prefixedAction
      nextState = actions[action.type](state, action.payload)
    } else {
      // All other cases, just return the current state
      return currentState
    }
    currentState = config.autoAssign ? Object.assign({}, state, nextState) : nextState
    // If autoAssign is on, extend the state to avoid mutation
    return currentState
  }

  // Loop through the actions and determine if we should proxy through redux or not
  Object.keys(actions).forEach((actionName) => {
    const prefixedActionName = `${config.name}_${actionName}`

    // Keep a reference to the original action for the reducer to reference
    namespacedMethods[prefixedActionName] = actions[actionName]

    // Create a namespaced action
    const prefixedActionMethod = (payload) => {
      const action = {
        type: prefixedActionName,
        payload
      }
      if (config.actionCreator) {
        return action
      }
      if (config.detached) {
        // If it's a detached state, bypass the redux dispatcher
        // and route actions directly into the reducer.
        return reducerWithActions(currentState, action)
      } else {
        // Otherwise, proxy the action through the attached redux dispatcher
        return dispatch(action)
      }
    }

    // Create a generic action
    const actionMethod = (payload) => {
      const action = {
        type: actionName,
        payload
      }
      if (config.actionCreator) {
        return action
      }
      // TODO: somehow support global actions with detached states
      // Generic actions currently don't support detached states, so just dispatch for now
      return dispatch(action)
    }

    // Attach the actionMethod to the reducer
    reducerWithActions[actionName] = prefixedActionMethod

    // Add the actionMethod to the global Actions list
    addAction(actionName, actionMethod)
    // If is a named State, add the prefixedActionMethod to the prefixed global Actions list
    if (stateName) {
      addStateAction(actionName, prefixedActionMethod, stateName)
    }

    // makes actions available directly when testing with an _ prefix
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'testing') {
      reducerWithActions[`_${actionName}`] = actions[actionName]
    }
  })

  return reducerWithActions
}
