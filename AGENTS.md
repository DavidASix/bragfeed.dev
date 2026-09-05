# AGENTS.md

See @README.md for project overview and @package.json

## Development Commands

### Building and Testing
NOTE: If you need to access the server, ALWAYS try to reach localhost:3000 or check if docker is running before trying to start it, as it may already be running as started by the user.
- `docker compose up` - Running this starts the server and runs pnpm dev

### Code Quality
- `pnpm check` - Run all checks (types, lint, format, tests)
- `pnpm check:types` - TypeScript type checking
- `pnpm check:lint` - ESLint checking
- `pnpm check:format` - Prettier format checking
- `pnpm test` - Run all tests once
- `pnpm test:watch` - Run tests in watch mode
- `pnpm format` - Format code with Prettier

### Database Operations
Agents are not permitted to use the pnpm database commands directly.

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 16 with App Router
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js v5 with email magic links
- **Styling**: Tailwind CSS with shadcn/ui components
- **Testing**: Vitest
- **Payments**: Stripe integration

### Project Structure

#### Core Application
- `src/app/` - Next.js App Router pages and API routes
  - `(product)/` - Product pages (requires auth)
  - `(site)/` - Public marketing/auth pages

#### Key Directories
- `src/components/` - React components organized by purpose:
  - `common/` - Shared business logic components
  - `magicui/` - UI animation components
  - `structure/` - Layout components (header, footer, navigation)
  - `ui/` - shadcn/ui base components
- `src/lib/` - Utility functions and shared logic
- `src/schema/` - Database schema and migrations

### Database Schema
Uses Drizzle ORM with PostgreSQL. A full table structure can be found in `src/schema/schema.ts`
- Generate migrations with `pnpm db:generate`
- If you need a blank or custom migration, you can generate it with the command `pnpm exec drizzle-kit generate --custom --name=some-name`

### Authentication & Security
- **Session Auth**: NextAuth.js with magic link email authentication
- **API Auth**: Custom API key system with encrypted storage for access to programmatic endpoints.
- **External API Auth**: Explicit API-key and paid-access checks inside the conventional route handler
- **Stripe Auth**: Explicit Stripe signature verification inside the webhook route
- **Development**: Uses console logging for magic links instead of email sending

### Styling Conventions
Pages must use semantic `<section>` blocks with consistent layout:
```html
<section className="section section-padding">
    <div className="content">
        <!-- content here -->
    </div>
</section>
```
- When using a section tag you MUST apply section and section-padding first before other styles. These take care of the padding and spacing.
- When placing a div inside a section tag it MUST have either `content` or `content-wide` class as this takes care of the maximum width.
- When applying mobile optimization styles, you cannot duplicate components. You should be using conditional rendering based on tailwind breakpoints like this:
```jsx
<div className="grid grid-cols-1 md:grid-cols-2"> {/* Some card */} </div>
```

## Development Conventions

### Code Style

- Use `camelCase` except for database fields which are `snake_case` (due to SQL case-sensitivity)
- Prefer optional chaining: `address?.postalCode` over `address && address.postalCode`

### Type Safety Rules

- **Never use `any`** - use `unknown` instead if type is unknown
- **Avoid `as unknown as Type`** - indicates wrong approach
- **Avoid `as Type`** - also indicates wrong approach

### Strings
When writing site contents, respect eslintreact/no-unescaped-entities. This is a requirement. Escape chars like &apos; should be used instead of `'`.


## Tools

### ShadCN
If you are creating a new ShadCN component you MUST install it with a `pnpm dlx` command (like `pnpm dlx shadcn@latest add badge`). You should NEVER write a ShadCN component from scratch, it should ALWAYS be installed.

# Git
When posting to github, you can attach screenshots you took from agent-browser using the [`--attach`](https://github.blog/changelog/2026-09-01-github-cli-media-in-issues-pull-requests-and-comments/) flag on gh cli.