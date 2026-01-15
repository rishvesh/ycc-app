"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

interface Message {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  created_at: string
}

export default function ChatPage() {
  const params = useParams()
  const userId = params.userId as string
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [otherUser, setOtherUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadChat = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) return

      setCurrentUser(userData.user)

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()
      setOtherUser(profile)

      const { data: chatMessages } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${userData.user.id},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${userData.user.id})`,
        )
        .order("created_at", { ascending: true })

      if (chatMessages) {
        setMessages(chatMessages as Message[])

        // Mark messages as read
        await supabase
          .from("messages")
          .update({ read_at: new Date().toISOString() })
          .eq("recipient_id", userData.user.id)
          .eq("sender_id", userId)
      }

      setLoading(false)
    }

    loadChat()
  }, [userId])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser) return

    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: currentUser.id,
        recipient_id: userId,
        content: newMessage,
      })

      if (error) throw error

      setNewMessage("")

      // Reload messages
      const { data: chatMessages } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${currentUser.id},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${currentUser.id})`,
        )
        .order("created_at", { ascending: true })

      if (chatMessages) {
        setMessages(chatMessages as Message[])
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-primary">YCC</div>
          </Link>
          <Link href="/messages" className="text-sm hover:text-primary transition">
            Back to Messages
          </Link>
        </div>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full py-8 px-4 flex flex-col">
        {/* Chat Header */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h1 className="text-2xl font-bold">{otherUser?.display_name || "User"}</h1>
            <p className="text-muted-foreground text-sm">{otherUser?.city || "Unknown"}</p>
          </CardContent>
        </Card>

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto mb-6 p-4 bg-muted/20 rounded-lg min-h-96">
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_id === currentUser?.id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.sender_id === currentUser?.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border"
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className="text-xs mt-1 opacity-70">{new Date(msg.created_at).toLocaleTimeString()}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center">No messages yet. Start the conversation!</p>
          )}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="bg-input"
          />
          <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={!newMessage.trim()}>
            Send
          </Button>
        </form>
      </div>
    </div>
  )
}
