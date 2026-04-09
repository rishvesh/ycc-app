import Navbar from "@/components/navbar"
import { Analytics } from "@vercel/analytics/next"

export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />

      {/* NO mt-6 here */}
      {children}

      <Analytics />
    </>
  )
}