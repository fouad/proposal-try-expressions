<p align="center">
  <strong><code>try expressions</code></strong>
</p>

<p align="center">
  Proposal for simpler error handling<br/>
  when using functions and Promises in ECMAScript
</p>

<br/>

## Summary

The current `try...catch` error handling pattern leads to uncaught exceptions when dealing with promises. This is a new `try` syntax to combine a Promise's value and error or wrap an expression in a `try...catch` with a single return type, an Array.

```js
let [json, jsonErr] = try JSON.parse('{}')
let [value, err] = try await fetch()

// instead of

let json, jsonErr, value, err

try {
  json = JSON.parse('{}')
} catch (_jsonErr) {
  jsonErr = _jsonErr
}

try {
  value = await fetch()
} catch (_err) {
  err = _err
}
```

> It's backwards-compatible with existing `try...catch` usage, functions and expressions.

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

// Or for error reporting

reportError((try importantFn())[1])
```

## Design Decisions

- **Array return type.** This removes unnecessary opinion and bytes from source compared to using an Object.
  - 👍 `let [myValue, myError] = try await fn()`
  - 👎 `let { value: myValue, error: myError } = try await fn()`
- **Array order inspired by Golang.** This seems to make more sense instead of callback-style with error as the first argument, e.g. `res, err := http.Get(API_HOST)`

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

- This proposal is implemented as a [Babel plugin](./packages/babel-plugin-transform-try-await) to compile try expressions down to valid ECMAScript
- Backwards-compatible with existing exception handling and Promise spec
- Open to community for comment and testing

## Acknowledgements

- [Zack Argyle](https://twitter.com/ZackArgyle/status/1078448278352482304)
