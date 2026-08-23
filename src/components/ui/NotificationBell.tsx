'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'

type Notification = {
  id: string
  title: string
  message: string
  is_read: boolean
  link: string | null
  created_at: string
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setNotifications(data)
        }
      })
      .catch((err) => console.error('Failed to fetch notifications', err))
  }, [])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' })
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
    } catch (error) {
      console.error('Failed to mark as read', error)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-ink hover:text-primary transition-colors focus:outline-none"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-surface border border-muted/20 rounded-md shadow-lg z-50 overflow-hidden">
          <div className="p-3 border-b border-muted/20 bg-muted/5 font-semibold text-ink">
            Notifications
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-ink/60">
                No notifications
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 border-b border-muted/10 hover:bg-muted/5 transition-colors cursor-pointer ${
                    !notif.is_read ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => {
                    if (!notif.is_read) markAsRead(notif.id)
                    if (notif.link) window.location.href = notif.link
                  }}
                >
                  <div className="font-medium text-sm text-ink">
                    {notif.title}
                  </div>
                  <div className="text-xs text-ink/70 mt-1">
                    {notif.message}
                  </div>
                  <div className="text-[10px] text-ink/40 mt-2">
                    {new Date(notif.created_at).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
