"use client"

import { useState, useCallback, useEffect } from "react"
import { MessageList } from "./message-list"
import { ChatInput } from "./chat-input"
import type { Message, Conversation } from "@/lib/types"
import { Menu, Sparkle } from "lucide-react"

interface ChatWindowProps {
  conversation: Conversation | null
  onConversationUpdate: (conv: Conversation) => void
  onToggleSidebar: () => void
  sidebarOpen: boolean
}

export function ChatWindow({ conversation, onConversationUpdate, onToggleSidebar, sidebarOpen }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [convId, setConvId] = useState<string | null>(null)

  useEffect(() => {
    if (conversation) {
      setMessages(conversation.messages)
      setConvId(conversation.id)
    } else {
      setMessages([])
      setConvId(null)
    }
  }, [conversation])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)

    try {
      const res = await fetch("/api/chat/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: convId, message: content }),
      })

      if (!res.ok) throw new Error("API error")

      const data = await res.json()
      setConvId(data.conversationId)

      const aiMsg: Message = {
        id: data.message.id,
        role: "assistant",
        content: data.message.content,
        createdAt: data.message.createdAt,
      }

      setMessages((prev) => [...prev, aiMsg])

      const convRes = await fetch(`/api/conversations/${data.conversationId}`)
      const updatedConv = await convRes.json()
      onConversationUpdate(updatedConv)
    } catch {
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I couldn't process that request. Please try again.",
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }, [convId, isLoading, onConversationUpdate])

  return (
    <div className="flex flex-1 flex-col h-full min-w-0">
      <div className="flex items-center gap-2 px-4 pt-2 pb-1 md:hidden">
        <button
          onClick={onToggleSidebar}
          className="h-8 w-8 rounded-lg hover:bg-accent flex items-center justify-center text-muted-foreground"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-1.5">
          <Sparkle className="h-3.5 w-3.5 text-primary" />
          <span className="font-heading text-xs font-semibold tracking-tight">Xperimne</span>
        </div>
      </div>
      <MessageList messages={messages} isLoading={isLoading} />
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  )
}
