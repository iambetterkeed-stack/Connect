"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      console.log("Sign in result:", result)

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        window.location.href = "/"
      }
    } catch (error) {
      console.error("Sign in error:", error)
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignIn = (provider: string) => {
    // OAuth providers are disabled until credentials are configured
    console.log(`${provider} OAuth is not configured yet`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <div className="w-full max-w-md p-8 space-y-8 bg-[#1e293b] rounded-lg shadow-lg">
        <div className="text-center">
          <img src="/logo.svg" alt="Connect Logo" className="w-20 h-20 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white">Welcome to Connect</h2>
          <p className="text-gray-400 mt-2">Sign in to continue</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#0f172a] border-[#334155] text-white"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#0f172a] border-[#334155] text-white"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3b82f6] hover:bg-[#2563eb]"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#334155]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#1e293b] text-gray-400">Or continue with</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#334155]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#1e293b] text-gray-400">OAuth coming soon</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 opacity-50 pointer-events-none">
          <Button
            type="button"
            variant="outline"
            className="bg-[#0f172a] border-[#334155] text-white hover:bg-[#1e293b]"
          >
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            className="bg-[#0f172a] border-[#334155] text-white hover:bg-[#1e293b]"
          >
            GitHub
          </Button>
          <Button
            type="button"
            variant="outline"
            className="bg-[#0f172a] border-[#334155] text-white hover:bg-[#1e293b]"
          >
            Discord
          </Button>
        </div>

        <p className="text-center text-gray-400">
          Don't have an account?{" "}
          <Link href="/register" className="text-[#3b82f6] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}