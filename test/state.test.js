/* global test, expect, beforeEach, jest, describe, it */

beforeEach(() => {
  jest.resetModules()
})

test('Import State', () => {
  const Jumpstate = require('../src/index')
  const State = Jumpstate.State
  expect(State).toBeDefined()
})

describe('State', () => {
  it('return a reducer', () => {
    const Jumpstate = require('../src/index')
    const State = Jumpstate.State

    const Reducer = State({
      initial: { value: 0 },
      setValue (state, payload) {
        return { value: payload }
      }
    })

    expect(typeof Reducer).toEqual('function')
    const initialState = Reducer(undefined, { type: '@@redux/INIT' })
    expect(typeof initialState).toEqual('object')
    expect(initialState.value).toBe(0)
    const newState = Reducer(initialState, { type: 'setValue', payload: 4 })
    expect(typeof newState).toEqual('object')
    expect(newState.value).toBe(4)
  })

  it('uses hydrated state instead of initial', () => {
    const Jumpstate = require('../src/index')
    const State = Jumpstate.State

    const Reducer = State({
      initial: { value: 0 },
      setValue (state, payload) {
        return { value: payload }
      }
    })

    expect(typeof Reducer).toEqual('function')
    const initialState = Reducer({ value: 100 }, { type: '@@redux/INIT' })
    expect(typeof initialState).toEqual('object')
    expect(initialState.value).toBe(100)
  })

  it('sets a global action creator', () => {
    const Jumpstate = require('../src/index')
    const State = Jumpstate.State
    const Actions = Jumpstate.Actions
    const CreateJumpstateMiddleware = Jumpstate.CreateJumpstateMiddleware
    const Redux = require('redux')

    const Reducer = State({
      initial: { word: 'abc' },
      setWord (state, payload) {
        return { word: payload }
      }
    })

    const Store = Redux.createStore(
      Reducer,
      Redux.applyMiddleware(
        CreateJumpstateMiddleware()
      )
    )

    expect(Actions.setWord).toBeDefined()
    Actions.setWord('hello')
    expect(Store.getState().word).toEqual('hello')
  })

  it('have local action creator', () => {
    const Jumpstate = require('../src/index')
    const State = Jumpstate.State
    const CreateJumpstateMiddleware = Jumpstate.CreateJumpstateMiddleware
    const Redux = require('redux')

    const Reducer = State({
      initial: { word: 'abc' },
      setWord (state, payload) {
        return { word: payload }
      }
    })

    const Store = Redux.createStore(
      Reducer,
      Redux.applyMiddleware(
        CreateJumpstateMiddleware()
      )
    )

    expect(Reducer.setWord).toBeDefined()
    Reducer.setWord('hello')
    expect(Store.getState().word).toEqual('hello')
  })

  it('wont mutate state', () => {
    const Jumpstate = require('../src/index')
    const State = Jumpstate.State
    const CreateJumpstateMiddleware = Jumpstate.CreateJumpstateMiddleware
    const Redux = require('redux')

    const Reducer = State({
      initial: { value: 0 },
      setValue (state, payload) {
        return { value: payload }
      }
    })

    Redux.createStore(
      Reducer,
      Redux.applyMiddleware(
        CreateJumpstateMiddleware()
      )
    )

    const oldState = Reducer.setValue(100)
    const newState = Reducer.setValue(200)
    expect(oldState).not.toEqual(newState)
  })

  it('has support to legacy getState method', () => {
    const Jumpstate = require('../src/index')
    const State = Jumpstate.State
    const Actions = Jumpstate.Actions
    const CreateJumpstateMiddleware = Jumpstate.CreateJumpstateMiddleware
    const Redux = require('redux')

    const Reducer = State({
      initial: { word: 'abc' },
      setWord (state, payload) {
        return { word: payload }
      }
    })

    Redux.createStore(
      Reducer,
      Redux.applyMiddleware(
        CreateJumpstateMiddleware()
      )
    )

    expect(Actions.setWord).toBeDefined()
    Actions.setWord('hello')
    expect(Reducer.getState().word).toEqual('hello')
  })
})

describe('Sandboxed State', () => {
  it('throws in case of invalid name', () => {
    const Jumpstate = require('../src/index')
    const State = Jumpstate.State

    expect(() => {
      State('sandboxReducer', {
        initial: { value: 0 },
        setValue (state, payload) {
          return { value: payload }
        }
      })
    }).not.toThrow()

    expect(() => {
      State('', {
        initial: { value: 0 },
        setValue (state, payload) {
          return { value: payload }
        }
      })
    }).toThrow()

    expect(() => {
      State(() => { return 'sandboxedReducer' }, {
        initial: { value: 0 },
        setValue (state, payload) {
          return { value: payload }
        }
      })
    }).toThrow()

    expect(() => {
      State(null, {
        initial: { value: 0 },
        setValue (state, payload) {
          return { value: payload }
        }
      })
    }).toThrow()

    expect(() => {
      State(9, {
        initial: { value: 0 },
        setValue (state, payload) {
          return { value: payload }
        }
      })
    }).toThrow()
  })

  it('wont setup a global action creator', () => {
    const Jumpstate = require('../src/index')
    const State = Jumpstate.State
    const Actions = Jumpstate.Actions

    State('sandboxedReducer', {
      initial: { word: 'abc' },
      setWord (state, payload) {
        return { word: payload }
      }
    })

    expect(Actions.setWord).not.toBeDefined()
  })
})
