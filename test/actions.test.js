import { Actions, ActionCreators, addAction, removeAction, reset } from '../src/actions'

/* global test, expect, beforeEach, jest */

beforeEach(() => {
  jest.resetModules()
  reset()
})

test('Imports Actions', () => {
  expect(Actions).toEqual({})
})

test('Add/Remove Action', () => {
  const cb = () => {}
  const cbc = () => 'actionCreator'
  addAction('increment', cb, cbc)
  expect(Actions.increment).toBeDefined()
  expect(ActionCreators.increment).toBeDefined()
  removeAction('increment')
  expect(Actions.increment).toBeUndefined()
  expect(ActionCreators.increment).toBeUndefined()
})

test('Add/Remove Sandboxed Action', () => {
  const cb = () => {}
  addAction('increment', cb, () => null, 'myBox')
  expect(Actions.myBox.increment).toBeDefined()
  expect(ActionCreators.myBox.increment).toBeDefined()
  removeAction('increment', 'myBox')
  expect(Actions.myBox.increment).toBeUndefined()
  expect(ActionCreators.myBox.increment).toBeUndefined()
})

test('Add action should prevent dups', () => {
  const cb = () => {}
  addAction('increment', cb)
  expect(Actions.increment).toBeDefined()
  expect(addAction('increment', cb)).toBe(true)
})

test('Add sandbox action should prevent dups', () => {
  const cb = () => {}
  addAction('increment', cb)
  addAction('increment', cb, () => null, 'myBox')
  expect(Actions.increment).toBeDefined()
  expect(Actions.myBox.increment).toBeDefined()
  expect(() => { addAction('increment', cb, () => null, 'myBox') }).toThrow()
  expect(() => { addAction('myBox', cb) }).toThrow()
})
