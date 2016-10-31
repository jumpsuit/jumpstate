# Jumpstate

Jumpstate is a dead-simple state machine for Redux and Vanilla JS that packs some serious power and some awesome key features:

- Provides methods instead of actions and a dispatcher
- Concise and small. No action constants or creators required
- No more repetitive `dispatch`ing
- Supports Redux and Vanilla JS

#### Why do we love it?
- It has encouraged us to use clear and deliberate imports and dependencies to manipulate our state
- It has reduced the amount of code we maintain for our state by 30%
- It's easy to learn and reads well
- It's testable and predictable

*Did you know? Jumpstate used to be exclusively available in [Jumpsuit](https://github.com/jumpsuit/jumpsuit), but we think it's meant for bigger things and can't wait to see what you do with it!*

## Installation

```bash
$ npm install jumpstate --save
```

## Redux Usage

```javascript
import { combineReducers } from 'redux'
import Jumpstate, { attachDispatcher } from 'jumpstate'

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
    return { count: ++state.count }
    // State is always immutable, so by default, jumpstate
    // will autoAssign your return value to a new
    // state object.  If you would like to manage your
    // own immutability, set `autoAssign: false` in the
    // state's config.
  },
  decrement (state) {
    return { count: --state.count }
  },
  setNote (state, note, reverse) {
    return {
      reverse ? note.split('').reverse().join('') : note
    }
  }
})

// Regular Redux
const reducers = {
  counter,
}
const rootReducer = combineReducers(reducers)
const store = createStore(rootReducer)

// After the store is created, we just need to supply
// our jumpstate's with the store dispatcher.

// You can pass it your reducer map
attachDispatcher(store, reducers)
// or an array of reducers
attachDispatcher(store, [counter])
// or a single reducer
attachDispatcher(store, counter)

// HINT: Want to fire your own actions through the Redux dispatcher?
// See the `Use as an action creator` section below ;)

// Somewhere else in your app...

// Get the current State
counter()
// { count: 0, note: '' }

// Call some actions
counter.increment()
// { count: 1, note: '' }
counter.setNote('Hello!', true)
// { count: 1, note: '!olleH' }
```

## Vanilla JS Usage

Using jumpstate on its own is exactly like the example above, with the exception of only importing `jumpstate` and setting `detached: true` in the optional config.

```javascript
import Jumpstate from 'jumpstate'

const counter = Jumpstate({
  detached: true // Now this state is a simple state machine
},{
  initial: {...}, // see Redux example
  increment (state) {...}, // see Redux example
  decrement (state) {...}, // see Redux example
  setNote (state, note, reverse) {...} // see Redux example
})

// Get the current State
counter()
// { count: 0, note: '' }

// Call some actions
counter.increment()
// { count: 1, note: '' }
counter.setNote('Hello!', true)
// { count: 1, note: '!olleH' }
```

## Configuration

Each state can be configured with some optional settings:
```javascript
Jumpstate({
  name: 'myState' // This name is used in Redux actions and for debugging. Defaults to a random unique short_id if not specified
  detached: false // If a state is detached it will not attempt to use Redux. Defaults to `false`
  autoAssign: true // Jumpstate auto-assigns your action returns into a new state instance to maintain state immutability. eg. `Object.assign({}, state, newState)`  If you would like to manage your own immutability, set this to false.
  actionCreator: false // If you would rather your jumpstate behave like an action creator, set this option to `true`, call an action with a payload, and you will receive a dispatchable action.
}, {
  initial: {},
  ...actions
})
```

You can also set global settings like so:
```javascript
import { jumpstateDefaults } from 'jumpstate'

jumpstateDefaults.actionCreator = true
// or
Object.assign(jumpstateDefaults, {
  detached: true,
  autoAssign: false,
})
```

## Passing multiple parameters
Jumpstate differs from Redux in that you can send multiple parameters when calling an action.

```javascript
myState.doSomething('Hello', true, [1,2,3,4])
```

In your action, each parameter follows after the current state.

```javascript
{
  doSomething (state, message, important, tags) {
    message === 'Hello' // true
    important === true // true
    tags === [1,2,3,4] // true
  }
}
```

## Use as an action creator
If you can't seem to get away from dispatching actions in the traditional sense, you can configure a Jumpstate to behave like an action creator like so:

```javascript
const counter = Jumpstate({
  actionCreator: true
}, {
  initial: {count: 0},
  increment (state, amount) {...}
})

// Call the action with a payload
const incrementAction = counter.increment(2)

// Dispatch away
dispatch(incrementAction)
```

## Help and Contributions
PRs and issues are welcome and wanted. Before submitting a feature-based PR, please file an issue to gauge its alignment with the goals of the project.

## License

[MIT](LICENSE) © Jumpsuit
