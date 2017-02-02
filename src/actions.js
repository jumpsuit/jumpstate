export const Actions = {}
export const ActionCreators = {}

export function addAction (actionName, action, actionCreator, sandboxName) {
  // Make sure the name is unique
  if (sandboxName) {
    if (typeof Actions[sandboxName] === 'function') {
      throw new Error(`An action called "${sandboxName}" already exists! Please pick another sandbox name!`)
    }
    Actions[sandboxName] = Actions[sandboxName] || {}
    ActionCreators[sandboxName] = ActionCreators[sandboxName] || {}
    if (Actions[sandboxName][actionName]) {
      throw new Error(`An action called "${actionName}" in the ${sandboxName} sandbox already exists! Please pick another action name!`)
    }

    Actions[sandboxName][actionName] = payload => action(payload)
    ActionCreators[sandboxName][actionName] = actionCreator
    return
  }

  // No need to add the action a second time.
  if (typeof Actions[actionName] === 'object') {
    throw new Error(`An action called "${actionName}" in the ${sandboxName} sandbox already exists! Please pick another action name!`)
  }
  if (Actions[actionName]) {
    return true
  }
  Actions[actionName] = payload => action(payload)
  ActionCreators[actionName] = actionCreator
}

export function addEffect (effectName, action, actionCreator) {
  // Make sure the effect name is unique
  if (Actions[effectName]) {
    throw new Error(`An action called "${effectName}" already exists! Please pick another name for this effect!`)
  }
  Actions[effectName] = payload => action(payload)
  ActionCreators[effectName] = actionCreator
}

export function removeAction (actionName, sandboxName) {
  if (sandboxName) {
    delete Actions[sandboxName][actionName]
    delete ActionCreators[sandboxName][actionName]
    return
  }
  delete Actions[actionName]
  delete ActionCreators[actionName]
}

export function reset () {
  for (var key in Actions) {
    if (Actions.hasOwnProperty(key)) {
      delete Actions[key]
      delete ActionCreators[key]
    }
  }
}
