const Actions = {}

export default Actions

export function addAction (actionName, action) {
  Actions[actionName] = payload => action(payload)
}

export function addStateAction (actionName, action, stateName) {
  Actions[stateName] = Actions[stateName] || {}
  Actions[stateName][actionName] = action
}
