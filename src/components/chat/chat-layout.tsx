"use client"

import { useSession, signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, Sparkle, Sun, Moon } from "lucide-react"

export function ChatLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border/60 bg-card/80 backdrop-blur-sm px-4 md:px-5 h-14 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Sparkle className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <h1 className="font-heading text-base font-semibold tracking-tight">Xperimne</h1>
          </div>
          <span className="hidden sm:inline-block text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
            Chatbot
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
            >
              {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}

          <span className="hidden md:inline text-xs text-muted-foreground font-medium ml-1">{session?.user?.email}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut({ redirectTo: "/login" })}
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="sr-only">Sign out</span>
          </Button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
