import Actions, { addAction, removeAction } from '../src/actions'

/* global test, expect, beforeEach, jest */

beforeEach(() => {
  jest.resetModules()
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

test('Add action should prevent dups', () => {
  const cb = () => {}
  addAction('increment', cb)
  expect(Actions.increment).toBeDefined()
  expect(() => { addAction('increment', cb) }).toThrow()
})
