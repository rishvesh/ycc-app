"use client"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Application {
  id: string
  volunteer_id: string
  opportunity_id: string
  status: "pending" | "approved" | "rejected"
  cover_letter: string
  created_at: string
  volunteer_name: string
  opportunity_title: string
}

export default function ApplicationsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [userType, setUserType] = useState<"volunteer" | "organization_staff" | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const loadApplications = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        router.push("/auth/login")
        return
      }

      const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", userData.user.id).single()

      if (profile) {
        setUserType(profile.user_type)

        if (profile.user_type === "volunteer") {
          // Volunteer: Load their applications
          const { data: appData } = await supabase
            .from("volunteer_applications")
            .select("*")
            .eq("volunteer_id", userData.user.id)
            .order("created_at", { ascending: false })

          if (appData) {
            const enriched = await Promise.all(
              appData.map(async (app: any) => {
                const { data: post } = await supabase
                  .from("posts")
                  .select("title")
                  .eq("id", app.opportunity_id)
                  .single()

                return {
                  ...app,
                  opportunity_title: post?.title || "Unknown",
                  volunteer_name: "You",
                }
              }),
            )

            setApplications(enriched)
          }
        } else {
          // NGO Staff: Load applications to their opportunities
          const { data: myPosts } = await supabase
            .from("posts")
            .select("id")
            .eq("author_id", userData.user.id)
            .eq("post_type", "opportunity")

          if (myPosts && myPosts.length > 0) {
            const opportunityIds = myPosts.map((p) => p.id)

            const { data: appData } = await supabase
              .from("volunteer_applications")
              .select("*")
              .in("opportunity_id", opportunityIds)
              .order("created_at", { ascending: false })

            if (appData) {
              const enriched = await Promise.all(
                appData.map(async (app: any) => {
                  const { data: volunteer } = await supabase
                    .from("profiles")
                    .select("display_name")
                    .eq("id", app.volunteer_id)
                    .single()

                  const { data: post } = await supabase
                    .from("posts")
                    .select("title")
                    .eq("id", app.opportunity_id)
                    .single()

                  return {
                    ...app,
                    volunteer_name: volunteer?.display_name || "Unknown",
                    opportunity_title: post?.title || "Unknown",
                  }
                }),
              )

              setApplications(enriched)
            }
          }
        }
      }

      setLoading(false)
    }

    loadApplications()
  }, [])

  const pendingApplications = applications.filter((a) => a.status === "pending")
  const approvedApplications = applications.filter((a) => a.status === "approved")
  const rejectedApplications = applications.filter((a) => a.status === "rejected")

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-6xl mx-auto w-full py-12 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            {userType === "volunteer" ? "My Applications" : "Applications Received"}
          </h1>
          <p className="text-muted-foreground mt-2">Track your volunteer applications and their status</p>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {loading ? (
              <p className="text-muted-foreground">Loading applications...</p>
            ) : pendingApplications.length > 0 ? (
              pendingApplications.map((app) => (
                <Card key={app.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{app.opportunity_title}</CardTitle>
                        <CardDescription className="mt-1">{app.volunteer_name}</CardDescription>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-700 text-xs font-semibold">
                        Pending
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Cover Letter:</p>
                      <p className="text-sm">{app.cover_letter}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Applied {new Date(app.created_at).toLocaleDateString()}
                    </div>
                    {userType === "organization_staff" && (
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                          Approve
                        </Button>
                        <Button size="sm" variant="outline">
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  {userType === "volunteer" ? "No pending applications" : "No pending applications received"}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4 mt-6">
            {approvedApplications.length > 0 ? (
              approvedApplications.map((app) => (
                <Card key={app.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{app.opportunity_title}</CardTitle>
                        <CardDescription className="mt-1">{app.volunteer_name}</CardDescription>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-700 text-xs font-semibold">
                        Approved
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    Approved {new Date(app.created_at).toLocaleDateString()}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">No approved applications</CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4 mt-6">
            {rejectedApplications.length > 0 ? (
              rejectedApplications.map((app) => (
                <Card key={app.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{app.opportunity_title}</CardTitle>
                        <CardDescription className="mt-1">{app.volunteer_name}</CardDescription>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-700 text-xs font-semibold">
                        Rejected
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    Rejected {new Date(app.created_at).toLocaleDateString()}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">No rejected applications</CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
