---
name: Orval queryKey required in hook options
description: Generated React Query hooks now require explicit queryKey in query options
---
After regenerating with Orval, hooks like `useListMods`, `useListAds` etc. require a `queryKey` in the `query` options object. Without it, TypeScript throws TS2741 "Property 'queryKey' is missing".

**Fix:** Always pass the queryKey helper:
```ts
const { data } = useListMods({ query: { refetchOnWindowFocus: true, queryKey: getListModsQueryKey() } })
```

**Why:** Orval generates the hook with a strongly-typed QueryKey type parameter that requires the queryKey to match. When using query options, always include `queryKey: get{OperationId}QueryKey(...)`.

**How to apply:** Any time you call a generated query hook with a `query` options object, include the matching `queryKey` from the generated helper function.
