# Architectural & Implementation Decisions — Smart Complaint Management System (SCMS)

This document records the design decisions, assumptions, and architectural choices made during the development of SCMS.

---

## 1. Project Directory & Workspace Architecture

- **Root Scaffolding**: To make the developer experience seamless when opening `c:\Users\DELL\Desktop\java PBL` directly in an IDE, Next.js, `package.json`, and all related files are placed directly in the root workspace directory rather than an isolated nested subfolder.
- **Strict Adherence to Specified Structure**: Every directory and file outlined in Section 3 of the prompt was created (`app/(auth)`, `app/(user)`, `app/(admin)`, `app/api/*`, `components/*`, `lib/supabase/*`, `lib/validations/*`, `supabase/migrations/*`, etc.).

---

## 2. Authentication & Authorization Strategy (Defense-in-Depth)

Role-based access control (RBAC) is enforced across **three independent layers**:

1. **Edge / Routing Layer (`middleware.ts`)**:
   - Intercepts requests to `(user)` and `(admin)` routes.
   - Redirects unauthenticated visitors to `/login` with a `redirectTo` preservation parameter.
   - Queries `public.profiles` for `role = 'admin'` when accessing `/admin/*`. Non-admin users attempting to reach any admin page are redirected to `/dashboard`.
   - Prevents authenticated users from returning to `/login` or `/register` by redirecting to `/dashboard` (or `/admin/dashboard` if admin).

2. **Database Layer (Supabase Row-Level Security — RLS)**:
   - `public.profiles`: Users can only read/update their own profile; admins can read all profiles.
   - `public.complaints`: Students can only view their own complaints (`user_id = auth.uid()`); administrators can view all complaints. Insert is restricted to `auth.uid() = user_id`. Updates to complaints are restricted to administrators.
   - `public.complaint_history`: Accessible to the complaint owner or any administrator. Insert is restricted to administrators (or system operations via the service role key).

3. **API & UI Layer**:
   - Every API route validates user authentication and authorization independently.
   - Admin routes (`PATCH /api/complaints/[id]/status`, `GET /api/reports/summary`) verify `profile.role === 'admin'`.
   - UI navigation components conditionally render administrative links only if the active profile role is `admin`.

---

## 3. Database Schema & Triggers

- **Profiles Synchronization**:
  - `auth.users` creates the underlying authentication identity.
  - A PostgreSQL trigger `on_auth_user_created` calls `public.handle_new_user()` to automatically populate `public.profiles` with `role = 'user'`, capturing `full_name` from `raw_user_meta_data`.
  - Promoted administrators have their `role` column set to `'admin'`.
- **Sequential Human-Friendly IDs**:
  - `complaints.complaint_number` is a `serial unique` integer, formatted in the UI as `#SCMS-0001`, `#SCMS-0002`, etc., providing human-readable identifiers while retaining UUID primary keys for secure foreign key references.
- **Auto-touch Updated At**:
  - The PostgreSQL function `touch_updated_at()` and trigger `trg_complaints_updated` automatically update `updated_at = now()` whenever a complaint is modified.
- **Complaint History Audit Trail**:
  - An immutable log in `public.complaint_history` captures `old_status`, `new_status`, `note`, `updated_by`, and `updated_at`.
  - Initial complaint submission creates an entry recording creation by the student.
  - Subsequent triage and resolution actions append new history rows with the acting administrator's UUID.

---

## 4. State Management & Data Fetching

- **React Query (`@tanstack/react-query`)**:
  - Client components use React Query for caching, automatic background invalidation, and refetching.
  - Updating a complaint immediately invalidates `['admin-complaint', id]`, `['admin-complaints']`, and `['admin-reports-summary']` so all dashboard and list views stay synchronized without manual full-page reloads.
- **Server Components & Route Handlers**:
  - Server components use `@supabase/ssr` with cookie storage to safely check session tokens on the server without leaking keys or tokens.
  - Heavy aggregation queries (`GET /api/reports/summary`) use Postgres `count()` and `group by` queries server-side, transferring only aggregated integers instead of thousands of row payloads.

---

## 5. UI/UX & Accessibility Decisions

- **Color-Coded Status & Priority**:
  - `Pending`: Amber / Yellow (#eab308)
  - `In Progress`: Blue (#3b82f6)
  - `Resolved`: Emerald / Green (#10b981)
  - `Rejected`: Rose / Red (#ef4444)
  - Color palettes and badges are configured in a single source of truth (`lib/constants.ts`).
- **Responsive Layout**:
  - Mobile-first layouts with responsive navigation menus, adaptable grid columns (1 col on mobile, 2 on tablet, 3-5 on desktop), and horizontal overflow tables for comprehensive data displays.
- **Feedback & Notifications**:
  - `sonner` provides non-blocking toast notifications for successful actions, network failures, and input validation feedback.
  - Skeleton loaders (`components/ui/skeleton.tsx`) prevent layout shift during asynchronous data loading.
  - Informative empty states guide users to take action rather than displaying blank containers.
