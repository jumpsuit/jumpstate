# Jumpstate

Jumpstate is a lightweight state framework for React that packs some serious power and some awesome features:

- No action creators
- No action constants
- No dispatching required
- Async actions
- Named and generic side-effects model
- Lightweight at **2kb**
- Powered by Redux

#### Why do we love it?
- It provides a clear and deliberate way of managing state
- It has reduced the amount of code we maintain for state and actions by more than 30%
- It's easy to learn and reads extremely well

*Did you know? Jumpstate is the core state-manager for [Jumpsuit](https://github.com/jumpsuit/jumpsuit), So if you like what you see, you'll likely love Jumpsuit as well!*

## Installation

```bash
$ npm install jumpstate --save
```

## Usage

```javascript
// Import Jumpstate Utils
import { State, Effect, Actions, getState, dispatch, CreateJumpstateMiddleware } from 'jumpstate'
// Redux stuff...
import { createStore, combineReducers } from 'redux'
import { connect } from 'redux-react'


// Create a generic reducer with some actions
const Counter = State({
  // Initial State
  initial: { count: 0 },
  // Actions
  increment (state, payload) {
    return { count: ++state.count }
  },
  decrement (state, payload) {
    return { count: --state.count }
  },
})


// You can create asynchronous actions like this:
const asyncIncrement = Effect('asyncIncrement', (time = 1000) => {
  setTimeout(() => Actions.increment(), time)
})
// You can call it with the return function
asyncIncrement()
// Or even via the global actions list
Actions.asyncIncrement()



// You can even create generic side-effects (like sagas, but 10x easier)
// You can monitor your state for any action or state condition, and then respond however you want.
Effect((action, getState) => {
  // Like never letting the count equal 10! Muahahaha!!!
  if (getState().counter.count === 10) {
    Math.random() > .5 ? Actions.increment() : Actions.decrement()
  }
})



// You can setup your redux however you like...
const reducers = {
  counter: Counter
}

// To wire it up, create a new middleware instance from jumpstate
const JumpstateMiddleware = CreateJumpstateMiddleware()

// As long as you apply the jumpstate middleware to your store, you're good to go!
const store = createStore(
  combineReducers(reducers)
  applyMiddware(JumpstateMiddleware)
)



// Now, anywhere else in your app...

// Call an action!
Actions.increment()
// This will increment all counts by 1

// Async actions are easy to call as well
Actions.asyncIncrement(2000) // To send a payload, just pass it in the function

// Oh, and you can still use the dispatcher for old-school redux anytime you want
dispatch(reduxFormActionCreator())
```

## State Configuration

Each state can be configured with some optional settings:
```javascript
State({
  name: 'myState' // This name is used in Redux actions and for debugging. Defaults to a random unique short_id if not specified
  autoAssign: true // Jumpstate auto-assigns your action returns into a new state instance to maintain state immutability. eg. `Object.assign({}, state, newState)`  If you would like to manage your own immutability, set this to false.
}, {
  initial: {},
  ...actions
})
```

You can also set global settings like so:
```javascript
import { jumpstateDefaults } from 'jumpstate'

jumpstateDefaults.autoAssign = false
// or
Object.assign(jumpstateDefaults, {
  autoAssign: false
})
```

## Sandboxed States

If you have ever wanted an action to only go through a single reducer, you can!
Sandboxed states only respond to actions called via their reducer.

```javascript
// Create a sandboxed state by passing a name
const SandboxedCounter = State('otherCounter', {
  // Initial State
  initial: { count: 0 },
  // Actions
  increment (state, payload) {
    return { count: ++state.count }
  },
  decrement (state, payload) {
    return { count: --state.count }
  },
})

// Call sandboxed actions using the reducer itself!
SandboxedCounter.increment()
// This action will only get called through this state
```

## Help and Contributions
PRs and issues are welcome and wanted. Before submitting a feature-based PR, please file an issue to gauge its alignment with the goals of the project.

## License

[MIT](LICENSE) © Jumpsuit
