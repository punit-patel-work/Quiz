"use client"

import { useState, useEffect } from "react"
import { Bell, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  link?: string
  isRead: boolean
  createdAt: string
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications")
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error)
    }
  }

  // Initial fetch and polling every 60s
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  const markAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await fetch("/api/notifications", { method: "PATCH" })
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Failed to mark all read", error)
    }
  }
  
  const deleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" })
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id))
        // If it was unread, decrease count
        const wasUnread = notifications.find(n => n.id === id)?.isRead === false
        if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Failed to delete notification", error)
    }
  }

  const handleItemClick = (n: Notification) => {
      if (n.link) {
          router.push(n.link)
          setIsOpen(false)
      }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 animate-pulse ring-2 ring-background" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-semibold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllRead} 
                className="h-auto p-1 text-xs text-muted-foreground hover:text-primary"
            >
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
            {notifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    No notifications yet
                </div>
            ) : (
                <div className="divide-y">
                    {notifications.map((n) => (
                        <div 
                            key={n.id} 
                            className={cn(
                                "relative group px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors text-left pr-8",
                                !n.isRead && "bg-muted/30"
                            )}
                            onClick={() => handleItemClick(n)}
                        >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                              onClick={(e) => deleteNotification(e, n.id)}
                            >
                              <span className="sr-only">Dismiss</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-3 w-3"
                              >
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                              </svg>
                            </Button>
                            <div className="flex justify-between gap-2 mb-1">
                                <h4 className={cn("text-sm font-medium leading-none", !n.isRead && "text-primary font-semibold")}>
                                    {n.title}
                                </h4>
                                <span className="text-[10px] text-muted-foreground flex-shrink-0">
                                    {new Date(n.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                {n.message}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
