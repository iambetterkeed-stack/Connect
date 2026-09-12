"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

interface Channel {
  id: string
  name: string
  type: string
}

interface ChannelSidebarProps {
  channels: Channel[]
  currentChannelId?: string
  onChannelSelect: (channelId: string) => void
  onCreateChannel: () => void
  serverName: string
}

export default function ChannelSidebar({ channels, currentChannelId, onChannelSelect, onCreateChannel, serverName }: ChannelSidebarProps) {
  const textChannels = channels.filter(c => c.type === 'text')
  const voiceChannels = channels.filter(c => c.type === 'voice')

  return (
    <div className="w-60 bg-[#1e293b] flex flex-col">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 border-b border-[#334155]"
      >
        <h2 className="text-white font-semibold">{serverName}</h2>
      </motion.div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {/* Text Channels */}
        {textChannels.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-xs font-semibold uppercase">Text Channels</h3>
              <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
                <Button
                  onClick={onCreateChannel}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                >
                  +
                </Button>
              </motion.div>
            </div>
            {textChannels.map((channel, index) => (
              <motion.div
                key={channel.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 5 }}
                className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                  currentChannelId === channel.id ? 'bg-[#334155] text-white' : 'text-gray-400 hover:bg-[#334155] hover:text-gray-200'
                }`}
                onClick={() => onChannelSelect(channel.id)}
              >
                <span className="text-lg">#</span>
                <span className="text-sm">{channel.name}</span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Voice Channels */}
        {voiceChannels.length > 0 && (
          <div>
            <h3 className="text-gray-400 text-xs font-semibold uppercase mb-2">Voice Channels</h3>
            {voiceChannels.map((channel) => (
              <motion.div
                key={channel.id}
                whileHover={{ x: 5 }}
                className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors text-gray-400 hover:bg-[#334155] hover:text-gray-200"
              >
                <span className="text-lg">🔊</span>
                <span className="text-sm">{channel.name}</span>
              </motion.div>
            ))}
          </div>
        )}

        {channels.length === 0 && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-400 text-sm"
          >
            No channels yet
          </motion.p>
        )}
      </div>
    </div>
  )
}