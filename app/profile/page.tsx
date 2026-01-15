import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Profile Content */}
      <div className="flex-1 max-w-4xl mx-auto w-full py-12 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">My Profile</h1>
          <p className="text-muted-foreground mt-2">Manage your volunteer profile and preferences</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center text-4xl">
                  👤
                </div>
                <h2 className="text-center text-xl font-semibold">{profile?.display_name || data.user.email}</h2>
                <p className="text-center text-sm text-muted-foreground mt-1">
                  {profile?.user_type === "ngo_staff" ? "NGO Staff" : "Volunteer"}
                </p>
                <p className="text-center text-sm text-muted-foreground mt-1">{profile?.city}</p>
              </CardContent>
            </Card>

            <div className="mt-4">
              <Link href="/profile/edit">
                <Button className="w-full bg-primary hover:bg-primary/90">Edit Profile</Button>
              </Link>
            </div>
          </div>

          {/* Main Profile Info */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{profile?.bio || "No bio added yet."}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills & Interests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile?.skills && profile.skills.length > 0 ? (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill: string) => (
                        <span key={skill} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {profile?.interests && profile.interests.length > 0 ? (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest: string) => (
                        <span key={interest} className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {(!profile?.skills || profile.skills.length === 0) &&
                (!profile?.interests || profile.interests.length === 0) ? (
                  <p className="text-muted-foreground">Add skills and interests to your profile.</p>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{data.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-medium">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "Recently"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
