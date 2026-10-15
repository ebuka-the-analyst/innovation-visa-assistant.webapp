import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface AdminSnapshot {
  packageId: string;
  legacy: boolean;
  source?: "admin_grant" | "stripe" | "unverified";
  membership: null | {
    active: boolean;
    paidThrough: string | null;
    periodEndsAt: string | null;
    generationLimit: number;
    remainingGenerations: number;
    revisionLimit: number;
    remainingRevisions: number;
  };
}

/** Audit-only read: the admin cannot grant paid entitlement from this screen. */
export function AdminVerifiedMembershipStatus({ userId }: { userId: string | null }) {
  const query = useQuery<AdminSnapshot>({
    queryKey: ["/api/admin/users/member-entitlement", userId],
    enabled: !!userId,
    staleTime: 0,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(userId!)}/member-entitlement`, {
        credentials: "include", cache: "no-store",
      });
      if (!response.ok) throw Error("Unable to verify membership ledger.");
      return await response.json() as AdminSnapshot;
    },
  });
  if (!userId) return null;
  if (query.isLoading) return <p className="flex items-center gap-2 text-xs"><Loader2 className="h-4 w-4 animate-spin"/>Checking entitlement ledger…</p>;
  if (query.isError) return <p className="text-xs text-destructive" role="alert">
    Could not verify paid access. Do not infer access from the tier label.
  </p>;
  const data=query.data;
  if (!data) return null;
  if (data.legacy) return <p className="text-xs text-muted-foreground">
    Historical/no membership. The Founder subscription ledger does not apply to this tier.
  </p>;
  if (!data.membership?.active) return <Badge variant="destructive">No active verified membership entitlement</Badge>;
  return <div className="rounded-lg border p-3 text-sm" data-testid="verified-member-entitlement">
    <Badge variant="secondary">{data.source==="admin_grant"?"Active administrator-granted access":data.source==="stripe"?"Verified paid membership":"Active entitlement"}</Badge>
    <p className="mt-2">{data.source==="admin_grant"?"Manual access expires":"Access through"}: {data.membership.paidThrough ? new Date(data.membership.paidThrough).toLocaleDateString("en-GB") : "Unavailable"}</p>
    {data.source==="admin_grant" && <p className="text-xs text-muted-foreground">This grant is not a customer payment and will not renew automatically.</p>}
    <p>Remaining generations: {data.membership.remainingGenerations} of {data.membership.generationLimit}</p>
    <p>Remaining revisions: {data.membership.remainingRevisions} of {data.membership.revisionLimit}</p>
    <p>Allowance period ends: {data.membership.periodEndsAt ? new Date(data.membership.periodEndsAt).toLocaleDateString("en-GB") : "Unavailable"}</p>
  </div>;
}
