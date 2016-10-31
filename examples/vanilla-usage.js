import Jumpstate from '../lib'

const counter = Jumpstate({
  detached: true // Now this state is a simple state machine
},{
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
    // state object.  If you would like to manage your
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

// Get the current State
console.log(counter())
// { count: 0, note: '' }

// Call some actions
console.log(counter.increment())
// { count: 1, note: '' }
console.log(counter.setNote('Hello!', true))
// { count: 1, note: '!olleH' }