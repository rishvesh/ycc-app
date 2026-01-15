"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useEffect, useState } from "react"

interface Thread {
  id: string
  title: string
  description: string
  category: string
  created_by: string
  created_at: string
  creator_name: string
  reply_count: number
}

const CATEGORIES = ["General", "Education", "Environment", "Health", "Technology", "Skills", "Other"]

export default function ForumPage() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [filteredThreads, setFilteredThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("General")
  const supabase = createClient()

  useEffect(() => {
    const loadThreads = async () => {
      const { data: threadData } = await supabase
        .from("forum_threads")
        .select("*")
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
        setFilteredThreads(enrichedThreads.filter((t) => t.category === "General"))
      }

      setLoading(false)
    }

    loadThreads()
  }, [])

  useEffect(() => {
    let results = threads.filter((thread) => thread.category === selectedCategory)

    if (search) {
      results = results.filter(
        (thread) =>
          thread.title.toLowerCase().includes(search.toLowerCase()) ||
          thread.description.toLowerCase().includes(search.toLowerCase()),
      )
    }

    setFilteredThreads(results)
  }, [search, selectedCategory, threads])

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-6xl mx-auto w-full py-12 px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Community Forum</h1>
            <p className="text-muted-foreground mt-2">Discuss ideas and share experiences with the community</p>
          </div>
          <Link href="/forum/create">
            <Button className="bg-primary hover:bg-primary/90">Start a Discussion</Button>
          </Link>
        </div>

        <div className="mb-8">
          <Input
            placeholder="Search discussions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md bg-input"
          />
        </div>

        <Tabs defaultValue="General" onValueChange={setSelectedCategory}>
          <TabsList className="mb-6 w-full justify-start overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="whitespace-nowrap">
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>

          {CATEGORIES.map((category) => (
            <TabsContent key={category} value={category} className="space-y-4">
              {loading ? (
                <p className="text-muted-foreground">Loading discussions...</p>
              ) : filteredThreads.length > 0 ? (
                filteredThreads.map((thread) => (
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
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No discussions in this category yet.{" "}
                    <Link href="/forum/create" className="text-primary hover:underline">
                      Start one!
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
