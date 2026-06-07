create table if not exists public.crossify_workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  dataset_fingerprint text,
  dataset_file_name text,
  dataset_cases integer,
  dataset_variables integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crossify_workspace_versions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.crossify_workspaces(id) on delete cascade,
  version_no integer not null,
  save_kind text not null check (save_kind in ('manual', 'autosave')),
  settings jsonb not null,
  created_at timestamptz not null default now(),
  unique (workspace_id, version_no)
);

create index if not exists crossify_workspaces_owner_updated_idx
  on public.crossify_workspaces(owner_id, updated_at desc);

create index if not exists crossify_workspace_versions_workspace_version_idx
  on public.crossify_workspace_versions(workspace_id, version_no desc);

alter table public.crossify_workspaces enable row level security;
alter table public.crossify_workspace_versions enable row level security;

drop policy if exists "Crossify users can view own workspaces" on public.crossify_workspaces;
create policy "Crossify users can view own workspaces"
  on public.crossify_workspaces
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);

drop policy if exists "Crossify users can insert own workspaces" on public.crossify_workspaces;
create policy "Crossify users can insert own workspaces"
  on public.crossify_workspaces
  for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

drop policy if exists "Crossify users can update own workspaces" on public.crossify_workspaces;
create policy "Crossify users can update own workspaces"
  on public.crossify_workspaces
  for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists "Crossify users can delete own workspaces" on public.crossify_workspaces;
create policy "Crossify users can delete own workspaces"
  on public.crossify_workspaces
  for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

drop policy if exists "Crossify users can view own workspace versions" on public.crossify_workspace_versions;
create policy "Crossify users can view own workspace versions"
  on public.crossify_workspace_versions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.crossify_workspaces w
      where w.id = workspace_id
        and w.owner_id = (select auth.uid())
    )
  );

drop policy if exists "Crossify users can insert own workspace versions" on public.crossify_workspace_versions;
create policy "Crossify users can insert own workspace versions"
  on public.crossify_workspace_versions
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.crossify_workspaces w
      where w.id = workspace_id
        and w.owner_id = (select auth.uid())
    )
  );
