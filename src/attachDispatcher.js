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
