import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default async function OrganizationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: org } = await supabase.from("organizations").select("*").eq("id", id).single()

  if (!org) {
    redirect("/dashboard")
  }

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("organization_id", id)
    .order("created_at", { ascending: false })

  const { data: user } = await supabase.auth.getUser()
  const isOwner = user?.user?.id === org.created_by

  return (
    <div className="flex flex-col min-h-screen mt--6">
      <div className="flex-1">
        {/* Organization Header */}
        <div className="bg-gradient-to-r from-accent/10 to-accent/5 border-b border-border py-8 px-4 pt-20">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">{org.name}</h1>
                <p className="text-lg text-muted-foreground mb-4">{org.mission}</p>
                <div className="flex flex-wrap gap-2">
                  {org.focus_areas?.map((area: string) => (
                    <span key={area} className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-medium">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
              {isOwner && (
                <div className="flex gap-2">
                  <Link href={`/organization/${id}/edit`}>
                    <Button variant="outline">Edit</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto py-12 px-4">
          <Tabs defaultValue="about" className="w-full">
            <TabsList>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="posts">Posts & Opportunities</TabsTrigger>
              <TabsTrigger value="forum">Forum</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>About {org.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{org.description || "No description provided"}</p>
                  </div>
                  {org.website && (
                    <div>
                      <h3 className="font-semibold mb-2">Website</h3>
                      <a
                        href={org.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {org.website}
                      </a>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold mb-2">Location</h3>
                    <p className="text-muted-foreground">{org.city || "Pune"}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="posts" className="space-y-6 mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Posts & Opportunities</h2>
                {isOwner && (
                  <Link href="/dashboard/create-post">
                    <Button className="bg-primary hover:bg-primary/90">Create Post</Button>
                  </Link>
                )}
              </div>

              {posts && posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post: any) => (
                    <Card key={post.id} className="hover:border-accent/30 transition">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <Link href={`/posts/${post.id}`}>
                              <CardTitle className="hover:text-primary transition">{post.title}</CardTitle>
                            </Link>
                            <CardDescription>{new Date(post.created_at).toLocaleDateString()}</CardDescription>
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent">
                            {post.post_type}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4 line-clamp-2">{post.content}</p>
                        <Link href={`/posts/${post.id}`}>
                          <Button variant="outline" size="sm">
                            View Post
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No posts yet. {isOwner && <span>Create your first opportunity!</span>}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="forum" className="space-y-6 mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Discussion Forum</h2>
                {isOwner && (
                  <Link href={`/organization/${id}/forum/create`}>
                    <Button className="bg-primary hover:bg-primary/90">Start Discussion</Button>
                  </Link>
                )}
              </div>
              <div className="space-y-4">
                {/* Placeholder for org forum threads - to be loaded dynamically */}
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    <p>Organization-specific forum threads will appear here</p>
                    {isOwner && (
                      <Link href={`/organization/${id}/forum/create`}>
                        <Button variant="outline" size="sm" className="mt-4 bg-transparent">
                          Start a Discussion
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
