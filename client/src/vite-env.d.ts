/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATA_SOURCE?: string
  readonly VITE_API_BASE_URL?: string
  readonly VITE_USE_API_auth?: string
  readonly VITE_USE_API_workspaces?: string
  readonly VITE_USE_API_projects?: string
  readonly VITE_USE_API_tasks?: string
  readonly VITE_USE_API_notifications?: string
  readonly VITE_USE_API_reports?: string
  readonly VITE_USE_API_ai?: string
  readonly VITE_USE_API_documents?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}