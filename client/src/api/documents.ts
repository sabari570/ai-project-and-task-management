import { client } from '@/api/client'
import { mockDelay } from '@/mocks/delays'
import { getMockStore, newId } from '@/mocks/store'
import { useApiFor } from '@/lib/env'
import type { DocumentResponse } from '@/types'

// API: POST /api/v1/documents
export async function uploadDocument(input: {
  workspace_id: string
  title: string
}): Promise<DocumentResponse> {
  if (useApiFor('documents')) {
    return client.post<DocumentResponse>('/api/v1/documents', input)
  }
  await mockDelay()
  const s = getMockStore()
  const doc: DocumentResponse = {
    id: newId('doc'),
    workspace_id: input.workspace_id,
    title: input.title,
    status: 'pending',
    uploaded_by: s.currentUserId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  s.documents.push(doc)
  return doc
}

// API: GET /api/v1/documents/{document_id}
export async function getDocument(documentId: string): Promise<DocumentResponse> {
  if (useApiFor('documents')) {
    return client.get<DocumentResponse>(`/api/v1/documents/${documentId}`)
  }
  await mockDelay()
  const d = getMockStore().documents.find((x) => x.id === documentId)!
  return { ...d }
}

export async function listDocuments(workspaceId?: string): Promise<DocumentResponse[]> {
  await mockDelay()
  const docs = getMockStore().documents
  if (!workspaceId) return [...docs]
  return docs.filter((d) => d.workspace_id === workspaceId)
}

// API: POST /api/v1/documents/{document_id}/summarize
export async function summarizeDocument(documentId: string): Promise<{ message: string }> {
  if (useApiFor('documents')) {
    return client.post(`/api/v1/documents/${documentId}/summarize`)
  }
  await mockDelay(400)
  return { message: 'Summary job queued (mock).' }
}

// API: POST /api/v1/documents/{document_id}/reindex
export async function reindexDocument(documentId: string): Promise<{ message: string }> {
  if (useApiFor('documents')) {
    return client.post(`/api/v1/documents/${documentId}/reindex`)
  }
  await mockDelay(400)
  return { message: 'Reindex job queued (mock).' }
}