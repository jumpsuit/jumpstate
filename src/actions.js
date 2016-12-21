const Actions = {}

export default Actions

export function addAction (actionName, action) {
  // Make sure the name is unique
  if (Actions[actionName]) {
    throw new Error(`An action called "${actionName}" already exists! Please pick another name!`)
  }
  Actions[actionName] = payload => action(payload)
}

export function removeAction (actionName) {
  delete Actions[actionName]
}
