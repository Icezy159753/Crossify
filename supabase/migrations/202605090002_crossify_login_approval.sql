create schema if not exists private;
revoke all on schema private from public;

create table if not exists public.crossify_user_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  role text not null default 'user' check (role in ('admin', 'user')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  last_seen_at timestamptz
);

create index if not exists crossify_user_access_status_requested_idx
  on public.crossify_user_access(status, requested_at desc);

alter table public.crossify_user_access enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update on public.crossify_user_access to authenticated;

create or replace function private.crossify_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select coalesce(lower(auth.jwt() ->> 'email') = 'songklod159@gmail.com', false)
    or exists (
      select 1
      from public.crossify_user_access access
      where access.user_id = auth.uid()
        and access.role = 'admin'
        and access.status = 'approved'
    );
$$;

create or replace function private.crossify_is_approved()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select private.crossify_is_admin()
    or exists (
      select 1
      from public.crossify_user_access access
      where access.user_id = auth.uid()
        and access.status = 'approved'
    );
$$;

create or replace function private.handle_new_crossify_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.crossify_user_access (user_id, email, display_name, role, status)
  values (
    new.id,
    lower(coalesce(new.email, '')),
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'name'),
    case when lower(coalesce(new.email, '')) = 'songklod159@gmail.com' then 'admin' else 'user' end,
    case when lower(coalesce(new.email, '')) = 'songklod159@gmail.com' then 'approved' else 'pending' end
  )
  on conflict (user_id) do update set
    email = excluded.email,
    display_name = coalesce(excluded.display_name, public.crossify_user_access.display_name),
    role = case when excluded.email = 'songklod159@gmail.com' then 'admin' else public.crossify_user_access.role end,
    status = case when excluded.email = 'songklod159@gmail.com' then 'approved' else public.crossify_user_access.status end;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_crossify_access on auth.users;
create trigger on_auth_user_created_crossify_access
  after insert on auth.users
  for each row execute function private.handle_new_crossify_user();

drop policy if exists "Crossify access users can view own profile" on public.crossify_user_access;
create policy "Crossify access users can view own profile"
  on public.crossify_user_access
  for select
  to authenticated
  using (user_id = (select auth.uid()) or private.crossify_is_admin());

drop policy if exists "Crossify access users can request access" on public.crossify_user_access;
create policy "Crossify access users can request access"
  on public.crossify_user_access
  for insert
  to authenticated
  with check (
    private.crossify_is_admin()
    or (
      user_id = (select auth.uid())
      and role = 'user'
      and status = 'pending'
    )
  );

drop policy if exists "Crossify admins can review access" on public.crossify_user_access;
create policy "Crossify admins can review access"
  on public.crossify_user_access
  for update
  to authenticated
  using (private.crossify_is_admin())
  with check (private.crossify_is_admin());

drop policy if exists "Crossify users can view own workspaces" on public.crossify_workspaces;
create policy "Crossify users can view own workspaces"
  on public.crossify_workspaces
  for select
  to authenticated
  using (private.crossify_is_approved() and (select auth.uid()) = owner_id);

drop policy if exists "Crossify users can insert own workspaces" on public.crossify_workspaces;
create policy "Crossify users can insert own workspaces"
  on public.crossify_workspaces
  for insert
  to authenticated
  with check (private.crossify_is_approved() and (select auth.uid()) = owner_id);

drop policy if exists "Crossify users can update own workspaces" on public.crossify_workspaces;
create policy "Crossify users can update own workspaces"
  on public.crossify_workspaces
  for update
  to authenticated
  using (private.crossify_is_approved() and (select auth.uid()) = owner_id)
  with check (private.crossify_is_approved() and (select auth.uid()) = owner_id);

drop policy if exists "Crossify users can delete own workspaces" on public.crossify_workspaces;
create policy "Crossify users can delete own workspaces"
  on public.crossify_workspaces
  for delete
  to authenticated
  using (private.crossify_is_approved() and (select auth.uid()) = owner_id);

drop policy if exists "Crossify users can view own workspace versions" on public.crossify_workspace_versions;
create policy "Crossify users can view own workspace versions"
  on public.crossify_workspace_versions
  for select
  to authenticated
  using (
    private.crossify_is_approved()
    and exists (
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
    private.crossify_is_approved()
    and exists (
      select 1
      from public.crossify_workspaces w
      where w.id = workspace_id
        and w.owner_id = (select auth.uid())
    )
  );
