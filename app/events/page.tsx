"use client"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
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

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadEvents = async () => {
      const { data: eventsData } = await supabase
        .from("events")
        .select("*, organizations(name)")
        .order("event_date", { ascending: true })

      if (eventsData) {
        const enrichedEvents = eventsData.map((event: any) => ({
          ...event,
          org_name: event.organizations?.name || "Unknown Organization",
        }))
        setEvents(enrichedEvents)
        setFilteredEvents(enrichedEvents)
      }
      setLoading(false)
    }

    loadEvents()
  }, [])

  useEffect(() => {
    const searchLower = search.toLowerCase()
    const filtered = events.filter(
      (event) =>
        event.title.toLowerCase().includes(searchLower) ||
        event.description?.toLowerCase().includes(searchLower) ||
        event.location.toLowerCase().includes(searchLower) ||
        event.org_name.toLowerCase().includes(searchLower),
    )
    setFilteredEvents(filtered)
  }, [search, events])

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-6xl mx-auto w-full py-12 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Upcoming Events</h1>
          <p className="text-muted-foreground mt-2">Discover volunteer events across all organizations</p>
        </div>

        <div className="mb-8">
          <Input
            placeholder="Search events by name, location, or organization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md bg-input"
          />
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading events...</p>
        ) : filteredEvents.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card className="h-full hover:shadow-md transition hover:border-accent/30">
                  <CardHeader>
                    <CardTitle className="line-clamp-2 hover:text-primary transition">{event.title}</CardTitle>
                    <CardDescription>{event.org_name}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">📍 {event.location}</p>
                      <p className="font-medium">📅 {new Date(event.event_date).toLocaleDateString()}</p>
                      <p className="font-medium">👥 {event.max_volunteers} volunteers needed</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No events found. Check back soon!
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
