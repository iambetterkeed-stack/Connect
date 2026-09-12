"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CreateChannelModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateChannel: (name: string, type: string) => void
}

export default function CreateChannelModal({ isOpen, onClose, onCreateChannel }: CreateChannelModalProps) {
  const [channelName, setChannelName] = useState("")
  const [channelType, setChannelType] = useState("text")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!channelName.trim()) return

    setIsLoading(true)
    try {
      await onCreateChannel(channelName, channelType)
      setChannelName("")
      onClose()
    } catch (error) {
      console.error("Failed to create channel:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-[#1e293b] rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Create Channel</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="channelName" className="block text-sm font-medium text-gray-300 mb-2">
                    Channel Name *
                  </label>
                  <Input
                    id="channelName"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    placeholder="general"
                    required
                    className="w-full bg-[#0f172a] border-[#334155] text-white"
                  />
                </div>

                <div>
                  <label htmlFor="channelType" className="block text-sm font-medium text-gray-300 mb-2">
                    Channel Type
                  </label>
                  <select
                    id="channelType"
                    value={channelType}
                    onChange={(e) => setChannelType(e.target.value)}
                    className="w-full bg-[#0f172a] border-[#334155] text-white rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
                  >
                    <option value="text">Text</option>
                    <option value="voice">Voice</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={onClose}
                    variant="outline"
                    className="flex-1 bg-[#0f172a] border-[#334155] text-white hover:bg-[#1e293b]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !channelName.trim()}
                    className="flex-1 bg-[#3b82f6] hover:bg-[#2563eb]"
                  >
                    {isLoading ? "Creating..." : "Create Channel"}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}