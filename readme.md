# `try await` Async Functions for ECMAScript

This proposal is implemented as a [Babel plugin](./packages/babel-plugin-transform-try-await) to compile `try await` code down to valid ECMAScript. For a simple multi-instance example:

```js
async function fetchUser(userId) {
  const [gqlRes, gqlErr] = try await fetch(GRAPHQL_HOST + queryForUser(userId))
  
  if (!gqlErr) return gqlRes
  
  // If the GraphQL server doesn't respond properly, use fallback API
  const [apiRes, apiErr] = try await fetch(`${V1_API_HOST}/v1/users/${userId}`)
  
  // If the fallback API fails, throw the error
  if (apiErr) throw apiErr
  
  return apiRes
}
```
