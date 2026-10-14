import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/SEOHead";
import { organizationSchema } from "@/lib/seo-schemas";
import FounderMembershipPlans from "@/components/FounderMembershipPlans";
import logoLight from "@assets/official_logo.webp";
import logoDark from "@assets/logo_dark.webp";

export default function Pricing() {
 const {data:user}=useQuery<{id:string}>({queryKey:["/api/auth/user"],retry:false});
 return <div className="min-h-screen bg-[#f5f8fc]">
  <SEOHead title="Membership Pricing | UK Innovator Founder Visa Assistant"
   description="Founder, Founder Pro and 90-Day Pass memberships for AI-assisted UK Innovator Founder business preparation."
   canonical="https://innovatorfoundervisaassistant.co.uk/pricing"
   schema={{"@context":"https://schema.org","@graph":[organizationSchema]}}/>
  <header className="border-b border-slate-200 bg-white">
   <nav className="mx-auto flex w-full max-w-[1300px] items-center justify-between gap-4 px-5 py-4 sm:px-7"
    aria-label="Membership navigation">
    <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="Innovator Founder Visa Assistant home">
     <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-950 p-1.5 shadow-sm">
      <img src={logoLight} alt="" className="logo-light max-h-8 max-w-8 object-contain" loading="eager"/>
      <img src={logoDark} alt="" className="logo-dark max-h-8 max-w-8 object-contain" loading="eager"/>
     </div>
     <span className="min-w-0">
      <span className="block truncate text-sm font-extrabold text-[#122540] sm:text-base">Innovator Founder Visa Assistant</span>
      <span className="block text-[11px] text-[#62728a]">AI-powered business preparation</span>
     </span>
    </Link>
    <div className="flex shrink-0 items-center gap-2 sm:gap-5">
     <Link href="/" className="hidden text-sm text-[#62728a] hover:text-blue-700 sm:block">Home</Link>
     <span className="hidden rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-800 sm:inline-flex" aria-current="page">Memberships</span>
     <ThemeToggle/>
     {!user && <Link href="/login"><Button size="sm" data-testid="button-pricing-sign-in">Sign In</Button></Link>}
     {!!user && <Link href="/dashboard"><Button size="sm" variant="outline">Dashboard</Button></Link>}
    </div>
   </nav>
  </header>
  <main className="mx-auto w-full max-w-[1300px] px-2 py-5 sm:px-5">
   <FounderMembershipPlans/>
  </main>
 </div>;
}
