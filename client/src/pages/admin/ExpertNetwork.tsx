import { useLocation } from "wouter";
import { ExternalLink, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { AdminNetworkManager } from "@/pages/expert-booking";

export default function AdminExpertNetwork() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleAdminSection = (section: string) => {
    if (section === "lawyer-manage-network") return;
    setLocation(`/admin#${section}`);
  };

  const refreshNetwork = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["/api/admin/expert-booking/experts"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-expert-bookings"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/expert-booking/experts"] }),
    ]);
    toast({ title: "Expert network refreshed", description: "Profiles, availability and consultation bookings have been refreshed." });
  };

  return (
    <SidebarProvider defaultOpen>
      <AdminSidebar activeSection="lawyer-manage-network" onSectionChange={handleAdminSection} />
      <SidebarInset>
        <div className="min-h-screen bg-background">
          <header className="sticky top-0 z-20 flex min-h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-6">
            <SidebarTrigger />
            <div className="flex-1">
              <div className="text-sm font-semibold">Admin Console</div>
              <div className="text-xs text-muted-foreground">Lawyer Review Center · Manage Network</div>
            </div>
            <Button variant="outline" size="sm" onClick={refreshNetwork}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/expert-booking" target="_blank" rel="noreferrer">
                Public booking page <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </header>

          <main className="mx-auto w-full max-w-[1500px] space-y-6 p-4 md:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Expert Network Management</h1>
                </div>
                <p className="max-w-4xl text-muted-foreground">
                  Manage the professionals who power Expert Support. Configure consultation profiles, services, pricing, live availability and booking operations from the Admin Console.
                </p>
              </div>
            </div>

            <Card className="border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/20">
              <CardContent className="flex gap-3 p-4 text-sm">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400" />
                <div>
                  <p className="font-medium">Shared professional directory</p>
                  <p className="mt-1 text-muted-foreground">
                    The same professional records can support document reviews and consultations, while consultation availability, pricing and booking lifecycle remain separate from document-review workload.
                  </p>
                </div>
              </CardContent>
            </Card>

            <AdminNetworkManager toast={toast} />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
