"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

interface ForumThread {
  id: string
  title: string
  description: string
  category: string
  created_by: string
  created_at: string
  creator_name: string
}

interface Reply {
  id: string
  content: string
  author_id: string
  author_name: string
  created_at: string
}

export default function ThreadPage() {
  const params = useParams()
  const threadId = params.threadId as string
  const [thread, setThread] = useState<ForumThread | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [newReply, setNewReply] = useState("")
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const loadThread = async () => {
      const { data: userData } = await supabase.auth.getUser()
      setCurrentUser(userData?.user)

      const { data: threadData } = await supabase.from("forum_threads").select("*").eq("id", threadId).single()

      if (threadData) {
        const { data: creator } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", threadData.created_by)
          .single()

        setThread({
          ...threadData,
          creator_name: creator?.display_name || "Anonymous",
        })
      }

      const { data: repliesData } = await supabase
        .from("forum_replies")
        .select("*")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true })

      if (repliesData) {
        const enrichedReplies = await Promise.all(
          repliesData.map(async (reply: any) => {
            const { data: author } = await supabase
              .from("profiles")
              .select("display_name")
              .eq("id", reply.author_id)
              .single()

            return {
              ...reply,
              author_name: author?.display_name || "Anonymous",
            }
          }),
        )

        setReplies(enrichedReplies)
      }

      setLoading(false)
    }

    loadThread()
  }, [threadId])

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newReply.trim() || !currentUser) return

    try {
      const { error } = await supabase.from("forum_replies").insert({
        thread_id: threadId,
        author_id: currentUser.id,
        content: newReply,
      })

      if (error) throw error

      setNewReply("")

      // Reload replies
      const { data: repliesData } = await supabase
        .from("forum_replies")
        .select("*")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true })

      if (repliesData) {
        const enrichedReplies = await Promise.all(
          repliesData.map(async (reply: any) => {
            const { data: author } = await supabase
              .from("profiles")
              .select("display_name")
              .eq("id", reply.author_id)
              .single()

            return {
              ...reply,
              author_name: author?.display_name || "Anonymous",
            }
          }),
        )

        setReplies(enrichedReplies)
      }
    } catch (error) {
      console.error("Error posting reply:", error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-primary">YCC</div>
          </Link>
          <Link href="/forum" className="text-sm hover:text-primary transition">
            Back to Forum
          </Link>
        </div>
      </header>

      <div className="flex-1 max-w-4xl mx-auto w-full py-8 px-4">
        {thread && (
          <>
            {/* Thread Header */}
            <Card className="mb-8">
              <CardHeader>
                <div className="space-y-2">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{thread.category}</span>
                  <CardTitle className="text-3xl">{thread.title}</CardTitle>
                  <CardDescription>
                    Started by {thread.creator_name} • {new Date(thread.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-foreground">{thread.description}</p>
              </CardContent>
            </Card>

            {/* Replies */}
            <div className="space-y-4 mb-8">
              <h2 className="text-2xl font-bold">{replies.length} Replies</h2>

              {replies.length > 0 ? (
                replies.map((reply) => (
                  <Card key={reply.id}>
                    <CardHeader className="pb-3">
                      <CardDescription>
                        {reply.author_name} • {new Date(reply.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>{reply.content}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground">No replies yet. Be the first to respond!</p>
              )}
            </div>

            {/* Reply Form */}
            {currentUser ? (
              <Card>
                <CardHeader>
                  <CardTitle>Add Your Reply</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleReply} className="space-y-4">
                    <Input
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                      placeholder="Share your thoughts..."
                      className="bg-input"
                    />
                    <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={!newReply.trim()}>
                      Post Reply
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <Link href="/auth/login" className="text-primary hover:underline">
                    Sign in
                  </Link>{" "}
                  to reply to this discussion.
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
