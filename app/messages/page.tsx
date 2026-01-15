"use client"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useEffect, useState } from "react"

interface Conversation {
  userId: string
  displayName: string
  lastMessage: string
  lastMessageTime: string
  unread: boolean
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const loadConversations = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) return

      setCurrentUser(userData.user)

      const { data: messages } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${userData.user.id},recipient_id.eq.${userData.user.id}`)
        .order("created_at", { ascending: false })

      if (messages) {
        const conversationMap = new Map<string, Conversation>()

        for (const msg of messages) {
          const otherUserId = msg.sender_id === userData.user.id ? msg.recipient_id : msg.sender_id

          if (!conversationMap.has(otherUserId)) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("display_name")
              .eq("id", otherUserId)
              .single()

            conversationMap.set(otherUserId, {
              userId: otherUserId,
              displayName: profile?.display_name || "Unknown",
              lastMessage: msg.content,
              lastMessageTime: msg.created_at,
              unread: !msg.read_at && msg.recipient_id === userData.user.id,
            })
          }
        }

        setConversations(Array.from(conversationMap.values()))
      }

      setLoading(false)
    }

    loadConversations()
  }, [])

  const filteredConversations = conversations.filter((conv) =>
    conv.displayName.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-4xl mx-auto w-full py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground mt-2">Connect with other volunteers and organization staff</p>
        </div>

        <div className="mb-6">
          <Input
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md bg-input"
          />
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading conversations...</p>
        ) : filteredConversations.length > 0 ? (
          <div className="space-y-3">
            {filteredConversations.map((conv) => (
              <Link key={conv.userId} href={`/messages/${conv.userId}`}>
                <Card className="hover:shadow-md transition cursor-pointer hover:border-accent/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{conv.displayName}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{conv.lastMessage}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {new Date(conv.lastMessageTime).toLocaleDateString()}
                        </p>
                        {conv.unread && <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No conversations yet.{" "}
              <Link href="/explore" className="text-primary hover:underline">
                Explore and connect with others
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
