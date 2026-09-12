"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSocket } from "@/lib/socket"

interface MessageInputProps {
  channelId: string
}

export default function MessageInput({ channelId }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const { socket } = useSocket()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !socket) return

    socket.emit("send-message", {
      channelId,
      content: message.trim()
    })

    setMessage("")
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-[#1e293b] border-t border-[#334155]"
    >
      <form onSubmit={handleSubmit} className="flex gap-2">
        <motion.div 
          whileFocus={{ scale: 1.02 }}
          className="flex-1"
        >
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="w-full bg-[#0f172a] border-[#334155] text-white"
          />
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button type="submit" className="bg-[#3b82f6] hover:bg-[#2563eb]">
            Send
          </Button>
        </motion.div>
      </form>
    </motion.div>
  )
}