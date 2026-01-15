"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

const CATEGORIES = ["General", "Education", "Environment", "Health", "Technology", "Skills", "Other"]

export default function CreateThreadPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("General")
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
        title,
        description,
        category,
      })

      if (insertError) throw insertError
      router.push("/forum")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to create discussion")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-primary">YCC</div>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/forum" className="text-sm hover:text-primary transition">
              Forum
            </Link>
          </nav>
        </div>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full py-12 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Start a Discussion</h1>
          <p className="text-muted-foreground mt-2">Share your thoughts and engage with the community</p>
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
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Link href="/forum">
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
