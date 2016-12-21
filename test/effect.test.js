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
