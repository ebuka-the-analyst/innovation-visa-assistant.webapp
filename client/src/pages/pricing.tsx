import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/SEOHead";
import { organizationSchema } from "@/lib/seo-schemas";
import FounderMembershipPlans from "@/components/FounderMembershipPlans";
import logoLight from "@assets/official_logo.webp";
import logoDark from "@assets/logo_dark.webp";

export default function Pricing(){
 const {data:user}=useQuery<{id:string}>({queryKey:["/api/auth/user"],retry:false});
 const demoMode=!user;
 const sidebarStyle={"--sidebar-width":"16rem","--sidebar-width-icon":"3rem"};
 return <SidebarProvider style={sidebarStyle as React.CSSProperties}>
  <div className="flex h-screen w-full">
   <AppSidebar demoMode={demoMode}/>
   <SidebarInset className="flex-1 overflow-auto">
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between gap-2 border-b bg-background/95 px-4 backdrop-blur">
     <div className="flex items-center gap-2">
      <SidebarTrigger data-testid="button-sidebar-toggle"/>
      <Link href="/">
       <div className="logo-container h-8">
        <img src={logoLight} alt="Logo" className="logo-light h-8 w-auto" loading="lazy"/>
        <img src={logoDark} alt="Logo" className="logo-dark h-8 w-auto" loading="lazy"/>
       </div>
      </Link>
     </div>
     <div className="flex items-center gap-2">
      <ThemeToggle/>
      {demoMode&&<Link href="/login"><Button size="sm">Sign In</Button></Link>}
     </div>
    </header>
    <div className="min-h-screen bg-background">
     <SEOHead title="Membership Pricing | UK Innovator Founder Visa Assistant"
      description="Founder, Founder Pro and fixed-duration membership options for AI-assisted UK Innovator Founder business preparation."
      canonical="https://innovatorfoundervisaassistant.co.uk/pricing"
      schema={{"@context":"https://schema.org","@graph":[organizationSchema]}}/>
     <main className="responsive-container"><FounderMembershipPlans/></main>
    </div>
   </SidebarInset>
  </div>
 </SidebarProvider>;
}
