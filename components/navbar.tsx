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
    <header className="glass fixed top-0 w-full z-50 border-b border-white/10 shadow-lg backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="text-2xl font-bold gradient-text group-hover:opacity-80 transition-smooth">YCC</div>
          </div>
          <div className="flex flex-col hidden sm:block">
            <p className="text-xs font-semibold text-foreground leading-none">Youth</p>
            <p className="text-xs text-muted-foreground">Collective</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
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
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-smooth"
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

        <div className="flex items-center gap-3">
          {!isLoading && !isAuthenticated && (
            <>
              <Link href="/auth/login">
                <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10 transition-smooth">
                  Login
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button size="sm" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-smooth text-background font-semibold">
                  Sign Up
                </Button>
              </Link>
            </>
          )}

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-white/5 transition-smooth ml-2"
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
    <Link href={href} className="relative px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-smooth group">
      {children}
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300"></span>
    </Link>
  )
}
