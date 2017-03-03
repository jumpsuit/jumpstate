import Effect from '../src/effect'

/* global test, expect, beforeEach, jest */

beforeEach(() => {
  jest.resetModules()
})

test('Import Effect', () => {
  expect(Effect).toBeDefined()
})

test('Effect should throw error when action namespace is already taken', () => {
  const cb = () => {}
  expect(() => { Effect('someEffect', cb) }).not.toThrow()
  expect(() => { Effect('someEffect', cb) }).toThrow()
})

test('Tightly looped effects should all resolve', () => {
  const Jumpstate = require('../src/index')
  const State = Jumpstate.State
  const EffectR = Jumpstate.Effect
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

  const cb = () => { return Promise.resolve(true) }
  const testEffect = EffectR('tightEffect', cb)
  const promises = []
  for (let i = 0; i < 100; i++) { promises.push(testEffect()) }
  // A throw means the test fails.
  // If a promise does not resolve, the test will time out and fail.
  return Promise.all(promises).then(results => expect(results.length).toEqual(100))
})
