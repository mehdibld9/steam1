---
name: Orval Zod Conflict
description: Removing schemas option from orval zod config to fix duplicate TS export errors
---
Orval's zod client config had `schemas: { path: "generated/types", type: "typescript" }` which generates separate TypeScript interfaces alongside Zod schemas — both named identically. When `lib/api-zod/src/index.ts` re-exports both, TypeScript throws TS2308 (duplicate member).

**Fix:** Remove `schemas` option from the `zod` config in `lib/api-spec/orval.config.ts`. The Zod schemas already provide runtime validation AND TypeScript types via inference — the separate interface files are redundant.

**Why:** The generated `index.ts` always does `export * from "./generated/api"` AND `export * from './generated/types'`. Since both export e.g. `SetupAdminBody` (as a Zod const and as an interface), TypeScript rejects it. Removing `schemas` means no types folder is generated, no conflict.

**How to apply:** Any time you add new schemas to the OpenAPI spec and regenerate with orval, if you see TS2308 errors about duplicate members, check that `schemas` is not in the zod output config.
