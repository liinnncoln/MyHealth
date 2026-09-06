-- MyHealth MVP schema
-- Run this in your Supabase project: Dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to re-run: uses IF NOT EXISTS / drop-if-exists guards where practical.

-- 1. PROFILES ---------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  date_of_birth date,
  blood_group text,
  allergies text,
  major_conditions text,
  emergency_contact_name text,
  emergency_contact_phone text,
  onboarding_complete boolean default false,
  created_at timestamptz default now()
);

-- 2. RECORDS (medical documents / history) -----------------------------------
create table if not exists records (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  category text not null default 'Other', -- Tests, Diagnoses, Medications, Imaging, Other
  facility text,
  record_date date,
  notes text,
  file_url text,
  ai_summary text,
  created_at timestamptz default now()
);

-- 3. MEDICATIONS --------------------------------------------------------------
create table if not exists medications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  dose text,
  frequency text,
  start_date date,
  end_date date,
  status text not null default 'current', -- current | completed
  notes text,
  created_at timestamptz default now()
);

-- 4. HEALTH READINGS (BP, glucose, weight, temperature) ------------------------
create table if not exists readings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade not null,
  type text not null, -- blood_pressure | glucose | weight | temperature
  value_primary numeric not null,   -- e.g. systolic, glucose value, weight kg
  value_secondary numeric,          -- e.g. diastolic
  unit text,
  recorded_at timestamptz default now()
);

-- 5. SHARES (patient-controlled sharing of records) ----------------------------
create table if not exists shares (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade not null,
  recipient_name text not null,
  recipient_type text, -- Doctor, Hospital, Lab, Other
  scope text not null, -- e.g. "Medical history, Medications, Lab results"
  duration text not null, -- '24h' | '7d' | 'until_revoked'
  status text not null default 'active', -- active | expired | revoked
  created_at timestamptz default now(),
  expires_at timestamptz
);

-- 6. ACCESS LOG ----------------------------------------------------------------
create table if not exists access_log (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade not null,
  share_id uuid references shares(id) on delete set null,
  accessor_name text,
  action text not null, -- viewed | uploaded | revoked
  info_accessed text,
  created_at timestamptz default now()
);

-- 7. FAMILY MEMBERS --------------------------------------------------------------
create table if not exists family_members (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade not null, -- the managing account
  full_name text not null,
  relationship text, -- Child, Parent, Dependant
  date_of_birth date,
  notes text,
  created_at timestamptz default now()
);

-- ROW LEVEL SECURITY ------------------------------------------------------------
alter table profiles enable row level security;
alter table records enable row level security;
alter table medications enable row level security;
alter table readings enable row level security;
alter table shares enable row level security;
alter table access_log enable row level security;
alter table family_members enable row level security;

-- Each user can only see/edit their own rows (owner_id = auth.uid(), or id = auth.uid() for profiles)
drop policy if exists "profiles_self" on profiles;
create policy "profiles_self" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "records_owner" on records;
create policy "records_owner" on records for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "medications_owner" on medications;
create policy "medications_owner" on medications for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "readings_owner" on readings;
create policy "readings_owner" on readings for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "shares_owner" on shares;
create policy "shares_owner" on shares for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "access_log_owner" on access_log;
create policy "access_log_owner" on access_log for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "family_owner" on family_members;
create policy "family_owner" on family_members for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- STORAGE (for uploaded record documents/photos) --------------------------------
insert into storage.buckets (id, name, public)
values ('records', 'records', false)
on conflict (id) do nothing;

drop policy if exists "records_bucket_owner" on storage.objects;
create policy "records_bucket_owner" on storage.objects for all
  using (bucket_id = 'records' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'records' and auth.uid()::text = (storage.foldername(name))[1]);
