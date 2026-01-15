import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface Post {
  id: string
  title: string
  content: string
  post_type: "opportunity" | "announcement" | "discussion"
  tags: string[]
  author_id: string
  created_at: string
  organization_id?: string
}

export default async function FeedPage() {
  const supabase = await createClient()

  const { data: user, error: userError } = await supabase.auth.getUser()
  if (userError || !user?.user) {
    redirect("/auth/login")
  }

  // Get user's subscribed organizations
  const { data: subscriptions } = await supabase
    .from("organization_subscriptions")
    .select("organization_id")
    .eq("user_id", user.user.id)

  const orgIds = subscriptions?.map((sub: any) => sub.organization_id) || []

  // Get posts from subscribed organizations
  let feedPosts: Post[] = []
  if (orgIds.length > 0) {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .in("organization_id", orgIds)
      .order("created_at", { ascending: false })
    feedPosts = data as Post[]
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-4xl mx-auto w-full py-12 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Your Feed</h1>
          <p className="text-muted-foreground mt-2">Posts from organizations you follow</p>
        </div>

        {feedPosts.length > 0 ? (
          <div className="space-y-4">
            {feedPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition hover:border-accent/30">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link href={`/posts/${post.id}`}>
                        <CardTitle className="hover:text-primary transition text-lg">{post.title}</CardTitle>
                      </Link>
                      <CardDescription className="mt-2">
                        {new Date(post.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        post.post_type === "opportunity"
                          ? "bg-primary/10 text-primary"
                          : post.post_type === "announcement"
                            ? "bg-secondary/10 text-secondary-foreground"
                            : "bg-accent/10 text-accent"
                      }`}
                    >
                      {post.post_type.charAt(0).toUpperCase() + post.post_type.slice(1)}
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
                    <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                      Read More
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <p>You haven't subscribed to any organizations yet.</p>
              <Link href="/explore" className="text-primary hover:underline block mt-2">
                Explore organizations to follow
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
