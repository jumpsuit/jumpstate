import jumpstateDefaults from './defaults'
import Utils from './utils'

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

  const config = Object.assign({
    name: Utils.shortID()
  }, jumpstateDefaults, userConfig)

  // Checks
  if (typeof config.name === 'string' && !config.name.length) {
    throw new Error('Jumpstate requires a name if defined in config')
  }

  // set the current state to the initial value
  let currentState = actions.initial || null
  delete actions.initial

  const prefixedActions = {}

  const reducerWithActions = (state = currentState, action = {}) => {
    // If action doesn't exist, return the cached current state
    if (!action || !prefixedActions[action.type]) {
      return currentState
    }
    // Compute the next state
    const nextState = prefixedActions[action.type](state, ...action.payload)
    currentState = config.autoAssign ? Object.assign({}, state, nextState) : nextState
    // If autoAssign is on, extend the state to avoid mutation
    return currentState
  }

  // Loop through the actions and determine if we should proxy through redux or not
  Object.keys(actions).forEach((actionName) => {
    const prefixedActionName = `${config.name}_${actionName}`

    // Keep a reference to the original action for the reducer to reference
    prefixedActions[prefixedActionName] = actions[actionName]

    // Create a method at reducer[actionName] to call our action
    reducerWithActions[actionName] = (...payload) => {
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
        return reducerWithActions._dispatch(action)
      }
    }

    // makes actions available directly when testing with an _ prefix
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'testing') {
      reducerWithActions[`_${actionName}`] = actions[actionName]
    }
  })

  Object.assign(reducerWithActions, {
    _config: config,
    _isJumpstate: true
  })
  reducerWithActions._config = config

  return reducerWithActions
}
