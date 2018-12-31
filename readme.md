<p align="center">
  <strong><code>try await</code></strong>
</p>

<p align="center">
  Proposal for simpler error handling<br/>
  when using Async Functions in ECMAScript
</p>

<br/>

## Summary

The current `try catch` error handling pattern leads to uncaught exceptions when dealing with promises. This is a new `try` syntax for Async Functions to combine a Promise's value and error into a single return as an Array.

```js
let [value, err] = try await fetch()

// instead of

let value, err
try {
  value = await fetch()
} catch (_err) {
  err = _err
}
```

> It's backwards-compatible with existing `try catch` usage and functions that return a Promise.

## Example

```js
async function fetchUser(userId) {
  let [gqlRes, gqlErr] = try await fetch(GRAPHQL_HOST + queryForUser(userId))
  
  if (!gqlErr) return gqlRes
  
  // If the GraphQL server doesn't respond properly, use fallback API
  let [apiRes, apiErr] = try await fetch(`${V1_API_HOST}/v1/users/${userId}`)
  
  // If the fallback API fails, throw the error
  if (apiErr) throw apiErr
  
  return apiRes
}
```

## Design Decisions

- **Array return type.** This removes unnecessary opinion and bytes from source compared to using an Object.
  - 👍 `let [myValue, myError] = try await fn()`
  - 👎 `let { value: myValue, error: myError } = try await fn()`
- **Array order inspired by Golang.** This seems to make more sense instead of callback-style with error as the first argument, e.g. `res, err := http.Get(API_HOST)`
- **Promises only.** Synchronous code (e.g. `let [value, error] = try fn()`) is a much broader code surface area. This proposal can serve as experiment with the pattern.

## Alternatives

### Status Quo

#### async/await

```js
async function fetchUser(userId) {
  try {
    return await fetch(GRAPHQL_HOST + queryForUser(userId))
  } catch (gqlErr) {
    try {
      return await fetch(`${V1_API_HOST}/v1/users/${userId}`)
    } catch (apiErr) {
      throw apiErr
    }
  }
}
```

#### async/await + catch

```js
async function fetchUser(userId) {
  let gqlErr, gqlErr

  gqlRes = await fetch(GRAPHQL_HOST + queryForUser(userId)).catch(err => gqlErr = err)
  
  if (gqlErr) {
    return await fetch(`${V1_API_HOST}/v1/users/${userId}`)
  }
  
  return gqlRes
}
```

### Userland Modules

- [await-to-js](https://github.com/scopsy/await-to-js)
- [@nucleartide/dx](https://github.com/nucleartide/dx)

## Adoption Strategy

- This proposal is implemented as a [Babel plugin](./packages/babel-plugin-transform-try-await) to compile `try await` code down to valid ECMAScript
- Backwards-compatible with existing exception handling and Promise spec
- Open to community for comment and testing




