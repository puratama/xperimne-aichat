"use client"

import { useState, useCallback, useEffect, useRef } from "react"
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
  const abortRef = useRef<AbortController | null>(null)

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

    let aiMsgId = ""

    try {
      abortRef.current = new AbortController()

      const res = await fetch("/api/chat/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: convId, message: content }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) throw new Error("API error")

      const reader = res.body?.getReader()
      if (!reader) throw new Error("No stream")

      const decoder = new TextDecoder()
      let buffer = ""
      let currentConvId = convId
      let addedPlaceholder = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const data = line.slice(6)
          if (data === "[DONE]") continue

          try {
            const parsed = JSON.parse(data)

            if (parsed.type === "meta") {
              currentConvId = parsed.conversationId
              setConvId(currentConvId)
              continue
            }

            const chunk = parsed.choices?.[0]?.delta?.content ?? ""
            if (!chunk) continue

            if (!addedPlaceholder) {
              addedPlaceholder = true
              aiMsgId = crypto.randomUUID()
              const placeholder: Message = {
                id: aiMsgId,
                role: "assistant",
                content: chunk,
                createdAt: new Date().toISOString(),
              }
              setMessages((prev) => [...prev, placeholder])
            } else {
              setMessages((prev) => {
                const updated = [...prev]
                const last = updated[updated.length - 1]
                if (last && last.role === "assistant") {
                  updated[updated.length - 1] = { ...last, content: last.content + chunk }
                }
                return updated
              })
            }
          } catch {}
        }
      }

      if (currentConvId) {
        const convRes = await fetch(`/api/conversations/${currentConvId}`)
        if (convRes.ok) {
          const updatedConv = await convRes.json()
          onConversationUpdate(updatedConv)
        }
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return
      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last && last.role === "assistant") {
          updated[updated.length - 1] = {
            ...last,
            content: last.content || "Sorry, I couldn't process that request. Please try again.",
          }
        }
        return updated
      })
    } finally {
      setIsLoading(false)
      abortRef.current = null
    }
  }, [convId, isLoading, onConversationUpdate])

  return (
    <div className="flex flex-1 flex-col h-full min-w-0">
      <div className="flex items-center gap-2 px-4 pt-2 pb-1 md:hidden">
        <button
          onClick={onToggleSidebar}
          className="h-8 w-8 rounded-lg hover:bg-accent flex items-center justify-center text-muted-foreground cursor-pointer"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-1.5">
          <Sparkle className="h-3.5 w-3.5 text-primary" />
          <span className="font-heading text-xs font-semibold tracking-tight">{process.env.NEXT_PUBLIC_APP_NAME || "Xperimne"}</span>
        </div>
      </div>
      <MessageList messages={messages} isLoading={isLoading} />
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  )
}
