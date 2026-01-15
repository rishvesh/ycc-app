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
}

interface PostCardProps {
  post: Post
}

export async function PostCard({ post }: PostCardProps) {
  const supabase = await createClient()
  const { data: author } = await supabase.from("profiles").select("display_name").eq("id", post.author_id).single()

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
    <Card className="hover:shadow-md transition">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link href={`/posts/${post.id}`}>
              <CardTitle className="hover:text-primary transition text-lg">{post.title}</CardTitle>
            </Link>
            <CardDescription className="mt-2">
              by {author?.display_name || "Unknown"} • {new Date(post.created_at).toLocaleDateString()}
            </CardDescription>
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
          <Button variant="outline" size="sm" className="mt-4 bg-transparent">
            Read More
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
