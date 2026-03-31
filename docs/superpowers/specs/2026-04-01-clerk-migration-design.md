# Clerk Migration Design Spec

## Summary

Migrate the web app's frontend authentication from a shared password gate (`ACCESS_PASSWORD` + cookie session) to Clerk, using `@clerk/nextjs` with middleware-based route protection and a custom sign-in form. The backend (NestJS) already uses Clerk for token validation — this migration connects the frontend to that same auth system.

Roles (PC/GM) remain in localStorage and are not part of this migration.

## Scope

**In scope:**

- Replace password-based access gate with Clerk authentication
- Custom sign-in form (username + password) using `useSignIn` hook
- Clerk middleware protecting all routes except `/sign-in`
- `<ClerkProvider>` wrapping the app in `layout.tsx`
- Utility for attaching Clerk session token to outgoing API requests
- Sign-out button in the app header
- Removal of old auth code

**Out of scope:**

- Sign-up (accounts created manually in Clerk dashboard)
- Role migration (stays in localStorage)
- Backend changes (NestJS or Express)
- Social login / OAuth

## Clerk Dashboard Configuration

- Enable **username + password** as the sign-in method
- Disable **sign-up** (invite-only, accounts created by admin in dashboard)

## Environment Variables

**Add:**

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk publishable key
- `CLERK_SECRET_KEY` — Clerk secret key
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in` — custom sign-in route

**Remove:**

- `ACCESS_PASSWORD`

## Architecture

### Middleware (`web/middleware.ts`)

Uses `clerkMiddleware()` from `@clerk/nextjs/server` to protect all routes. The `/sign-in` route is marked as public. Unauthenticated requests to any other route are redirected to `/sign-in`.

### Layout (`web/app/layout.tsx`)

Wrap `{children}` in `<ClerkProvider>` from `@clerk/nextjs`. No other layout changes.

### Sign-In Page (`web/app/sign-in/page.tsx`)

Custom form built with Clerk's `useSignIn` hook:

- Username field + password field
- Styled to match the current `AccessGate` aesthetic (dark card, gold accents, Swords icon, "invite-only" subtitle)
- On success: redirect to `/`
- On error: display error message inline

### Main Page (`web/app/page.tsx`)

Remove all auth-related code:

- Remove `authenticated` state and `useEffect` that checks `/api/auth`
- Remove `AccessGate` import and conditional rendering
- Remove the `if (authenticated === null) return null` loading guard
- The component renders the app directly — middleware guarantees authentication

### API Token Utility (`web/lib/api.ts`)

Export a helper function that wraps `fetch` and attaches the Clerk session token:

```typescript
import { useAuth } from '@clerk/nextjs'

// Hook-based approach for use in client components
function useAuthFetch() {
  const { getToken } = useAuth()
  return async (url: string, options?: RequestInit) => {
    const token = await getToken()
    return fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Bearer ${token}`,
      },
    })
  }
}
```

### Sign-Out Button

Add a small sign-out button in the app header (next to the PC/GM toggle), using `useClerk().signOut()` or `<SignOutButton>` from `@clerk/nextjs`.

## Files to Create

| File | Purpose |
|------|---------|
| `web/middleware.ts` | Clerk middleware, route protection |
| `web/app/sign-in/page.tsx` | Custom sign-in form |
| `web/lib/api.ts` | Auth-aware fetch utility |

## Files to Modify

| File | Change |
|------|--------|
| `web/app/layout.tsx` | Wrap in `<ClerkProvider>` |
| `web/app/page.tsx` | Remove auth state, AccessGate, loading guard |
| `web/package.json` | Add `@clerk/nextjs` dependency |
| `web/.env` | Add Clerk keys, remove `ACCESS_PASSWORD` |

## Files to Delete

| File | Reason |
|------|--------|
| `web/lib/auth.ts` | Old password/session token logic |
| `web/app/api/auth/route.ts` | Old auth API endpoint |
| `web/components/access-gate.tsx` | Old password gate component |

## Testing

- Verify unauthenticated users are redirected to `/sign-in`
- Verify sign-in with valid username + password grants access
- Verify sign-in with invalid credentials shows an error
- Verify sign-out returns to `/sign-in`
- Verify the Clerk session token is attached to API requests (check network tab)
- Verify all existing app functionality (tabs, character sheet, chat) works unchanged
