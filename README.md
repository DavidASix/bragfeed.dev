# Bragfeed.dev
Do you build static sites for your clients, but struggle to integrate Google Reviews into your static setup? Your solution is right here!

- **What is this?**
	- A SaaS which provides an easy way to integration Google Reviews for your business into a statically generated website. 
- **What's the value?**
	- Google makes it difficult to display your Google Reviews on your website, and there is no solution online to use your active Google reviews as a data source for static site generation. You can point to this software as a data-source for your statically generated site, so that each time your site is re-built, your Google Reviews re-fetch and update, serving statically on your site.
- **Target Users?**
	- Web developers who design websites for small and local businesses. People who design statically generated websites can implement this tool to have their clients reviews show on the websites they build.


## Deployment Procedure

All deployments to `main` must first be opened as a pull request targeting the `staging` branch for review. Use `staging` to validate changes in a realistic environment before anything reaches `main`.

- PRs targeting `staging` must pass CI checks before they can be merged.
- Every deployment to `main` must be reviewed and approved by the repository code owner and reviewed by Copilot.
- If your changes include a Drizzle migration flag it as such as, the production database migration action will need to be run during the merge process:

```bash
pnpm db:production:migrate
```


## Request Middleware System

This project uses a composable middleware system that allows you to easily add authentication, body parsing, and other common functionality to API routes. The middleware can be chained together in any order, providing flexibility in how you structure your endpoints.

### Available Middleware

#### `withAuth`
Validates user session authentication and adds `user_id` to the context.

```typescript
import { withAuth } from "@/middleware/withAuth";

export const GET = withAuth(async (_, context) => {
  const { user_id } = context; // string - authenticated user's ID
  // Implementation...
});
```

#### `withApiKey`
Validates API key authentication from the `Authorization` header and adds `user_id` to the context.

```typescript
import { withApiKey } from "@/middleware/withApiKey";

export const GET = withApiKey(async (_, context) => {
  const { user_id } = context; // string - API key owner's user ID
  // Implementation...
});
```

#### `withBody`
Parses and validates request body using Zod schemas, adding the typed `body` to the context.

```typescript
import { withBody } from "@/middleware/withBody";
import schema from "./schema";

export const POST = withBody(schema, async (_, context) => {
  const { body } = context; // Typed and validated request body
  // Implementation...
});
```

### Middleware Chaining

Middleware can be chained together in any order, though authentication typically comes first:

```typescript
// Authentication + Body parsing
export const POST = withAuth(
  withBody(schema, async (_, context) => {
    const { user_id, body } = context;
    // Both user_id and parsed body available
  })
);

// API Key + Body parsing
export const POST = withApiKey(
  withBody(schema, async (_, context) => {
    const { user_id, body } = context;
    // API key validation + parsed body
  })
);
```

### Creating Custom Middleware

To create additional middleware, follow this pattern:

```typescript
type CustomContext = {
  customData: string;
};

export function withCustom<T extends object & { customData?: never }>(
  handler: RequestHandler<T & CustomContext>
): RequestHandler<T> {
  return async function (req, context: T) {
    // Custom logic here
    const customData = "processed data";
    
    const newContext = { ...context, customData };
    return handler(req, newContext as T & CustomContext);
  };
}
```

The key principles:
- Use TypeScript generics to ensure type safety
- Spread existing context and add new properties
- Return a function that matches the `RequestHandler` type
- Handle errors appropriately with proper HTTP status codes

## Type-Safe API Request Pattern

This project uses a custom type-safe API request pattern that ensures both client and server are aware of expected request and response formats. The pattern leverages Zod schemas for runtime validation and TypeScript for compile-time type safety.

### How It Works

Each API endpoint has two key files:
1. **Route Handler** (`/api/endpoint/route.ts`) - The server-side implementation
2. **Schema Definition** (`/api/endpoint/schema.ts`) - Shared type definitions

### Schema Structure

API schemas follow the `APISchema` type defined in `src/schema/types.ts`:

```typescript
type APISchema<TRequestSchema, TResponseSchema> = {
  url: string;               // API endpoint URL
  request: TRequestSchema;   // Zod schema for request body
  response: TResponseSchema; // Zod schema for response body
};
```

### Example: GET Request

**Schema** (`src/app/api/security/get-latest-active-key/schema.ts`):
```typescript
import { z } from "zod";
import type { APISchema } from "@/schema/types";

const schema = {
  url: "/api/security/get-latest-active-key",
  request: z.undefined(), // No request body for GET
  response: z.object({
    apiKey: z.string().nullable(),
  }),
} satisfies APISchema;

export default schema;
```

**Client Usage**:
```typescript
import requests from "@/lib/requests";
import getLatestActiveKeySchema from "@/app/api/security/get-latest-active-key/schema";

// Type-safe GET request
const { apiKey } = await requests.get(getLatestActiveKeySchema);
// apiKey is typed as string | null
```

### Example: POST Request

**Schema** (`src/app/api/purchases/initialize-checkout/schema.ts`):
```typescript
import { z } from "zod";
import { productKeys } from "@/lib/products";
import type { APISchema } from "@/schema/types";

const schema = {
  url: "/api/purchases/checkout-context",
  request: z.object({
    product: z.enum(productKeys),
  }),
  response: z.object({
    session: z.any(), // Stripe session object
  }),
} satisfies APISchema;

export default schema;
```

**Client Usage**:
```typescript
import requests from "@/lib/requests";
import checkoutContextSchema from "@/app/api/purchases/initialize-checkout/schema";

// Type-safe POST request with validation
const checkout = await requests.post(checkoutContextSchema, {
  product: "all_access", // Validated against schema
});
// checkout.session is typed according to response schema
```

### Server-Side Usage

Route handlers import and use the schema for validation:

```typescript
import schema from "./schema";

export const POST = withAuth(
  withBody(schema, async (_, context) => {
    const { body } = context; // body is typed and validated
    
    // Process request...
    
    const response = schema.response.parse(result);
    return NextResponse.json(response);
  })
);
```

### Benefits

- **Type Safety**: Full TypeScript support from client to server
- **Runtime Validation**: Zod schemas validate data at runtime
- **Single Source of Truth**: Schema shared between client and server
- **Developer Experience**: Autocomplete and compile-time error checking
- **Maintainability**: Schema changes automatically propagate type updates

> [!NOTE]
> Yes, I'm aware of the existence of tRPC, but I figured building my own E2E type safety system would build character (and be more lightweight)
