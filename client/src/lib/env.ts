export type DataSource = 'mock' | 'api'

export function getDataSource(): DataSource {
  const v = import.meta.env.VITE_DATA_SOURCE
  return v === 'api' ? 'api' : 'mock'
}

/** Per-domain override: use API when VITE_USE_API_<domain>=1 or global api mode. */
export function useApiFor(domain: string): boolean {
  const key = `VITE_USE_API_${domain}` as keyof ImportMetaEnv
  const override = import.meta.env[key]
  if (override === '1' || override === 'true') return true
  if (override === '0' || override === 'false') return false
  return getDataSource() === 'api'
}

export function getApiBaseUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL
  if (base && typeof base === 'string' && base.length > 0) return base.replace(/\/$/, '')
  return ''
}