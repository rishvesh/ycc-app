"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Post {
  id: string
  title: string
  content: string
  post_type: "opportunity" | "announcement" | "discussion"
  tags: string[]
  author_id: string
  created_at: string
  author_name: string
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.postId as string
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [hasApplied, setHasApplied] = useState(false)
  const [coverLetter, setCoverLetter] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const loadPost = async () => {
      const { data: userData } = await supabase.auth.getUser()
      setCurrentUser(userData?.user)

      const { data: postData } = await supabase.from("posts").select("*").eq("id", postId).single()

      if (postData) {
        const { data: author } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", postData.author_id)
          .single()

        setPost({
          ...postData,
          author_name: author?.display_name || "Unknown",
        })

        // Check if user has already applied
        if (userData?.user && postData.post_type === "opportunity") {
          const { data: application } = await supabase
            .from("volunteer_applications")
            .select("*")
            .eq("volunteer_id", userData.user.id)
            .eq("opportunity_id", postId)
            .single()

          if (application) {
            setHasApplied(true)
          }
        }
      }

      setLoading(false)
    }

    loadPost()
  }, [postId])

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) {
      router.push("/auth/login")
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase.from("volunteer_applications").insert({
        volunteer_id: currentUser.id,
        opportunity_id: postId,
        cover_letter: coverLetter || null,
      })

      if (error) throw error

      setHasApplied(true)
      setCoverLetter("")
    } catch (error) {
      console.error("Error applying:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!post) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Post not found</p>
        <Link href="/explore">
          <Button className="mt-4">Back to Explore</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-primary">YCC</div>
          </Link>
          <Link href="/explore" className="text-sm hover:text-primary transition">
            Back to Explore
          </Link>
        </div>
      </header>

      <div className="flex-1 max-w-4xl mx-auto w-full py-8 px-4">
        {/* Post Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded capitalize">
                    {post.post_type.replace("_", " ")}
                  </span>
                  <CardTitle className="text-4xl mt-3">{post.title}</CardTitle>
                  <CardDescription className="mt-2">
                    Posted by {post.author_name} • {new Date(post.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none">
              <p className="text-lg whitespace-pre-wrap">{post.content}</p>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {post.tags.map((tag: string) => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-border text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Section - Only for Opportunities */}
        {post.post_type === "opportunity" && currentUser && (
          <Card>
            <CardHeader>
              <CardTitle>Apply for this Opportunity</CardTitle>
              <CardDescription>
                {hasApplied
                  ? "You've already applied to this opportunity"
                  : "Submit your interest and why you'd like to participate"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasApplied ? (
                <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded">
                  <p className="text-green-800 dark:text-green-200">
                    Thank you for applying! We'll review your application soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleApply} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cover Letter (Optional)</label>
                    <Textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Tell us why you're interested in this opportunity and what you can contribute..."
                      rows={6}
                      className="bg-input"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        )}

        {/* Sign in prompt */}
        {post.post_type === "opportunity" && !currentUser && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">Sign in to apply for this opportunity</p>
              <Link href="/auth/login">
                <Button className="bg-primary hover:bg-primary/90">Sign In to Apply</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
