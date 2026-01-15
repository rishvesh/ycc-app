import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export default async function HomePage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="flex-1 bg-gradient-to-br from-background via-background to-accent/5 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
              <span className="text-primary">Connect.</span> Volunteer. <span className="text-accent">Impact.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join Pune's vibrant community. Find meaningful opportunities with organizations making a real difference
              in our city.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline">
                Explore Opportunities
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 max-w-6xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-center mb-12">Why Join Youth Collective Council?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-lg border border-border bg-card hover:shadow-lg transition hover:border-accent/30">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 text-xl font-semibold">
              ✓
            </div>
            <h3 className="text-lg font-semibold mb-2">Find Your Cause</h3>
            <p className="text-muted-foreground text-sm">
              Discover volunteer opportunities aligned with your passions and values
            </p>
          </div>
          <div className="p-6 rounded-lg border border-border bg-card hover:shadow-lg transition hover:border-accent/30">
            <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4 text-xl font-semibold">
              👥
            </div>
            <h3 className="text-lg font-semibold mb-2">Connect & Collaborate</h3>
            <p className="text-muted-foreground text-sm">
              Join a vibrant community of volunteers and organization leaders
            </p>
          </div>
          <div className="p-6 rounded-lg border border-border bg-card hover:shadow-lg transition hover:border-accent/30">
            <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary-foreground flex items-center justify-center mb-4 text-xl font-semibold">
              🌟
            </div>
            <h3 className="text-lg font-semibold mb-2">Create Real Impact</h3>
            <p className="text-muted-foreground text-sm">
              Directly contribute to causes that matter in Pune and beyond
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground text-sm">
          <p>© 2025 Youth Collective Council. Building a better Pune together.</p>
        </div>
      </footer>
    </div>
  )
}
