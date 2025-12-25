"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Loader2, Search, Activity } from "lucide-react"
import { format } from "date-fns"

export default function AdminLogsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState("")
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    fetchLogs()
  }, [page, actionFilter])

  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), action: actionFilter })
      const res = await fetch(`/api/admin/logs?${params}`)
      if (res.status === 403) {
        router.push("/dashboard")
        return
      }
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    if (action.includes("DELETE")) return "text-red-600 bg-red-100 dark:bg-red-900/30"
    if (action.includes("APPROVE")) return "text-green-600 bg-green-100 dark:bg-green-900/30"
    if (action.includes("REJECT")) return "text-orange-600 bg-orange-100 dark:bg-orange-900/30"
    if (action.includes("UPDATE")) return "text-blue-600 bg-blue-100 dark:bg-blue-900/30"
    return "text-muted-foreground bg-muted"
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Audit Logs</h1>
            <p className="text-muted-foreground">
              View all admin actions and changes
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by action (e.g., DELETE, APPROVE)..."
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1) }}
            className="pl-10"
          />
        </div>

        {/* Logs List */}
        <div className="space-y-2">
          {logs.map((log) => (
            <Card key={log.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <Activity className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="text-sm">
                      {log.targetType && <span className="text-muted-foreground">{log.targetType}: </span>}
                      {log.targetId && <code className="text-xs">{log.targetId.substring(0, 8)}...</code>}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    By: {log.admin?.name || log.admin?.email || "System"}
                    {log.details && Object.keys(log.details).length > 0 && (
                      <span className="ml-2">
                        • {JSON.stringify(log.details).substring(0, 100)}
                        {JSON.stringify(log.details).length > 100 && "..."}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground flex-shrink-0">
                  {format(new Date(log.createdAt), "MMM d, yyyy h:mm a")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm text-muted-foreground">
              Page {page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              disabled={page === pagination.pages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        )}

        {logs.length === 0 && !isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            No audit logs found
          </div>
        )}
      </div>
    </div>
  )
}
