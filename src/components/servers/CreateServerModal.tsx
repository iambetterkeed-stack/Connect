"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CreateServerModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateServer: (name: string, description?: string) => void
}

export default function CreateServerModal({ isOpen, onClose, onCreateServer }: CreateServerModalProps) {
  const [serverName, setServerName] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!serverName.trim()) return

    setIsLoading(true)
    try {
      await onCreateServer(serverName, description)
      setServerName("")
      setDescription("")
      onClose()
    } catch (error) {
      console.error("Failed to create server:", error)
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
                <h2 className="text-2xl font-bold text-white">Create Server</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="serverName" className="block text-sm font-medium text-gray-300 mb-2">
                    Server Name *
                  </label>
                  <Input
                    id="serverName"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    placeholder="My Awesome Server"
                    required
                    className="w-full bg-[#0f172a] border-[#334155] text-white"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's this server about?"
                    rows={3}
                    className="w-full bg-[#0f172a] border-[#334155] text-white rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
                  />
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
                    disabled={isLoading || !serverName.trim()}
                    className="flex-1 bg-[#3b82f6] hover:bg-[#2563eb]"
                  >
                    {isLoading ? "Creating..." : "Create Server"}
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