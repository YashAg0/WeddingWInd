# WeddingWithIndia — Authentication Architecture Guide

This guide documents the authentication framework, session synchronization, token flow, and client state management powering **WeddingWithIndia**.

---

## 1. Authentication Overview

WeddingWithIndia uses **Clerk Authentication** for identity management coupled with a **PostgreSQL User Schema Sync** for relational application data.

```
 [ Client Browser ] ──────► [ Clerk Auth Provider ] (Managed Session & JWT)
         │                          │
         ▼                          ▼
 [ Next.js Middleware ] ────► [ syncAndGetDbUser() ] ────► [ PostgreSQL DB ]
```

### Key Technical Properties:
- **Managed JWTs**: Authentication tokens are issued and cryptographically signed by Clerk.
- **Middleware Interception**: Requests to private dashboards (`/dashboard/*`) and APIs (`/api/*`) are intercepted at the edge in `middleware.ts` / `proxy.ts`.
- **Database Synchronization**: `syncAndGetDbUser()` transparently provisions missing database user records and assigns default profiles (`TravelerProfile`) upon first login.
- **Standalone Resilience**: If the database is temporarily offline, `syncAndGetDbUser()` returns a transient fallback guest profile, enabling zero-downtime offline browsing.

---

## 2. Authentication Helper Functions (`lib/auth.ts`)

| Function | Return Type | Description |
| :--- | :--- | :--- |
| `getSession()` | `Promise<AuthObject>` | Returns the raw Clerk session context (`userId`, `sessionId`). |
| `getDbUser()` | `Promise<User \| null>` | Resolves the full PostgreSQL `User` model including linked profiles. |
| `syncAndGetDbUser()` | `Promise<User \| null>` | Syncs Clerk user into PostgreSQL DB on first login and returns user record. |
| `requireAuth()` | `Promise<User>` | Enforces authentication; throws `UNAUTHORIZED` if user is unauthenticated or `BANNED`. |
| `requireRole(allowedRoles)` | `Promise<User>` | Enforces authentication AND role check; throws `FORBIDDEN` if user lacks required role. |
| `isAdmin()` | `Promise<boolean>` | Returns `true` if current user possesses the `ADMIN` role. |

---

## 3. Client Context & Hooks (`context/AuthContext.tsx`)

The frontend accesses authentication state via the `useAuth()` hook:

```tsx
import { useAuth } from "@/context/AuthContext";

export function UserProfileHeader() {
  const { user, loading, logout, wishlist, toggleWishlist } = useAuth();

  if (loading) return <div>Loading account...</div>;
  if (!user) return <a href="/login">Sign In</a>;

  return (
    <div>
      <p>Welcome, {user.name} ({user.role})</p>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}
```

---

## 4. Auth Route Configurations

- **Sign In Path**: `/login` (Renders Clerk `<SignIn />` component)
- **Sign Up Path**: `/signup` (Renders Clerk `<SignUp />` component)
- **Post-Login Redirect**: `/dashboard` (Auto-routed by role)
- **Post-Logout Redirect**: `/`
