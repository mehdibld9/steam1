---
name: Zod in api-server routes
description: api-server does not have zod as a direct dep; use @workspace/api-zod schemas
---
`artifacts/api-server` does not have `zod` in its package.json dependencies. Importing `from "zod"` directly in route files causes esbuild to fail with "Could not resolve zod".

**Fix:** Import Zod schemas from `@workspace/api-zod` instead. For example:
```ts
import { CreateAdBody, UpdateAdBody, UpdateAdParams, DeleteAdParams } from "@workspace/api-zod";
```
The generated Zod schemas in `lib/api-zod/src/generated/api.ts` follow naming pattern: `{OperationId}Body`, `{OperationId}Params`, `{OperationId}Response`.

**Why:** The api-server bundles with esbuild which resolves deps from package.json. Zod is only a dep of `@workspace/api-zod`, not of `api-server` itself. `@workspace/api-zod` is bundled by esbuild as part of the monorepo.
