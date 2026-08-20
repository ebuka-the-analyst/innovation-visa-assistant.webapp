import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  Mic,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import logoLightImg from "@assets/official_logo.webp";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImageUrl: string;
  publicTitle: string;
  publicBio: string;
  firmName: string;
  regulatorType: "sra" | "iaa" | "both" | "other";
  sraNumber: string;
  iaaRegistrationNumber: string;
  iaaLevel: string;
  yearsExperience: string;
  specializations: string;
  timezone: string;
  meetingMode: "video" | "phone" | "either";
  bookingNoticeHours: string;
  bookingHorizonDays: string;
  slotIntervalMinutes: string;
  bufferMinutes: string;
  serviceName: string;
  serviceDescription: string;
  durationMinutes: string;
  pricePounds: string;
  preparationNote: string;
  weekdays: number[];
  startTime: string;
  endTime: string;
  accuracyConfirmed: boolean;
  displayConsent: boolean;
};

const initialForm: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  profileImageUrl: "",
  publicTitle: "",
  publicBio: "",
  firmName: "",
  regulatorType: "sra",
  sraNumber: "",
  iaaRegistrationNumber: "",
  iaaLevel: "",
  yearsExperience: "",
  specializations: "Innovator Founder Visa",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/London",
  meetingMode: "video",
  bookingNoticeHours: "24",
  bookingHorizonDays: "60",
  slotIntervalMinutes: "30",
  bufferMinutes: "15",
  serviceName: "Innovator Founder consultation",
  serviceDescription: "",
  durationMinutes: "60",
  pricePounds: "",
  preparationNote: "",
  weekdays: [1, 2, 3, 4, 5],
  startTime: "09:00",
  endTime: "17:00",
  accuracyConfirmed: false,
  displayConsent: false,
};

const weekdayOptions = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

async function jsonRequest(url: string, init?: RequestInit) {
  const response = await fetch(url, { credentials: "include", cache: "no-store", ...init });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || payload.message || "Request failed");
  return payload;
}

function VoiceButton({ onText }: { onText: (value: string) => void }) {
  const { toast } = useToast();
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const start = () => {
    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Recognition) {
      toast({ title: "Voice input is not supported in this browser", description: "Try Chrome or Edge, or type your answer instead." });
      return;
    }
    const recognition = new Recognition();
    recognition.lang = "en-GB";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      toast({ title: "Voice input stopped", description: "Please check microphone permission and try again." });
    };
    recognition.onresult = (event: any) => {
      const text = Array.from(event.results || [])
        .map((result: any) => result?.[0]?.transcript || "")
        .join(" ")
        .trim();
      if (text) onText(text);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={start} disabled={listening} className="gap-1.5 shrink-0">
      {listening ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mic className="h-3.5 w-3.5" />}
      {listening ? "Listening" : "Speak"}
    </Button>
  );
}

function FieldActions({
  value,
  field,
  onChange,
  enhance,
  enhancing,
}: {
  value: string;
  field: string;
  onChange: (value: string) => void;
  enhance?: (field: string, value: string, onChange: (value: string) => void) => void;
  enhancing?: boolean;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <VoiceButton onText={(spoken) => onChange(value ? `${value} ${spoken}` : spoken)} />
      {enhance && (
        <Button type="button" variant="outline" size="sm" disabled={enhancing || value.trim().length < 2} onClick={() => enhance(field, value, onChange)} className="gap-1.5">
          {enhancing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          Enhance with AI
        </Button>
      )}
    </div>
  );
}

export default function ExpertJoin() {
  const { toast } = useToast();
  const inviteToken = useMemo(() => new URLSearchParams(window.location.search).get("invite") || "", []);
  const [form, setForm] = useState<FormState>(initialForm);
  const [enhancingField, setEnhancingField] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const inviteQuery = useQuery<any>({
    queryKey: ["expert-network-invite", inviteToken],
    enabled: Boolean(inviteToken),
    retry: false,
    queryFn: () => jsonRequest(`/api/expert-applications/invite/${encodeURIComponent(inviteToken)}`),
  });

  useEffect(() => {
    if (!inviteToken) return;
    const saved = localStorage.getItem(`expert-network-draft:${inviteToken}`);
    if (saved) {
      try { setForm({ ...initialForm, ...JSON.parse(saved) }); } catch {}
    }
  }, [inviteToken]);

  useEffect(() => {
    if (inviteQuery.data?.recipientEmail) {
      setForm((current) => ({ ...current, email: inviteQuery.data.recipientEmail }));
    }
  }, [inviteQuery.data?.recipientEmail]);

  useEffect(() => {
    if (!inviteToken || submitted) return;
    const timeout = window.setTimeout(() => {
      localStorage.setItem(`expert-network-draft:${inviteToken}`, JSON.stringify(form));
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [form, inviteToken, submitted]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const enhance = async (field: string, value: string, onChange: (next: string) => void) => {
    setEnhancingField(field);
    try {
      const result = await jsonRequest("/api/expert-applications/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteToken, field, text: value }),
      });
      onChange(result.enhanced);
      toast({ title: "Wording improved", description: "Please review the AI-edited text before you submit it." });
    } catch (error: any) {
      toast({ title: "AI enhancement unavailable", description: error.message || "You can still submit your original wording." });
    } finally {
      setEnhancingField(null);
    }
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      const specializations = form.specializations.split(",").map((item) => item.trim()).filter(Boolean);
      return jsonRequest("/api/expert-applications/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          inviteToken,
          yearsExperience: Number(form.yearsExperience),
          bookingNoticeHours: Number(form.bookingNoticeHours),
          bookingHorizonDays: Number(form.bookingHorizonDays),
          slotIntervalMinutes: Number(form.slotIntervalMinutes),
          bufferMinutes: Number(form.bufferMinutes),
          durationMinutes: Number(form.durationMinutes),
          pricePounds: Number(form.pricePounds),
          specializations,
        }),
      });
    },
    onSuccess: () => {
      localStorage.removeItem(`expert-network-draft:${inviteToken}`);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onError: (error: any) => {
      toast({ title: "Please check the form", description: error.message || "We could not submit your profile." });
    },
  });

  const requiredReady = Boolean(
    form.firstName && form.lastName && form.email && form.publicTitle && form.publicBio.length >= 40 &&
    form.yearsExperience !== "" && form.specializations && form.serviceName && form.serviceDescription.length >= 20 &&
    form.pricePounds !== "" && form.weekdays.length && form.accuracyConfirmed && form.displayConsent &&
    (!(form.regulatorType === "sra" || form.regulatorType === "both") || form.sraNumber) &&
    (!(form.regulatorType === "iaa" || form.regulatorType === "both") || form.iaaRegistrationNumber)
  );

  if (!inviteToken) {
    return <InvalidInvite message="This page requires a valid professional invitation link." />;
  }
  if (inviteQuery.isLoading) {
    return <div className="min-h-screen grid place-items-center bg-slate-50"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;
  }
  if (inviteQuery.isError) {
    return <InvalidInvite message={(inviteQuery.error as Error)?.message || "This invitation is no longer available."} />;
  }
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 md:py-16">
        <Card className="mx-auto max-w-2xl border-emerald-200 shadow-lg">
          <CardContent className="p-8 text-center md:p-12">
            <img src={logoLightImg} alt="Innovator Founder Visa Assistant" className="mx-auto mb-8 h-14 w-auto" />
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50"><CheckCircle2 className="h-9 w-9 text-emerald-600" /></div>
            <h1 className="text-3xl font-bold text-slate-950">Profile submitted</h1>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600">
              Your professional profile, consultation fee and availability are now saved in the platform. The administrator will verify your professional details before public booking is enabled.
            </p>
            <div className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              You will receive an email when your profile has been reviewed.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <img src={logoLightImg} alt="Innovator Founder Visa Assistant" className="h-11 w-auto" />
          <div className="hidden items-center gap-2 text-sm text-slate-600 sm:flex"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Secure professional onboarding</div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
        <div className="mb-8 max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
            <UserRoundCheck className="h-4 w-4" /> Join the Expert Support network
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">Create your professional consultation profile</h1>
          <p className="mt-3 text-lg leading-8 text-slate-600">Complete one simple form. Your profile, consultation rate and weekly availability will be created automatically for administrator verification.</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-emerald-600" /> AI writing help</span>
            <span className="inline-flex items-center gap-1.5"><Mic className="h-4 w-4 text-emerald-600" /> Voice-to-text</span>
            <span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-emerald-600" /> Professional verification before publication</span>
          </div>
        </div>

        <form className="space-y-6" onSubmit={(event) => { event.preventDefault(); submitMutation.mutate(); }}>
          <Section title="1. Your professional profile" description="These details create the profile applicants will see after verification." icon={<UserRoundCheck className="h-5 w-5" />}>
            <div className="grid gap-5 md:grid-cols-2">
              <TextField label="First name" required value={form.firstName} onChange={(v) => set("firstName", v)} />
              <TextField label="Last name" required value={form.lastName} onChange={(v) => set("lastName", v)} />
              <TextField label="Professional email" type="email" required value={form.email} onChange={(v) => set("email", v)} disabled={Boolean(inviteQuery.data?.recipientEmail)} />
              <TextField label="Phone number" value={form.phone} onChange={(v) => set("phone", v)} />
              <TextField label="Firm / organisation" value={form.firmName} onChange={(v) => set("firmName", v)} enhanceField="firmName" enhance={enhance} enhancing={enhancingField === "firmName"} />
              <TextField label="Professional photo URL" value={form.profileImageUrl} onChange={(v) => set("profileImageUrl", v)} placeholder="https://... (optional)" />
            </div>
            <TextField label="Public professional title" required value={form.publicTitle} onChange={(v) => set("publicTitle", v)} placeholder="e.g. Senior Immigration Solicitor & Innovator Founder Adviser" enhanceField="publicTitle" enhance={enhance} enhancing={enhancingField === "publicTitle"} />
            <NarrativeField label="Public biography" required value={form.publicBio} onChange={(v) => set("publicBio", v)} placeholder="Describe your professional background, areas of practice and how you support founders. Only include facts you can substantiate." enhanceField="publicBio" enhance={enhance} enhancing={enhancingField === "publicBio"} />
          </Section>

          <Section title="2. Regulation & experience" description="Regulatory identifiers are factual fields. AI will not alter them." icon={<BadgeCheck className="h-5 w-5" />}>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Regulatory status *</Label>
                <Select value={form.regulatorType} onValueChange={(v: any) => set("regulatorType", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sra">SRA regulated</SelectItem><SelectItem value="iaa">IAA / OISC regulated</SelectItem><SelectItem value="both">SRA and IAA / OISC</SelectItem><SelectItem value="other">Other professional status</SelectItem></SelectContent></Select>
              </div>
              <div className="space-y-2"><Label>Years of professional experience *</Label><Input type="number" min="0" max="80" value={form.yearsExperience} onChange={(e) => set("yearsExperience", e.target.value)} /></div>
              {(form.regulatorType === "sra" || form.regulatorType === "both") && <TextField label="SRA number" required value={form.sraNumber} onChange={(v) => set("sraNumber", v)} />}
              {(form.regulatorType === "iaa" || form.regulatorType === "both") && <TextField label="IAA / OISC registration number" required value={form.iaaRegistrationNumber} onChange={(v) => set("iaaRegistrationNumber", v)} />}
              {(form.regulatorType === "iaa" || form.regulatorType === "both") && <TextField label="IAA / OISC level" value={form.iaaLevel} onChange={(v) => set("iaaLevel", v)} placeholder="If applicable" />}
            </div>
            <TextField label="Practice areas / specialisms" required value={form.specializations} onChange={(v) => set("specializations", v)} placeholder="Separate with commas" enhanceField="specializations" enhance={enhance} enhancing={enhancingField === "specializations"} />
          </Section>

          <Section title="3. Consultation & fee" description="Set the first service applicants can book. More services can be added later." icon={<Banknote className="h-5 w-5" />}>
            <div className="grid gap-5 md:grid-cols-2">
              <TextField label="Consultation name" required value={form.serviceName} onChange={(v) => set("serviceName", v)} enhanceField="serviceName" enhance={enhance} enhancing={enhancingField === "serviceName"} />
              <div className="space-y-2"><Label>Consultation fee (£) *</Label><Input type="number" min="0" max="5000" step="0.01" value={form.pricePounds} onChange={(e) => set("pricePounds", e.target.value)} placeholder="175" /><p className="text-xs text-slate-500">This is the customer-facing consultation price. Bank details are not collected here.</p></div>
              <div className="space-y-2"><Label>Duration *</Label><Select value={form.durationMinutes} onValueChange={(v) => set("durationMinutes", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{[30,45,60,75,90,120].map((m) => <SelectItem key={m} value={String(m)}>{m} minutes</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Meeting format *</Label><Select value={form.meetingMode} onValueChange={(v: any) => set("meetingMode", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="video">Video</SelectItem><SelectItem value="phone">Phone</SelectItem><SelectItem value="either">Video or phone</SelectItem></SelectContent></Select></div>
            </div>
            <NarrativeField label="Consultation description" required value={form.serviceDescription} onChange={(v) => set("serviceDescription", v)} placeholder="Explain what the client can expect from this consultation." enhanceField="serviceDescription" enhance={enhance} enhancing={enhancingField === "serviceDescription"} />
            <NarrativeField label="Preparation note for clients" value={form.preparationNote} onChange={(v) => set("preparationNote", v)} placeholder="What should clients prepare before the meeting?" enhanceField="preparationNote" enhance={enhance} enhancing={enhancingField === "preparationNote"} />
          </Section>

          <Section title="4. Availability" description="Choose your normal weekly consultation window. You can change this later." icon={<CalendarDays className="h-5 w-5" />}>
            <div className="space-y-2"><Label>Days available *</Label><div className="flex flex-wrap gap-2">{weekdayOptions.map((day) => { const active = form.weekdays.includes(day.value); return <Button key={day.value} type="button" size="sm" variant={active ? "default" : "outline"} onClick={() => set("weekdays", active ? form.weekdays.filter((v) => v !== day.value) : [...form.weekdays, day.value])}>{day.label}</Button>; })}</div></div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2"><Label>Start time *</Label><Input type="time" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} /></div>
              <div className="space-y-2"><Label>End time *</Label><Input type="time" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} /></div>
              <div className="space-y-2"><Label>Minimum notice</Label><Select value={form.bookingNoticeHours} onValueChange={(v) => set("bookingNoticeHours", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{[0,12,24,48,72].map((h) => <SelectItem key={h} value={String(h)}>{h === 0 ? "No minimum" : `${h} hours`}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Booking horizon</Label><Select value={form.bookingHorizonDays} onValueChange={(v) => set("bookingHorizonDays", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{[14,30,60,90,180].map((d) => <SelectItem key={d} value={String(d)}>{d} days</SelectItem>)}</SelectContent></Select></div>
              <TextField label="Time zone" required value={form.timezone} onChange={(v) => set("timezone", v)} />
              <div className="space-y-2"><Label>Slot interval</Label><Select value={form.slotIntervalMinutes} onValueChange={(v) => set("slotIntervalMinutes", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{[15,30,45,60].map((m) => <SelectItem key={m} value={String(m)}>{m} minutes</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Buffer between bookings</Label><Select value={form.bufferMinutes} onValueChange={(v) => set("bufferMinutes", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{[0,10,15,20,30,45,60].map((m) => <SelectItem key={m} value={String(m)}>{m} minutes</SelectItem>)}</SelectContent></Select></div>
            </div>
          </Section>

          <Card className="border-slate-200"><CardContent className="space-y-4 p-5 md:p-6">
            <label className="flex cursor-pointer gap-3"><input type="checkbox" className="mt-1 h-4 w-4" checked={form.accuracyConfirmed} onChange={(e) => set("accuracyConfirmed", e.target.checked)} /><span className="text-sm leading-6 text-slate-700"><strong>I confirm the information is accurate.</strong> I understand the platform may verify regulatory and professional details before publication.</span></label>
            <label className="flex cursor-pointer gap-3"><input type="checkbox" className="mt-1 h-4 w-4" checked={form.displayConsent} onChange={(e) => set("displayConsent", e.target.checked)} /><span className="text-sm leading-6 text-slate-700"><strong>I give permission for these professional details to be displayed.</strong> Public booking will only be enabled after platform verification.</span></label>
          </CardContent></Card>

          <div className="sticky bottom-3 z-20 rounded-2xl border bg-white/95 p-4 shadow-xl backdrop-blur md:flex md:items-center md:justify-between">
            <div className="mb-3 flex items-center gap-2 text-sm text-slate-600 md:mb-0"><Clock3 className="h-4 w-4" /> Your draft saves automatically in this browser.</div>
            <Button type="submit" size="lg" disabled={!requiredReady || submitMutation.isPending} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 md:w-auto">{submitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Submit professional profile</Button>
          </div>
        </form>
      </main>
    </div>
  );
}

function Section({ title, description, icon, children }: { title: string; description: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <Card className="border-slate-200 shadow-sm"><CardHeader className="pb-4"><div className="flex gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">{icon}</div><div><CardTitle className="text-xl">{title}</CardTitle><p className="mt-1 text-sm text-slate-500">{description}</p></div></div></CardHeader><CardContent className="space-y-5">{children}</CardContent></Card>;
}

function TextField({ label, value, onChange, required, type = "text", placeholder, disabled, enhanceField, enhance, enhancing }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string; placeholder?: string; disabled?: boolean; enhanceField?: string; enhance?: (field: string, value: string, onChange: (value: string) => void) => void; enhancing?: boolean }) {
  return <div className="space-y-2"><Label>{label}{required ? " *" : ""}</Label><Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} required={required} /><FieldActions value={value} field={enhanceField || label} onChange={onChange} enhance={enhanceField ? enhance : undefined} enhancing={enhancing} /></div>;
}

function NarrativeField({ label, value, onChange, required, placeholder, enhanceField, enhance, enhancing }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; placeholder?: string; enhanceField: string; enhance: (field: string, value: string, onChange: (value: string) => void) => void; enhancing?: boolean }) {
  return <div className="space-y-2"><Label>{label}{required ? " *" : ""}</Label><Textarea rows={5} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} /><FieldActions value={value} field={enhanceField} onChange={onChange} enhance={enhance} enhancing={enhancing} /><p className="text-xs text-slate-500">AI improves wording only and is instructed not to invent professional claims.</p></div>;
}

function InvalidInvite({ message }: { message: string }) {
  return <div className="min-h-screen grid place-items-center bg-slate-50 p-4"><Card className="max-w-lg w-full"><CardContent className="p-8 text-center"><img src={logoLightImg} alt="Innovator Founder Visa Assistant" className="mx-auto mb-6 h-12 w-auto" /><ShieldCheck className="mx-auto h-12 w-12 text-slate-400" /><h1 className="mt-4 text-2xl font-bold">Invitation unavailable</h1><p className="mt-3 text-slate-600">{message}</p></CardContent></Card></div>;
}
