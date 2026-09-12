"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import ServerSidebar from "@/components/layout/ServerSidebar"
import ChannelSidebar from "@/components/layout/ChannelSidebar"
import MessageList from "@/components/messages/MessageList"
import MessageInput from "@/components/messages/MessageInput"
import CreateServerModal from "@/components/servers/CreateServerModal"
import CreateChannelModal from "@/components/servers/CreateChannelModal"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentServerId, setCurrentServerId] = useState<string | undefined>()
  const [currentChannelId, setCurrentChannelId] = useState<string | undefined>()
  const [servers, setServers] = useState<any[]>([])
  const [channels, setChannels] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [showCreateServer, setShowCreateServer] = useState(false)
  const [showCreateChannel, setShowCreateChannel] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/login"
    }
  }, [status])

  useEffect(() => {
    if (status === "authenticated") {
      fetchServers()
    }
  }, [status])

  const fetchServers = async () => {
    try {
      const response = await fetch("/api/servers")
      const data = await response.json()
      setServers(data.servers || [])
    } catch (error) {
      console.error("Failed to fetch servers:", error)
    }
  }

  const fetchChannels = async (serverId: string) => {
    try {
      const response = await fetch(`/api/servers/${serverId}/channels`)
      const data = await response.json()
      setChannels(data.channels || [])
    } catch (error) {
      console.error("Failed to fetch channels:", error)
    }
  }

  const fetchMessages = async (channelId: string) => {
    try {
      const response = await fetch(`/api/channels/${channelId}/messages`)
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    }
  }

  const handleServerSelect = async (serverId: string) => {
    setCurrentServerId(serverId || undefined)
    setCurrentChannelId(undefined)
    setMessages([])
    
    if (serverId) {
      await fetchChannels(serverId)
    } else {
      setChannels([])
    }
  }

  const handleChannelSelect = async (channelId: string) => {
    setCurrentChannelId(channelId)
    await fetchMessages(channelId)
  }

  const handleCreateServer = async (name: string, description?: string) => {
    try {
      const response = await fetch("/api/servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description })
      })
      const data = await response.json()
      if (response.ok) {
        fetchServers()
        // Select the newly created server
        if (data.server?.id) {
          handleServerSelect(data.server.id)
        }
      } else {
        throw new Error(data.error || "Failed to create server")
      }
    } catch (error) {
      console.error("Failed to create server:", error)
      throw error
    }
  }

  const handleCreateChannel = async (name: string, type: string) => {
    if (!currentServerId) return
    
    try {
      const response = await fetch(`/api/servers/${currentServerId}/channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type })
      })
      const data = await response.json()
      if (response.ok) {
        fetchChannels(currentServerId)
        // Select the newly created channel
        if (data.channel?.id) {
          handleChannelSelect(data.channel.id)
        }
      } else {
        throw new Error(data.error || "Failed to create channel")
      }
    } catch (error) {
      console.error("Failed to create channel:", error)
      throw error
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#3b82f6] border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!session) {
    return null
  }

  const currentServer = servers.find(s => s.id === currentServerId)
  const currentChannel = channels.find(c => c.id === currentChannelId)

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <div className="flex h-screen">
        {/* Server Sidebar */}
        <ServerSidebar
          servers={servers}
          currentServerId={currentServerId}
          onServerSelect={handleServerSelect}
          onCreateServer={() => setShowCreateServer(true)}
        />

        {/* Channel Sidebar */}
        {currentServer ? (
          <ChannelSidebar
            channels={channels}
            currentChannelId={currentChannelId}
            onChannelSelect={handleChannelSelect}
            onCreateChannel={() => setShowCreateChannel(true)}
            serverName={currentServer.name}
          />
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-60 bg-[#1e293b] flex items-center justify-center"
          >
            <p className="text-gray-400 text-sm">Select a server</p>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {currentChannel ? (
            <>
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-12 bg-[#1e293b] border-b border-[#334155] flex items-center px-4"
              >
                <span className="text-white font-semibold">{currentChannel.name}</span>
              </motion.div>
              <MessageList 
                messages={messages} 
                channelId={currentChannelId} 
                onMessagesUpdate={(updater) => setMessages(prev => updater(prev))}
              />
              <MessageInput channelId={currentChannelId} />
            </>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex items-center justify-center"
            >
              <div className="text-center">
                <motion.img 
                  src="/logo.svg" 
                  alt="Connect" 
                  className="w-32 h-32 mx-auto mb-4"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                />
                <h1 className="text-3xl font-bold text-white mb-2">Welcome to Connect!</h1>
                <p className="text-gray-400 mb-4">
                  {currentServer 
                    ? `Welcome to ${currentServer.name}! Select a channel to start chatting.`
                    : "Select a server to get started, or create a new one."
                  }
                </p>
                {!currentServer && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      onClick={() => setShowCreateServer(true)} 
                      className="bg-[#3b82f6] hover:bg-[#2563eb]"
                    >
                      Create Server
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Members Sidebar */}
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-60 bg-[#1e293b] p-4"
        >
          <h3 className="text-white font-semibold mb-4">Online</h3>
          <motion.div 
            className="flex items-center gap-2 mb-2"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-8 h-8 bg-[#3b82f6] rounded-full"></div>
            <span className="text-white text-sm">{session.user?.name || "User"}</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Modals */}
      <CreateServerModal
        isOpen={showCreateServer}
        onClose={() => setShowCreateServer(false)}
        onCreateServer={handleCreateServer}
      />
      <CreateChannelModal
        isOpen={showCreateChannel}
        onClose={() => setShowCreateChannel(false)}
        onCreateChannel={handleCreateChannel}
      />
    </div>
  )
}
