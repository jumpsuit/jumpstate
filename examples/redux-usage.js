import { createStore, combineReducers } from 'redux'
import Jumpstate, { attachDispatcher } from '../lib'

// Creating a jumpstate is as simple as passing an initial
// state value, and any actions that can alter that state
const counter = Jumpstate({
  // Initial State
  initial: {
    count: 0,
    note: ''
  },
  // Actions
  increment (state) {
    // Each action is passed the current state
    // and any parameters the action was called with
    return { count: state.count + 1 }
    // State is always immutable, so by default, jumpstate
    // will autoAssign your return value to a new
    // state object. If you would like to manage your
    // own immutability, set `autoAssign: false` in the
    // state's config.
  },
  decrement (state) {
    return { count: state.count - 1 }
  },
  setNote (state, note, reverse) {
    return {
      note: reverse ? note.split('').reverse().join('') : note
    }
  }
})

// Regular Redux
const reducers = {
  counter
}
const rootReducer = combineReducers(reducers)
const store = createStore(rootReducer)

// After the store is created, we just need to supply
// our jumpstate's with the store dispatcher.

// You can pass pass it your reducer map
attachDispatcher(store, reducers)
// or an array of reducers
attachDispatcher(store, [counter])
// or a single reducer
attachDispatcher(store, counter)

// HINT: Want to fire your own actions through the Redux dispatcher?
// See the `Use as an action creator` section below ;)

// Somewhere else in your app...

// Get the current State
console.log(counter())
// { count: 0, note: '' }

// Call some actions
counter.increment()
console.log(counter())
// { count: 1, note: '' }

counter.setNote('Hello!', true)
console.log(counter())
// { count: 1, note: '!olleH' }