const Actions = {}

export default Actions

export function addAction (actionName, action, sandboxName) {
  // Make sure the name is unique
  if (sandboxName) {
    if (typeof Actions[sandboxName] === 'function') {
      throw new Error(`An action called "${sandboxName}" already exists! Please pick another sandbox name!`)
    }
    Actions[sandboxName] = Actions[sandboxName] || {}
    if (Actions[sandboxName][actionName]) {
      throw new Error(`An action called "${actionName}" in the ${sandboxName} sandbox already exists! Please pick another action name!`)
    }

    Actions[sandboxName][actionName] = payload => action(payload)
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
}

export function addEffect (effectName, action) {
  // Make sure the effect name is unique
  if (Actions[effectName]) {
    throw new Error(`An action called "${effectName}" already exists! Please pick another name for this effect!`)
  }
  Actions[effectName] = payload => action(payload)
}

export function removeAction (actionName, sandboxName) {
  if (sandboxName) {
    delete Actions[sandboxName][actionName]
    return
  }
  delete Actions[actionName]
}

export function reset () {
  for (var key in Actions) {
    if (Actions.hasOwnProperty(key)) {
      delete Actions[key]
    }
  }
}
