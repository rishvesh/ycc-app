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
    const supabase = createClient();

    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser()
      setIsAuthenticated(!!data?.user)
      setIsLoading(false)
    }
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user)
      setIsLoading(false)
    })

    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark)
    setIsDark(shouldBeDark);

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
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
    <header className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="text-xl font-semibold text-foreground">YCC</div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {!isLoading && isAuthenticated && (
            <>
              <NavLink href="/feed">Feed</NavLink>
              <NavLink href="/explore">Explore</NavLink>
              <NavLink href="/forum">Forum</NavLink>
              <NavLink href="/messages">Messages</NavLink>
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/profile">Profile</NavLink>
              <button
                onClick={handleSignOut}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign Out
              </button>
            </>
          )}

          {!isLoading && !isAuthenticated && (
            <>
              <NavLink href="/explore">Explore</NavLink>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {!isLoading && !isAuthenticated && (
            <>
              <Link href="/auth/login">
                <Button variant="outline" size="sm" className="rounded-lg hover:bg-muted transition-colors">
                  Login
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors font-medium">
                  Sign Up
                </Button>
              </Link>
            </>
          )}

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-2"
            aria-label="Toggle dark mode"
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
    </header>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
      {children}
    </Link>
  )
}
