export const jumpstateDefaults = {
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

  const config = Object.assign(jumpstateDefaults, {
    name: shortID()
  }, userConfig)

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
    const payload = action._jumpstate.multiPayload ? action.payload : [action.payload]
    const nextState = prefixedActions[action.type](state, ...payload)
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
      const multiPayload = payload.length > 1
      const action = {
        _jumpstate: {
          stateName: config.name,
          actionName: actionName,
          multiPayload: multiPayload
        },
        type: prefixedActionName,
        payload: multiPayload ? payload : payload[0]
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
    if (process.env.NODE_ENV === 'testing') {
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

export function attachDispatcher (store, input) {
  // Expect the default to be a single jumpstate reducer
  let jumpstates = [input]
  // Normalize anything else to an array of jumpstates
  if (typeof input === 'object') {
    if (input.length) {
      // Must be an array already
      jumpstates = input
    } else {
      // Must be a reducer map or object, loop the values
      jumpstates = []
      Object.keys(input).forEach(key => {
        jumpstates.push(input[key])
      })
    }
  }
  // Attach the store's dispatcher to each reducer
  jumpstates.forEach(reducer => {
    if (reducer._isJumpstate) {
      reducer._dispatch = store.dispatch
    }
  })
}

function shortID () {
  // returns a fairly unique 4 digit UUID for default state names
  return ('0000' + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4)
}
