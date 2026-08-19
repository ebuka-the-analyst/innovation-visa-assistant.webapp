import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  ExternalLink,
  FileText,
  Globe2,
  Loader2,
  LockKeyhole,
  Plus,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  UserRoundCheck,
  Users,
  Video,
  XCircle,
} from "lucide-react";

interface ConsultationService {
  id: string;
  expertId: string;
  name: string;
  description?: string | null;
  durationMinutes: number;
  pricePence: number;
  currency: string;
  preparationNote?: string | null;
  active?: boolean;
}

interface Expert {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string | null;
  publicTitle: string;
  publicBio?: string | null;
  timezone: string;
  featured: boolean;
  meetingMode: "video" | "phone" | "either";
  bookingNoticeHours: number;
  bookingHorizonDays: number;
  preparationNote?: string | null;
  oiscLevel?: string | null;
  oiscRegistrationNumber?: string | null;
  sraNumber?: string | null;
  firmName?: string | null;
  specializations: string[];
  yearsExperience?: number | null;
  successRate?: number | null;
  averageRating?: number | null;
  totalReviewsCompleted?: number | null;
  services: ConsultationService[];
}

interface AvailabilitySlot {
  startsAt: string;
  endsAt: string;
  localDate: string;
  localTime: string;
}

interface AvailabilityResponse {
  timeZone: string;
  slots: AvailabilitySlot[];
}

interface Booking {
  id: string;
  startsAt: string;
  endsAt: string;
  status: string;
  paymentStatus: string;
  amountPence: number;
  currency: string;
  customerTimezone?: string;
  agenda?: string | null;
  meetingUrl?: string | null;
  meetingMode?: string;
  expertId: string;
  expertFirstName: string;
  expertLastName: string;
  expertTitle?: string;
  expertTimezone?: string;
  serviceId: string;
  serviceName: string;
  durationMinutes: number;
}

interface AdminExpert extends Partial<Expert> {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAvailable: boolean;
  status: string;
  consultationEnabled: boolean;
  currentReviewCount: number;
  maxConcurrentReviews: number;
  services: ConsultationService[];
  availabilityRules: Array<{
    id: string;
    expertId: string;
    weekday: number;
    startTime: string;
    endTime: string;
    active: boolean;
  }>;
  slotIntervalMinutes?: number;
  bufferMinutes?: number;
}

interface AdminBooking {
  id: string;
  startsAt: string;
  endsAt: string;
  status: string;
  paymentStatus: string;
  amountPence: number;
  currency: string;
  agenda?: string | null;
  meetingUrl?: string | null;
  meetingMode?: string;
  adminNotes?: string | null;
  userEmail: string;
  userFirstName?: string | null;
  userLastName?: string | null;
  expertId: string;
  expertFirstName: string;
  expertLastName: string;
  serviceName: string;
  durationMinutes: number;
}

interface ConfigFormState {
  publicTitle: string;
  publicBio: string;
  timezone: string;
  consultationEnabled: boolean;
  featured: boolean;
  meetingMode: "video" | "phone" | "either";
  bookingNoticeHours: string;
  bookingHorizonDays: string;
  slotIntervalMinutes: string;
  bufferMinutes: string;
  preparationNote: string;
  serviceId?: string;
  serviceName: string;
  serviceDescription: string;
  durationMinutes: string;
  pricePounds: string;
  weekdays: number[];
  startTime: string;
  endTime: string;
}

const weekdayOptions = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

const defaultConfig: ConfigFormState = {
  publicTitle: "",
  publicBio: "",
  timezone: "Europe/London",
  consultationEnabled: false,
  featured: false,
  meetingMode: "video",
  bookingNoticeHours: "24",
  bookingHorizonDays: "60",
  slotIntervalMinutes: "30",
  bufferMinutes: "15",
  preparationNote: "",
  serviceName: "",
  serviceDescription: "",
  durationMinutes: "60",
  pricePounds: "",
  weekdays: [1, 2, 3, 4, 5],
  startTime: "09:00",
  endTime: "17:00",
};

function money(pence: number, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: pence % 100 === 0 ? 0 : 2,
  }).format(pence / 100);
}

function readableSpecialty(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function initials(firstName: string, lastName: string) {
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
}

function bookingStatusClass(status: string) {
  if (status === "confirmed" || status === "completed") return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
  if (status === "pending_payment") return "bg-amber-500/10 text-amber-700 border-amber-500/20";
  if (status === "cancelled" || status === "expired" || status === "no_show") return "bg-rose-500/10 text-rose-700 border-rose-500/20";
  return "bg-muted text-muted-foreground";
}

function formatSlotDate(iso: string, timeZone: string, includeTime = true) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(iso));
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: "include", cache: "no-store" });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "Request failed");
  }
  return response.json();
}

function configPayload(form: ConfigFormState) {
  const price = Number(form.pricePounds);
  return {
    publicTitle: form.publicTitle.trim(),
    publicBio: form.publicBio.trim(),
    timezone: form.timezone.trim() || "Europe/London",
    consultationEnabled: form.consultationEnabled,
    featured: form.featured,
    meetingMode: form.meetingMode,
    bookingNoticeHours: Number(form.bookingNoticeHours),
    bookingHorizonDays: Number(form.bookingHorizonDays),
    slotIntervalMinutes: Number(form.slotIntervalMinutes),
    bufferMinutes: Number(form.bufferMinutes),
    preparationNote: form.preparationNote.trim(),
    serviceId: form.serviceId || undefined,
    serviceName: form.serviceName.trim(),
    serviceDescription: form.serviceDescription.trim(),
    durationMinutes: Number(form.durationMinutes),
    pricePence: Math.round(price * 100),
    weekdays: form.weekdays,
    startTime: form.startTime,
    endTime: form.endTime,
  };
}

export default function ExpertBooking() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedExpertId, setSelectedExpertId] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [agenda, setAgenda] = useState("");
  const [meetingMode, setMeetingMode] = useState<"video" | "phone">("video");
  const [activeTab, setActiveTab] = useState("book");
  const paymentProcessedRef = useRef(false);

  const { data: experts = [], isLoading: expertsLoading, refetch: refetchExperts } = useQuery<Expert[]>({
    queryKey: ["/api/expert-booking/experts"],
  });

  const selectedExpert = experts.find((expert) => expert.id === selectedExpertId) || null;
  const selectedService = selectedExpert?.services.find((service) => service.id === selectedServiceId) || null;

  useEffect(() => {
    if (!selectedExpertId && experts.length) {
      setSelectedExpertId(experts[0].id);
      setSelectedServiceId(experts[0].services[0]?.id || "");
    }
  }, [experts, selectedExpertId]);

  useEffect(() => {
    if (!selectedExpert) return;
    if (!selectedExpert.services.some((service) => service.id === selectedServiceId)) {
      setSelectedServiceId(selectedExpert.services[0]?.id || "");
      setSelectedSlot(null);
    }
    if (selectedExpert.meetingMode === "phone") setMeetingMode("phone");
    if (selectedExpert.meetingMode === "video") setMeetingMode("video");
  }, [selectedExpert, selectedServiceId]);

  const fromDate = new Date().toISOString().slice(0, 10);
  const availabilityQuery = useQuery<AvailabilityResponse>({
    queryKey: ["expert-booking-availability", selectedExpertId, selectedServiceId, fromDate],
    enabled: Boolean(selectedExpertId && selectedServiceId),
    queryFn: () => fetchJson(
      `/api/expert-booking/experts/${encodeURIComponent(selectedExpertId)}/availability?serviceId=${encodeURIComponent(selectedServiceId)}&from=${fromDate}&days=14`,
    ),
    staleTime: 20_000,
  });

  const myBookingsQuery = useQuery<Booking[]>({
    queryKey: ["/api/expert-booking/bookings"],
    enabled: isAuthenticated,
    staleTime: 15_000,
  });

  const groupedSlots = useMemo(() => {
    const groups = new Map<string, AvailabilitySlot[]>();
    for (const slot of availabilityQuery.data?.slots || []) {
      const current = groups.get(slot.localDate) || [];
      current.push(slot);
      groups.set(slot.localDate, current);
    }
    return [...groups.entries()].slice(0, 8);
  }, [availabilityQuery.data]);

  const createBookingMutation = useMutation({
    mutationFn: async () => {
      if (!selectedExpert || !selectedService || !selectedSlot) throw new Error("Choose an expert, service and appointment time.");
      if (!isAuthenticated) throw new Error("Sign in before confirming a consultation.");
      const idempotencyKey = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
      const response = await apiRequest("POST", "/api/expert-booking/bookings", {
        expertId: selectedExpert.id,
        serviceId: selectedService.id,
        startsAt: selectedSlot.startsAt,
        customerTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/London",
        agenda: agenda.trim(),
        meetingMode,
        idempotencyKey,
      });
      return response.json();
    },
    onSuccess: (payload) => {
      if (payload.checkoutUrl) {
        window.location.assign(payload.checkoutUrl);
        return;
      }
      toast({ title: "Consultation confirmed", description: "Your booking is now in My Consultations." });
      setSelectedSlot(null);
      setAgenda("");
      queryClient.invalidateQueries({ queryKey: ["/api/expert-booking/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["expert-booking-availability"] });
      setActiveTab("mine");
    },
    onError: (error: Error) => toast({ title: "Booking could not be completed", description: error.message, variant: "destructive" }),
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: async ({ bookingId, sessionId }: { bookingId: string; sessionId: string }) => {
      const response = await apiRequest("POST", `/api/expert-booking/bookings/${encodeURIComponent(bookingId)}/confirm-payment`, { sessionId });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Payment verified", description: "Your expert consultation is confirmed." });
      queryClient.invalidateQueries({ queryKey: ["/api/expert-booking/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["expert-booking-availability"] });
      setActiveTab("mine");
      const cleanUrl = `${window.location.pathname}`;
      window.history.replaceState({}, "", cleanUrl);
    },
    onError: (error: Error) => toast({ title: "Payment verification pending", description: error.message, variant: "destructive" }),
  });

  useEffect(() => {
    if (paymentProcessedRef.current || !isAuthenticated) return;
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get("booking");
    const sessionId = params.get("session_id");
    const cancelled = params.get("cancelled");
    if (bookingId && sessionId) {
      paymentProcessedRef.current = true;
      confirmPaymentMutation.mutate({ bookingId, sessionId });
    } else if (bookingId && cancelled === "1") {
      paymentProcessedRef.current = true;
      toast({ title: "Checkout cancelled", description: "The temporary reservation will expire automatically if payment is not completed." });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [isAuthenticated]);

  const upcomingBookings = (myBookingsQuery.data || []).filter((booking) =>
    ["confirmed", "pending_payment"].includes(booking.status) && new Date(booking.endsAt) > new Date(),
  );
  const pastBookings = (myBookingsQuery.data || []).filter((booking) => !upcomingBookings.includes(booking));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="responsive-container py-6 md:py-10">
        <div className="max-w-7xl mx-auto space-y-6">
          <section className="relative overflow-hidden rounded-3xl border bg-card p-6 md:p-9">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.12),transparent_38%)] pointer-events-none" />
            <div className="relative grid lg:grid-cols-[1.25fr_.75fr] gap-8 items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge variant="secondary" className="gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Expert Support</Badge>
                  <Badge variant="outline" className="gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Human professional support</Badge>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight max-w-3xl">
                  Book the right expert at the right point in your founder journey.
                </h1>
                <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-3xl leading-relaxed">
                  Choose a verified platform expert, see live bookable times, select the consultation you need and keep your appointment, payment and meeting details together in one place.
                </p>
                <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Real availability</span>
                  <span className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-emerald-600" /> Secure payment flow</span>
                  <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-emerald-600" /> Calendar-ready bookings</span>
                </div>
              </div>
              <Card className="bg-background/80 backdrop-blur border-primary/15">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Available network</p>
                      <p className="text-3xl font-bold mt-1">{experts.length}</p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center"><Users className="h-6 w-6 text-primary" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Upcoming</p><p className="text-xl font-semibold">{upcomingBookings.length}</p></div>
                    <div className="rounded-xl bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Next 14 days</p><p className="text-xl font-semibold">{availabilityQuery.data?.slots.length || 0}</p></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
            <TabsList className="h-auto flex-wrap justify-start">
              <TabsTrigger value="book" className="gap-2"><CalendarDays className="h-4 w-4" /> Book Expert</TabsTrigger>
              <TabsTrigger value="mine" className="gap-2"><BriefcaseBusiness className="h-4 w-4" /> My Consultations</TabsTrigger>
              {user?.isAdmin && <TabsTrigger value="manage" className="gap-2"><Settings2 className="h-4 w-4" /> Manage Network</TabsTrigger>}
            </TabsList>

            <TabsContent value="book" className="space-y-6">
              {expertsLoading ? (
                <div className="grid lg:grid-cols-3 gap-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}</div>
              ) : experts.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-14 text-center max-w-2xl mx-auto">
                    <div className="h-14 w-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4"><UserRoundCheck className="h-7 w-7 text-primary" /></div>
                    <h2 className="text-xl font-semibold">Expert consultations are being configured</h2>
                    <p className="mt-2 text-muted-foreground">Only professionals explicitly enabled by the administrator appear here. This prevents placeholder or unverified profiles from being shown to applicants.</p>
                    {user?.isAdmin && <Button className="mt-5" onClick={() => setActiveTab("manage")}><Plus className="h-4 w-4 mr-2" /> Configure first expert</Button>}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,.6fr)] gap-6 items-start">
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-end justify-between gap-4 mb-4">
                        <div><p className="text-sm font-medium text-primary">Step 1</p><h2 className="text-2xl font-semibold">Choose an expert</h2></div>
                        <Button variant="ghost" size="sm" onClick={() => refetchExperts()}><RefreshCw className="h-4 w-4 mr-2" /> Refresh</Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        {experts.map((expert) => {
                          const selected = expert.id === selectedExpertId;
                          const startingPrice = Math.min(...expert.services.map((service) => service.pricePence));
                          return (
                            <Card
                              key={expert.id}
                              className={`cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${selected ? "border-primary ring-2 ring-primary/10" : ""}`}
                              onClick={() => { setSelectedExpertId(expert.id); setSelectedServiceId(expert.services[0]?.id || ""); setSelectedSlot(null); }}
                            >
                              <CardContent className="p-5">
                                <div className="flex gap-4">
                                  {expert.profileImageUrl ? (
                                    <img src={expert.profileImageUrl} alt="" className="h-16 w-16 rounded-2xl object-cover border" />
                                  ) : (
                                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">{initials(expert.firstName, expert.lastName)}</div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                      <div><h3 className="font-semibold text-lg leading-tight">{expert.firstName} {expert.lastName}</h3><p className="text-sm text-muted-foreground mt-1">{expert.publicTitle}</p></div>
                                      {expert.featured && <Badge className="shrink-0">Featured</Badge>}
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      {expert.sraNumber && <Badge variant="outline" className="gap-1"><BadgeCheck className="h-3 w-3" /> SRA details</Badge>}
                                      {expert.oiscRegistrationNumber && <Badge variant="outline" className="gap-1"><BadgeCheck className="h-3 w-3" /> IAA/OISC details</Badge>}
                                      {expert.yearsExperience !== null && expert.yearsExperience !== undefined && <Badge variant="secondary">{expert.yearsExperience}+ yrs</Badge>}
                                    </div>
                                  </div>
                                </div>
                                {expert.publicBio && <p className="mt-4 text-sm text-muted-foreground line-clamp-3 leading-relaxed">{expert.publicBio}</p>}
                                <div className="mt-4 flex flex-wrap gap-1.5">{expert.specializations.slice(0, 4).map((specialty) => <span key={specialty} className="text-xs rounded-full bg-muted px-2.5 py-1">{readableSpecialty(specialty)}</span>)}</div>
                                <div className="mt-5 pt-4 border-t flex items-center justify-between text-sm">
                                  <span className="flex items-center gap-1.5">{expert.averageRating ? <><Star className="h-4 w-4 fill-current text-amber-500" /> {expert.averageRating}.0</> : <><ShieldCheck className="h-4 w-4 text-primary" /> Professional profile</>}</span>
                                  <span className="font-semibold">From {money(startingPrice)}</span>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>

                    {selectedExpert && (
                      <div className="space-y-5">
                        <div><p className="text-sm font-medium text-primary">Step 2</p><h2 className="text-2xl font-semibold">Choose the support you need</h2></div>
                        <div className="grid md:grid-cols-2 gap-3">
                          {selectedExpert.services.map((service) => (
                            <button
                              type="button"
                              key={service.id}
                              onClick={() => { setSelectedServiceId(service.id); setSelectedSlot(null); }}
                              className={`text-left rounded-2xl border p-4 transition-all ${selectedServiceId === service.id ? "border-primary bg-primary/5 ring-2 ring-primary/10" : "bg-card hover:border-primary/40"}`}
                            >
                              <div className="flex justify-between gap-4"><div><p className="font-semibold">{service.name}</p><p className="text-sm text-muted-foreground mt-1">{service.description || "Focused one-to-one expert consultation."}</p></div><p className="font-bold text-lg whitespace-nowrap">{money(service.pricePence, service.currency)}</p></div>
                              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {service.durationMinutes} min</span><span className="flex items-center gap-1"><Video className="h-3.5 w-3.5" /> {selectedExpert.meetingMode === "either" ? "Video or phone" : selectedExpert.meetingMode}</span></div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedService && (
                      <div className="space-y-4">
                        <div className="flex items-end justify-between gap-4"><div><p className="text-sm font-medium text-primary">Step 3</p><h2 className="text-2xl font-semibold">Choose a live time</h2><p className="text-sm text-muted-foreground mt-1">Times are shown in {availabilityQuery.data?.timeZone || selectedExpert?.timezone}.</p></div></div>
                        {availabilityQuery.isLoading ? <Skeleton className="h-44 rounded-2xl" /> : availabilityQuery.isError ? (
                          <Card><CardContent className="py-8 text-center"><XCircle className="h-6 w-6 text-destructive mx-auto mb-2" /><p className="font-medium">Availability could not be loaded.</p><Button variant="outline" className="mt-3" onClick={() => availabilityQuery.refetch()}>Try again</Button></CardContent></Card>
                        ) : groupedSlots.length === 0 ? (
                          <Card className="border-dashed"><CardContent className="py-8 text-center"><CalendarDays className="h-8 w-8 mx-auto text-muted-foreground mb-2" /><p className="font-medium">No open times in the next 14 days</p><p className="text-sm text-muted-foreground mt-1">Try another expert or service.</p></CardContent></Card>
                        ) : (
                          <div className="space-y-3">
                            {groupedSlots.map(([date, slots]) => (
                              <Card key={date}><CardContent className="p-4"><div className="grid md:grid-cols-[150px_1fr] gap-3 items-start"><div><p className="font-semibold">{formatSlotDate(slots[0].startsAt, availabilityQuery.data?.timeZone || selectedExpert?.timezone || "Europe/London", false)}</p><p className="text-xs text-muted-foreground mt-1">{slots.length} time{slots.length === 1 ? "" : "s"}</p></div><div className="flex flex-wrap gap-2">{slots.map((slot) => <Button key={slot.startsAt} size="sm" variant={selectedSlot?.startsAt === slot.startsAt ? "default" : "outline"} onClick={() => setSelectedSlot(slot)}>{slot.localTime}</Button>)}</div></div></CardContent></Card>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <aside className="xl:sticky xl:top-24">
                    <Card className="overflow-hidden shadow-sm">
                      <CardHeader className="border-b bg-muted/30"><p className="text-sm font-medium text-primary">Step 4</p><CardTitle>Confirm consultation</CardTitle><CardDescription>Your live booking summary updates as you make selections.</CardDescription></CardHeader>
                      <CardContent className="p-5 space-y-5">
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between gap-3"><span className="text-muted-foreground">Expert</span><span className="font-medium text-right">{selectedExpert ? `${selectedExpert.firstName} ${selectedExpert.lastName}` : "Not selected"}</span></div>
                          <div className="flex justify-between gap-3"><span className="text-muted-foreground">Service</span><span className="font-medium text-right">{selectedService?.name || "Not selected"}</span></div>
                          <div className="flex justify-between gap-3"><span className="text-muted-foreground">Duration</span><span className="font-medium">{selectedService ? `${selectedService.durationMinutes} min` : "—"}</span></div>
                          <div className="flex justify-between gap-3"><span className="text-muted-foreground">Appointment</span><span className="font-medium text-right">{selectedSlot ? formatSlotDate(selectedSlot.startsAt, availabilityQuery.data?.timeZone || selectedExpert?.timezone || "Europe/London") : "Choose a time"}</span></div>
                          <div className="flex justify-between gap-3 pt-3 border-t"><span className="text-muted-foreground">Total</span><span className="font-bold text-xl">{selectedService ? money(selectedService.pricePence, selectedService.currency) : "—"}</span></div>
                        </div>

                        {selectedExpert?.meetingMode === "either" && (
                          <div><Label>Meeting preference</Label><Select value={meetingMode} onValueChange={(value: "video" | "phone") => setMeetingMode(value)}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="video">Video consultation</SelectItem><SelectItem value="phone">Phone consultation</SelectItem></SelectContent></Select></div>
                        )}
                        <div><Label htmlFor="booking-agenda">What should the expert focus on?</Label><Textarea id="booking-agenda" value={agenda} onChange={(event) => setAgenda(event.target.value)} placeholder="Give the expert useful context, questions or areas you want to cover." className="mt-2 min-h-28" maxLength={3000} /><p className="text-xs text-muted-foreground mt-1.5">Optional. Do not upload sensitive documents here.</p></div>

                        {!isAuthenticated && <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-800">You need to sign in before a slot can be reserved.</div>}
                        <Button className="w-full h-12 gap-2" disabled={!selectedSlot || !selectedService || createBookingMutation.isPending || confirmPaymentMutation.isPending} onClick={() => createBookingMutation.mutate()}>
                          {createBookingMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : selectedService?.pricePence === 0 ? <CheckCircle2 className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                          {selectedService?.pricePence === 0 ? "Confirm booking" : "Reserve slot & pay"}
                        </Button>
                        <div className="flex items-start gap-2 text-xs text-muted-foreground"><LockKeyhole className="h-3.5 w-3.5 mt-0.5 shrink-0" /><p>Paid slots are temporarily held while checkout is completed. The server re-checks availability before every reservation to prevent double-booking.</p></div>
                      </CardContent>
                    </Card>
                  </aside>
                </div>
              )}
            </TabsContent>

            <TabsContent value="mine" className="space-y-5">
              {!isAuthenticated ? (
                <Card><CardContent className="py-12 text-center"><LockKeyhole className="h-8 w-8 mx-auto text-muted-foreground mb-3" /><h2 className="text-xl font-semibold">Sign in to see your consultations</h2></CardContent></Card>
              ) : myBookingsQuery.isLoading ? <Skeleton className="h-64 rounded-2xl" /> : (
                <>
                  <div><p className="text-sm font-medium text-primary">Your schedule</p><h2 className="text-2xl font-semibold">Upcoming consultations</h2></div>
                  {upcomingBookings.length === 0 ? <Card className="border-dashed"><CardContent className="py-10 text-center"><CalendarDays className="h-8 w-8 mx-auto text-muted-foreground mb-2" /><p className="font-medium">No upcoming consultations</p><Button variant="outline" className="mt-4" onClick={() => setActiveTab("book")}>Book an expert</Button></CardContent></Card> : (
                    <div className="grid lg:grid-cols-2 gap-4">{upcomingBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)}</div>
                  )}
                  {pastBookings.length > 0 && <div className="pt-4"><h3 className="text-lg font-semibold mb-3">History</h3><div className="grid lg:grid-cols-2 gap-4">{pastBookings.slice(0, 12).map((booking) => <BookingCard key={booking.id} booking={booking} compact />)}</div></div>}
                </>
              )}
            </TabsContent>

            {user?.isAdmin && <TabsContent value="manage"><AdminNetworkManager toast={toast} /></TabsContent>}
          </Tabs>

          <Card className="bg-muted/30">
            <CardContent className="p-4 md:p-5 flex gap-3 items-start">
              <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Expert Support is separate from the platform's automated tools and document-review workflow. Professional credentials and scope should be checked on the expert profile. The platform itself does not become a regulated immigration adviser by facilitating a booking.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function BookingCard({ booking, compact = false }: { booking: Booking; compact?: boolean }) {
  const timeZone = booking.expertTimezone || "Europe/London";
  const expertName = `${booking.expertFirstName} ${booking.expertLastName}`;
  return (
    <Card>
      <CardContent className={compact ? "p-4" : "p-5"}>
        <div className="flex items-start justify-between gap-3">
          <div><p className="font-semibold">{booking.serviceName}</p><p className="text-sm text-muted-foreground mt-1">with {expertName}</p></div>
          <Badge variant="outline" className={bookingStatusClass(booking.status)}>{booking.status.replace(/_/g, " ")}</Badge>
        </div>
        <div className="mt-4 grid gap-2 text-sm">
          <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-muted-foreground" /> {formatSlotDate(booking.startsAt, timeZone)}</div>
          <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-muted-foreground" /> {booking.durationMinutes} minutes</div>
          <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-muted-foreground" /> {money(booking.amountPence, booking.currency)} · {booking.paymentStatus}</div>
        </div>
        {!compact && booking.status === "confirmed" && (
          <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
            {booking.meetingUrl && <Button size="sm" asChild><a href={booking.meetingUrl} target="_blank" rel="noreferrer"><Video className="h-4 w-4 mr-2" /> Join meeting <ExternalLink className="h-3.5 w-3.5 ml-1" /></a></Button>}
            <Button size="sm" variant="outline" asChild><a href={`/api/expert-booking/bookings/${booking.id}/calendar.ics`}><CalendarDays className="h-4 w-4 mr-2" /> Add to calendar</a></Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AdminNetworkManager({ toast }: { toast: ReturnType<typeof useToast>["toast"] }) {
  const [selectedExpertId, setSelectedExpertId] = useState("");
  const [config, setConfig] = useState<ConfigFormState>(defaultConfig);
  const [createMode, setCreateMode] = useState(false);
  const [identity, setIdentity] = useState({ firstName: "", lastName: "", email: "", firmName: "", sraNumber: "", oiscRegistrationNumber: "", yearsExperience: "" });
  const [bookingFilter, setBookingFilter] = useState("all");
  const [meetingLinks, setMeetingLinks] = useState<Record<string, string>>({});

  const expertsQuery = useQuery<AdminExpert[]>({ queryKey: ["/api/admin/expert-booking/experts"], staleTime: 10_000 });
  const bookingsQuery = useQuery<AdminBooking[]>({
    queryKey: ["admin-expert-bookings", bookingFilter],
    queryFn: () => fetchJson(`/api/admin/expert-booking/bookings${bookingFilter === "all" ? "" : `?status=${encodeURIComponent(bookingFilter)}`}`),
    staleTime: 10_000,
  });

  const selectedAdminExpert = (expertsQuery.data || []).find((expert) => expert.id === selectedExpertId);

  function loadExpert(expert: AdminExpert) {
    const service = expert.services?.find((item) => item.active !== false) || expert.services?.[0];
    const activeRules = (expert.availabilityRules || []).filter((rule) => rule.active !== false);
    setSelectedExpertId(expert.id);
    setCreateMode(false);
    setConfig({
      publicTitle: expert.publicTitle || "",
      publicBio: expert.publicBio || "",
      timezone: expert.timezone || "Europe/London",
      consultationEnabled: Boolean(expert.consultationEnabled),
      featured: Boolean(expert.featured),
      meetingMode: expert.meetingMode || "video",
      bookingNoticeHours: String(expert.bookingNoticeHours ?? 24),
      bookingHorizonDays: String(expert.bookingHorizonDays ?? 60),
      slotIntervalMinutes: String(expert.slotIntervalMinutes ?? 30),
      bufferMinutes: String(expert.bufferMinutes ?? 15),
      preparationNote: expert.preparationNote || "",
      serviceId: service?.id,
      serviceName: service?.name || "",
      serviceDescription: service?.description || "",
      durationMinutes: String(service?.durationMinutes ?? 60),
      pricePounds: service ? String(service.pricePence / 100) : "",
      weekdays: activeRules.length ? [...new Set(activeRules.map((rule) => Number(rule.weekday)))] : [1, 2, 3, 4, 5],
      startTime: activeRules[0]?.startTime?.slice(0, 5) || "09:00",
      endTime: activeRules[0]?.endTime?.slice(0, 5) || "17:00",
    });
  }

  const saveConfigurationMutation = useMutation({
    mutationFn: async () => {
      if (!selectedExpertId) throw new Error("Choose a team member first.");
      const payload = configPayload(config);
      if (!payload.publicTitle || !payload.serviceName || !Number.isFinite(payload.pricePence) || config.weekdays.length === 0) throw new Error("Complete the title, service, price and availability fields.");
      const response = await apiRequest("PUT", `/api/admin/expert-booking/experts/${selectedExpertId}/configuration`, payload);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Expert configuration saved", description: "The booking directory and availability now use this configuration." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/expert-booking/experts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expert-booking/experts"] });
    },
    onError: (error: Error) => toast({ title: "Could not save configuration", description: error.message, variant: "destructive" }),
  });

  const createExpertMutation = useMutation({
    mutationFn: async () => {
      const payload = configPayload(config);
      if (!identity.firstName.trim() || !identity.lastName.trim() || !identity.email.trim()) throw new Error("First name, last name and email are required.");
      if (!payload.publicTitle || !payload.serviceName || !Number.isFinite(payload.pricePence) || config.weekdays.length === 0) throw new Error("Complete the consultation setup before creating the expert.");
      const response = await apiRequest("POST", "/api/admin/expert-booking/experts", {
        ...payload,
        firstName: identity.firstName.trim(),
        lastName: identity.lastName.trim(),
        email: identity.email.trim(),
        firmName: identity.firmName.trim(),
        sraNumber: identity.sraNumber.trim(),
        oiscRegistrationNumber: identity.oiscRegistrationNumber.trim(),
        yearsExperience: identity.yearsExperience ? Number(identity.yearsExperience) : undefined,
        specializations: ["innovator_founder"],
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Expert added", description: "The professional is now part of the Lawyer Team and Expert Support network." });
      setIdentity({ firstName: "", lastName: "", email: "", firmName: "", sraNumber: "", oiscRegistrationNumber: "", yearsExperience: "" });
      setConfig(defaultConfig);
      setCreateMode(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/expert-booking/experts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expert-booking/experts"] });
    },
    onError: (error: Error) => toast({ title: "Could not add expert", description: error.message, variant: "destructive" }),
  });

  const visibilityMutation = useMutation({
    mutationFn: async ({ expertId, consultationEnabled }: { expertId: string; consultationEnabled: boolean }) => {
      const response = await apiRequest("PATCH", `/api/admin/expert-booking/experts/${expertId}/visibility`, { consultationEnabled });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/expert-booking/experts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expert-booking/experts"] });
    },
    onError: (error: Error) => toast({ title: "Visibility update failed", description: error.message, variant: "destructive" }),
  });

  const updateBookingMutation = useMutation({
    mutationFn: async ({ bookingId, changes }: { bookingId: string; changes: Record<string, unknown> }) => {
      const response = await apiRequest("PATCH", `/api/admin/expert-booking/bookings/${bookingId}`, changes);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Booking updated" });
      queryClient.invalidateQueries({ queryKey: ["admin-expert-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expert-booking/bookings"] });
    },
    onError: (error: Error) => toast({ title: "Booking update failed", description: error.message, variant: "destructive" }),
  });

  const enabledCount = (expertsQuery.data || []).filter((expert) => expert.consultationEnabled).length;
  const configuredCount = (expertsQuery.data || []).filter((expert) => Boolean(expert.publicTitle && expert.services?.length)).length;
  const confirmedCount = (bookingsQuery.data || []).filter((booking) => booking.status === "confirmed").length;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-3">
        <Metric label="Lawyer / expert team" value={expertsQuery.data?.length || 0} icon={<Users className="h-5 w-5" />} />
        <Metric label="Configured" value={configuredCount} icon={<Settings2 className="h-5 w-5" />} />
        <Metric label="Publicly bookable" value={enabledCount} icon={<Globe2 className="h-5 w-5" />} />
        <Metric label="Confirmed bookings" value={confirmedCount} icon={<CheckCircle2 className="h-5 w-5" />} />
      </div>

      <div className="grid xl:grid-cols-[.7fr_1.3fr] gap-6 items-start">
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-4"><div><CardTitle>Shared professional directory</CardTitle><CardDescription className="mt-1">The same people power Lawyer Team and Expert Support.</CardDescription></div><Button size="sm" onClick={() => { setCreateMode(true); setSelectedExpertId(""); setConfig(defaultConfig); }}><Plus className="h-4 w-4 mr-2" /> Add Expert</Button></CardHeader>
          <CardContent className="space-y-2">
            {expertsQuery.isLoading ? [1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />) : (expertsQuery.data || []).length === 0 ? <p className="text-sm text-muted-foreground py-6 text-center">No professionals have been added yet.</p> : (expertsQuery.data || []).map((expert) => (
              <button type="button" key={expert.id} onClick={() => loadExpert(expert)} className={`w-full text-left rounded-xl border p-3 transition-colors ${selectedExpertId === expert.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                <div className="flex justify-between gap-3"><div><p className="font-medium">{expert.firstName} {expert.lastName}</p><p className="text-xs text-muted-foreground mt-1">{expert.publicTitle || "Consultation profile not configured"}</p></div><Badge variant={expert.consultationEnabled ? "default" : "secondary"}>{expert.consultationEnabled ? "Bookable" : "Internal"}</Badge></div>
                <div className="mt-2 flex gap-3 text-xs text-muted-foreground"><span>{expert.currentReviewCount}/{expert.maxConcurrentReviews} document reviews</span><span>·</span><span>{expert.services?.length || 0} consultation service{expert.services?.length === 1 ? "" : "s"}</span></div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{createMode ? "Add a new professional" : selectedAdminExpert ? `Configure ${selectedAdminExpert.firstName} ${selectedAdminExpert.lastName}` : "Consultation configuration"}</CardTitle><CardDescription>{createMode ? "Creates the Lawyer Team record and its consultation configuration together." : "Consultation settings are separate from document-review workload and capacity."}</CardDescription></CardHeader>
          <CardContent>
            {!createMode && !selectedAdminExpert ? <div className="py-12 text-center text-muted-foreground"><Settings2 className="h-8 w-8 mx-auto mb-3" /><p>Select a team member or add a new expert.</p></div> : (
              <div className="space-y-6">
                {createMode && <div className="grid md:grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/40">
                  <Field label="First name"><Input value={identity.firstName} onChange={(e) => setIdentity({ ...identity, firstName: e.target.value })} /></Field>
                  <Field label="Last name"><Input value={identity.lastName} onChange={(e) => setIdentity({ ...identity, lastName: e.target.value })} /></Field>
                  <Field label="Professional email"><Input type="email" value={identity.email} onChange={(e) => setIdentity({ ...identity, email: e.target.value })} /></Field>
                  <Field label="Firm / organisation"><Input value={identity.firmName} onChange={(e) => setIdentity({ ...identity, firmName: e.target.value })} /></Field>
                  <Field label="SRA number (if applicable)"><Input value={identity.sraNumber} onChange={(e) => setIdentity({ ...identity, sraNumber: e.target.value })} /></Field>
                  <Field label="IAA/OISC registration (if applicable)"><Input value={identity.oiscRegistrationNumber} onChange={(e) => setIdentity({ ...identity, oiscRegistrationNumber: e.target.value })} /></Field>
                  <Field label="Years of experience"><Input type="number" min="0" value={identity.yearsExperience} onChange={(e) => setIdentity({ ...identity, yearsExperience: e.target.value })} /></Field>
                </div>}

                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Public title"><Input value={config.publicTitle} onChange={(e) => setConfig({ ...config, publicTitle: e.target.value })} placeholder="e.g. Immigration Solicitor & Founder Adviser" /></Field>
                  <Field label="Timezone"><Input value={config.timezone} onChange={(e) => setConfig({ ...config, timezone: e.target.value })} placeholder="Europe/London" /></Field>
                  <div className="md:col-span-2"><Label>Public bio</Label><Textarea className="mt-2 min-h-24" value={config.publicBio} onChange={(e) => setConfig({ ...config, publicBio: e.target.value })} /></div>
                  <Field label="Meeting format"><Select value={config.meetingMode} onValueChange={(value: "video" | "phone" | "either") => setConfig({ ...config, meetingMode: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="video">Video</SelectItem><SelectItem value="phone">Phone</SelectItem><SelectItem value="either">Client chooses</SelectItem></SelectContent></Select></Field>
                  <div className="flex items-center gap-5 pt-6"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={config.consultationEnabled} onChange={(e) => setConfig({ ...config, consultationEnabled: e.target.checked })} /> Publicly bookable</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={config.featured} onChange={(e) => setConfig({ ...config, featured: e.target.checked })} /> Featured</label></div>
                </div>

                <div className="border-t pt-5"><h4 className="font-semibold mb-4">Primary consultation service</h4><div className="grid md:grid-cols-2 gap-4">
                  <Field label="Service name"><Input value={config.serviceName} onChange={(e) => setConfig({ ...config, serviceName: e.target.value })} placeholder="e.g. 60-minute strategy consultation" /></Field>
                  <Field label="Price (£)"><Input type="number" min="0" step="0.01" value={config.pricePounds} onChange={(e) => setConfig({ ...config, pricePounds: e.target.value })} placeholder="Enter price" /></Field>
                  <Field label="Duration (minutes)"><Input type="number" min="15" max="360" value={config.durationMinutes} onChange={(e) => setConfig({ ...config, durationMinutes: e.target.value })} /></Field>
                  <div className="md:col-span-2"><Label>Service description</Label><Textarea className="mt-2" value={config.serviceDescription} onChange={(e) => setConfig({ ...config, serviceDescription: e.target.value })} /></div>
                </div></div>

                <div className="border-t pt-5"><h4 className="font-semibold mb-4">Recurring availability</h4><div className="flex flex-wrap gap-2 mb-4">{weekdayOptions.map((day) => <Button type="button" key={day.value} size="sm" variant={config.weekdays.includes(day.value) ? "default" : "outline"} onClick={() => setConfig({ ...config, weekdays: config.weekdays.includes(day.value) ? config.weekdays.filter((value) => value !== day.value) : [...config.weekdays, day.value] })}>{day.label}</Button>)}</div><div className="grid md:grid-cols-4 gap-4">
                  <Field label="Starts"><Input type="time" value={config.startTime} onChange={(e) => setConfig({ ...config, startTime: e.target.value })} /></Field>
                  <Field label="Ends"><Input type="time" value={config.endTime} onChange={(e) => setConfig({ ...config, endTime: e.target.value })} /></Field>
                  <Field label="Slot interval"><Input type="number" min="15" value={config.slotIntervalMinutes} onChange={(e) => setConfig({ ...config, slotIntervalMinutes: e.target.value })} /></Field>
                  <Field label="Buffer"><Input type="number" min="0" value={config.bufferMinutes} onChange={(e) => setConfig({ ...config, bufferMinutes: e.target.value })} /></Field>
                  <Field label="Minimum notice (hours)"><Input type="number" min="0" value={config.bookingNoticeHours} onChange={(e) => setConfig({ ...config, bookingNoticeHours: e.target.value })} /></Field>
                  <Field label="Booking horizon (days)"><Input type="number" min="1" value={config.bookingHorizonDays} onChange={(e) => setConfig({ ...config, bookingHorizonDays: e.target.value })} /></Field>
                </div></div>

                <div><Label>Preparation note</Label><Textarea className="mt-2" value={config.preparationNote} onChange={(e) => setConfig({ ...config, preparationNote: e.target.value })} placeholder="What the client should prepare before the call." /></div>
                <div className="flex flex-wrap gap-2 justify-end"><Button variant="outline" onClick={() => { setCreateMode(false); if (selectedAdminExpert) loadExpert(selectedAdminExpert); }}>Cancel</Button><Button onClick={() => createMode ? createExpertMutation.mutate() : saveConfigurationMutation.mutate()} disabled={createExpertMutation.isPending || saveConfigurationMutation.isPending}>{(createExpertMutation.isPending || saveConfigurationMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{createMode ? "Create expert" : "Save configuration"}</Button></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4"><div><CardTitle>Consultation operations</CardTitle><CardDescription className="mt-1">Payment status, meeting links and appointment lifecycle are managed independently from document reviews.</CardDescription></div><Select value={bookingFilter} onValueChange={setBookingFilter}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All bookings</SelectItem><SelectItem value="pending_payment">Pending payment</SelectItem><SelectItem value="confirmed">Confirmed</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem><SelectItem value="expired">Expired</SelectItem></SelectContent></Select></CardHeader>
        <CardContent className="space-y-3">
          {bookingsQuery.isLoading ? [1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />) : (bookingsQuery.data || []).length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No consultation bookings in this view.</p> : (bookingsQuery.data || []).map((booking) => (
            <div key={booking.id} className="rounded-2xl border p-4 grid lg:grid-cols-[1fr_auto] gap-4">
              <div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{booking.serviceName}</p><Badge variant="outline" className={bookingStatusClass(booking.status)}>{booking.status.replace(/_/g, " ")}</Badge><Badge variant="secondary">{booking.paymentStatus}</Badge></div><p className="text-sm text-muted-foreground mt-1">{booking.userFirstName} {booking.userLastName} · {booking.userEmail}</p><p className="text-sm mt-2">{formatSlotDate(booking.startsAt, "Europe/London")} · with {booking.expertFirstName} {booking.expertLastName} · {money(booking.amountPence, booking.currency)}</p>{booking.agenda && <p className="text-sm text-muted-foreground mt-2 line-clamp-2"><FileText className="h-3.5 w-3.5 inline mr-1" /> {booking.agenda}</p>}</div>
              <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-2 min-w-[260px]">
                <Input value={meetingLinks[booking.id] ?? booking.meetingUrl ?? ""} onChange={(e) => setMeetingLinks({ ...meetingLinks, [booking.id]: e.target.value })} placeholder="Meeting URL" className="min-w-[200px]" />
                <Button variant="outline" size="sm" onClick={() => updateBookingMutation.mutate({ bookingId: booking.id, changes: { meetingUrl: meetingLinks[booking.id] ?? booking.meetingUrl ?? null } })}>Save link</Button>
                {booking.status === "confirmed" && <Button size="sm" onClick={() => updateBookingMutation.mutate({ bookingId: booking.id, changes: { status: "completed" } })}>Complete</Button>}
                {booking.status !== "cancelled" && booking.status !== "completed" && <Button size="sm" variant="outline" onClick={() => updateBookingMutation.mutate({ bookingId: booking.id, changes: { status: "cancelled" } })}>Cancel</Button>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return <Card><CardContent className="p-4 flex items-center justify-between"><div><p className="text-xs text-muted-foreground">{label}</p><p className="text-2xl font-bold mt-1">{value}</p></div><div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">{icon}</div></CardContent></Card>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label>{label}</Label><div className="mt-2">{children}</div></div>;
}
