import { client } from '@/api/client'
import { mockDelay } from '@/mocks/delays'
import { getMockStore, newId } from '@/mocks/store'
import { useApiFor } from '@/lib/env'
import type { AIConversation, AIMessage, AITaskPlanSuggestion, TaskPriority } from '@/types'

// API: POST /api/v1/ai/task-plans
export async function generateTaskPlan(input: {
  requirement: string
  project_id?: string
}): Promise<AITaskPlanSuggestion[]> {
  if (useApiFor('ai')) {
    return client.post<AITaskPlanSuggestion[]>('/api/v1/ai/task-plans', input)
  }
  await mockDelay(600)
  return [
    {
      title: 'Clarify acceptance criteria',
      description: `From: ${input.requirement.slice(0, 80)}…`,
      priority: 'high' as TaskPriority,
      status: 'todo',
    },
    {
      title: 'Spike technical approach',
      description: 'Document options and risks.',
      priority: 'normal' as TaskPriority,
      status: 'backlog',
    },
    {
      title: 'Implement core flow',
      description: 'Build happy path with tests on backend.',
      priority: 'high' as TaskPriority,
      status: 'backlog',
    },
  ]
}

// API: GET /api/v1/ai/conversations
export async function listConversations(): Promise<AIConversation[]> {
  if (useApiFor('ai')) {
    return client.get<AIConversation[]>('/api/v1/ai/conversations')
  }
  await mockDelay()
  const s = getMockStore()
  return s.conversations.filter((c) => c.user_id === s.currentUserId)
}

// API: POST /api/v1/ai/conversations
export async function createConversation(title: string): Promise<AIConversation> {
  if (useApiFor('ai')) {
    return client.post<AIConversation>('/api/v1/ai/conversations', { title })
  }
  await mockDelay()
  const s = getMockStore()
  const c: AIConversation = {
    id: newId('ai'),
    user_id: s.currentUserId,
    workspace_id: null,
    title,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  s.conversations.push(c)
  return c
}

// API: GET /api/v1/ai/conversations/{conversation_id}
export async function getConversation(conversationId: string): Promise<AIConversation> {
  if (useApiFor('ai')) {
    return client.get<AIConversation>(`/api/v1/ai/conversations/${conversationId}`)
  }
  await mockDelay(100)
  const c = getMockStore().conversations.find((x) => x.id === conversationId)!
  return { ...c }
}

// API: GET messages (mock); API: POST /api/v1/ai/conversations/{id}/messages
export async function listMessages(conversationId: string): Promise<AIMessage[]> {
  await mockDelay(100)
  return getMockStore().messages.filter((m) => m.conversation_id === conversationId)
}

export async function sendMessage(conversationId: string, content: string): Promise<AIMessage> {
  if (useApiFor('ai')) {
    return client.post<AIMessage>(
      `/api/v1/ai/conversations/${conversationId}/messages`,
      { content },
    )
  }
  await mockDelay(200)
  const s = getMockStore()
  const userMsg: AIMessage = {
    id: newId('msg'),
    conversation_id: conversationId,
    role: 'user',
    content,
    created_at: new Date().toISOString(),
  }
  s.messages.push(userMsg)
  const assistantMsg: AIMessage = {
    id: newId('msg'),
    conversation_id: conversationId,
    role: 'assistant',
    content: 'This is a mock assistant reply. Connect T074 for project-scoped answers.',
    created_at: new Date().toISOString(),
  }
  s.messages.push(assistantMsg)
  return assistantMsg
}

/** Simulated streaming for UI — API: POST .../stream (SSE) when T075 ships */
export async function* streamMockReply(text: string): AsyncGenerator<string> {
  const words = text.split(' ')
  for (const w of words) {
    await mockDelay(40)
    yield `${w} `
  }
}