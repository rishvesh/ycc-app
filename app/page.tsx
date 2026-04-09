import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export default async function HomePage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col min-h-screen pt-24">
      {/* Hero */}
      <section className="flex-1 px-4 py-20">
        <div className="max-w-5xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="space-y-6">
            <div className="inline-block glass-sm px-4 py-2 mb-6">
              <span className="text-xs font-semibold text-primary">Welcome to YCC</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold leading-tight">
              <span className="gradient-text">Connect.</span>
              <br />
              <span className="text-foreground">Volunteer.</span>
              <br />
              <span className="gradient-text">Impact.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Join Pune's vibrant community. Find meaningful opportunities with organizations making a real difference
              in our city.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-slide-in-bottom">
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-smooth text-background font-semibold shadow-lg hover:shadow-xl">
                Get Started
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/10 transition-smooth">
                Explore Opportunities
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Join Youth Collective Council?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experience a platform designed for changemakers and community builders
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon="01"
              title="Find Your Cause"
              description="Discover volunteer opportunities aligned with your passions and values. Explore thousands of meaningful projects."
              delay="0s"
            />
            <FeatureCard
              icon="02"
              title="Connect & Collaborate"
              description="Join a vibrant community of volunteers and organization leaders. Build lasting relationships."
              delay="0.1s"
            />
            <FeatureCard
              icon="03"
              title="Create Real Impact"
              description="Directly contribute to causes that matter in Pune and beyond. Make a measurable difference."
              delay="0.2s"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-4">
            <StatCard number="10K+" label="Active Volunteers" />
            <StatCard number="500+" label="Organizations" />
            <StatCard number="50K+" label="Hours Served" />
            <StatCard number="100+" label="Causes" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 mb-20">
        <div className="max-w-4xl mx-auto glass-lg p-12 text-center space-y-8">
          <h2 className="text-4xl font-bold">Ready to make a difference?</h2>
          <p className="text-muted-foreground text-lg">
            Join thousands of volunteers transforming Pune, one opportunity at a time
          </p>
          <Link href="/auth/sign-up">
            <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-smooth text-background font-semibold shadow-lg">
              Start Your Journey
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 glass py-12 px-4 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><Link href="/explore" className="hover:text-foreground transition-smooth">Explore</Link></li>
                <li><Link href="/forum" className="hover:text-foreground transition-smooth">Community</Link></li>
                <li><Link href="/feed" className="hover:text-foreground transition-smooth">Feed</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-foreground transition-smooth">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-foreground transition-smooth">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Connect</h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-foreground transition-smooth">Twitter</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">LinkedIn</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-muted-foreground text-sm">
            <p>© 2025 Youth Collective Council. Building a better Pune together.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description, delay }: { icon: string; title: string; description: string; delay: string }) {
  return (
    <div 
      className="glass-lg p-8 rounded-2xl group hover:border-primary/50 transition-smooth"
      style={{ animation: `slide-in-from-bottom 0.5s ease-out ${delay}` }}
    >
      <div className="text-4xl font-bold gradient-text mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-smooth">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="glass-lg p-6 rounded-xl text-center hover:border-primary/50 transition-smooth group">
      <div className="text-3xl font-bold gradient-text mb-2 group-hover:scale-110 transition-transform">{number}</div>
      <p className="text-muted-foreground text-sm">{label}</p>
    </div>
  )
}
