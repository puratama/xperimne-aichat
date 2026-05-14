export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: string
}

export interface Conversation {
  id: string
  title: string | null
  userId: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}
