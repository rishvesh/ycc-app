"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

const focusAreas = ["Education", "Environment", "Health", "Technology", "Skills", "Community", "Arts", "Sports"]

export default function CreateOrganizationPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    mission: "",
    description: "",
    website: "",
    focusAreas: [] as string[],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) throw new Error("Not authenticated")

      const { error: insertError } = await supabase.from("organizations").insert({
        created_by: userData.user.id,
        name: formData.name,
        mission: formData.mission,
        description: formData.description,
        website: formData.website,
        focus_areas: formData.focusAreas,
      })

      if (insertError) throw insertError
      router.push("/dashboard")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create organization")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFocusArea = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter((a) => a !== area)
        : [...prev.focusAreas, area],
    }))
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-2xl mx-auto w-full py-12 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create Organization</h1>
          <p className="text-muted-foreground mt-2">Register your organization and start connecting with volunteers</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Pune Youth Foundation"
                  required
                  className="bg-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mission">Mission *</Label>
                <Input
                  id="mission"
                  value={formData.mission}
                  onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                  placeholder="What does your organization do?"
                  required
                  className="bg-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell us more about your organization..."
                  rows={4}
                  className="bg-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://yourorganization.org"
                  className="bg-input"
                />
              </div>

              <div className="space-y-3">
                <Label>Focus Areas *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {focusAreas.map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleFocusArea(area)}
                      className={`px-4 py-2 rounded-lg border transition text-sm font-medium ${
                        formData.focusAreas.includes(area)
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">{error}</p>}

              <div className="flex gap-4">
                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Organization"}
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
