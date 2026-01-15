"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

interface Event {
  id: string
  title: string
  description: string
  event_date: string
  location: string
  max_volunteers: number
  organization_id: string
  org_name: string
}

export default function EventDetailPage() {
  const params = useParams()
  const eventId = params.id as string
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadEvent = async () => {
      const { data: eventData } = await supabase
        .from("events")
        .select("*, organizations(name, id)")
        .eq("id", eventId)
        .single()

      if (eventData) {
        setEvent({
          ...eventData,
          org_name: eventData.organizations?.name || "Unknown",
        })
      }
      setLoading(false)
    }

    loadEvent()
  }, [eventId])

  if (loading) return <div className="py-12 text-center text-muted-foreground">Loading event...</div>
  if (!event) return <div className="py-12 text-center text-muted-foreground">Event not found</div>

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-4xl mx-auto w-full py-12 px-4">
        <Link href="/events" className="text-primary hover:underline mb-6 inline-block">
          ← Back to Events
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{event.title}</CardTitle>
            <CardDescription>
              By{" "}
              <Link href={`/organization/${event.organization_id}`} className="text-primary hover:underline">
                {event.org_name}
              </Link>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">About this event</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold">Date & Time</h3>
                <p className="text-muted-foreground text-lg">{new Date(event.event_date).toLocaleString()}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Location</h3>
                <p className="text-muted-foreground text-lg">{event.location}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Volunteers Needed</h3>
                <p className="text-muted-foreground text-lg">{event.max_volunteers}</p>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-border">
              <Button className="bg-primary hover:bg-primary/90">Sign Up to Volunteer</Button>
              <Link href={`/organization/${event.organization_id}`}>
                <Button variant="outline">View Organization</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
