# Bragfeed.dev

Bragfeed provides Google Reviews as a data source for developers building static client websites. Customer builds call the paid API to refresh and read review data without requiring a dynamic website runtime.

## Deployment procedure

All deployments to `main` must first be opened as a pull request targeting the `staging` branch for review. Use `staging` to validate changes in a realistic environment before anything reaches `main`.

- PRs targeting `staging` must pass CI checks before they can be merged.
- Every deployment to `main` must be reviewed and approved by the repository code owner and reviewed by Copilot.
- If changes include a Drizzle migration, flag it because the production database migration action must run during the merge process.

```bash
pnpm db:production:migrate
```

## Application API conventions

Browser-facing product operations use tRPC through the single `/api/trpc` route. Feature procedures live in `src/trpc/routers`, and the root router only composes those feature routers.

- Use `protectedProcedure` for operations available to any signed-in user.
- Use `paidProcedure` only when an active subscription is part of the operation's existing policy.
- Validate every procedure input with Zod through `.input(...)`.
- Return domain data directly. SuperJSON preserves values such as `Date` across the browser boundary.

Add a query or mutation to the router that owns its feature. Client components consume it through the generated `api` hooks:

```typescript
const utils = api.useUtils();
const businessQuery = api.google.getBusinessDetails.useQuery({ businessId });

const updateMutation = api.google.updateMinimumScore.useMutation({
  onSuccess: () =>
    utils.google.getBusinessDetails.invalidate({ businessId }),
});
```

Use generated tRPC utilities for invalidation and `skipToken` for a query whose input is not yet available. Preserve `meta.errorMessage` in query options so the shared query cache displays a useful toast.

The paid public API and Stripe webhook remain conventional Next.js route handlers because their callers are external systems with different trust boundaries. These handlers should show authentication, authorization, validation, and policy checks explicitly in top-to-bottom order, while sharing transport-neutral server functions for database-backed decisions.

Every route under `src/app/api/(endpoints)` must declare and export a `schema` object containing `input` and `output` Zod schemas in its `route.ts` file. Keep the contract beside the handler rather than creating a separate `schema.ts`; the endpoint convention test enforces both requirements.
