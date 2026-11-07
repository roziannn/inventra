# Inventra Backend Documentation

## 1. Overview

Inventra is an inventory management application built on Next.js. The
frontend and backend currently live in the same Next.js project. The
backend exposes API endpoints, handles authentication and authorization,
and accesses Neon PostgreSQL through Drizzle ORM.

### Technology stack

  ----------------------------------------------------------------------------
  Layer                   Technology                   Responsibility
  ----------------------- ---------------------------- -----------------------
  Application             Next.js App Router           Frontend and backend
                                                       application

  API                     Next.js Route Handlers       HTTP API endpoints

  Language                TypeScript                   Application and
                                                       database types

  Database                Neon PostgreSQL              Persistent relational
                                                       data

  ORM                     Drizzle ORM                  Typed database queries
                                                       and schema definitions

  Migration               Drizzle Kit                  Generate and apply
                                                       database migrations

  Database runtime driver `@neondatabase/serverless`   Application database
                                                       connectivity

  Password hashing        Argon2id (`argon2`)          Secure password hashing

  Validation              Zod                          Request and input
                                                       validation
  ----------------------------------------------------------------------------

> Authentication is planned as a custom implementation using the
> application's `CORE_User` and session data. The login and session
> implementation must be completed before the application is considered
> production-ready.

## 2. Backend folder structure

The backend-related files are organized as follows:

``` text
inventra/
├── app/
│   └── api/
│       └── health/
│           └── db/
│               └── route.ts
├── lib/
│   ├── auth/
│   └── db/
│       ├── index.ts
│       └── schema/
│           ├── index.ts
│           ├── core-user.ts
│           └── core-role.ts
├── database/
│   └── migrations/
├── docs/
│   ├── backend/
│   └── frontend/
├── drizzle.config.ts
└── .env.local
```

This is the intended organization for the current backend foundation.
Add new files under the matching feature or responsibility as the
project grows.

### Folder responsibilities

-   `app/api/`: Next.js Route Handlers exposed as HTTP endpoints.
-   `lib/auth/`: Authentication, password hashing, session creation,
    validation, and authorization utilities.
-   `lib/db/index.ts`: Shared database client for application runtime.
-   `lib/db/schema/`: Drizzle table definitions and schema exports.
-   `database/migrations/`: SQL migrations generated and applied by
    Drizzle Kit.
-   `database/seeds/`: Optional location for repeatable seed scripts, if
    introduced.
-   `docs/backend/`: Backend architecture, database standards, API
    conventions, and operational documentation.

## 3. Database naming conventions

Inventra uses table prefixes to distinguish system/master data from
operational transactions.

  -----------------------------------------------------------------------
  Prefix                  Purpose                 Examples
  ----------------------- ----------------------- -----------------------
  `CORE_`                 System configuration,   `CORE_User`,
                          master data, identity,  `CORE_Role`,
                          and authorization       `CORE_Menu`

  `DATA_`                 Operational and         `DATA_GoodsReceipt`,
                          transactional records   `DATA_GoodsIssue`,
                                                  `DATA_StockMovement`
  -----------------------------------------------------------------------

PostgreSQL folds unquoted identifiers to lowercase. To preserve the
agreed PascalCase-style names and capitalization, define table and
column names explicitly with quoted identifiers through Drizzle.

### Planned core tables

  Table             Purpose
  ----------------- ------------------------------------
  `CORE_User`       User accounts
  `CORE_Role`       Role definitions
  `CORE_UserRole`   User-to-role assignments
  `CORE_Menu`       Application menu definitions
  `CORE_RoleMenu`   Menu permissions assigned to roles

### Planned transaction tables

The following are examples for future inventory modules. They are not
all implemented yet.

  Table                    Purpose
  ------------------------ -------------------------------
  `DATA_Warehouse`         Warehouse records
  `DATA_Item`              Inventory item records
  `DATA_Stock`             Current stock balance
  `DATA_StockMovement`     Stock movement ledger
  `DATA_GoodsReceipt`      Goods receipt transactions
  `DATA_GoodsIssue`        Goods issue transactions
  `DATA_StockAdjustment`   Stock adjustment transactions

## 4. Database connection configuration

The application uses two Neon connection strings for different
workloads.

``` env
# Application runtime connection (Neon pooled connection)
DATABASE_URL="postgresql://..."

# Schema migration connection (Neon direct connection)
DIRECT_URL="postgresql://..."
```

Do not commit `.env.local` or expose either connection string in source
control, screenshots, logs, or client-side code.

### `DATABASE_URL`

-   Used by the running Next.js application.
-   Normally configured with Neon connection pooling (`-pooler`
    hostname).
-   Suitable for handling concurrent application requests efficiently.

### `DIRECT_URL`

-   Used by Drizzle Kit for schema migrations.
-   Configured with the direct Neon hostname (without `-pooler`).
-   Must point to the same Neon project, branch, and database as
    `DATABASE_URL`.

Both URLs connect to the same database; they do not represent separate
database copies.

## 5. Drizzle configuration

### Schema export

`lib/db/schema/index.ts` is the schema entry point used by Drizzle Kit.
Export every table definition from this file.

Example:

``` ts
export * from "./core-user";
export * from "./core-role";
```

### `drizzle.config.ts`

The Drizzle Kit configuration points to the schema entry point and
migration output directory.

``` ts
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
  schema: "./lib/db/schema/index.ts",
  out: "./database/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DIRECT_URL!,
  },
  strict: true,
  verbose: true,
});
```

### Runtime database client

`lib/db/index.ts` exports the shared Drizzle database client.
Application code should import this client rather than creating a new
connection in each route handler.

The current implementation uses `Pool` from `@neondatabase/serverless`
with the WebSocket constructor configured for Node.js runtime. Route
handlers that use this connection should declare the Node.js runtime
where appropriate.

## 6. Database migration workflow

Use the following workflow when changing database schemas.

### Step 1 --- Update the Drizzle schema

Create or modify the relevant file under `lib/db/schema/`, then export
it from `lib/db/schema/index.ts`.

### Step 2 --- Generate a migration

``` bash
pnpm db:generate
```

Drizzle Kit creates a numbered SQL migration in `database/migrations/`.
The descriptive suffix in the generated filename is automatically
generated. This is expected behavior.

### Step 3 --- Review the generated SQL

Before applying a migration, inspect the generated SQL and confirm:

-   Table and column names are correct.
-   Data types and nullability match the schema.
-   Primary keys, unique indexes, and foreign keys are correct.
-   No unrelated or destructive changes are included.

### Step 4 --- Apply the migration

``` bash
pnpm db:migrate
```

Run migrations against the intended Neon branch and database. Do not
manually rename or delete migration files that have already been
applied.

### Step 5 --- Verify the database

Use Neon SQL Editor or another PostgreSQL client to verify the resulting
tables, columns, and indexes.

Example query:

``` sql
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'CORE_User'
ORDER BY ordinal_position;
```

### Useful commands

``` bash
pnpm dev
pnpm db:generate
pnpm db:migrate
pnpm db:studio
```

## 7. Health check endpoint

The database connectivity endpoint is:

``` text
GET /api/health/db
```

A successful response currently looks like:

``` json
{
  "success": true,
  "message": "Inventra database connected",
  "database": "Neon PostgreSQL",
  "orm": "Drizzle"
}
```

This endpoint is intended for connectivity verification. Before
production deployment, review whether it should be restricted or
simplified to avoid exposing unnecessary infrastructure details.

## 8. Authentication and authorization plan

The initial authentication foundation will use the following entities:

1.  `CORE_User` --- account identity and password hash.
2.  `CORE_Role` --- role definitions such as `SUPERADMIN`.
3.  `CORE_UserRole` --- assignment of one or more roles to a user.
4.  `CORE_Menu` --- application menu definitions.
5.  `CORE_RoleMenu` --- permissions for each role and menu.

### Security requirements

-   Store only password hashes generated with Argon2id. Never store
    plaintext passwords.
-   Validate and normalize login input on the server.
-   Use generic login failure messages so the API does not disclose
    whether a username or email exists.
-   Use secure, HTTP-only cookies for session credentials.
-   In production, set cookies with `Secure`, `HttpOnly`, and an
    appropriate `SameSite` policy.
-   Enforce authorization in backend API handlers; hiding frontend menu
    items is not sufficient access control.
-   Revoke or invalidate sessions on logout and when appropriate for
    account security.
-   Never return `PasswordHash` or session secrets from API responses.
-   Add rate limiting and audit logging before production release.

Authentication and authorization are not considered complete until
login, logout, session validation, and protected API access have been
implemented and tested.

## 9. Development status

Status reflects the backend foundation established so far. Update this
section as implementation progresses.

  -----------------------------------------------------------------------
  Area                                Status
  ----------------------------------- -----------------------------------
  Neon PostgreSQL project and         Connected
  connectivity                        

  Drizzle ORM installed and           Configured
  configured                          

  Database runtime connection         Tested

  Database health endpoint            Tested successfully

  `CORE_User` schema                  Created; migration generated

  `CORE_User` migration               Applied successfully

  `CORE_Role` schema                  Present in workspace; migration
                                      status to verify

  User seed / initial administrator   Pending

  Login and logout API                Pending

  Session management                  Pending

  Role and menu authorization         Pending

  Inventory transaction modules       Pending
  -----------------------------------------------------------------------

## 10. Development guidelines

-   Keep database schema definitions in `lib/db/schema/`.
-   Keep database connection initialization in `lib/db/index.ts`.
-   Keep HTTP request handling in `app/api/` route handlers.
-   Keep authentication and authorization utilities in `lib/auth/`.
-   Validate external input with Zod before using it in business logic.
-   Prefer Drizzle's parameterized query APIs. Do not concatenate
    untrusted input into SQL strings.
-   Use database transactions for operations that must succeed or fail
    as a unit, especially stock movements and inventory balance updates.
-   Keep generated migration files under version control.
-   Test migrations against a development Neon branch before production.
-   Never commit secrets or real credentials.

------------------------------------------------------------------------

**Document purpose:** Backend architecture and database setup reference
for the Inventra Inventory Management application.

**Last updated:** 7 November 2026
