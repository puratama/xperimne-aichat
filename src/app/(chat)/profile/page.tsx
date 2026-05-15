"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  User,
  Key,
  Trash2,
  Check,
  Eye,
  EyeOff,
  Camera,
  Loader2,
} from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, update } = useSession()

  const [profile, setProfile] = useState({ name: "", image: "", hasPassword: false })
  const [avatarPreview, setAvatarPreview] = useState("")
  const [profileError, setProfileError] = useState("")
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [deleteError, setDeleteError] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const [loadingProfile, setLoadingProfile] = useState(true)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/user/profile")
        const data = await res.json()
        if (res.ok) {
          setProfile({ name: data.name || "", image: data.image || "", hasPassword: data.hasPassword })
          setAvatarPreview(data.image || "")
        }
      } catch {
        /* empty */
      } finally {
        setLoadingProfile(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const n = session?.user?.name
    if (n && !profile.name) {
      setProfile((p) => ({ ...p, name: n }))
    }
  }, [session?.user?.name, profile.name])

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    setProfileLoading(true)
    setProfileError("")
    setProfileSuccess(false)

    const body: Record<string, string> = { name: profile.name }
    if (profile.image !== avatarPreview) {
      body.image = avatarPreview
    }

    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      setProfileError(data.error)
      setProfileLoading(false)
      return
    }

    setProfile({ name: data.name, image: data.image || "", hasPassword: profile.hasPassword })
    setAvatarPreview(data.image || "")

    const updateBody: Record<string, string> = {}
    if (data.name) updateBody.name = data.name
    if (data.image) updateBody.image = data.image
    await update(updateBody)

    setProfileSuccess(true)
    setProfileLoading(false)
    nameInputRef.current?.blur()
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordError("")
    setPasswordSuccess(false)

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match")
      setPasswordLoading(false)
      return
    }

    const res = await fetch("/api/user/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: profile.hasPassword ? currentPassword : undefined,
        newPassword,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setPasswordError(data.error)
      setPasswordLoading(false)
      return
    }

    setProfile((p) => ({ ...p, hasPassword: true }))
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setPasswordSuccess(true)
    setPasswordLoading(false)
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true)
    setDeleteError("")

    const res = await fetch("/api/user/account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmation: deleteConfirm }),
    })

    const data = await res.json()

    if (!res.ok) {
      setDeleteError(data.error)
      setDeleteLoading(false)
      return
    }

    setDeleteDialogOpen(false)
    await signOut({ redirectTo: "/login" })
  }

  if (loadingProfile) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-4 py-8 md:py-12">
        <div className="mb-8 md:mb-10 animate-slide-up" style={{ animationDelay: "0ms" }}>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className="h-8 w-8 shrink-0 rounded-xl text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-heading text-xl font-semibold tracking-tight">Profile</h1>
              <p className="text-sm text-muted-foreground/80">Manage your account and preferences</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 md:space-y-8">
          <section
            className="rounded-2xl bg-card ring-1 ring-border/40 p-5 md:p-6 animate-slide-up shadow-xs"
            style={{ animationDelay: "100ms" }}
          >
            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <User className="h-3.5 w-3.5" />
              </div>
              <h2 className="font-heading text-sm font-semibold tracking-tight">Profile</h2>
            </div>

            <form onSubmit={handleProfileSave}>
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-6">
                <div className="flex flex-col items-center gap-3 sm:items-center">
                  <div className="group relative">
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20 transition-shadow duration-300 group-hover:ring-primary/40">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none"
                            ;(e.target as HTMLImageElement).parentElement!.querySelector(".fallback")?.classList.remove("hidden")
                          }}
                        />
                      ) : null}
                      <div className={`fallback ${avatarPreview ? "hidden" : ""}`}>
                        <User className="h-8 w-8 text-primary/60" />
                      </div>
                    </div>
                    <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-2xl bg-black/0 text-white/0 transition-all duration-200 hover:bg-black/30 hover:text-white">
                      <Camera className="h-5 w-5" />
                      <input
                        type="text"
                        className="sr-only"
                        tabIndex={-1}
                        onFocus={() => document.getElementById("avatar-url-input")?.focus()}
                      />
                    </label>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-medium">Avatar</span>
                </div>

                <div className="flex flex-1 flex-col gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Display Name
                    </label>
                    <Input
                      ref={nameInputRef}
                      placeholder="Your name"
                      value={profile.name}
                      onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                      required
                      className="rounded-xl border-border/60 bg-background py-2.5 px-3.5"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Avatar URL
                    </label>
                    <Input
                      id="avatar-url-input"
                      type="url"
                      placeholder="https://example.com/avatar.jpg"
                      value={avatarPreview}
                      onChange={(e) => setAvatarPreview(e.target.value)}
                      className="rounded-xl border-border/60 bg-background py-2.5 px-3.5"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Email
                    </label>
                    <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-3.5 py-2.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">{session?.user?.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {profileError && (
                <div className="mt-4 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-2.5 text-sm text-destructive animate-fade-in">
                  {profileError}
                </div>
              )}

              {profileSuccess && (
                <div className="mt-4 rounded-xl bg-primary/10 border border-primary/20 px-4 py-2.5 text-sm text-primary animate-fade-in flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Profile updated
                </div>
              )}

              <div className="mt-5 flex justify-end">
                <Button
                  type="submit"
                  className="rounded-xl px-5 font-medium"
                  disabled={profileLoading || !profile.name.trim()}
                >
                  {profileLoading ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </form>
          </section>

          <section
            className="rounded-2xl bg-card ring-1 ring-border/40 p-5 md:p-6 animate-slide-up shadow-xs"
            style={{ animationDelay: "200ms" }}
          >
            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Key className="h-3.5 w-3.5" />
              </div>
              <h2 className="font-heading text-sm font-semibold tracking-tight">Password</h2>
            </div>

            <form onSubmit={handlePasswordChange}>
              <div className="space-y-4">
                {profile.hasPassword && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Current Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showCurrent ? "text" : "password"}
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="rounded-xl border-border/60 bg-background py-2.5 px-3.5 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground cursor-pointer"
                      >
                        {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {!profile.hasPassword && (
                  <p className="rounded-xl bg-muted/50 px-3.5 py-2.5 text-sm text-muted-foreground">
                    You don&apos;t have a password yet. Set one below to enable password login.
                  </p>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showNew ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      minLength={6}
                      className="rounded-xl border-border/60 bg-background py-2.5 px-3.5 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground cursor-pointer"
                    >
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      minLength={6}
                      className="rounded-xl border-border/60 bg-background py-2.5 px-3.5 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground cursor-pointer"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {passwordError && (
                <div className="mt-4 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-2.5 text-sm text-destructive animate-fade-in">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="mt-4 rounded-xl bg-primary/10 border border-primary/20 px-4 py-2.5 text-sm text-primary animate-fade-in flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Password updated
                </div>
              )}

              <div className="mt-5 flex justify-end">
                <Button
                  type="submit"
                  className="rounded-xl px-5 font-medium"
                  disabled={passwordLoading || !newPassword || !confirmPassword}
                >
                  {passwordLoading ? "Updating..." : "Update password"}
                </Button>
              </div>
            </form>
          </section>

          <section
            className="rounded-2xl bg-card ring-1 ring-border/40 p-5 md:p-6 animate-slide-up shadow-xs"
            style={{ animationDelay: "300ms" }}
          >
            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </div>
              <h2 className="font-heading text-sm font-semibold tracking-tight text-destructive">
                Danger Zone
              </h2>
            </div>

            <div className="rounded-xl border border-destructive/20 bg-destructive/[0.03] p-4 md:p-5">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Permanently delete your account and all conversations. This action cannot be undone.
              </p>

              <div className="mt-4 flex justify-end">
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger
                    render={
                      <Button variant="destructive" className="rounded-xl px-5 font-medium">
                        <Trash2 className="h-4 w-4" />
                        Delete account
                      </Button>
                    }
                  />
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Delete account</DialogTitle>
                      <DialogDescription>
                        This will permanently delete your account and all conversations. Type{" "}
                        <span className="font-mono font-bold text-foreground">DELETE</span> to confirm.
                      </DialogDescription>
                    </DialogHeader>

                    <Input
                      placeholder='Type "DELETE" to confirm'
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      className="rounded-xl border-border/60 bg-background py-2.5 px-3.5"
                    />

                    {deleteError && (
                      <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-2.5 text-sm text-destructive">
                        {deleteError}
                      </div>
                    )}

                    <DialogFooter showCloseButton>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={deleteLoading || deleteConfirm !== "DELETE"}
                        className="rounded-xl"
                      >
                        {deleteLoading ? "Deleting..." : "Delete my account"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </section>
        </div>

        <p className="pb-8 mt-8 text-center text-xs text-muted-foreground/50 animate-fade-in">
          &copy; {new Date().getFullYear()} {process.env.NEXT_PUBLIC_APP_NAME || "Xperimne"}. All rights reserved.
        </p>
      </div>
    </div>
  )
}
