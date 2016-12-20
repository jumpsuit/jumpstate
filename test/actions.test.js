import Actions, { addAction, removeAction } from '../src/actions'

/* global test, expect */

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
