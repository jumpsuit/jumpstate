# Jumpstate

Jumpstate is a simple and powerful state management utility for Redux.

- Lightweight at **2kb**
- Write less, read easier, teach faster
- Effects (Async actions and side-effects)
- Global hook system
- No action creators
- No action constants
- No dispatching required

#### Why do we love it?
- It provides a clear and understandable way of managing state
- It has massively reduced the amount of code we maintain
- It is easy to learn/teach, and reads extremely well
- It has replaced the need for thunks and sagas.

*Jumpstate is now officially maintained by [Decipher](http://deciphernow.com/)!*

## Installation

```bash
$ npm install jumpstate --save
```

## Complete Example

```javascript
// Import Jumpstate
import { State, Effect, Actions, Hook, dispatch, getState, CreateJumpstateMiddleware } from 'jumpstate'

// Create a state with some actions
const Counter = State({
  // Initial State
  initial: { count: 0 },
  // Actions
  increment (state, payload) {
    return { count: state.count + 1 }
  },
  decrement (state, payload) {
    return { count: state.count - 1 }
  }
})

// Create a sandboxed state with similar actions
const SandboxCounter = State('sandboxCounter', {
  // Initial State
  initial: { count: 0 },
  // Actions
  increment (state, payload) {
    return { count: state.count + 1 }
  },
  decrement (state, payload) {
    return { count: state.count - 1 }
  }
})

// Create an asynchronous effect
Effect('asyncIncrement', (isSandbox) => {
  console.log(isSandbox)
  if (isSandbox) {
    return setTimeout(() => SandboxCounter.increment(), 1000)
  }
  setTimeout(() => Actions.increment(), 1000)
})

// Create a hook
Hook((action, getState) => {
  // Like never letting the first counter equal 10!
  if (getState().counter.count === 10) {
    Actions.increment()
  }
})

// Setup your redux however you like
const reducers = {
  counter: Counter,
  counter2: Counter2,
  sandboxCounter: SandboxCounter
}

const store = createStore(
  combineReducers(reducers),
  // Just be sure to apply the Jumpstate Middleware :)
  applyMiddleware(
    CreateJumpstateMiddleware()
  )
)

// Somwhere in a connected component...
React.createClass({
  render () {
    return (
      <div>
        <h1>Counter 1: { this.props.count }</h1>
        <h1>Counter 2: { this.props.count2 } <em>*Try to make me 10</em></h1>
        <h1>Sandboxed Counter: { this.props.sandboxCount }</h1>

        <h3>Global Actions</h3>
        <button onClick={() => Actions.decrement()}>Decrement</button>
        <button onClick={() => Actions.increment()}>Increment</button>
        <button onClick={() => Actions.asyncIncrement()}>Increment after 1 sec.</button>

        <h3>Sandboxed Actions</h3>
        <button onClick={() => SandboxCounter.decrement()}>Decrement</button>
        <button onClick={() => SandboxCounter.increment()}>Increment</button>
        <button onClick={() => Actions.asyncIncrement(true)}>Increment after 1 sec.</button>
      </div>
    )
  }
})

// You can still use the dispatcher and getState for traditional redux anytime you want
dispatch(reduxFormActionCreator())
console.log(getState()) // displays the current global state

// You take it from here...
```

## Global States

Creating a global state is easy, and in return you get a reducer that is usable with redux right out of the box.

```javascript
import { State, Actions } from 'jumpstate'

// Use `State` to make a new global state
const counterReducer = State({
  // Initial State
  initial: { count: 0 },
  // Actions
  increment (state, payload) {
    return { count: state.count + 1 }
  },
  decrement (state, payload) {
    return { count: state.count - 1 }
  }
})

// Now you can use the reducer it returned in your redux setup
const store = createStore({
  counter: counterReducer
})

// And call global actions using jumpstate's `Actions` registry
Actions.increment()
```

## State Actions
When you create a state, you assign action functions that can change that state in some way. When called, each action received the current `state`, and the `payload` that was passed with the call.

It's important to maintain immutability here, and not mutate the current state in these actions. Doing so will meddle with debugging, time-travel, and the underlying redux instance.

```javascript
increment (state, payload) {
  return {
    count: state.count + 1
  }
},
```

In the example above, we created a new state with our updated count. Win!

## Effects
Effects, at their core, are asynchronous actions. They build on the concepts of [thunks](https://github.com/gaearon/redux-thunk) and [sagas](https://github.com/yelouafi/redux-saga) **but are much easier to understand and use**. Unlike thunks, Effects have their own redux actions, and their callback are executed **because** of those actions. You also gain all of the benefits of a side-effects model, without having to deal with the convoluted api of redux-saga.

To create an effect:
```javascript
import { Effect, Actions } from 'jumpstate'

const postFetchEffect = Effect('postsFetch', (payload) => {
  // You can do anything here, but async actions are a great use case:
  Actions.showLoading(true)
  Axio.get('http://mysite.com/posts')
    .then(Actions.postsFetchSuccess)
    .catch(Actions.postsFetchError)
    .finally(() => Actions.showLoading(false))
})

// Call the effect
Actions.postsFetch()
// or alternatively
postFetchEffect()
```

## Hooks
A simple hook system that lets you monitor your state for actions or conditions and do just about anything you want.

To create a hook:
```javascript
import { Hook, Actions } from 'jumpstate'

// You can hook into any actions, even ones from external libraries!
const formLoadedHook = Hook((action, getState) => {
  if (action.type === 'redux-form/INITIALIZE') {
    console.log('A Redux-Form was just initialized with this payload', payload)
  }
})

// Load google analytics if it is not yet loaded
const analyticsLoadedHook = Hook((action, getState) => {
  if (!getState().analytics.loaded)
  Actions.analytics.load()
})

// Cancel a hook:
formLoadedHook.cancel()
analyticsLoadedHook.cancel()
```

## Actions
All actions (including effects) are available via the `Actions` object.
```javascript
Actions.increment()
Actions.mySandbox.increment()
Actions.myEffect()
```

## Sandboxed States
Sandboxed states are namespaced and isolated from global events. Their state can only be modified by calling actions via `Actions.prefixName.actionName()` or directly via their reducer methods. They also return a reducer that is redux-compatible out of the box.

```javascript
import { State, Actions } from 'jumpstate'

// Create a sandboxed state by passing a name as the first parameter
const SandboxedCounter = State('otherCounter', {
  // Initial State
  initial: { count: 0 },
  // Actions
  increment (state, payload) {
    return { count: state.count + 1 }
  },
  decrement (state, payload) {
    return { count: state.count - 1 }
  },
})

// Now you can use the reducer it returned in your redux setup
const store = createStore({
  sandboxedCounter: SandboxedCounter
})

// Sandboxed actions are accessible through the prefix on Actions or as methods on its reducer!
Actions.otherCounter.increment()
// or
SandboxedCounter.increment()
```

## Action Creators
Jumpstate automatically provides you with access to the action creators that power your actions. Every action has a corresponding action creator method on:

1. The importable `ActionCreators` object
1. The reducer that the action belongs to via `myReducer.actionCreators`
1. The effect via `myEffect.actionCreator`

```javascript
import { State, Actions, Effect, ActionCreators } from 'jumpstate'

const globalCounterReducer = State({
  initial: { count: 0 },
  increment (state, payload) {
    return { count: state.count + 1 }
  }
})

const myCounterReducer = State('myCounter', {
  initial: { count: 0 },
  increment (state, payload) {
    return { count: state.count + 1 }
  }
})

const incrementAsyncEffect = Effect('incrementAsync', () => setTimeout(() => Actions.increment(), 1000))

// All of the available action creators are available...

// On The ActionCreators object:
ActionCreators.increment(2) === {
  type: 'increment',
  payload: 2
}
ActionCreators.myCounter.increment(2) === {
  type: 'myCounter_increment',
  payload: 2
}
ActionCreators.incrementAsync(2) === {
  type: 'incrementAsync',
  payload: 2
}

// And on the reducer/effect the action belongs to:
globalCounterReducer.actionCreators.increment(2) === {
  type: 'increment',
  payload: 2
}
myCounterReducer.actionCreators.increment(2) === {
  type: 'myCounter_increment',
  payload: 2
}
incrementAsyncEffect.actionCreator.increment(2) === {
  type: 'myCounter_increment',
  payload: 2
}
```

A common pattern in redux is to export your actionCreators and bind/utilize them in your components. Now you can!
```javascript
// Examples are on the way :)
```

### Removing/Cancelling Effects and Hooks
If you know you are done with an effect or hook and want to free up some memory, you can cancel them:
```javascript
// Effects
const myEffect = Effect(...)
myEffect.cancel()

// Hooks
const myHook = Hook(...)
myHook.cancel()
```


## Join us on Slack
- [Join Here](https://react-chat-signup.herokuapp.com/)
- [Chat Here](https://react-tools.slack.com/)

## Team

[![Decipher Technology Studios](https://avatars2.githubusercontent.com/u/13125018?s=100&v=4)](https://github.com/DecipherNow) [![Tanner Linsley](https://avatars1.githubusercontent.com/u/5580297?v=3&s=100)](https://github.com/tannerlinsley) [![Jason Maurer](https://avatars2.githubusercontent.com/u/911274?v=3&s=100)](https://github.com/jsonmaur)

[Decipher](https://github.com/DecipherNow) | [Tanner Linsley](https://github.com/tannerlinsley) | [Jason Maurer](https://github.com/jsonmaur)

## Previously used by

<a href='https://nozzle.io'>
  <img src='https://nozzle.io/img/logo-blue.png' alt='Nozzle Logo' style='width:300px;'/>
</a>

## Help and Contributions
PRs and issues are welcome and wanted. Before submitting a feature-based PR, please file an issue to gauge its alignment with the goals of the project.

## License

[MIT](LICENSE) © Jumpsuit
