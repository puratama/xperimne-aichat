"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp } from "lucide-react"

interface ChatInputProps {
  onSend: (message: string) => void
  disabled: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSubmit() {
    if (!input.trim() || disabled) return
    onSend(input.trim())
    setInput("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px"
    }
  }

  return (
    <div className="border-t border-border/40 bg-gradient-to-t from-background via-background to-transparent px-4 pt-3 pb-4">
      <div className="mx-auto flex max-w-3xl items-end gap-2 bg-card border border-border/50 rounded-2xl px-3 py-2 shadow-sm transition-shadow focus-within:shadow-md focus-within:border-primary/30">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground/40 disabled:opacity-50 leading-relaxed"
          style={{ maxHeight: "200px" }}
        />
        <Button
          onClick={handleSubmit}
          disabled={disabled || !input.trim()}
          size="icon"
          className="h-9 w-9 shrink-0 rounded-xl transition-all duration-200 disabled:opacity-30"
        >
          <ArrowUp className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
      <p className="mt-2 text-center text-[10px] text-muted-foreground/25 uppercase tracking-[0.1em] font-medium">
        Responses are AI-generated
      </p>
    </div>
  )
}
