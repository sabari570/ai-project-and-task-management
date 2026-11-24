import { client } from '@/api/client'
import { mockDelay } from '@/mocks/delays'
import { getMockStore } from '@/mocks/store'
import { useApiFor } from '@/lib/env'
import type { NotificationResponse } from '@/types'

// API: GET /api/v1/notifications
export async function listNotifications(): Promise<NotificationResponse[]> {
  if (useApiFor('notifications')) {
    return client.get<NotificationResponse[]>('/api/v1/notifications')
  }
  await mockDelay()
  const s = getMockStore()
  return s.notifications
    .filter((n) => n.recipient_id === s.currentUserId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
}

// API: PATCH /api/v1/notifications/{notification_id}
export async function markNotification(
  notificationId: string,
  read: boolean,
): Promise<NotificationResponse> {
  if (useApiFor('notifications')) {
    return client.patch<NotificationResponse>(`/api/v1/notifications/${notificationId}`, {
      read,
    })
  }
  await mockDelay()
  const n = getMockStore().notifications.find((x) => x.id === notificationId)!
  n.read_at = read ? new Date().toISOString() : null
  return { ...n }
}

// API: POST /api/v1/notifications/read-all
export async function markAllNotificationsRead(): Promise<void> {
  if (useApiFor('notifications')) {
    await client.post('/api/v1/notifications/read-all')
    return
  }
  await mockDelay()
  const s = getMockStore()
  const now = new Date().toISOString()
  for (const n of s.notifications) {
    if (n.recipient_id === s.currentUserId && !n.read_at) n.read_at = now
  }
}

export function unreadCount(): number {
  const s = getMockStore()
  return s.notifications.filter((n) => n.recipient_id === s.currentUserId && !n.read_at).length
}