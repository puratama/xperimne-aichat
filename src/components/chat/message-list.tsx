"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { Message } from "@/lib/types"
import { Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="text-center max-w-sm animate-fade-in">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <h2 className="font-heading text-xl font-semibold tracking-tight">Start a conversation</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Send a message to begin chatting with AI<br className="hidden sm:inline" /> powered by OpenRouter
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary/30 animate-pulse" style={{ animationDelay: "0ms" }} />
            <span className="h-1.5 w-1.5 rounded-full bg-primary/30 animate-pulse" style={{ animationDelay: "300ms" }} />
            <span className="h-1.5 w-1.5 rounded-full bg-primary/30 animate-pulse" style={{ animationDelay: "600ms" }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl space-y-4 py-8 px-5">
        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-3 animate-slide-up",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
            style={{ animationDelay: `${msg === messages[messages.length - 1] ? 0 : i * 50}ms` }}
          >
            {msg.role === "assistant" && (
              <div className="flex h-8 w-8 shrink-0 mt-1 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Bot className="h-4 w-4" />
              </div>
            )}

            <div
              className={cn(
                "max-w-[90%] md:max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-card text-card-foreground border border-border/40 rounded-bl-md"
              )}
            >
              <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-pre:bg-muted prose-pre:border prose-pre:border-border/40">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>

            {msg.role === "user" && (
              <div className="flex h-8 w-8 shrink-0 mt-1 items-center justify-center rounded-xl bg-secondary text-secondary-foreground shadow-sm">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="flex h-8 w-8 shrink-0 mt-1 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl border border-border/40 bg-card px-5 py-3.5 shadow-sm rounded-bl-md">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
