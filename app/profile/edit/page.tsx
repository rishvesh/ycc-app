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
import { useEffect, useState } from "react"

export default function EditProfilePage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [city, setCity] = useState("Pune")
  const [skills, setSkills] = useState("")
  const [interests, setInterests] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()
        if (profile) {
          setDisplayName(profile.display_name || "")
          setBio(profile.bio || "")
          setCity(profile.city || "Pune")
          setSkills(profile.skills?.join(", ") || "")
          setInterests(profile.interests?.join(", ") || "")
        }
      }
    }
    loadProfile()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { data } = await supabase.auth.getUser()
      if (!data?.user) throw new Error("Not authenticated")

      const skillsArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
      const interestsArray = interests
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean)

      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          bio: bio || null,
          city,
          skills: skillsArray,
          interests: interestsArray,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.user.id)

      if (error) throw error
      setSuccess(true)
      setTimeout(() => router.push("/profile"), 1500)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to save profile")
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
            <Link href="/explore" className="text-sm hover:text-primary transition">
              Explore
            </Link>
            <Link href="/profile" className="text-sm hover:text-primary transition">
              Profile
            </Link>
          </nav>
        </div>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full py-12 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="text-muted-foreground mt-2">Update your information and preferences</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="displayName">Full Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="bg-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="bg-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} className="bg-input" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma separated)</Label>
                <Input
                  id="skills"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g., Teaching, Design, Marketing"
                  className="bg-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interests">Interests (comma separated)</Label>
                <Input
                  id="interests"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="e.g., Education, Environment, Health"
                  className="bg-input"
                />
              </div>

              {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">{error}</p>}
              {success && (
                <p className="text-sm text-green-600 bg-green-50 dark:bg-green-950 p-3 rounded">
                  Profile saved successfully!
                </p>
              )}

              <div className="flex gap-4">
                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
                <Link href="/profile">
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
