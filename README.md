# Smart Complaint Management System (SCMS) - Java PBL & Full Stack

> A production-ready campus facility complaint management, AI auto-triage, SLA monitoring, and resolution platform. Features a complete **Pure Java Standard Edition Backend (JDK 17+)** alongside a Next.js 14 web client and an integrated Java-native single-page dashboard.

---

## ☕ Pure Java PBL Architecture

The system features a complete, standalone, object-oriented **Pure Java** server built strictly with standard Java SE libraries (zero external Maven dependencies required for compilation and execution):

- **Architecture**: Domain Model Pattern + DAO/Repository Layer + Service Layer + REST HTTP Handlers (`com.sun.net.httpserver.HttpServer`).
- **Standard Maven Build**: Fully configured with standard `pom.xml` for IDEs (IntelliJ IDEA, Eclipse, VS Code).
- **Embedded Web Client**: The Java server on port `8080` serves both the JSON REST API and the complete interactive web UI (with dark mode, 4-stage tracking, photo zoom modal, and CSV export).
- **Zero-Config Scripts**: `run.bat` (single-click build & launch) and `build.bat` (compiles and packages `scms.jar`).

### Quick Start (Pure Java)

To compile and launch the Java system directly on Windows:

```cmd
run.bat
```

Or manually:

```cmd
javac -encoding UTF-8 -d bin -sourcepath src/main/java src/main/java/com/scms/Main.java
java -cp bin com.scms.Main
```

Open your browser at:
- **Web UI**: [http://localhost:8080](http://localhost:8080)
- **API Endpoints**: [http://localhost:8080/api/](http://localhost:8080/api/)
- **CSV Export**: [http://localhost:8080/api/export/csv](http://localhost:8080/api/export/csv)

---


## Features

- ⚡ **Student Portal**:
  - Register complaints across 8 campus facility categories (`Electrical`, `Water Supply`, `Cleanliness`, `Hostel Maintenance`, `Internet/IT`, `Laboratory Equipment`, `Infrastructure`, `Other`).
  - Automatic sequential complaint numbers (`#SCMS-0001`).
  - Filter and track personal complaints with color-coded status badges (`Pending`, `In Progress`, `Resolved`, `Rejected`).
  - Real-time resolution timeline and administrator notes.
- 🛡️ **Administrator Operations**:
  - Global triage dashboard with multi-parameter filtering (status, category, priority, keyword/ID search).
  - Department reassignment and status progression (`Pending` → `In Progress` → `Resolved` / `Rejected`).
  - Immutable audit trail recording every state change with admin attribution.
  - Analytics dashboard with aggregate metrics and interactive Recharts category distribution.
- 🔒 **Defense-in-Depth Security**:
  - Three-tier authorization: Next.js edge `middleware.ts`, Supabase Row-Level Security (RLS) policies, and server-side route validation.
  - Strict data isolation: students cannot access other students' complaints; non-admin users cannot access `/admin/*` routes.
- 📱 **Modern Responsive UI**:
  - Mobile-first Tailwind design tested across mobile, tablet, and desktop breakpoints.
  - Skeleton loading states and informative empty states.
  - Accessible forms powered by `react-hook-form` and `zod`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | Next.js 14+ (App Router, TypeScript) |
| Styling / UI | Tailwind CSS + shadcn/ui components |
| State & Mutations | React Server Components + `@tanstack/react-query` |
| Backend & Database | Supabase (PostgreSQL, Auth, Row-Level Security) |
| Client SDK | `@supabase/supabase-js` + `@supabase/ssr` |
| Validation | `react-hook-form` + `zod` |
| Charts | `recharts` |
| Notifications | `sonner` |
| Package Manager | `pnpm` |

---

## Getting Started

### 1. Prerequisites

- **Node.js**: v18.17+ (v20+ recommended)
- **pnpm**: v9+ (v12 installed)
- A **Supabase** project ([supabase.com](https://supabase.com))

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Fill in your Supabase credentials from your Supabase Dashboard (**Project Settings** → **API**):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Security Note**: Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client. It is used exclusively in server route handlers for atomic administrative operations.

---

### 3. Apply Database Migration & Seed Data

1. Open your Supabase project's **SQL Editor**.
2. Run the migration script located at [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql). This sets up:
   - `public.profiles`, `public.complaints`, `public.complaint_history`
   - Trigger `on_auth_user_created` to synchronize new auth signups with profile entries
   - Trigger `trg_complaints_updated` to auto-touch `updated_at`
   - Row-Level Security (RLS) policies on all tables
3. Run [`supabase/seed.sql`](supabase/seed.sql) to populate sample complaints across all categories and statuses.

---

### 4. Create Demo Accounts

Create two accounts in your Supabase project (either via the Supabase Auth Dashboard or by registering on `/register`):

1. **Administrator Account**:
   - Email: `admin@college.edu`
   - Password: `Password123!`
   - Full Name: `Campus Administrator`
   - **Promote to Admin** by executing in Supabase SQL Editor:
     ```sql
     UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@college.edu';
     ```
2. **Student Account**:
   - Email: `student@college.edu`
   - Password: `Password123!`
   - Full Name: `Alex Johnson`
   - Auto-assigned `role = 'user'`.

---

### 5. Install Dependencies & Run Development Server

```bash
# Install dependencies
pnpm install

# Start Next.js development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
scms/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx              # Student & Admin login
│   │   ├── register/page.tsx           # Student registration
│   │   └── layout.tsx                  # Centered auth layout
│   ├── (user)/
│   │   ├── dashboard/page.tsx          # Student's complaints list
│   │   ├── complaints/new/page.tsx     # File new complaint
│   │   ├── complaints/[id]/page.tsx    # Complaint tracking & timeline
│   │   └── layout.tsx                  # User-only guarded layout
│   ├── (admin)/
│   │   ├── admin/dashboard/page.tsx    # Analytics & Recharts stats
│   │   ├── admin/complaints/page.tsx   # Global triage table & filters
│   │   ├── admin/complaints/[id]/page.tsx # Status update & dispatch
│   │   └── layout.tsx                  # Admin-only guarded layout
│   ├── api/
│   │   ├── complaints/route.ts         # GET list, POST create
│   │   ├── complaints/[id]/route.ts    # GET one, PATCH details
│   │   ├── complaints/[id]/status/route.ts # PATCH status + audit log
│   │   └── reports/summary/route.ts    # GET aggregated counts
│   ├── layout.tsx                      # Root layout with Providers
│   ├── page.tsx                        # Public landing page
│   └── globals.css                     # Tailwind CSS & theme tokens
├── components/
│   ├── ui/                             # shadcn/ui base primitives
│   ├── complaint-form.tsx              # React Hook Form + Zod
│   ├── complaint-card.tsx              # Complaint card display
│   ├── complaint-status-badge.tsx      # Color-coded status & priority
│   ├── admin-filter-bar.tsx            # Multi-parameter filter bar
│   ├── stats-cards.tsx                 # Metric overview cards
│   ├── category-chart.tsx              # Recharts bar chart
│   ├── navbar.tsx                      # Responsive navigation & auth
│   └── providers.tsx                   # React Query & Sonner
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Browser Supabase client
│   │   ├── server.ts                   # Cookie-based server client
│   │   └── middleware.ts               # Session refresh helper
│   ├── validations/complaint.ts        # Shared Zod validation schemas
│   ├── types.ts                        # TypeScript DB & DTO types
│   ├── constants.ts                    # Categories, statuses, priorities
│   └── utils.ts                        # Styling and date helpers
├── middleware.ts                       # Route protection (user/admin)
├── supabase/
│   ├── migrations/
│   │   └── 0001_init.sql               # Full schema, triggers & RLS
│   └── seed.sql                        # Sample complaints & history
├── DECISIONS.md                        # Architecture & design decisions
└── README.md
```

---

## Verification & Testing

To verify the build and linting:

```bash
# Typecheck & Build
pnpm build

# Lint
pnpm lint
```

### Acceptance Checklist Verification:
- [x] A new user can sign up, is auto-assigned `role = 'user'`, and lands on `/dashboard`.
- [x] A user can submit a complaint and immediately see it with status "Pending" and a complaint number.
- [x] A user cannot see another user's complaints (enforced via Supabase RLS and API filters).
- [x] A non-admin user cannot access any `/admin/*` route (redirected to `/dashboard` via `middleware.ts` and `app/(admin)/layout.tsx`).
- [x] An admin can see and filter all complaints by status/category/priority/search.
- [x] An admin updating a complaint's status automatically creates a new `complaint_history` row.
- [x] The user sees the updated status and resolution note in their detail view.
- [x] The admin dashboard shows correct aggregate counts matching the actual data.
- [x] All forms show inline validation errors before submitting.
- [x] The app builds with zero TypeScript errors and zero ESLint errors.
- [x] The app is responsive across mobile, tablet, and desktop viewports.
