-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ── PROFILES (extends auth.users) ────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Unnamed User'),
    new.email,
    'user'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── COMPLAINTS ────────────────────────────────────────────────
create table public.complaints (
  id uuid primary key default uuid_generate_v4(),
  complaint_number serial unique,             -- human-friendly sequential ID
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null check (category in
    ('Electrical','Water Supply','Cleanliness','Hostel Maintenance',
     'Internet/IT','Laboratory Equipment','Infrastructure','Other')),
  location text not null,
  description text not null,
  priority text not null default 'Medium' check (priority in ('Low','Medium','High')),
  status text not null default 'Pending' check (status in ('Pending','In Progress','Resolved','Rejected')),
  assigned_to text,
  resolution_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_complaints_user_id on public.complaints(user_id);
create index idx_complaints_status on public.complaints(status);
create index idx_complaints_category on public.complaints(category);

-- ── COMPLAINT HISTORY (audit trail) ─────────────────────────────
create table public.complaint_history (
  id uuid primary key default uuid_generate_v4(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  old_status text,
  new_status text not null,
  note text,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

-- ── updated_at auto-touch trigger ───────────────────────────────
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_complaints_updated
  before update on public.complaints
  for each row execute procedure public.touch_updated_at();

-- ── ROW LEVEL SECURITY ───────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.complaints enable row level security;
alter table public.complaint_history enable row level security;

-- profiles: user can read/update own profile; admin can read all
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (
    auth.uid() = id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- complaints: user sees own; admin sees all
create policy "complaints_select" on public.complaints
  for select using (
    user_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
create policy "complaints_insert_own" on public.complaints
  for insert with check (user_id = auth.uid());
create policy "complaints_update_admin_only" on public.complaints
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- complaint_history: same visibility as parent complaint; admin-only insert
create policy "history_select" on public.complaint_history
  for select using (
    exists (
      select 1 from public.complaints c
      where c.id = complaint_id
        and (c.user_id = auth.uid()
             or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
    )
  );
create policy "history_insert_admin_only" on public.complaint_history
  for insert with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
