"use client"

import { useSession, signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { LogOut, Sparkle, Sun, Moon, User, ChevronDown } from "lucide-react"

export function ChatLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : session?.user?.email?.slice(0, 2).toUpperCase() || "?";

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border/60 bg-card/80 backdrop-blur-sm px-4 md:px-5 h-14 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Sparkle className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <h1 className="font-heading text-base font-semibold tracking-tight">{process.env.NEXT_PUBLIC_APP_NAME || "Xperimne"}</h1>
          </div>
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

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 transition-all duration-150 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt=""
                  className="h-6 w-6 rounded-lg object-cover ring-1 ring-border/50"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-[11px] font-semibold text-primary ring-1 ring-primary/20">
                  {initials}
                </div>
              )}
              <span className="hidden md:inline text-xs font-medium text-muted-foreground max-w-24 truncate">
                {session?.user?.name || session?.user?.email}
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground/50" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" sideOffset={6} className="w-48">
              <div className="px-2 py-2">
                <p className="text-sm font-medium text-foreground truncate">
                  {session?.user?.name || "User"}
                </p>
                <p className="text-xs text-muted-foreground/70 truncate">
                  {session?.user?.email}
                </p>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => router.push("/profile")}>
                <User className="h-4 w-4" />
                Profile
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant="destructive"
                onClick={() => signOut({ redirectTo: "/login" })}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
