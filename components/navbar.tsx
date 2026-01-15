"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDark, setIsDark] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      setIsAuthenticated(!!data?.user)
      setIsLoading(false)
    }
    checkAuth()

    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark)
    setIsDark(shouldBeDark)
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setIsAuthenticated(false)
    router.push("/")
  }

  const toggleDarkMode = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)

    if (newIsDark) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="text-2xl font-bold text-primary group-hover:text-primary/80 transition">YCC</div>
          <div className="flex flex-col">
            <p className="text-xs font-semibold text-foreground leading-none">Youth Collective</p>
            <p className="text-xs text-muted-foreground">Council</p>
          </div>
        </Link>

        <nav className="flex items-center gap-6">
          {!isLoading && isAuthenticated && (
            <>
              <Link href="/feed" className="text-sm text-muted-foreground hover:text-foreground transition">
                Feed
              </Link>
              <Link href="/explore" className="text-sm text-muted-foreground hover:text-foreground transition">
                Explore
              </Link>
              <Link href="/forum" className="text-sm text-muted-foreground hover:text-foreground transition">
                Forum
              </Link>
              <Link href="/messages" className="text-sm text-muted-foreground hover:text-foreground transition">
                Messages
              </Link>
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition">
                Dashboard
              </Link>
              <Link href="/profile" className="text-sm text-muted-foreground hover:text-foreground transition">
                Profile
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                Sign Out
              </button>
            </>
          )}

          {!isLoading && !isAuthenticated && (
            <>
              <Link href="/explore" className="text-sm text-muted-foreground hover:text-foreground transition">
                Explore
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Sign Up
                </Button>
              </Link>
            </>
          )}

          <button
            onClick={toggleDarkMode}
            className="ml-2 p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition"
            aria-label="Toggle dark mode"
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </nav>
      </div>
    </header>
  )
}
