import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, ShieldAlert } from "lucide-react";

interface MemberOffer {
  id: "founder" | "founder_pro" | "founder_pass_90d";
  name: string;
  pricePence: number;
  currency: "GBP";
  billingLabel: string;
  billingKind: "monthly" | "one_time";
  benefits: string[];
  generationsPerPeriod: number;
  revisionsPerPeriod: number;
  maximumGenerations: number | null;
}
interface MemberOffers { offers: MemberOffer[]; revision: number; }

/** Server-owned display: never stores a duplicate admin-only price schedule. */
export function FounderMembershipAdministration() {
  const { data, isLoading, isError, refetch } = useQuery<MemberOffers>({
    queryKey: ["/api/member-offers", "admin"],
    queryFn: async () => {
      const response = await fetch("/api/member-offers", { credentials: "include", cache: "no-store" });
      if (!response.ok) throw Error("Unable to verify current membership catalogue.");
      const body = await response.json() as MemberOffers;
      if (!Array.isArray(body.offers) || body.offers.length !== 3)
        throw Error("Membership catalogue is unavailable.");
      return body;
    },
    staleTime: 0, refetchOnWindowFocus: true,
  });
  return <section className="space-y-5" data-testid="admin-current-membership-catalogue">
    <header>
      <h2 className="text-lg font-semibold">Active Membership Packages</h2>
      <p className="text-sm text-muted-foreground">
        Founder, Founder Pro and 90-Day Pass are the only current packages for new purchases.
        Amounts and benefits come directly from the server catalogue used by customer pricing.
      </p>
    </header>
    {isLoading && <p className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin"/>Checking live packages…</p>}
    {isError && <button type="button" className="text-sm underline" onClick={() => void refetch()}>
      Cannot verify current packages. Retry
    </button>}
    <div className="grid gap-4 md:grid-cols-3">
      {data?.offers.map(offer => <Card key={offer.id} data-testid={`admin-package-${offer.id}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2 text-base">
            {offer.name}<Badge variant="secondary">{offer.billingKind === "monthly" ? "Monthly" : "Fixed duration"}</Badge>
          </CardTitle>
          <p className="text-lg font-semibold">
            {new Intl.NumberFormat("en-GB", { style: "currency", currency: offer.currency, maximumFractionDigits: 0 }).format(offer.pricePence / 100)}
            <span className="ml-1 text-xs font-normal text-muted-foreground">{offer.billingLabel}</span>
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">{offer.generationsPerPeriod} generations and {offer.revisionsPerPeriod} revisions per allowance period</p>
          {offer.maximumGenerations != null && <p className="text-sm">Maximum {offer.maximumGenerations} generations per pass</p>}
          <ul className="space-y-2">{offer.benefits.map((b, i) =>
            <li key={i} className="flex items-start gap-2 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary"/>{b}</li>)}</ul>
        </CardContent>
      </Card>)}
    </div>
    <div className="flex gap-2 rounded-md border p-4 text-sm">
      <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0"/>
      <p><strong>Customer membership records are payment-controlled.</strong> Do not assign a paid
        package by editing a tier label or adding old coins. Verified Stripe events create,
        renew, suspend or expire entitlements. Existing Basic, Premium, Enterprise and
        Ultimate purchasers remain grandfathered under their recorded terms, and are not
        automatically migrated or refunded.</p>
    </div>
  </section>;
}
