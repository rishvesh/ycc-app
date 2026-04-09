import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export default async function HomePage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="flex-1 px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold leading-tight text-foreground">
              Find your cause.<br />
              Make an impact.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Join Pune&apos;s growing community of changemakers. Discover meaningful volunteer opportunities and connect with organizations making real impact.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-full transition-colors duration-200">
                Get Started
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline" className="border-border/80 hover:bg-white/30 dark:hover:bg-white/10 hover:border-border text-foreground rounded-full transition-colors duration-200">
                Explore Opportunities
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-3">Why join YCC?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A platform built for volunteers and organizations who care
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              number="01"
              title="Discover Opportunities"
              description="Browse hundreds of volunteer roles that align with your passions and skills."
            />
            <FeatureCard
              number="02"
              title="Join a Community"
              description="Connect with like-minded changemakers and build lasting relationships."
            />
            <FeatureCard
              number="03"
              title="Track Your Impact"
              description="See the real-world difference your volunteering makes in Pune."
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass p-6">
              <div className="text-2xl md:text-3xl font-semibold text-primary mb-1">100+</div>
              <div className="text-sm text-muted-foreground">Active Volunteers</div>
            </div>
            <div className="glass p-6">
              <div className="text-2xl md:text-3xl font-semibold text-primary mb-1">10+</div>
              <div className="text-sm text-muted-foreground">Organizations</div>
            </div>
            <div className="glass p-6">
              <div className="text-2xl md:text-3xl font-semibold text-primary mb-1">10K+</div>
              <div className="text-sm text-muted-foreground">Hours Served</div>
            </div>
            <div className="glass p-6">
              <div className="text-2xl md:text-3xl font-semibold text-primary mb-1">500+</div>
              <div className="text-sm text-muted-foreground">Causes</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 md:py-20 mb-20">
        <div className="max-w-2xl mx-auto glass p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground text-base md:text-lg mb-8">
            Join thousands making a difference in our community.
          </p>
          <Link href="/auth/sign-up">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-full transition-colors duration-200">
              Sign Up Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 bg-1a1a1a">
            <div>
              <h3 className="font-semibold text-foreground mb-4 text-sm">Product</h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><Link href="/explore" className="hover:text-foreground transition-colors">Explore</Link></li>
                <li><Link href="/forum" className="hover:text-foreground transition-colors">Community</Link></li>
                <li><Link href="/feed" className="hover:text-foreground transition-colors">Feed</Link></li>
              </ul>
            </div>
            <div>
          </div>
        </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="glass-hover p-8">
      <div className="text-sm font-semibold text-primary mb-3">{number}</div>
      <h3 className="text-lg font-semibold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  )
}
