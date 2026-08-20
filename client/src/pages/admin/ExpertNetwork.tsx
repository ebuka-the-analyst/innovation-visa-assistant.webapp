import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { BadgeCheck, Clipboard, ExternalLink, RefreshCw, ShieldCheck, UserPlus, Users, XCircle } from "lucide-react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { AdminNetworkManager } from "@/pages/expert-booking";

type Application = {
  id: string;
  expertId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  regulatorType?: string | null;
  regulatorNumber?: string | null;
  reviewStatus: string;
  createdAt: string;
  publicTitle?: string | null;
  consultationEnabled?: boolean;
  serviceName?: string | null;
  pricePence?: number | null;
  currency?: string | null;
  durationMinutes?: number | null;
};

async function requestJson(url: string, init?: RequestInit) {
  const response = await fetch(url, { credentials: "include", cache: "no-store", ...init });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Request failed");
  return payload;
}

export default function AdminExpertNetwork() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [recipientEmail, setRecipientEmail] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");

  const applicationsQuery = useQuery<Application[]>({
    queryKey: ["/api/admin/expert-applications"],
    queryFn: () => requestJson("/api/admin/expert-applications"),
    staleTime: 15_000,
  });

  const inviteMutation = useMutation({
    mutationFn: () => requestJson("/api/admin/expert-applications/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientEmail: recipientEmail.trim(), expiresInDays: 30 }),
    }),
    onSuccess: async (data: any) => {
      setInviteUrl(data.inviteUrl);
      try { await navigator.clipboard.writeText(data.inviteUrl); } catch {}
      toast({ title: "Professional invite link created", description: "The 30-day link has been copied where browser permission allows." });
    },
    onError: (error: any) => toast({ title: "Invite could not be created", description: error.message }),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: "approved" | "rejected" }) => requestJson(`/api/admin/expert-applications/${id}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    }),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/admin/expert-applications"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/admin/expert-booking/experts"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/expert-booking/experts"] }),
      ]);
      toast({
        title: variables.decision === "approved" ? "Profile verified and published" : "Application rejected",
        description: variables.decision === "approved" ? "The expert can now appear on the public booking page." : "The professional profile remains hidden from public booking.",
      });
    },
    onError: (error: any) => toast({ title: "Review could not be saved", description: error.message }),
  });

  const handleAdminSection = (section: string) => {
    if (section === "lawyer-manage-network") return;
    setLocation(`/admin#${section}`);
  };

  const refreshNetwork = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["/api/admin/expert-booking/experts"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-expert-bookings"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/expert-booking/experts"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/admin/expert-applications"] }),
    ]);
    toast({ title: "Expert network refreshed", description: "Profiles, applications, availability and consultation bookings have been refreshed." });
  };

  const pending = (applicationsQuery.data || []).filter((application) => application.reviewStatus === "pending_verification");

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
                  Manage the professionals who power Expert Support. Invite lawyers to complete their own profile, verify submissions, then manage services, pricing, live availability and bookings.
                </p>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
              <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg"><UserPlus className="h-5 w-5 text-blue-700" /> Invite a professional</CardTitle>
                  <p className="text-sm text-muted-foreground">Create a secure 30-day link you can send directly to a potential lawyer or adviser.</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input type="email" value={recipientEmail} onChange={(event) => setRecipientEmail(event.target.value)} placeholder="Optional: bind invite to their email" />
                  <Button onClick={() => inviteMutation.mutate()} disabled={inviteMutation.isPending} className="w-full sm:w-auto">
                    {inviteMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Create invite link
                  </Button>
                  {inviteUrl && (
                    <div className="rounded-lg border bg-background p-3">
                      <div className="flex gap-2">
                        <Input readOnly value={inviteUrl} className="font-mono text-xs" />
                        <Button variant="outline" size="icon" onClick={async () => { await navigator.clipboard.writeText(inviteUrl); toast({ title: "Invite link copied" }); }}><Clipboard className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg"><BadgeCheck className="h-5 w-5 text-amber-700" /> Applications awaiting verification <Badge variant="secondary">{pending.length}</Badge></CardTitle>
                  <p className="text-sm text-muted-foreground">Submitted profiles appear in the shared directory automatically, but remain hidden from public booking until you verify them.</p>
                </CardHeader>
                <CardContent>
                  {applicationsQuery.isLoading ? (
                    <div className="py-6 text-sm text-muted-foreground">Loading applications…</div>
                  ) : pending.length === 0 ? (
                    <div className="rounded-lg border border-dashed bg-background/70 p-5 text-sm text-muted-foreground">No professional applications are waiting for review.</div>
                  ) : (
                    <div className="space-y-3">
                      {pending.slice(0, 8).map((application) => (
                        <div key={application.id} className="rounded-xl border bg-background p-4">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                              <div className="font-semibold">{application.firstName} {application.lastName}</div>
                              <div className="text-sm text-muted-foreground">{application.publicTitle || application.email}</div>
                              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                {application.regulatorNumber && <Badge variant="outline">{application.regulatorNumber}</Badge>}
                                {application.serviceName && <Badge variant="outline">{application.serviceName}</Badge>}
                                {application.pricePence != null && <Badge variant="outline">{new Intl.NumberFormat("en-GB", { style: "currency", currency: application.currency || "GBP" }).format(application.pricePence / 100)} · {application.durationMinutes} min</Badge>}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => reviewMutation.mutate({ id: application.id, decision: "approved" })} disabled={reviewMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700"><BadgeCheck className="h-4 w-4" /> Verify & publish</Button>
                              <Button size="sm" variant="outline" onClick={() => reviewMutation.mutate({ id: application.id, decision: "rejected" })} disabled={reviewMutation.isPending}><XCircle className="h-4 w-4" /> Reject</Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/20">
              <CardContent className="flex gap-3 p-4 text-sm">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400" />
                <div>
                  <p className="font-medium">Verification protects the public directory</p>
                  <p className="mt-1 text-muted-foreground">
                    A lawyer can create their own profile, price and availability from the invite link, but the public booking switch stays off until an administrator verifies their professional details.
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
