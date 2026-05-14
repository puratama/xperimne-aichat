import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { ChatLayout } from "@/components/chat/chat-layout"

export default async function ChatRootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return <ChatLayout>{children}</ChatLayout>
}
