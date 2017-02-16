import Middleware from '../src/middleware'

/* global test, expect, it,describe */

test('Import Middleware', () => {
  expect(Middleware).toBeDefined()
})

describe('CreateJumpstateMiddleware', () => {
  it('should not preserve storeUtils across stores', () => {
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

    let Store = Redux.createStore(
      Reducer,
      Redux.applyMiddleware(
        CreateJumpstateMiddleware()
      )
    )

    Reducer.setValue(1)

    Store = Redux.createStore(
      Reducer,
      Redux.applyMiddleware(
        CreateJumpstateMiddleware()
      )
    )

    Reducer.setValue(2)

    const state = Store.getState()

    expect(state.value).toEqual(2)
  })
})
