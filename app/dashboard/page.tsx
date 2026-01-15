import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  const { data: myPosts } = await supabase
    .from("posts")
    .select("*")
    .eq("author_id", data.user.id)
    .order("created_at", { ascending: false })

  const { data: organizations } =
    profile?.user_type === "organization_staff"
      ? await supabase.from("organizations").select("*").eq("created_by", data.user.id)
      : { data: null }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-6xl mx-auto w-full py-12 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back, {profile?.display_name}!</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">My Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{myPosts?.length || 0}</p>
            </CardContent>
          </Card>

          {profile?.user_type === "organization_staff" && (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">My Organizations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{organizations?.length || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">0</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList>
            <TabsTrigger value="posts">My Posts</TabsTrigger>
            {profile?.user_type === "organization_staff" && (
              <>
                <TabsTrigger value="organizations">My Organizations</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
              </>
            )}
            {profile?.user_type === "volunteer" && <TabsTrigger value="applications">My Applications</TabsTrigger>}
          </TabsList>

          <TabsContent value="posts" className="space-y-4 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">My Posts</h2>
              <Link href="/dashboard/create-post">
                <Button className="bg-primary hover:bg-primary/90">Create Post</Button>
              </Link>
            </div>

            {myPosts && myPosts.length > 0 ? (
              myPosts.map((post: any) => (
                <Card key={post.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle>{post.title}</CardTitle>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{post.post_type}</span>
                    </div>
                    <CardDescription>Created {new Date(post.created_at).toLocaleDateString()}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center">
                    <p className="text-muted-foreground line-clamp-2">{post.content}</p>
                    <Link href={`/posts/${post.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No posts yet.{" "}
                  <Link href="/dashboard/create-post" className="text-primary hover:underline">
                    Create your first post
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {profile?.user_type === "organization_staff" && (
            <TabsContent value="organizations" className="space-y-4 mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">My Organizations</h2>
                <Link href="/organization/create">
                  <Button className="bg-primary hover:bg-primary/90">Create Organization</Button>
                </Link>
              </div>

              {organizations && organizations.length > 0 ? (
                organizations.map((org: any) => (
                  <Card key={org.id} className="hover:border-accent/30 transition">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{org.name}</CardTitle>
                          <CardDescription className="mt-2">{org.mission}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        Focus: {org.focus_areas?.join(", ") || "Not specified"}
                      </div>
                      <Link href={`/organization/${org.id}`}>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No organizations created yet.{" "}
                    <Link href="/organization/create" className="text-primary hover:underline">
                      Create your first organization
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}

          <TabsContent value="applications" className="space-y-4 mt-6">
            <h2 className="text-xl font-semibold">
              {profile?.user_type === "volunteer" ? "My Applications" : "Applications Received"}
            </h2>
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">No applications yet.</CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
