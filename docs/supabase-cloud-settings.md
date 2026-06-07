# Crossify Cloud Settings

Crossify Cloud Settings stores only workspace configuration in Supabase. It does not upload `.sav` data files.

Stored data:

- table definitions
- top/side axis settings
- filters
- output settings
- variable overrides, Net/T2B/Grid settings
- dataset metadata and fingerprint
- autosave/manual version history

## Setup

1. Create or open a Supabase project.
2. Run `supabase/migrations/202605090001_crossify_cloud_settings.sql` in the Supabase SQL editor or through the Supabase CLI.
3. Add environment variables:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-or-publishable-key
```

4. Restart the Vite dev server.

## Security

The migration enables RLS on both Cloud Settings tables.

- Users can only select/update/delete their own workspaces.
- Users can only insert/read versions for workspaces they own.
- The frontend must only use the anon/publishable key. Never expose a service role key in the browser.

## App Flow

- Workspace -> Cloud Settings -> Sign in to Cloud sends a magic link.
- Save to Cloud creates or updates the current cloud workspace and appends a settings version.
- Load Latest Cloud restores the newest version for the current cloud workspace, or the most recently updated workspace.
- AutoSave Cloud starts after a cloud workspace exists, so the first cloud save must be manual.
