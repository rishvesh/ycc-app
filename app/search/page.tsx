"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [search, setSearch] = useState(query)
  const [organizations, setOrganizations] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [threads, setThreads] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setOrganizations([])
      setPosts([])
      setEvents([])
      setThreads([])
      return
    }

    setLoading(true)
    const searchLower = searchQuery.toLowerCase()

    const [orgsResult, postsResult, eventsResult, threadsResult] = await Promise.all([
      supabase.from("organizations").select("*").ilike("name", `%${searchQuery}%`),
      supabase.from("posts").select("*").ilike("title", `%${searchQuery}%`),
      supabase.from("events").select("*").ilike("title", `%${searchQuery}%`),
      supabase.from("forum_threads").select("*").ilike("title", `%${searchQuery}%`),
    ])

    setOrganizations(orgsResult.data || [])
    setPosts(postsResult.data || [])
    setEvents(eventsResult.data || [])
    setThreads(threadsResult.data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (query) {
      handleSearch(query)
    }
  }, [query])

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-6xl mx-auto w-full py-12 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Search</h1>
          <p className="text-muted-foreground">Find organizations, opportunities, events, and discussions</p>
        </div>

        <div className="mb-8">
          <div className="flex gap-2">
            <Input
              placeholder="Search anything..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(search)}
              className="flex-1 bg-input"
            />
            <Button onClick={() => handleSearch(search)} className="bg-primary hover:bg-primary/90">
              Search
            </Button>
          </div>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Searching...</p>
        ) : search ? (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Results</TabsTrigger>
              <TabsTrigger value="orgs">Organizations ({organizations.length})</TabsTrigger>
              <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
              <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
              <TabsTrigger value="forums">Discussions ({threads.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {organizations.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Organizations</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {organizations.map((org) => (
                      <Link key={org.id} href={`/organization/${org.id}`}>
                        <Card className="hover:shadow-md transition hover:border-accent/30">
                          <CardHeader>
                            <CardTitle className="hover:text-primary transition">{org.name}</CardTitle>
                            <CardDescription>{org.mission}</CardDescription>
                          </CardHeader>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {posts.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Posts & Opportunities</h2>
                  <div className="space-y-4">
                    {posts.slice(0, 3).map((post) => (
                      <Link key={post.id} href={`/posts/${post.id}`}>
                        <Card className="hover:shadow-md transition hover:border-accent/30">
                          <CardHeader>
                            <CardTitle className="hover:text-primary transition">{post.title}</CardTitle>
                            <CardDescription>{post.post_type}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground line-clamp-2">{post.content}</p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="orgs" className="space-y-4">
              {organizations.length > 0 ? (
                organizations.map((org) => (
                  <Link key={org.id} href={`/organization/${org.id}`}>
                    <Card className="hover:shadow-md transition hover:border-accent/30">
                      <CardHeader>
                        <CardTitle className="hover:text-primary transition">{org.name}</CardTitle>
                        <CardDescription>{org.mission}</CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">No organizations found</CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="posts" className="space-y-4">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <Link key={post.id} href={`/posts/${post.id}`}>
                    <Card className="hover:shadow-md transition hover:border-accent/30">
                      <CardHeader>
                        <CardTitle className="hover:text-primary transition">{post.title}</CardTitle>
                        <CardDescription>{post.post_type}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground line-clamp-2">{post.content}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">No posts found</CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="events" className="space-y-4">
              {events.length > 0 ? (
                events.map((event) => (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <Card className="hover:shadow-md transition hover:border-accent/30">
                      <CardHeader>
                        <CardTitle className="hover:text-primary transition">{event.title}</CardTitle>
                        <CardDescription>{event.location}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.event_date).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">No events found</CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="forums" className="space-y-4">
              {threads.length > 0 ? (
                threads.map((thread) => (
                  <Link key={thread.id} href={`/forum/${thread.id}`}>
                    <Card className="hover:shadow-md transition hover:border-accent/30">
                      <CardHeader>
                        <CardTitle className="hover:text-primary transition">{thread.title}</CardTitle>
                        <CardDescription>{thread.category}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground line-clamp-2">{thread.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">No discussions found</CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Enter a search term to get started
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
