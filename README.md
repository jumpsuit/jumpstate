# Jumpstate

Jumpstate is a lightweight Redux utility that packs some serious power and some awesome features:

- Get all the benefits of Thunks, Sagas, and even Relay-like side-effects without the bloat
- Concise and small. No action constants or creators required
- No more repetitive `dispatch`ing
- Powered by Redux under the hood

#### Why do we love it?
- It provides a clear and deliberate way of managing our state
- It has reduced the amount of code we maintain for our state by more than 30%
- It's easy to learn and reads extremely well

*Did you know? Jumpstate is the core state-manager for [Jumpsuit](https://github.com/jumpsuit/jumpsuit), So if you like what you see, you'll likely love Jumpsuit as well!*

## Installation

```bash
$ npm install jumpstate --save
```

## Usage

```javascript
import { State, Effect, Actions, GetState, Dispatch, CreateJumpstateMiddleware } from 'jumpstate'
import { createStore, combineReducers } from 'redux'
import { connect } from 'redux-react'

// Create a state with some actions
const CounterState = State('counter', {
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

// This is an async action.
// It's even tracked in the state history :) eg. {type: 'asyncIncrement', payload: ...}
Effect('asyncIncrement', () => {
  setTimeout(() => CounterState.increment(), 1000)
})

// This is a generic side-effect.
// You can monitor your state for any actions or state, and respond however you want.
Effect((action, getState) => {
  // Like never letting the count equal 10! Muahahaha
  if (getState().CounterState.count === 10) {
    Math.random() > .5 ? CounterState.increment() : CounterState.decrement()
  }
})


// To wire it up, create a new middleware instance from jumpstate
const JumpstateMiddleware = CreateJumpstateMiddleware()

// Then setup your redux however you like
const reducers = {
  counter: CounterState
}

// As long as you apply the jumpstate middleware to your store
const store = createStore(
  combineReducers(reducers)
  applyMiddware(JumpstateMiddleware)
)



// Now, anywhere else in your app...

// Get the current State of a specific reducer
console.log(CounterState())
// { count: 0}

// Call a specific action on the reducer itself!
CounterState.increment()
console.log(CounterState())
// { count: 1}

// Or call it using the action registry!
Actions.Counter.increment()
console.log(CounterState())
// { count: 2}

// Or call it as a global action, which will be handled by every reducer
Actions.increment()
console.log(CounterState())
// { count: 3}

// Get the current global state anytime you want
console.log(getState())
// { counter: { count: 0} }

// Use the dispatcher anytime you want
dispatch(reduxFormActionCreator())
```

## API
- **State(name/config, actions)** - Creates a new state.
  - `name/config` - an optional string or config object
  - `actions` - an object of action functions including a required `initial` property
- **Effect()** - Creates a new asynchronous action. Callable via the return function or via `Actions.myAsyncAction()`
- **Actions** - A global registry of available actions.
  - `myAction` - All global actions are attached to the root of `Actions`
  - `StateName.myAction` - All state-specific actions are accessible via the state name (capitalized)
- **GetState()** - Access the read-only global state at any time
- **Dispatch()** - Dispatch any standard redux action at any time

## Configuration

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

## Help and Contributions
PRs and issues are welcome and wanted. Before submitting a feature-based PR, please file an issue to gauge its alignment with the goals of the project.

## License

[MIT](LICENSE) © Jumpsuit
