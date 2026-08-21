import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import logo from "@assets/official_logo.webp";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  ExternalLink,
  Globe2,
  Loader2,
  LockKeyhole,
  Mail,
  RefreshCw,
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
  oiscRegistrationNumber?: string | null;
  sraNumber?: string | null;
  firmName?: string | null;
  specializations: string[];
  yearsExperience?: number | null;
  averageRating?: number | null;
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
  agenda?: string | null;
  meetingUrl?: string | null;
  expertFirstName: string;
  expertLastName: string;
  expertTitle?: string;
  expertTimezone?: string;
  serviceName: string;
  durationMinutes: number;
}

interface GuestBookingRef {
  bookingId: string;
  accessToken: string;
}

const GUEST_BOOKINGS_KEY = "ifva-expert-guest-bookings-v1";

function money(pence: number, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: pence % 100 === 0 ? 0 : 2,
  }).format(pence / 100);
}

function readableSpecialty(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function initials(firstName: string, lastName: string) {
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
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

function statusClass(status: string) {
  if (status === "confirmed" || status === "completed") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "pending_payment") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: "include", cache: "no-store" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Request failed");
  return payload;
}

function readGuestRefs(): GuestBookingRef[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(GUEST_BOOKINGS_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item?.bookingId && item?.accessToken).slice(0, 8);
  } catch {
    return [];
  }
}

function saveGuestRef(ref: GuestBookingRef) {
  const current = readGuestRefs().filter((item) => item.bookingId !== ref.bookingId);
  localStorage.setItem(GUEST_BOOKINGS_KEY, JSON.stringify([ref, ...current].slice(0, 8)));
}

function emailLooksValid(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function PublicExpertBooking() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedExpertId, setSelectedExpertId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [agenda, setAgenda] = useState("");
  const [meetingMode, setMeetingMode] = useState<"video" | "phone">("video");
  const [activeTab, setActiveTab] = useState("book");
  const [guest, setGuest] = useState({ firstName: "", lastName: "", email: "" });
  const [guestRefs, setGuestRefs] = useState<GuestBookingRef[]>([]);
  const paymentProcessedRef = useRef(false);
  const scheduleRef = useRef<HTMLDivElement>(null);

  const expertsQuery = useQuery<Expert[]>({ queryKey: ["/api/expert-booking/experts"], staleTime: 20_000 });
  const experts = expertsQuery.data || [];
  const selectedExpert = experts.find((expert) => expert.id === selectedExpertId) || null;
  const selectedService = selectedExpert?.services.find((service) => service.id === selectedServiceId) || null;

  useEffect(() => {
    setGuestRefs(readGuestRefs());
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get("booking");
    const accessToken = params.get("access");
    const requestedTab = params.get("tab");
    if (bookingId && accessToken) {
      const ref = { bookingId, accessToken };
      saveGuestRef(ref);
      setGuestRefs(readGuestRefs());
    }
    if (requestedTab === "mine") setActiveTab("mine");
  }, []);

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
    queryKey: ["public-expert-availability", selectedExpertId, selectedServiceId, fromDate],
    enabled: Boolean(selectedExpertId && selectedServiceId),
    queryFn: () => fetchJson(
      `/api/expert-booking/experts/${encodeURIComponent(selectedExpertId)}/availability?serviceId=${encodeURIComponent(selectedServiceId)}&from=${fromDate}&days=21`,
    ),
    staleTime: 20_000,
  });

  const registeredBookingsQuery = useQuery<Booking[]>({
    queryKey: ["/api/expert-booking/bookings"],
    enabled: Boolean(isAuthenticated),
    staleTime: 15_000,
  });

  const guestBookingsQuery = useQuery<Booking[]>({
    queryKey: ["guest-expert-bookings", guestRefs],
    enabled: !authLoading && !isAuthenticated && guestRefs.length > 0,
    queryFn: async () => {
      const results = await Promise.allSettled(
        guestRefs.map((ref) => fetchJson<Booking>(
          `/api/expert-booking/guest-bookings/${encodeURIComponent(ref.bookingId)}?access=${encodeURIComponent(ref.accessToken)}`,
        )),
      );
      return results.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
    },
    staleTime: 10_000,
  });

  const groupedSlots = useMemo(() => {
    const groups = new Map<string, AvailabilitySlot[]>();
    for (const slot of availabilityQuery.data?.slots || []) {
      const current = groups.get(slot.localDate) || [];
      current.push(slot);
      groups.set(slot.localDate, current);
    }
    return [...groups.entries()].slice(0, 12);
  }, [availabilityQuery.data]);

  const createBookingMutation = useMutation({
    mutationFn: async () => {
      if (!selectedExpert || !selectedService || !selectedSlot) {
        throw new Error("Choose a professional, consultation and time first.");
      }
      if (!isAuthenticated && (!guest.firstName.trim() || !emailLooksValid(guest.email))) {
        throw new Error("Enter your name and a valid email address so we can send the booking details.");
      }
      const idempotencyKey = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
      const body = {
        expertId: selectedExpert.id,
        serviceId: selectedService.id,
        startsAt: selectedSlot.startsAt,
        customerTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/London",
        agenda: agenda.trim(),
        meetingMode,
        idempotencyKey,
        ...(!isAuthenticated ? {
          customerEmail: guest.email.trim(),
          customerFirstName: guest.firstName.trim(),
          customerLastName: guest.lastName.trim(),
        } : {}),
      };
      const endpoint = isAuthenticated
        ? "/api/expert-booking/bookings"
        : "/api/expert-booking/guest-bookings";
      const response = await apiRequest("POST", endpoint, body);
      return response.json();
    },
    onSuccess: (payload) => {
      if (payload.guestAccessToken && payload.booking?.id) {
        saveGuestRef({ bookingId: payload.booking.id, accessToken: payload.guestAccessToken });
        setGuestRefs(readGuestRefs());
      }
      if (payload.checkoutUrl) {
        window.location.assign(payload.checkoutUrl);
        return;
      }
      toast({ title: "Consultation confirmed", description: "Your confirmation has been sent by email." });
      setSelectedSlot(null);
      setAgenda("");
      queryClient.invalidateQueries({ queryKey: ["/api/expert-booking/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["guest-expert-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["public-expert-availability"] });
      setActiveTab("mine");
    },
    onError: (error: Error) => toast({ title: "Booking could not be completed", description: error.message, variant: "destructive" }),
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: async ({ bookingId, sessionId, accessToken }: { bookingId: string; sessionId: string; accessToken?: string | null }) => {
      const endpoint = accessToken
        ? `/api/expert-booking/guest-bookings/${encodeURIComponent(bookingId)}/confirm-payment`
        : `/api/expert-booking/bookings/${encodeURIComponent(bookingId)}/confirm-payment`;
      const response = await apiRequest("POST", endpoint, accessToken ? { sessionId, accessToken } : { sessionId });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Payment verified", description: "Your consultation is confirmed and the details have been emailed to you." });
      queryClient.invalidateQueries({ queryKey: ["/api/expert-booking/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["guest-expert-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["public-expert-availability"] });
      setActiveTab("mine");
      const params = new URLSearchParams(window.location.search);
      params.delete("session_id");
      params.delete("cancelled");
      params.set("tab", "mine");
      window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
    },
    onError: (error: Error) => toast({ title: "Payment verification pending", description: error.message, variant: "destructive" }),
  });

  useEffect(() => {
    if (paymentProcessedRef.current || authLoading) return;
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get("booking");
    const sessionId = params.get("session_id");
    const accessToken = params.get("access");
    const cancelled = params.get("cancelled");
    if (bookingId && sessionId) {
      paymentProcessedRef.current = true;
      confirmPaymentMutation.mutate({ bookingId, sessionId, accessToken });
    } else if (bookingId && cancelled === "1") {
      paymentProcessedRef.current = true;
      toast({ title: "Checkout cancelled", description: "The temporary slot will be released automatically if payment is not completed." });
      setActiveTab("book");
    }
  }, [authLoading, isAuthenticated]);

  const bookings = isAuthenticated ? (registeredBookingsQuery.data || []) : (guestBookingsQuery.data || []);
  const upcomingBookings = bookings.filter((booking) =>
    ["confirmed", "pending_payment"].includes(booking.status) && new Date(booking.endsAt) > new Date(),
  );
  const historyBookings = bookings.filter((booking) => !upcomingBookings.includes(booking));
  const canSubmit = Boolean(
    selectedExpert && selectedService && selectedSlot
    && (isAuthenticated || (guest.firstName.trim() && emailLooksValid(guest.email))),
  );
  const chosenTimezone = availabilityQuery.data?.timeZone || selectedExpert?.timezone || "Europe/London";

  const scrollSchedule = (direction: number) => {
    scheduleRef.current?.scrollBy({ left: direction * 310, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <img src={logo} alt="Innovator Founder Visa Assistant" className="h-9 w-auto" />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/blog"><Button variant="ghost" size="sm">Blog</Button></Link>
            {isAuthenticated ? (
              <Link href="/dashboard"><Button variant="outline" size="sm">Dashboard</Button></Link>
            ) : (
              <Link href="/login?redirect=%2Fexpert-booking"><Button variant="outline" size="sm">Sign in</Button></Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-10 lg:px-8">
        <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_70px_-40px_rgba(15,23,42,.35)]">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="relative grid gap-8 p-6 md:p-9 lg:grid-cols-[1.25fr_.75fr] lg:p-11">
            <div className="max-w-3xl">
              <div className="mb-5 flex flex-wrap gap-2">
                <Badge className="rounded-full bg-blue-50 text-blue-700 hover:bg-blue-50"><Sparkles className="mr-1.5 h-3.5 w-3.5" /> Expert Support</Badge>
                <Badge variant="outline" className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700"><ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> Verified professional profiles</Badge>
              </div>
              <h1 className="text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl lg:text-5xl">
                Book professional support without the back-and-forth.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Compare professionals, choose the consultation you need, pick a live time and pay securely. No subscription and no account required.
              </p>
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-600">
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Live availability</span>
                <span className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-emerald-600" /> Secure checkout</span>
                <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-emerald-600" /> Email confirmations</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 self-end">
              <div className="col-span-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                <div className="flex items-center justify-between"><span className="text-sm text-slate-500">Professionals available</span><Users className="h-5 w-5 text-blue-600" /></div>
                <div className="mt-2 text-3xl font-bold">{experts.length}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="text-xs text-slate-500">Booking</div><div className="mt-1 text-sm font-semibold">Open to everyone</div></div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="text-xs text-slate-500">Payment</div><div className="mt-1 text-sm font-semibold">Pay per session</div></div>
            </div>
          </div>
        </section>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-7">
          <TabsList className="h-11 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <TabsTrigger value="book" className="rounded-lg px-5"><CalendarDays className="mr-2 h-4 w-4" /> Book a consultation</TabsTrigger>
            <TabsTrigger value="mine" className="rounded-lg px-5"><Clock3 className="mr-2 h-4 w-4" /> My consultations</TabsTrigger>
          </TabsList>

          <TabsContent value="book" className="mt-6">
            {expertsQuery.isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-64 rounded-3xl" />)}</div>
            ) : experts.length === 0 ? (
              <Card className="rounded-3xl border-dashed"><CardContent className="py-16 text-center"><UserRoundCheck className="mx-auto h-9 w-9 text-slate-400" /><h2 className="mt-4 text-xl font-semibold">New professionals are being added</h2><p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">Only verified and enabled profiles are shown here.</p></CardContent></Card>
            ) : (
              <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                <div className="space-y-7">
                  <section>
                    <StepTitle number="1" title="Choose a professional" subtitle="Select the person you want to speak with." />
                    <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3">
                      {experts.map((expert) => {
                        const selected = expert.id === selectedExpertId;
                        const startingPrice = Math.min(...expert.services.map((service) => service.pricePence));
                        return (
                          <button
                            type="button"
                            key={expert.id}
                            onClick={() => {
                              setSelectedExpertId(expert.id);
                              setSelectedServiceId(expert.services[0]?.id || "");
                              setSelectedSlot(null);
                            }}
                            className={`group rounded-3xl border bg-white p-5 text-left transition-all duration-200 ${selected ? "border-blue-500 shadow-[0_14px_45px_-28px_rgba(37,99,235,.7)] ring-2 ring-blue-100" : "border-slate-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"}`}
                          >
                            <div className="flex items-start gap-3.5">
                              {expert.profileImageUrl ? <img src={expert.profileImageUrl} alt="" className="h-14 w-14 rounded-2xl border border-slate-200 object-cover" /> : <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 font-bold text-blue-700">{initials(expert.firstName, expert.lastName)}</div>}
                              <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><div className="font-semibold leading-tight">{expert.firstName} {expert.lastName}</div><div className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{expert.publicTitle}</div></div>{selected && <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white"><Check className="h-3.5 w-3.5" /></span>}</div></div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-1.5">
                              {expert.sraNumber && <Badge variant="outline" className="rounded-full text-[11px]"><BadgeCheck className="mr-1 h-3 w-3" /> SRA</Badge>}
                              {expert.oiscRegistrationNumber && <Badge variant="outline" className="rounded-full text-[11px]"><BadgeCheck className="mr-1 h-3 w-3" /> IAA/OISC</Badge>}
                              {expert.yearsExperience !== null && expert.yearsExperience !== undefined && <Badge variant="secondary" className="rounded-full text-[11px]">{expert.yearsExperience}+ years</Badge>}
                            </div>
                            {expert.publicBio && <p className="mt-4 line-clamp-3 text-xs leading-5 text-slate-500">{expert.publicBio}</p>}
                            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs"><span className="flex items-center gap-1 text-slate-500">{expert.averageRating ? <><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {expert.averageRating}</> : <><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Verified profile</>}</span><span className="font-semibold text-slate-900">From {money(startingPrice)}</span></div>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  {selectedExpert && (
                    <section>
                      <StepTitle number="2" title="Choose a consultation" subtitle="Pricing is set by each professional." />
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {selectedExpert.services.map((service) => {
                          const selected = service.id === selectedServiceId;
                          return <button type="button" key={service.id} onClick={() => { setSelectedServiceId(service.id); setSelectedSlot(null); }} className={`rounded-2xl border bg-white p-4 text-left transition ${selected ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200 hover:border-slate-300"}`}><div className="flex justify-between gap-4"><div><div className="font-semibold text-slate-900">{service.name}</div><p className="mt-1 text-sm leading-5 text-slate-500">{service.description || "Focused one-to-one professional consultation."}</p></div><div className="shrink-0 text-lg font-bold">{money(service.pricePence, service.currency)}</div></div><div className="mt-3 flex gap-4 text-xs text-slate-500"><span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {service.durationMinutes} min</span><span className="flex items-center gap-1"><Video className="h-3.5 w-3.5" /> {selectedExpert.meetingMode === "either" ? "Video or phone" : selectedExpert.meetingMode}</span></div></button>;
                        })}
                      </div>
                    </section>
                  )}

                  {selectedService && (
                    <section>
                      <div className="flex items-end justify-between gap-4"><StepTitle number="3" title="Choose a live time" subtitle={`Times shown in ${chosenTimezone}. Swipe or use the arrows to see more dates.`} /><div className="hidden gap-2 sm:flex"><Button type="button" size="icon" variant="outline" className="rounded-full" onClick={() => scrollSchedule(-1)}><ChevronLeft className="h-4 w-4" /></Button><Button type="button" size="icon" variant="outline" className="rounded-full" onClick={() => scrollSchedule(1)}><ChevronRight className="h-4 w-4" /></Button></div></div>
                      <div className="mt-4">
                        {availabilityQuery.isLoading ? <Skeleton className="h-48 rounded-3xl" /> : availabilityQuery.isError ? <Card className="rounded-3xl"><CardContent className="py-10 text-center"><XCircle className="mx-auto h-7 w-7 text-rose-500" /><p className="mt-2 font-medium">Availability could not be loaded.</p><Button variant="outline" className="mt-4" onClick={() => availabilityQuery.refetch()}><RefreshCw className="mr-2 h-4 w-4" /> Try again</Button></CardContent></Card> : groupedSlots.length === 0 ? <Card className="rounded-3xl border-dashed"><CardContent className="py-10 text-center"><CalendarDays className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-2 font-medium">No open times in the next 21 days</p><p className="mt-1 text-sm text-slate-500">Try another professional or consultation.</p></CardContent></Card> : (
                          <div ref={scheduleRef} className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [scrollbar-width:thin]">
                            {groupedSlots.map(([date, slots]) => <div key={date} className="min-w-[235px] max-w-[250px] snap-start rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between"><div><div className="font-semibold">{formatSlotDate(slots[0].startsAt, chosenTimezone, false)}</div><div className="mt-1 text-xs text-slate-500">{slots.length} available</div></div><CalendarDays className="h-4 w-4 text-blue-600" /></div><div className="mt-4 grid grid-cols-2 gap-2">{slots.slice(0, 8).map((slot) => <Button type="button" key={slot.startsAt} size="sm" variant={selectedSlot?.startsAt === slot.startsAt ? "default" : "outline"} className="rounded-xl" onClick={() => setSelectedSlot(slot)}>{slot.localTime}</Button>)}</div></div>)}
                          </div>
                        )}
                      </div>
                    </section>
                  )}
                </div>

                <aside className="xl:sticky xl:top-24">
                  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_55px_-38px_rgba(15,23,42,.45)]">
                    <div className="border-b border-slate-100 p-5"><div className="text-xs font-semibold uppercase tracking-[.16em] text-blue-600">Step 4</div><h2 className="mt-1 text-xl font-bold">Booking summary</h2><p className="mt-1 text-sm text-slate-500">Review your selections and continue to secure checkout.</p></div>
                    <div className="space-y-5 p-5">
                      <div className="space-y-3 text-sm">
                        <SummaryRow label="Professional" value={selectedExpert ? `${selectedExpert.firstName} ${selectedExpert.lastName}` : "Choose a professional"} />
                        <SummaryRow label="Consultation" value={selectedService?.name || "Choose a consultation"} />
                        <SummaryRow label="Duration" value={selectedService ? `${selectedService.durationMinutes} min` : "—"} />
                        <SummaryRow label="Time" value={selectedSlot ? formatSlotDate(selectedSlot.startsAt, chosenTimezone) : "Choose a live time"} />
                        <div className="flex items-center justify-between border-t border-slate-100 pt-4"><span className="text-slate-500">Total</span><span className="text-2xl font-bold">{selectedService ? money(selectedService.pricePence, selectedService.currency) : "—"}</span></div>
                      </div>

                      {selectedExpert?.meetingMode === "either" && <div><Label>Meeting preference</Label><Select value={meetingMode} onValueChange={(value: "video" | "phone") => setMeetingMode(value)}><SelectTrigger className="mt-2 rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="video">Video consultation</SelectItem><SelectItem value="phone">Phone consultation</SelectItem></SelectContent></Select></div>}

                      {!authLoading && !isAuthenticated && <div className="rounded-2xl bg-slate-50 p-4"><div className="mb-3 flex items-center gap-2"><Mail className="h-4 w-4 text-blue-600" /><span className="text-sm font-semibold">Your booking details</span></div><div className="grid grid-cols-2 gap-3"><div><Label htmlFor="guest-first">First name</Label><Input id="guest-first" className="mt-1.5 rounded-xl bg-white" value={guest.firstName} onChange={(e) => setGuest({ ...guest, firstName: e.target.value })} /></div><div><Label htmlFor="guest-last">Last name</Label><Input id="guest-last" className="mt-1.5 rounded-xl bg-white" value={guest.lastName} onChange={(e) => setGuest({ ...guest, lastName: e.target.value })} /></div><div className="col-span-2"><Label htmlFor="guest-email">Email</Label><Input id="guest-email" type="email" className="mt-1.5 rounded-xl bg-white" placeholder="you@example.com" value={guest.email} onChange={(e) => setGuest({ ...guest, email: e.target.value })} /></div></div><p className="mt-3 text-xs leading-5 text-slate-500">No account required. Confirmation, payment and meeting updates will be sent to this email.</p></div>}

                      <div><Label htmlFor="booking-agenda">What would you like to discuss?</Label><Textarea id="booking-agenda" className="mt-2 min-h-24 rounded-xl" value={agenda} onChange={(e) => setAgenda(e.target.value)} maxLength={3000} placeholder="Optional context or questions for the professional." /></div>

                      <Button className="h-12 w-full rounded-xl text-base" disabled={!canSubmit || createBookingMutation.isPending || confirmPaymentMutation.isPending} onClick={() => createBookingMutation.mutate()}>{createBookingMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : selectedService?.pricePence === 0 ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <CreditCard className="mr-2 h-4 w-4" />}{selectedService?.pricePence === 0 ? "Confirm consultation" : "Reserve time & pay"}</Button>
                      <div className="flex items-start gap-2 text-xs leading-5 text-slate-500"><LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span>Availability is checked again when you reserve. Paid times are held temporarily while checkout is completed.</span></div>
                    </div>
                  </div>
                </aside>
              </div>
            )}
          </TabsContent>

          <TabsContent value="mine" className="mt-6">
            <div className="mb-5 flex items-end justify-between"><div><div className="text-sm font-semibold text-blue-600">Your schedule</div><h2 className="mt-1 text-2xl font-bold">Consultations</h2><p className="mt-1 text-sm text-slate-500">{isAuthenticated ? "Bookings connected to your account." : "Guest bookings made from this browser. Confirmation and updates are also sent by email."}</p></div><Button variant="outline" onClick={() => setActiveTab("book")}><ArrowLeft className="mr-2 h-4 w-4" /> Book another</Button></div>
            {(isAuthenticated ? registeredBookingsQuery.isLoading : guestBookingsQuery.isLoading) ? <Skeleton className="h-56 rounded-3xl" /> : bookings.length === 0 ? <Card className="rounded-3xl border-dashed"><CardContent className="py-14 text-center"><CalendarDays className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-3 font-semibold">No consultations to show yet</p><Button className="mt-4" onClick={() => setActiveTab("book")}>Find a professional</Button></CardContent></Card> : <div className="space-y-6">{upcomingBookings.length > 0 && <div><h3 className="mb-3 font-semibold">Upcoming</h3><div className="grid gap-4 md:grid-cols-2">{upcomingBookings.map((booking) => <BookingCard key={booking.id} booking={booking} guestRef={guestRefs.find((ref) => ref.bookingId === booking.id)} />)}</div></div>}{historyBookings.length > 0 && <div><h3 className="mb-3 font-semibold">History</h3><div className="grid gap-4 md:grid-cols-2">{historyBookings.slice(0, 8).map((booking) => <BookingCard key={booking.id} booking={booking} compact guestRef={guestRefs.find((ref) => ref.bookingId === booking.id)} />)}</div></div>}</div>}
          </TabsContent>
        </Tabs>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 sm:flex sm:items-start sm:gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-blue-600" /><p className="mt-2 text-xs leading-5 text-slate-500 sm:mt-0">Expert Support facilitates bookings with independent professionals. Check the professional profile and regulatory details relevant to the service you need. The platform does not itself provide regulated immigration advice by facilitating the booking.</p></section>
      </main>
    </div>
  );
}

function StepTitle({ number, title, subtitle }: { number: string; title: string; subtitle: string }) {
  return <div className="flex items-start gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">{number}</div><div><h2 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div></div>;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4"><span className="text-slate-500">{label}</span><span className="max-w-[210px] text-right font-medium text-slate-900">{value}</span></div>;
}

function BookingCard({ booking, compact = false, guestRef }: { booking: Booking; compact?: boolean; guestRef?: GuestBookingRef }) {
  const timezone = booking.expertTimezone || "Europe/London";
  const calendarHref = guestRef
    ? `/api/expert-booking/guest-bookings/${encodeURIComponent(booking.id)}/calendar.ics?access=${encodeURIComponent(guestRef.accessToken)}`
    : `/api/expert-booking/bookings/${encodeURIComponent(booking.id)}/calendar.ics`;
  return <Card className="rounded-3xl border-slate-200 shadow-sm"><CardContent className={compact ? "p-4" : "p-5"}><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{booking.serviceName}</p><p className="mt-1 text-sm text-slate-500">with {booking.expertFirstName} {booking.expertLastName}</p></div><Badge variant="outline" className={`rounded-full ${statusClass(booking.status)}`}>{booking.status.replace(/_/g, " ")}</Badge></div><div className="mt-4 grid gap-2 text-sm text-slate-600"><div className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {formatSlotDate(booking.startsAt, timezone)}</div><div className="flex items-center gap-2"><Clock3 className="h-4 w-4" /> {booking.durationMinutes} minutes</div><div className="flex items-center gap-2"><CreditCard className="h-4 w-4" /> {money(booking.amountPence, booking.currency)} · {booking.paymentStatus}</div></div>{!compact && booking.status === "confirmed" && <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">{booking.meetingUrl && <Button size="sm" asChild><a href={booking.meetingUrl} target="_blank" rel="noreferrer"><Video className="mr-2 h-4 w-4" /> Join meeting <ExternalLink className="ml-1 h-3.5 w-3.5" /></a></Button>}<Button size="sm" variant="outline" asChild><a href={calendarHref}><CalendarDays className="mr-2 h-4 w-4" /> Add to calendar</a></Button></div>}</CardContent></Card>;
}
