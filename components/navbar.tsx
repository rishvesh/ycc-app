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
    <header className="fixed top-4 left-1/2 -translate-x-1/2 w-fit z-50 glass rounded-full border border-white/20 dark:border-white/10 px-6 py-2">
      <div className="flex items-center justify-between gap-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="text-lg font-semibold text-foreground">YCC</div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
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
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
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
                <Button variant="outline" size="sm" className="rounded-full hover:bg-muted transition-colors h-8 px-3 text-xs">
                  Login
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full transition-colors font-medium h-8 px-3 text-xs">
                  Sign Up
                </Button>
              </Link>
            </>
          )}

          <button
            onClick={toggleDarkMode}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/10 dark:hover:bg-white/10 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 1 1 2.707 2.707a8.001 8.001 0 0 1 14.586 10.586z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1zm0 13a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1zm8-8a1 1 0 0 1-1 1h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1zm-14 0a1 1 0 0 1-1 1H2a1 1 0 0 1 0-2h1a1 1 0 0 1 1 1zm11.586-4.414a1 1 0 0 0-1.414 0l-.707.707a1 1 0 0 0 1.414 1.414l.707-.707a1 1 0 0 0 0-1.414zm-7.07 7.07a1 1 0 0 0-1.414 0l-.707.707a1 1 0 0 0 1.414 1.414l.707-.707a1 1 0 0 0 0-1.414zm7.07 0a1 1 0 0 1 0 1.414l-.707.707a1 1 0 0 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 0zM9.586 5.414a1 1 0 0 0-1.414 0L7.465 6.535a1 1 0 1 0 1.414 1.414l.707-.707a1 1 0 0 0 0-1.414zM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
      {children}
    </Link>
  )
}
