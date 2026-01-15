"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary">YCC</h1>
          <p className="text-muted-foreground mt-2">Young Citizens Connect</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Check Your Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-center">
              We&apos;ve sent you a confirmation email. Please click the link in the email to verify your account.
            </p>
            <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20">
              <p className="text-sm text-muted-foreground">
                Once you confirm your email, you can log in and start connecting with volunteer opportunities.
              </p>
            </div>
            <div className="pt-4">
              <Link href="/auth/login">
                <Button variant="outline" className="w-full bg-transparent">
                  Back to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
