Inventra Backend Documentation
1. Overview
Inventra is an inventory management application built on Next.js.
Frontend and backend are maintained in the same Next.js project. The
backend exposes API endpoints, handles authentication and authorization,
and accesses Neon PostgreSQL through Drizzle ORM.
Technology stack
  Layer                   Technology                   Responsibility
  Application             Next.js App Router           Frontend and backend

  API                     Next.js Route Handlers       HTTP API endpoints

  Language                TypeScript                   Application and
database types

  Database                Neon PostgreSQL              Relational data storage

  ORM                     Drizzle ORM                  Typed database queries
and schema

  Migration               Drizzle Kit                  Generate and apply
migrations

  Runtime driver          @neondatabase/serverless   Application database
connectivity

  Migration driver        pg                         Drizzle Kit migration
connectivity

  Password hashing        Argon2id (argon2)          Password hashing and
verification
Validation              Zod                          Request validation
2. Backend folder structure
inventra/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── logout/route.ts
│       │   └── me/route.ts
│       └── health/
│           └── db/route.ts
├── lib/
│   ├── auth/
│   │   ├── password.ts
│   │   ├── token.ts
│   │   └── session.ts
│   ├── db/
│   │   ├── index.ts
│   │   └── schema/
│   │       ├── index.ts
│   │       ├── core-user.ts
│   │       ├── core-role.ts
│   │       ├── core-user-role.ts
│   │       └── core-session.ts
│   └── validations/
│       └── auth.ts
├── scripts/
│   ├── seed-roles.ts
│   └── seed-admin.ts
├── database/
│   └── migrations/
├── docs/
│   ├── backend/
│   └── frontend/
├── drizzle.config.ts
└── .env.local
Folder responsibilities
- app/(auth)/: Authentication pages. The route group name does not
  appear in the URL; app/(auth)/login/page.tsx is served at
  /login.
- app/api/: Next.js Route Handlers.
- lib/auth/: Password verification, token generation, and session
  utilities.
- lib/db/index.ts: Shared runtime database client.
- lib/db/schema/: Drizzle table definitions and schema exports.
- lib/validations/: Zod request validation.
- scripts/: Repeatable seed scripts.
- database/migrations/: SQL migrations generated and applied by
  Drizzle Kit.
- docs/backend/: Backend architecture and operational documentation.
3. Database naming conventions
Inventra uses table prefixes to distinguish system/master data from
operational transactions.
  Prefix                  Purpose                 Examples
  CORE_                 System configuration,   CORE_User,
master data, identity,  CORE_Role,
and authorization       CORE_Menu
DATA_                 Operational and         DATA_GoodsReceipt,
transactional records   DATA_GoodsIssue,
DATA_StockMovement
PostgreSQL folds unquoted identifiers to lowercase. Drizzle definitions
explicitly preserve the agreed capitalization through quoted
identifiers.
Implemented core tables
  Table                   Purpose                 Status
  CORE_User             User accounts and       Implemented and
password hashes         migrated

  CORE_Role             Role definitions        Implemented, migrated,
and seeded

  CORE_UserRole         User-to-role            Implemented and
assignments             migrated
CORE_Session          Login sessions and      Implemented and
token hashes            migrated
Planned core tables
  Table             Purpose
  CORE_Menu       Application menu definitions
CORE_RoleMenu   Permissions assigned to roles and menus
Seeded default roles
  RoleCode              RoleName
  SUPERADMIN          Super Administrator
ADMIN               System Administrator
WAREHOUSE_MANAGER   Warehouse Manager
WAREHOUSE_STAFF     Warehouse Staff
INVENTORY_AUDITOR   Inventory Auditor
VIEWER              Read Only User

The role seed uses an upsert keyed by RoleCode to avoid duplicate role
records.
Initial administrator
The administrator seed reads its configuration from environment
variables:
ADMIN_USERNAME="admin"
ADMIN_EMAIL="admin@inventra.local"
ADMIN_FULLNAME="Inventra Super Administrator"
ADMIN_PASSWORD="use-a-strong-secret-password"
The password is hashed with Argon2id before storage. The seed assigns
the SUPERADMIN role through CORE_UserRole. It does not overwrite the
password of an existing administrator account.

Do not commit .env.local or expose its values.
Planned transaction tables
These are examples for future inventory modules and are not implemented
yet.

  Table                    Purpose
  DATA_Warehouse         Warehouse records
DATA_Item              Inventory item records
DATA_Stock             Current stock balance
DATA_StockMovement     Stock movement ledger
DATA_GoodsReceipt      Goods receipt transactions
DATA_GoodsIssue        Goods issue transactions
DATA_StockAdjustment   Stock adjustment transactions
4. Database connection configuration
The application uses two Neon connection strings:
# Application runtime connection (Neon pooled connection)
DATABASE_URL="postgresql://..."

# Schema migration connection (Neon direct connection)
DIRECT_URL="postgresql://..."
Do not commit .env.local or expose connection strings in source
control, screenshots, logs, or client-side code.
DATABASE_URL
- Used by the running Next.js application.
- Normally configured with Neon connection pooling (-pooler
  hostname).
- Suitable for handling concurrent application requests efficiently.
DIRECT_URL
- Used by Drizzle Kit for schema migrations.
- Configured with the direct Neon hostname (without -pooler).
- Must point to the same Neon project, branch, and database as
  DATABASE_URL.
Both URLs connect to the same database; they are not separate database
copies.
5. Drizzle configuration
Schema export
lib/db/schema/index.ts is the schema entry point used by Drizzle Kit.
export * from "./core-user";
export * from "./core-role";
export * from "./core-user-role";
export * from "./core-session";
drizzle.config.ts
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
Runtime database client
lib/db/index.ts exports the shared Drizzle database client.
Application code should import this client rather than creating a new
connection in each route handler.

The current implementation uses Pool from @neondatabase/serverless
with the WebSocket constructor configured for Node.js runtime. Route
handlers using this connection should declare the Node.js runtime where
appropriate.
6. Database migration workflow
1. Update or create the relevant schema file under lib/db/schema/.
2. Export the schema from lib/db/schema/index.ts.
3. Generate a migration:
   pnpm db:generate
4. Review the generated SQL. Confirm table and column names, data
   types, nullability, keys, indexes, and foreign keys. Check that no
   unrelated or destructive changes are included.
5. Apply the migration:
   pnpm db:migrate
6. Verify the resulting tables and columns in Neon SQL Editor or
   another PostgreSQL client.
Drizzle Kit generates numbered migration filenames with an automatically
generated descriptive suffix. This is expected. Do not manually rename
or delete migrations that have already been applied.

Example verification query:
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'CORE_User'
ORDER BY ordinal_position;
Useful commands
pnpm dev
pnpm db:generate
pnpm db:migrate
pnpm db:studio
pnpm db:seed:roles
pnpm db:seed:admin
7. Health check endpoint
The database connectivity endpoint is:
GET /api/health/db
Successful response:
{
  "success": true,
  "message": "Inventra database connected",
  "database": "Neon PostgreSQL",
  "orm": "Drizzle"
}
This endpoint is intended for connectivity verification. Before
production deployment, review whether it should be restricted or
simplified to avoid exposing unnecessary infrastructure details.
8. Authentication architecture
Inventra uses custom authentication backed by CORE_User and
CORE_Session.
Authentication utilities
  File                                Responsibility
  lib/auth/password.ts              Verify passwords against Argon2id
hashes

  lib/auth/token.ts                 Generate random session tokens and
calculate SHA-256 hashes

  lib/auth/session.ts               Create, validate, and revoke
sessions
lib/validations/auth.ts           Validate login request data with
Zod
Login flow
1. The frontend submits an identifier (username or email) and password
   to POST /api/auth/login.
2. The API validates the request using Zod.
3. The API finds the user in CORE_User and checks that the account is
   active.
4. The API verifies the password using Argon2id.
5. The API creates a random session token.
6. The SHA-256 hash of the token is stored in CORE_Session; the raw
   token is sent to the browser in an HTTP-only cookie.
7. The API returns the authenticated user's basic profile and active
   roles.
The raw session token must never be returned in JSON or stored in the
database.
Session configuration
  Setting            Value
  Cookie name        inventra_session
Session lifetime   8 hours
HttpOnly         true
Secure           true in production
SameSite         Lax
Path               /
Stored token       SHA-256 hash

SameSite=Lax is suitable for the current same-origin frontend and API
arrangement. It helps restrict cross-site cookie sending but is not a
complete replacement for CSRF protections. State-changing endpoints
should also validate request origin and use appropriate CSRF defenses.
Authentication API endpoints
  Method            Endpoint             Purpose           Status
  POST            /api/auth/login    Verify            Implemented and
credentials and   tested
create a session  

  POST            /api/auth/logout   Revoke current    Implemented and
session and clear tested
cookie            
GET             /api/auth/me       Return current    Implemented and
authenticated     tested
user and roles
A successful login response contains the user's basic profile and role
information. It must not include PasswordHash, raw session tokens, or
other secrets. An unauthenticated request to /api/auth/me should
return HTTP 401.
Frontend login integration
The login page is located at:
app/(auth)/login/page.tsx
The (auth) directory is a Next.js route group and does not appear in
the URL. The page is available at /login.

The existing login UI submits this request body:
{
  "identifier": "admin",
  "password": "..."
}
to:
POST /api/auth/login
The frontend uses credentials: "same-origin" so the browser handles
the session cookie for same-origin requests. On successful login, the
page displays a success notification and navigates to /.

The existing visual design, form components, password visibility
control, and help modal are retained. The login identifier field accepts
either a username or an email address.
9. Security requirements and production considerations
- Store only password hashes generated with Argon2id. Never store
  plaintext passwords.
- Validate and normalize login input on the server.
- Use generic login failure messages so the API does not disclose
  whether a username or email exists.
- Use secure, HTTP-only cookies for session credentials.
- In production, set cookies with Secure, HttpOnly, and an
  appropriate SameSite policy.
- Enforce authorization in backend API handlers; hiding frontend menu
  items is not sufficient access control.
- Revoke or invalidate sessions on logout and when appropriate for
  account security.
- Never return PasswordHash or session secrets from API responses.
- Add rate limiting to login and other sensitive endpoints before
  production release.
- Validate request origin and implement appropriate CSRF protection
  for state-changing endpoints.
- Ensure inactive users and revoked or expired sessions cannot access
  protected resources.
- Add a cleanup strategy for expired sessions.
- Test migrations against a development Neon branch before production.
- Keep database credentials and administrator seed secrets out of
  source control.
10. Development status
Status reflects the implementation completed so far.

  Area                                             Status
  Neon PostgreSQL project and connectivity         Connected and tested
Drizzle ORM and Drizzle Kit configuration        Configured
Database runtime connection                      Tested successfully
Database health endpoint                         Tested successfully
CORE_User schema and migration                 Completed
CORE_Role schema and migration                 Completed
CORE_UserRole schema and migration             Completed
CORE_Session schema and migration              Completed
Default role seed                                Completed
Initial SUPERADMIN seed                          Completed
Argon2id password verification utility           Implemented
Session token generation and hashing             Implemented
Session create, validate, and revoke utilities   Implemented
Login API                                        Implemented and tested
Logout API                                       Implemented and tested
Session validation API                           Implemented and tested
Frontend login API integration                   Implemented and tested
Protected dashboard and application routes       Pending
Centralized authorization and role permissions   Pending
CORE_Menu and CORE_RoleMenu                  Pending
Forgot/reset password workflow                   Pending
Login rate limiting and CSRF hardening           Pending
Inventory transaction modules                    Pending
11. Next implementation milestones
1. Protect dashboard and application routes so unauthenticated users
   are redirected to /login.
2. Add a reusable server-side authentication guard for protected pages
   and API handlers.
3. Load the authenticated user's profile and roles in the application
   layout.
4. Implement centralized authorization and role-based permissions.
5. Create CORE_Menu and CORE_RoleMenu.
6. Add audit logging for authentication and important user actions.
7. Begin warehouse and inventory master/transaction modules.
Document purpose: Backend architecture, database setup, and
authentication reference for the Inventra Inventory Management
application.

Last updated: 7 November 2026