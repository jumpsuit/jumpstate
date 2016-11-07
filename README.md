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
- It's easy to learn/teach, and reads extremely well
- It has replaced the need for thunks and sagas.

*Did you know? Jumpstate is the core state-manager for [Jumpsuit](https://github.com/jumpsuit/jumpsuit), So if you like what you see, you'll likely love Jumpsuit as well!*

## Installation

```bash
$ npm install jumpstate --save
```

## Complete Example

```javascript
// Import Jumpstate
import { State, Effect, Actions, dispatch, getState, CreateJumpstateMiddleware } from 'jumpstate'

// Create a state with some actions
const Counter = State({
  // Initial State
  initial: { count: 0 },
  // Actions
  increment (state, payload) {
    return { count: state.count + 1 }
  }
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
  }
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
  // Just be sure to apply the Jumpstate Middlware :)
  applyMiddlware(
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
        <br />
        <br />
        {/* Call actions via the global Actions list */}
        <h3>Global Actions</h3>
        <button onClick={() => Actions.decrement()}>Decrement</button>
        <button onClick={() => Actions.increment()}>Increment</button>
        <br />
        <button onClick={() => Actions.asyncIncrement()}>Increment after 1 sec.</button>
        <br />
        <br />
        <br />
        {/* To use a sandboxed state, call the actions attached to its reducer */}
        <h3>Sandboxed Actions</h3>
        <button onClick={() => SandboxCounter.decrement()}>Decrement</button>
        <button onClick={() => SandboxCounter.increment()}>Increment</button>
        <br />
        <button onClick={() => Actions.asyncIncrement(true)}>Increment after 1 sec.</button>
      </div>
    )
  }
})

// You can take it from here...

// Oh, and you can still use the dispatcher and getState for traditional redux anytime you want
dispatch(reduxFormActionCreator())
console.log(getState()) // displays the current global state
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
    return { count: ++state.count }
  },
  decrement (state, payload) {
    return { count: --state.count }
  },
})

// Now you can use the reducer it returned in your redux setup
const store = createStore({
  counter: counterReducer
})

// And call global actions using jumpstate's `Actions` registry
Actions.increment()
```

## Sandboxed States
Sandboxed states are namespaced and isolated from global events. Their state can only be modified by calling actions via their reducer methods. They also return a reducer that is redux-compatible out of the box.

```javascript
import { State } from 'jumpstate'

// Create a sandboxed state by passing a name as the first parameter
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

// Now you can use the reducer it returned in your redux setup
const store = createStore({
  sandboxedCounter: SandboxedCounter
})

// Sandboxed actions are only accessible through the methods on it's reducer!
SandboxedCounter.increment()
```

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

To create a global effect:
```javascript
import { Hook } from 'jumpstate'

// You can hook into any actions, even ones from external libraries!
const myEffect = Effect((action, getState) => {
  if (action.type === 'redux-form/INITIALIZE') {
    console.log('A Redux-Form was just initialized with this payload', payload)
  }
})

// Load google analytics if it is not found
const myEffect = Hook((action, getState) => {
  GoogleAnalytics('send', 'page', payload.pathname)
})
```

## Actions
All global actions (including effects) are available via the `Actions` object.
```javascript
Actions.increment()
Actions.myEffect()
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


## Help and Contributions
PRs and issues are welcome and wanted. Before submitting a feature-based PR, please file an issue to gauge its alignment with the goals of the project.

## License

[MIT](LICENSE) © Jumpsuit
