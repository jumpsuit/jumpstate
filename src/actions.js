const Actions = {}

export default Actions

export function addAction (actionName, action) {
  Actions[actionName] = payload => action(payload)
}

export function removeAction (actionName) {
  delete Actions[actionName]
}
