"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useEffect, useState } from "react"

interface Post {
  id: string
  title: string
  content: string
  post_type: "opportunity" | "announcement" | "discussion"
  tags: string[]
  author_id: string
  created_at: string
}

interface Organization {
  id: string
  name: string
  mission: string
  focus_areas: string[]
  created_at: string
}

export default function ExplorePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      const [postsResult, orgsResult] = await Promise.all([
        supabase.from("posts").select("*").order("created_at", { ascending: false }),
        supabase.from("organizations").select("*").order("created_at", { ascending: false }),
      ])

      if (postsResult.data) {
        setPosts(postsResult.data as Post[])
        setFilteredPosts(postsResult.data as Post[])
      }

      if (orgsResult.data) {
        setOrganizations(orgsResult.data as Organization[])
        setFilteredOrgs(orgsResult.data as Organization[])
      }

      setLoading(false)
    }

    loadData()
  }, [])

  useEffect(() => {
    const searchLower = search.toLowerCase()

    const filteredPostsResult = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower) ||
        post.tags?.some((tag) => tag.toLowerCase().includes(searchLower)),
    )

    const filteredOrgsResult = organizations.filter(
      (org) =>
        org.name.toLowerCase().includes(searchLower) ||
        org.mission.toLowerCase().includes(searchLower) ||
        org.focus_areas?.some((area) => area.toLowerCase().includes(searchLower)),
    )

    setFilteredPosts(filteredPostsResult)
    setFilteredOrgs(filteredOrgsResult)
  }, [search, posts, organizations])

  const handlePostTypeFilter = (type: string) => {
    if (type === "all") {
      setFilteredPosts(posts)
    } else {
      setFilteredPosts(posts.filter((post) => post.post_type === type))
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Content */}
      <div className="flex-1 max-w-6xl mx-auto w-full py-12 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Explore</h1>
          <p className="text-muted-foreground">Discover opportunities and organizations making an impact</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <Input
            placeholder="Search organizations, opportunities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md bg-input"
          />
        </div>

        <Tabs defaultValue="organizations" className="mb-8">
          <TabsList>
            <TabsTrigger value="organizations">Organizations</TabsTrigger>
            <TabsTrigger value="opportunities">All Posts</TabsTrigger>
          </TabsList>

          <TabsContent value="organizations" className="space-y-4 mt-6">
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : filteredOrgs.length > 0 ? (
              filteredOrgs.map((org) => (
                <Card key={org.id} className="hover:shadow-md transition hover:border-accent/30">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link href={`/organization/${org.id}`}>
                          <CardTitle className="hover:text-primary transition">{org.name}</CardTitle>
                        </Link>
                        <CardDescription className="mt-2">{org.mission}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {org.focus_areas && org.focus_areas.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {org.focus_areas.map((area: string) => (
                          <span
                            key={area}
                            className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    )}
                    <Link href={`/organization/${org.id}`}>
                      <Button variant="outline" size="sm">
                        View Organization
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">No organizations found.</CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-4 mt-6">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => handlePostTypeFilter("all")}
                className="px-4 py-2 rounded-lg border border-border hover:border-accent/50 transition text-sm"
              >
                All
              </button>
              {["opportunity", "announcement", "discussion"].map((type) => (
                <button
                  key={type}
                  onClick={() => handlePostTypeFilter(type)}
                  className="px-4 py-2 rounded-lg border border-border hover:border-accent/50 transition text-sm"
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : filteredPosts.length > 0 ? (
              filteredPosts.map((post) => <PostCardClient key={post.id} post={post} />)
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No posts found. Check back soon!
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function PostCardClient({ post }: { post: Post }) {
  const typeColors = {
    opportunity: "bg-primary/10 text-primary",
    announcement: "bg-secondary/10 text-secondary-foreground",
    discussion: "bg-accent/10 text-accent",
  }

  const typeLabel = {
    opportunity: "Opportunity",
    announcement: "Announcement",
    discussion: "Discussion",
  }

  return (
    <Card className="hover:shadow-md transition hover:border-accent/30">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link href={`/posts/${post.id}`}>
              <CardTitle className="hover:text-primary transition text-lg">{post.title}</CardTitle>
            </Link>
            <CardDescription className="mt-2">{new Date(post.created_at).toLocaleDateString()}</CardDescription>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${typeColors[post.post_type]}`}>
            {typeLabel[post.post_type]}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground line-clamp-3">{post.content}</p>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag: string) => (
              <span key={tag} className="px-2 py-1 rounded bg-border text-xs">
                #{tag}
              </span>
            ))}
          </div>
        )}
        <Link href={`/posts/${post.id}`}>
          <Button variant="outline" size="sm">
            Read More
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
