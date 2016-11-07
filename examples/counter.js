// Import Jumpstate
import { State, Effect, Actions, CreateJumpstateMiddleware } from 'jumpstate'

// These are some reusable actions for all of our counters
const increment = (state, payload) => {
  return { count: state.count + 1 }
}
const decrement = (state, payload) => {
  return { count: state.count - 1 }
}

// Create a state with some actions
const Counter = State({
  // Initial State
  initial: { count: 0 },
  // Actions
  increment,
  decrement
})

// Create a state with some actions
const Counter2 = State({
  // Initial State
  initial: { count: 0 },
  // Actions
  increment,
  decrement
})

// Create a sandboxed state with similar actions
const SandboxCounter = State('sandboxCounter', {
  // Initial State
  initial: { count: 0 },
  // Actions
  increment,
  decrement
})

// Create a global asynchronous event
Effect('asyncIncrement', (isSandbox) => {
  console.log(isSandbox)
  if (isSandbox) {
    return setTimeout(() => SandboxCounter.increment(), 1000)
  }
  setTimeout(() => Actions.increment(), 1000)
})

// Create a global effect, that will get run after every dispatch
Effect((action, getState) => {
  // Like never letting the second counter equal 10!
  if (getState().counter2.count === 10) {
    Actions.increment()
  }
})

// Setup your redux however you like
const reducers = {
  counter: Counter,
  counter2: Counter2,
  sandboxCounter: SandboxCounter
}

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

// Setup Redux any way your heart desires...
const store = createStore(
  combineReducers(reducers),
  // Just be sure to apply the Jumpstate Middlware :)
  applyMiddlware(CreateJumpstateMiddleware())
)

// You can take it from here...
