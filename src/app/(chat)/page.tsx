"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Sidebar } from "@/components/chat/sidebar"
import { ChatWindow } from "@/components/chat/chat-window"
import type { Conversation } from "@/lib/types"

export default function ChatPage() {
  const { data: session } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeConv, setActiveConv] = useState<Conversation | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const loadConversations = useCallback(async () => {
    const res = await fetch("/api/conversations")
    if (res.ok) {
      const data = await res.json()
      setConversations(data)
    }
  }, [])

  useEffect(() => {
    if (session?.user) loadConversations()
  }, [session, loadConversations])

  useEffect(() => {
    if (activeId) {
      fetch(`/api/conversations/${activeId}`)
        .then((res) => res.json())
        .then(setActiveConv)
    } else {
      setActiveConv(null)
    }
  }, [activeId])

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [sidebarOpen])

  function handleNewChat() {
    setActiveId(null)
    setActiveConv(null)
    setSidebarOpen(false)
  }

  function handleSelect(id: string) {
    setActiveId(id)
    setSidebarOpen(false)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/conversations/${id}`, { method: "DELETE" })
    if (activeId === id) {
      setActiveId(null)
      setActiveConv(null)
    }
    loadConversations()
  }

  async function handleRename(id: string, title: string) {
    await fetch(`/api/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    })
    loadConversations()
  }

  function handleConversationUpdate(conv: Conversation) {
    setActiveConv(conv)
    setActiveId(conv.id)
    loadConversations()
  }

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar
        conversations={conversations}
        activeId={activeId ?? undefined}
        onNewChat={handleNewChat}
        onSelect={handleSelect}
        onDelete={handleDelete}
        onRename={handleRename}
        sidebarOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <ChatWindow
        conversation={activeConv}
        onConversationUpdate={handleConversationUpdate}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        sidebarOpen={sidebarOpen}
      />
    </>
  )
}
