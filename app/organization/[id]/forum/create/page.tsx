"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

export default function CreateOrgForumPage() {
  const router = useRouter()
  const params = useParams()
  const orgId = params.id as string
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) throw new Error("Not authenticated")

      const { error: insertError } = await supabase.from("forum_threads").insert({
        created_by: userData.user.id,
        organization_id: orgId,
        title,
        description,
        category: "General",
      })

      if (insertError) throw insertError
      router.push(`/organization/${orgId}?tab=forum`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to create discussion")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Start a Discussion</h2>
        <p className="text-muted-foreground mt-2">Share your thoughts with organization members</p>
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
                placeholder="What do you want to discuss?"
                required
                className="bg-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your discussion topic in detail..."
                rows={6}
                required
                className="bg-input"
              />
            </div>

            {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">{error}</p>}

            <div className="flex gap-4">
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? "Creating..." : "Start Discussion"}
              </Button>
              <Link href={`/organization/${orgId}`}>
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
