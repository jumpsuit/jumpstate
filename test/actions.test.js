import Actions, { addAction, removeAction, reset } from '../src/actions'

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
  addAction('increment', cb)
  expect(Actions.increment).toBeDefined()
  removeAction('increment')
  expect(Actions.increment).toBeUndefined()
})

test('Add/Remove Sandboxed Action', () => {
  const cb = () => {}
  addAction('increment', cb, 'myBox')
  expect(Actions.myBox.increment).toBeDefined()
  removeAction('increment', 'myBox')
  expect(Actions.myBox.increment).toBeUndefined()
})

test('Add action should prevent dups', () => {
  const cb = () => {}
  addAction('increment', cb)
  expect(Actions.increment).toBeDefined()
  expect(() => { addAction('increment', cb) }).toThrow()
})

test('Add sandbox action should prevent dups', () => {
  const cb = () => {}
  addAction('increment', cb)
  addAction('increment', cb, 'myBox')
  expect(Actions.increment).toBeDefined()
  expect(Actions.myBox.increment).toBeDefined()
  expect(() => { addAction('increment', cb) }).toThrow()
  expect(() => { addAction('increment', cb, 'myBox') }).toThrow()
  expect(() => { addAction('myBox', cb) }).toThrow()
})
