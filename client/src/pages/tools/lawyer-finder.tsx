import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToolAccessGuard } from "@/components/ToolAccessGuard";
import { BadgeCheck, CalendarCheck2, Heart, RefreshCw, Search, ShieldCheck, UserRoundSearch } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ConsultationService = {
  id: string;
  expertId: string;
  name: string;
  description?: string | null;
  durationMinutes: number;
  pricePence: number;
  currency: string;
};

type ExpertProfile = {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string | null;
  oiscLevel?: string | null;
  oiscRegistrationNumber?: string | null;
  sraNumber?: string | null;
  regulatorType?: "sra" | "iaa" | "both" | "other" | null;
  verificationStatus?: "platform_onboarding_approved" | null;
  lastVerifiedAt?: string | null;
  firmName?: string | null;
  specializations: string[];
  yearsExperience?: number | null;
  averageRating?: number | null;
  totalReviewsCompleted?: number | null;
  publicTitle?: string | null;
  publicBio?: string | null;
  featured?: boolean;
  meetingMode?: "video" | "phone" | "either";
  services: ConsultationService[];
};

const FAVORITES_KEY = "lawyer-finder-live-favorites-v1";

function money(pence: number, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: String(currency || "GBP").toUpperCase(),
    minimumFractionDigits: pence % 100 === 0 ? 0 : 2,
  }).format(pence / 100);
}

function expertName(expert: ExpertProfile) {
  return `${expert.firstName || ""} ${expert.lastName || ""}`.trim();
}

function lowestFee(expert: ExpertProfile) {
  if (!expert.services?.length) return Number.POSITIVE_INFINITY;
  return Math.min(...expert.services.map((service) => Number(service.pricePence || 0)));
}

function registrationLabel(expert: ExpertProfile) {
  const registrations = [
    expert.sraNumber ? `SRA ${expert.sraNumber}` : null,
    expert.oiscRegistrationNumber ? `IAA ${expert.oiscRegistrationNumber}` : null,
  ].filter(Boolean);
  return registrations.join(" · ");
}

function professionalType(expert: ExpertProfile) {
  if (expert.regulatorType === "both") return "SRA and IAA regulated professional";
  if (expert.regulatorType === "sra") return "SRA-regulated legal professional";
  if (expert.regulatorType === "iaa") return "IAA-regulated immigration adviser";
  if (expert.regulatorType === "other") return "Other regulated professional";
  return null;
}

function verifiedDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(date);
}

function readFavorites(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export default function LawyerFinder() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  const [activeTab, setActiveTab] = useState("browse");
  const [favorites, setFavorites] = useState<string[]>(readFavorites);

  const expertsQuery = useQuery<ExpertProfile[]>({
    queryKey: ["/api/expert-booking/experts"],
    staleTime: 20_000,
    retry: 1,
  });

  const experts = expertsQuery.data || [];
  const filteredExperts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return experts
      .filter((expert) => {
        if (!query) return true;
        const searchable = [expertName(expert), expert.firmName, expert.publicTitle, expert.publicBio, professionalType(expert), ...(expert.specializations || [])]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return searchable.includes(query);
      })
      .sort((a, b) => {
        if (sortBy === "experience") return Number(b.yearsExperience || 0) - Number(a.yearsExperience || 0);
        if (sortBy === "fee-low") return lowestFee(a) - lowestFee(b);
        if (sortBy === "fee-high") return lowestFee(b) - lowestFee(a);
        if (sortBy === "name") return expertName(a).localeCompare(expertName(b));
        if (Boolean(a.featured) !== Boolean(b.featured)) return a.featured ? -1 : 1;
        return expertName(a).localeCompare(expertName(b));
      });
  }, [experts, searchTerm, sortBy]);

  const favoriteExperts = useMemo(() => experts.filter((expert) => favorites.includes(expert.id)), [experts, favorites]);

  const toggleFavorite = (expertId: string) => {
    setFavorites((current) => {
      const next = current.includes(expertId) ? current.filter((id) => id !== expertId) : [...current, expertId];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  };

  const openBooking = (expert: ExpertProfile) => setLocation(`/expert-booking?expertId=${encodeURIComponent(expert.id)}`);

  const ExpertCard = ({ expert }: { expert: ExpertProfile }) => {
    const name = expertName(expert);
    const registration = registrationLabel(expert);
    const type = professionalType(expert);
    const lastVerified = verifiedDate(expert.lastVerifiedAt);
    const firstService = expert.services?.[0];
    const reviewCount = Number(expert.totalReviewsCompleted || 0);
    const rating = Number(expert.averageRating || 0);

    return (
      <Card className="flex h-full flex-col" data-testid={`lawyer-card-${expert.id}`}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 gap-3">
              {expert.profileImageUrl ? <img src={expert.profileImageUrl} alt="" className="h-14 w-14 rounded-full border object-cover" /> : (
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary/10 text-lg font-semibold text-primary">{(expert.firstName?.[0] || "") + (expert.lastName?.[0] || "")}</div>
              )}
              <div className="min-w-0">
                <CardTitle className="truncate text-lg">{name || "Professional profile"}</CardTitle>
                <CardDescription className="mt-1">{expert.publicTitle || expert.firmName || "Immigration professional"}</CardDescription>
                {expert.firmName && expert.publicTitle && <p className="mt-1 text-xs text-muted-foreground">{expert.firmName}</p>}
              </div>
            </div>
            <Button variant="ghost" size="icon" aria-label={favorites.includes(expert.id) ? `Remove ${name} from favourites` : `Save ${name} to favourites`} onClick={() => toggleFavorite(expert.id)} data-testid={`button-favorite-${expert.id}`}>
              <Heart className={`h-5 w-5 ${favorites.includes(expert.id) ? "fill-current text-red-500" : ""}`} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 space-y-4">
          <div className="flex flex-wrap gap-2">
            {expert.featured && <Badge variant="secondary">Featured</Badge>}
            {expert.verificationStatus === "platform_onboarding_approved" && <Badge className="gap-1 bg-emerald-600"><ShieldCheck className="h-3.5 w-3.5" />Platform onboarding approved</Badge>}
            {registration && <Badge variant="outline" className="gap-1"><BadgeCheck className="h-3.5 w-3.5" />{registration}</Badge>}
            {Number(expert.yearsExperience || 0) > 0 && <Badge variant="outline">{expert.yearsExperience} years experience</Badge>}
          </div>

          {(type || lastVerified) && (
            <div className="rounded-lg border bg-muted/20 p-3 text-xs leading-5 text-muted-foreground">
              {type && <p><span className="font-medium text-foreground">Professional type:</span> {type}</p>}
              {lastVerified && <p><span className="font-medium text-foreground">Last platform verification:</span> {lastVerified}</p>}
              <p>Platform verification records onboarding review only and is not a recommendation, guarantee or substitute for checking the professional's current regulator register entry.</p>
            </div>
          )}

          {reviewCount > 0 && rating > 0 && <p className="text-sm text-muted-foreground">Platform consultation rating: <span className="font-medium text-foreground">{rating.toFixed(1)}/5</span> from {reviewCount} completed {reviewCount === 1 ? "review" : "reviews"}.</p>}
          {expert.publicBio && <p className="text-sm leading-6 text-muted-foreground">{expert.publicBio}</p>}
          {expert.specializations?.length > 0 && <div className="flex flex-wrap gap-1.5">{expert.specializations.map((specialization) => <Badge key={specialization} variant="outline" className="text-xs">{specialization}</Badge>)}</div>}
          {firstService ? (
            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
              <div className="font-medium">{firstService.name}</div>
              <div className="mt-1 text-muted-foreground">{firstService.durationMinutes} min · {money(firstService.pricePence, firstService.currency)}{expert.services.length > 1 ? ` · ${expert.services.length} consultation options` : ""}</div>
            </div>
          ) : null}
        </CardContent>

        <CardFooter className="flex items-center justify-between gap-3 border-t pt-4">
          <div className="text-xs leading-5 text-muted-foreground">Availability is confirmed in the live booking calendar.</div>
          <Button onClick={() => openBooking(expert)} disabled={!expert.services?.length} className="shrink-0 gap-2" data-testid={`button-book-${expert.id}`}><CalendarCheck2 className="h-4 w-4" />Book consultation</Button>
        </CardFooter>
      </Card>
    );
  };

  const renderGrid = (items: ExpertProfile[]) => {
    if (expertsQuery.isLoading) return <div className="grid gap-5 md:grid-cols-2">{[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-72 w-full rounded-xl" />)}</div>;
    if (expertsQuery.isError) return (
      <Card><CardContent className="flex flex-col items-center gap-4 p-10 text-center"><RefreshCw className="h-8 w-8 text-muted-foreground" /><div><h3 className="font-semibold">We could not load the professional network</h3><p className="mt-1 text-sm text-muted-foreground">No cached or demo profiles are being substituted.</p></div><Button variant="outline" onClick={() => expertsQuery.refetch()}>Retry</Button></CardContent></Card>
    );
    if (!items.length) {
      const hasNetwork = experts.length > 0;
      return (
        <Card><CardContent className="flex flex-col items-center gap-4 p-10 text-center"><UserRoundSearch className="h-10 w-10 text-muted-foreground" /><div><h3 className="font-semibold">{hasNetwork ? "No professionals match this search" : "No immigration professionals are currently available for booking"}</h3><p className="mt-1 max-w-xl text-sm text-muted-foreground">{hasNetwork ? "Try a different name, firm or specialisation." : "Only administrator-approved professionals with an enabled consultation profile and active service are shown here. Please check back later."}</p></div>{hasNetwork ? <Button variant="outline" onClick={() => setSearchTerm("")}>Clear search</Button> : <Button variant="outline" onClick={() => expertsQuery.refetch()}>Refresh</Button>}</CardContent></Card>
      );
    }
    return <div className="grid gap-5 md:grid-cols-2">{items.map((expert) => <ExpertCard key={expert.id} expert={expert} />)}</div>;
  };

  return (
    <ToolAccessGuard requiredTier="free" toolName="Lawyer Finder & Booking">
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
        <div className="responsive-container max-w-6xl space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><h1 className="text-3xl font-bold tracking-tight">Lawyer Finder & Booking</h1><p className="mt-2 text-muted-foreground">Browse professionals who have completed platform onboarding and are currently enabled for consultation bookings.</p></div>
            <div className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-emerald-600" />Live onboarding directory</div>
          </div>

          <Card><CardContent className="grid gap-3 p-5 md:grid-cols-[1fr_220px]"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search by name, firm or specialisation..." className="pl-9" data-testid="input-lawyer-search" /></div><Select value={sortBy} onValueChange={setSortBy}><SelectTrigger data-testid="select-lawyer-sort"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="recommended">Recommended</SelectItem><SelectItem value="experience">Most experienced</SelectItem><SelectItem value="fee-low">Fee: low to high</SelectItem><SelectItem value="fee-high">Fee: high to low</SelectItem><SelectItem value="name">Name A-Z</SelectItem></SelectContent></Select></CardContent></Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}><TabsList><TabsTrigger value="browse">Browse all ({experts.length})</TabsTrigger><TabsTrigger value="favorites">My favourites ({favoriteExperts.length})</TabsTrigger></TabsList><TabsContent value="browse" className="mt-5">{renderGrid(filteredExperts)}</TabsContent><TabsContent value="favorites" className="mt-5">{renderGrid(favoriteExperts)}</TabsContent></Tabs>

          <div className="rounded-xl border bg-background p-4 text-sm leading-6 text-muted-foreground"><strong className="text-foreground">Important:</strong> Profiles are published only after platform onboarding approval, but users should independently verify a professional's current regulatory status, scope of practice and engagement terms directly with the relevant regulator before instructing them. Platform onboarding verification is not an endorsement of the professional. This platform does not provide legal advice.</div>
        </div>
      </div>
    </ToolAccessGuard>
  );
}
