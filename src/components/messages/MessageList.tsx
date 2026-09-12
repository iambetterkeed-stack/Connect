"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { useSocket } from "@/lib/socket"

interface Message {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    username: string
    displayName?: string
    avatar?: string
  }
  reactions?: Array<{
    id: string
    emoji: string
    user: {
      id: string
      username: string
      avatar?: string
    }
  }>
}

interface MessageListProps {
  messages: Message[]
  channelId: string
  onMessagesUpdate: (updater: (prev: Message[]) => Message[]) => void
}

export default function MessageList({ messages, channelId, onMessagesUpdate }: MessageListProps) {
  const { socket } = useSocket()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!socket) return

    socket.emit("join-channel", channelId)

    // Listen for new messages
    const handleNewMessage = (newMessage: Message) => {
      onMessagesUpdate((prevMessages) => [...prevMessages, newMessage])
    }

    socket.on("new-message", handleNewMessage)

    return () => {
      socket.emit("leave-channel", channelId)
      socket.off("new-message", handleNewMessage)
    }
  }, [socket, channelId, onMessagesUpdate])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            No messages yet. Start the conversation!
          </motion.p>
        </div>
      ) : (
        messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.05, 0.5) }}
            whileHover={{ scale: 1.01 }}
            className="flex gap-3 hover:bg-[#1e293b] p-2 rounded"
          >
            {/* Avatar */}
            <div className="flex-shrink-0">
              {message.author.avatar ? (
                <img 
                  src={message.author.avatar} 
                  alt={message.author.displayName || message.author.username}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#3b82f6] flex items-center justify-center text-white font-semibold">
                  {(message.author.displayName || message.author.username).charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Message Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-white hover:underline cursor-pointer">
                  {message.author.displayName || message.author.username}
                </span>
                <span className="text-xs text-gray-400">{formatTime(message.createdAt)}</span>
              </div>
              <p className="text-gray-200 break-words">{message.content}</p>

              {/* Reactions */}
              {message.reactions && message.reactions.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {message.reactions.map((reaction) => (
                    <motion.div
                      key={reaction.id}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-[#334155] px-2 py-0.5 rounded text-sm flex items-center gap-1"
                    >
                      <span>{reaction.emoji}</span>
                      <span className="text-gray-300">1</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}