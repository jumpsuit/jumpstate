# Changelog

## 1.0.7
Breaking Changes
- Reducers are now pure functions eg. `State()` will no longer return the current state.  To retrieve the current state, use the reserved hanging method `State.getState()`
