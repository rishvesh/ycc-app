"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function CreatePostPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [postType, setPostType] = useState<"opportunity" | "announcement" | "discussion">("opportunity")
  const [tags, setTags] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data } = await supabase.auth.getUser()
      if (!data?.user) throw new Error("Not authenticated")

      const tagsArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)

      const { error: insertError } = await supabase.from("posts").insert({
        author_id: data.user.id,
        title,
        content,
        post_type: postType,
        tags: tagsArray,
      })

      if (insertError) throw insertError
      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to create post")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-2xl mx-auto w-full py-12 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create Post</h1>
          <p className="text-muted-foreground mt-2">Share an opportunity, announcement, or start a discussion</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What's this about?"
                  required
                  className="bg-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your post..."
                  rows={6}
                  required
                  className="bg-input"
                />
              </div>

              <div className="space-y-3">
                <Label>Post Type</Label>
                <RadioGroup value={postType} onValueChange={(value: any) => setPostType(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="opportunity" id="opportunity" />
                    <Label htmlFor="opportunity" className="font-normal cursor-pointer">
                      Volunteer Opportunity
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="announcement" id="announcement" />
                    <Label htmlFor="announcement" className="font-normal cursor-pointer">
                      Announcement
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="discussion" id="discussion" />
                    <Label htmlFor="discussion" className="font-normal cursor-pointer">
                      Discussion
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g., education, environment, youth"
                  className="bg-input"
                />
              </div>

              {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">{error}</p>}

              <div className="flex gap-4">
                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Post"}
                </Button>
                <Link href="/dashboard">
                  <Button variant="outline">Cancel</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
