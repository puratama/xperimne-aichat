"use client"

import { cn } from "@/lib/utils"
import type { Conversation } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Plus, MessageSquare, Trash2, MoreHorizontal, Pencil, Check, X, XIcon } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SidebarProps {
  conversations: Conversation[]
  activeId?: string
  onNewChat: () => void
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onRename: (id: string, title: string) => void
  sidebarOpen: boolean
  onClose: () => void
}

function SidebarContent({
  conversations,
  activeId,
  onNewChat,
  onSelect,
  onDelete,
  onRename,
  onClose,
  showClose,
}: SidebarProps & { showClose: boolean }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingId && inputRef.current) inputRef.current.focus()
  }, [editingId])

  function startRename(conv: Conversation) {
    setEditingId(conv.id)
    setEditTitle(conv.title || "")
  }

  function saveRename() {
    if (editingId && editTitle.trim()) {
      onRename(editingId, editTitle.trim())
    }
    setEditingId(null)
  }

  return (
    <div className="flex h-full w-72 flex-col bg-sidebar">
      {showClose && (
        <div className="flex items-center justify-between p-4 pb-2">
          <span className="font-heading text-sm font-semibold tracking-tight">History</span>
          <button onClick={onClose} className="h-7 w-7 rounded-lg hover:bg-accent flex items-center justify-center cursor-pointer">
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className={cn("px-4 pb-2", !showClose && "pt-4")}>
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2.5 rounded-xl border-dashed bg-transparent font-medium text-sm hover:bg-accent hover:text-accent-foreground transition-all"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          New conversation
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5">
        {conversations.length === 0 && (
          <div className="px-4 py-8 text-center animate-fade-in">
            <MessageSquare className="mx-auto h-5 w-5 text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">No conversations yet</p>
            <p className="text-[11px] text-muted-foreground/50 mt-0.5">Start a new chat to begin</p>
          </div>
        )}

        {conversations.map((conv, i) => (
          <div
            key={conv.id}
            className={cn(
              "group relative flex items-center rounded-xl px-3 py-2.5 text-sm transition-all duration-200 cursor-pointer",
              "hover:bg-accent/60",
              activeId === conv.id && "bg-accent"
            )}
            style={{ animationDelay: `${i * 30}ms` }}
            onClick={() => onSelect(conv.id)}
          >
            {editingId === conv.id ? (
              <div className="flex w-full items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <input
                  ref={inputRef}
                  className="flex-1 bg-background rounded-lg border border-border px-2 py-1 text-xs outline-none"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveRename()
                    if (e.key === "Escape") setEditingId(null)
                  }}
                />
                <button onClick={saveRename} className="text-muted-foreground hover:text-foreground p-0.5 cursor-pointer">
                  <Check className="h-3 w-3" />
                </button>
                <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground p-0.5 cursor-pointer">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <>
                <MessageSquare className="mr-2.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                <span className="flex-1 truncate text-[13px]">{conv.title || "New Chat"}</span>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="opacity-0 group-hover:opacity-100 inline-flex items-center justify-center h-7 w-7 rounded-lg hover:bg-muted hover:text-foreground shrink-0 cursor-pointer transition-all duration-150"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 py-1">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); startRename(conv) }}>
                      <Pencil className="mr-2 h-3.5 w-3.5" /> Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={(e) => { e.stopPropagation(); onDelete(conv.id) }}
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        ))}
      </nav>

      <div className="border-t border-border/40 px-4 py-3">
        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/30 font-medium text-center">
          {process.env.NEXT_PUBLIC_APP_NAME || "Xperimne"}
        </p>
      </div>
    </div>
  )
}

export function Sidebar(props: SidebarProps) {
  return (
    <>
      {/* Desktop: always visible */}
      <aside className="hidden md:flex h-full border-r border-border/50">
        <SidebarContent {...props} showClose={false} />
      </aside>

      {/* Mobile: slide drawer */}
      <aside
        className={cn(
          "flex md:hidden fixed inset-y-0 left-0 z-40",
          "transition-transform duration-300 ease-in-out",
          props.sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent {...props} showClose={true} />
      </aside>
    </>
  )
}
