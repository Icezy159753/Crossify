import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import type { SavDataset } from './savParser'
import type { AllSettings, SettingsWorkbookPayload } from './settingsIO'

interface CloudWorkspaceRow {
  id: string
  name: string
  dataset_fingerprint: string | null
  dataset_file_name: string | null
  updated_at: string
}

interface CloudVersionRow {
  id: string
  workspace_id: string
  version_no: number
  settings: AllSettings
  save_kind: 'manual' | 'autosave'
  created_at: string
}

export interface CloudSettingsConfigStatus {
  configured: boolean
  url?: string
}

export interface SaveCloudSettingsInput {
  workspaceId: string | null
  payload: SettingsWorkbookPayload
  snapshot: AllSettings
  dataset: SavDataset | null
  saveKind: 'manual' | 'autosave'
}

export interface SaveCloudSettingsResult {
  workspaceId: string
  versionId: string
  versionNo: number
}

export interface LoadCloudSettingsResult {
  workspace: CloudWorkspaceRow
  version: CloudVersionRow
}

let client: SupabaseClient | null = null

export function getCloudSettingsStatus(): CloudSettingsConfigStatus {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim()
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
  return { configured: Boolean(url && key), url }
}

export function getSupabaseClient(): SupabaseClient {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim()
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
  if (!url || !key) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  if (!client) {
    client = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  }
  return client
}

export async function getCloudUser(): Promise<User | null> {
  if (!getCloudSettingsStatus().configured) return null
  const { data, error } = await getSupabaseClient().auth.getUser()
  if (error) return null
  return data.user
}

export async function signInCloudSettings(email: string): Promise<void> {
  const trimmed = email.trim()
  if (!trimmed) throw new Error('Email is required for Cloud Settings sign in.')
  const { error } = await getSupabaseClient().auth.signInWithOtp({
    email: trimmed,
    options: {
      emailRedirectTo: window.location.origin,
    },
  })
  if (error) throw error
}

export async function signOutCloudSettings(): Promise<void> {
  const { error } = await getSupabaseClient().auth.signOut()
  if (error) throw error
}

export function buildDatasetFingerprint(dataset: SavDataset | null, payload: SettingsWorkbookPayload): string {
  const source = payload.sourceDataset
  if (!dataset) return [
    source?.fileName ?? 'unknown',
    source?.filePath ?? '',
  ].join('|')
  return [
    dataset.fileName,
    dataset.fileSize,
    dataset.cases.length,
    dataset.variables.length,
  ].join('|')
}

function buildWorkspaceName(dataset: SavDataset | null, payload: SettingsWorkbookPayload): string {
  const fileName = dataset?.fileName || payload.sourceDataset?.fileName
  if (!fileName) return 'Crossify Workspace'
  return fileName.replace(/\.sav$/i, '')
}

export async function saveCloudSettings({
  workspaceId,
  payload,
  snapshot,
  dataset,
  saveKind,
}: SaveCloudSettingsInput): Promise<SaveCloudSettingsResult> {
  const supabase = getSupabaseClient()
  const user = await getCloudUser()
  if (!user) throw new Error('Please sign in before using Cloud Settings.')

  const datasetFingerprint = buildDatasetFingerprint(dataset, payload)
  const workspacePatch = {
    owner_id: user.id,
    name: buildWorkspaceName(dataset, payload),
    dataset_fingerprint: datasetFingerprint,
    dataset_file_name: dataset?.fileName ?? payload.sourceDataset?.fileName ?? null,
    dataset_cases: dataset?.cases.length ?? null,
    dataset_variables: dataset?.variables.length ?? null,
    updated_at: new Date().toISOString(),
  }

  const workspaceResult = workspaceId
    ? await supabase
      .from('crossify_workspaces')
      .update(workspacePatch)
      .eq('id', workspaceId)
      .select('id')
      .single()
    : await supabase
      .from('crossify_workspaces')
      .insert(workspacePatch)
      .select('id')
      .single()

  if (workspaceResult.error) throw workspaceResult.error
  const nextWorkspaceId = workspaceResult.data.id as string

  const { count, error: countError } = await supabase
    .from('crossify_workspace_versions')
    .select('id', { count: 'exact', head: true })
    .eq('workspace_id', nextWorkspaceId)
  if (countError) throw countError
  const versionNo = (count ?? 0) + 1

  const { data: version, error: versionError } = await supabase
    .from('crossify_workspace_versions')
    .insert({
      workspace_id: nextWorkspaceId,
      version_no: versionNo,
      save_kind: saveKind,
      settings: snapshot,
    })
    .select('id, version_no')
    .single()
  if (versionError) throw versionError

  return {
    workspaceId: nextWorkspaceId,
    versionId: version.id as string,
    versionNo: version.version_no as number,
  }
}

export async function loadLatestCloudSettings(workspaceId?: string | null): Promise<LoadCloudSettingsResult> {
  const supabase = getSupabaseClient()
  const user = await getCloudUser()
  if (!user) throw new Error('Please sign in before using Cloud Settings.')

  const workspaceQuery = workspaceId
    ? supabase
      .from('crossify_workspaces')
      .select('id, name, dataset_fingerprint, dataset_file_name, updated_at')
      .eq('id', workspaceId)
      .single()
    : supabase
      .from('crossify_workspaces')
      .select('id, name, dataset_fingerprint, dataset_file_name, updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

  const { data: workspace, error: workspaceError } = await workspaceQuery
  if (workspaceError) throw workspaceError
  if (!workspace) throw new Error('No Cloud Settings workspace found.')

  const { data: version, error: versionError } = await supabase
    .from('crossify_workspace_versions')
    .select('id, workspace_id, version_no, settings, save_kind, created_at')
    .eq('workspace_id', workspace.id)
    .order('version_no', { ascending: false })
    .limit(1)
    .single()
  if (versionError) throw versionError

  return {
    workspace: workspace as CloudWorkspaceRow,
    version: version as CloudVersionRow,
  }
}
