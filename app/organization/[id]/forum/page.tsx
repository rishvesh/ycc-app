"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

interface Thread {
  id: string
  title: string
  description: string
  created_by: string
  created_at: string
  creator_name: string
  reply_count: number
}

export default function OrganizationForumPage() {
  const params = useParams()
  const orgId = params.id as string
  const [threads, setThreads] = useState<Thread[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadThreads = async () => {
      const { data: threadData } = await supabase
        .from("forum_threads")
        .select("*")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false })

      if (threadData) {
        const enrichedThreads = await Promise.all(
          threadData.map(async (thread: any) => {
            const { data: creator } = await supabase
              .from("profiles")
              .select("display_name")
              .eq("id", thread.created_by)
              .single()

            const { count: replyCount } = await supabase
              .from("forum_replies")
              .select("*", { count: "exact", head: true })
              .eq("thread_id", thread.id)

            return {
              ...thread,
              creator_name: creator?.display_name || "Anonymous",
              reply_count: replyCount || 0,
            }
          }),
        )
        setThreads(enrichedThreads)
      }
      setLoading(false)
    }

    loadThreads()
  }, [orgId])

  const filteredThreads = threads.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Discussion Forum</h2>
          <p className="text-muted-foreground">Connect with organization members</p>
        </div>
        <Link href={`/organization/${orgId}/forum/create`}>
          <Button className="bg-primary hover:bg-primary/90">Start Discussion</Button>
        </Link>
      </div>

      <Input
        placeholder="Search discussions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md bg-input"
      />

      {loading ? (
        <p className="text-muted-foreground">Loading discussions...</p>
      ) : filteredThreads.length > 0 ? (
        <div className="space-y-4">
          {filteredThreads.map((thread) => (
            <Link key={thread.id} href={`/forum/${thread.id}`}>
              <Card className="hover:shadow-md transition cursor-pointer hover:border-accent/30">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg hover:text-primary transition">{thread.title}</CardTitle>
                      <CardDescription className="mt-2 line-clamp-2">{thread.description}</CardDescription>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded whitespace-nowrap">
                      {thread.reply_count} replies
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Started by {thread.creator_name} • {new Date(thread.created_at).toLocaleDateString()}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No discussions yet.{" "}
            <Link href={`/organization/${orgId}/forum/create`} className="text-primary hover:underline">
              Start one!
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
