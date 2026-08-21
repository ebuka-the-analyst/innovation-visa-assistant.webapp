import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Activity,
  BarChart3,
  Calendar as CalendarIcon,
  CheckCircle2,
  Edit,
  Eye,
  MoreVertical,
  Plus,
  RefreshCw,
  Star,
  Trash2,
  UserCheck,
  UserCog,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

type Lawyer = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string | null;
  oiscLevel?: string | null;
  oiscRegistrationNumber?: string | null;
  sraNumber?: string | null;
  firmName?: string | null;
  specializations?: string[] | null;
  yearsExperience?: number | null;
  successRate?: number | null;
  isAvailable: boolean;
  maxConcurrentReviews: number;
  currentReviewCount: number;
  totalReviewsCompleted: number;
  averageRating?: number | null;
  averageTurnaroundHours?: number | null;
  status: string;
  verifiedAt?: string | null;
  bio?: string | null;
  notes?: string | null;
};

type Performance = {
  totalReviews: number;
  completedReviews: number;
  approvedReviews?: number;
  approvalRate?: number;
  averageRating: number;
  averageTurnaroundHours: number;
};

type LawyerForm = {
  firstName: string;
  lastName: string;
  email: string;
  firmName: string;
  oiscLevel: string;
  oiscRegistrationNumber: string;
  sraNumber: string;
  yearsExperience: string;
  specializations: string;
  profileImageUrl: string;
  bio: string;
  notes: string;
  maxConcurrentReviews: string;
  isAvailable: boolean;
};

const emptyForm: LawyerForm = {
  firstName: "",
  lastName: "",
  email: "",
  firmName: "",
  oiscLevel: "none",
  oiscRegistrationNumber: "",
  sraNumber: "",
  yearsExperience: "",
  specializations: "Innovator Founder, Business Visa, Immigration Law",
  profileImageUrl: "",
  bio: "",
  notes: "",
  maxConcurrentReviews: "5",
  isAvailable: true,
};

function toForm(lawyer: Lawyer): LawyerForm {
  return {
    firstName: lawyer.firstName || "",
    lastName: lawyer.lastName || "",
    email: lawyer.email || "",
    firmName: lawyer.firmName || "",
    oiscLevel: lawyer.oiscLevel || "none",
    oiscRegistrationNumber: lawyer.oiscRegistrationNumber || "",
    sraNumber: lawyer.sraNumber || "",
    yearsExperience: lawyer.yearsExperience == null ? "" : String(lawyer.yearsExperience),
    specializations: Array.isArray(lawyer.specializations) ? lawyer.specializations.join(", ") : "",
    profileImageUrl: lawyer.profileImageUrl || "",
    bio: lawyer.bio || "",
    notes: lawyer.notes || "",
    maxConcurrentReviews: String(lawyer.maxConcurrentReviews || 5),
    isAvailable: Boolean(lawyer.isAvailable),
  };
}

function payloadFromForm(form: LawyerForm) {
  const capacity = Number(form.maxConcurrentReviews);
  const years = form.yearsExperience.trim() ? Number(form.yearsExperience) : null;
  return {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim().toLowerCase(),
    firmName: form.firmName.trim() || null,
    oiscLevel: form.oiscLevel === "none" ? null : form.oiscLevel,
    oiscRegistrationNumber: form.oiscRegistrationNumber.trim() || null,
    sraNumber: form.sraNumber.trim() || null,
    yearsExperience: Number.isFinite(years) ? years : null,
    specializations: form.specializations.split(",").map((value) => value.trim()).filter(Boolean),
    profileImageUrl: form.profileImageUrl.trim() || null,
    bio: form.bio.trim() || null,
    notes: form.notes.trim() || null,
    maxConcurrentReviews: Number.isInteger(capacity) ? capacity : 5,
    isAvailable: form.isAvailable,
    status: "active",
  };
}

function initials(lawyer: Lawyer) {
  return `${lawyer.firstName?.[0] || ""}${lawyer.lastName?.[0] || ""}`.toUpperCase() || "LP";
}

function approvalDisplay(value?: number | null) {
  return value == null ? "—" : `${Math.max(0, Math.min(100, Math.round(value)))}%`;
}

export function LawyerTeamManagement() {
  const { toast } = useToast();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"add" | "edit">("add");
  const [form, setForm] = useState<LawyerForm>(emptyForm);
  const [selected, setSelected] = useState<Lawyer | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [performanceOpen, setPerformanceOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [availability, setAvailability] = useState({ isAvailable: true, maxConcurrentReviews: "5" });
  const [performance, setPerformance] = useState<Performance | null>(null);

  const { data: lawyers = [], isLoading, isFetching, refetch } = useQuery<Lawyer[]>({
    queryKey: ["/api/admin/lawyers"],
  });

  const refreshTeam = async () => {
    await queryClient.invalidateQueries({ queryKey: ["/api/admin/lawyers"] });
    await refetch();
  };

  const saveMutation = useMutation({
    mutationFn: async ({ mode, lawyerId, values }: { mode: "add" | "edit"; lawyerId?: string; values: LawyerForm }) => {
      const payload = payloadFromForm(values);
      if (!payload.firstName || !payload.lastName || !payload.email) throw new Error("First name, last name and email are required.");
      if (payload.maxConcurrentReviews < 1 || payload.maxConcurrentReviews > 50) throw new Error("Review capacity must be between 1 and 50.");
      if (payload.yearsExperience != null && (payload.yearsExperience < 0 || payload.yearsExperience > 80)) throw new Error("Years of experience must be between 0 and 80.");
      const response = await apiRequest(mode === "add" ? "POST" : "PATCH", mode === "add" ? "/api/admin/lawyers" : `/api/admin/lawyers/${lawyerId}`, payload);
      return await response.json() as Lawyer;
    },
    onSuccess: async (lawyer) => {
      setEditorOpen(false);
      setSelected(lawyer);
      await refreshTeam();
      toast({ title: editorMode === "add" ? "Lawyer added" : "Lawyer updated", description: `${lawyer.firstName} ${lawyer.lastName} is now up to date.` });
    },
    onError: (error: Error) => toast({ title: "Could not save lawyer", description: error.message, variant: "destructive" }),
  });

  const availabilityMutation = useMutation({
    mutationFn: async () => {
      if (!selected) throw new Error("No lawyer selected.");
      const capacity = Number(availability.maxConcurrentReviews);
      if (!Number.isInteger(capacity) || capacity < 1 || capacity > 50) throw new Error("Review capacity must be between 1 and 50.");
      const response = await apiRequest("PATCH", `/api/admin/lawyers/${selected.id}`, {
        isAvailable: availability.isAvailable,
        maxConcurrentReviews: capacity,
      });
      return await response.json() as Lawyer;
    },
    onSuccess: async (lawyer) => {
      setAvailabilityOpen(false);
      setSelected(lawyer);
      await refreshTeam();
      toast({ title: "Availability updated", description: `${lawyer.firstName} ${lawyer.lastName}'s capacity is now saved.` });
    },
    onError: (error: Error) => toast({ title: "Could not update availability", description: error.message, variant: "destructive" }),
  });

  const performanceMutation = useMutation({
    mutationFn: async (lawyer: Lawyer) => {
      const response = await apiRequest("GET", `/api/admin/lawyers/${lawyer.id}/performance`);
      return await response.json() as Performance;
    },
    onSuccess: (data) => {
      setPerformance(data);
      setPerformanceOpen(true);
    },
    onError: (error: Error) => toast({ title: "Could not load performance", description: error.message, variant: "destructive" }),
  });

  const removeMutation = useMutation({
    mutationFn: async (lawyer: Lawyer) => {
      await apiRequest("DELETE", `/api/admin/lawyers/${lawyer.id}`);
      return lawyer;
    },
    onSuccess: async (lawyer) => {
      queryClient.setQueryData<Lawyer[]>(["/api/admin/lawyers"], (current = []) => current.filter((item) => item.id !== lawyer.id));
      setRemoveOpen(false);
      setSelected(null);
      await refreshTeam();
      toast({ title: "Lawyer removed", description: `${lawyer.firstName} ${lawyer.lastName} has been removed from the active team.` });
    },
    onError: (error: Error) => toast({ title: "Could not remove lawyer", description: error.message, variant: "destructive" }),
  });

  const ratedLawyers = lawyers.filter((lawyer) => lawyer.averageRating != null && Number(lawyer.averageRating) > 0);
  const averageRating = ratedLawyers.length
    ? (ratedLawyers.reduce((sum, lawyer) => sum + Number(lawyer.averageRating || 0), 0) / ratedLawyers.length).toFixed(1)
    : "0.0";
  const totalCurrentReviews = lawyers.reduce((sum, lawyer) => sum + Number(lawyer.currentReviewCount || 0), 0);
  const totalCompleted = lawyers.reduce((sum, lawyer) => sum + Number(lawyer.totalReviewsCompleted || 0), 0);

  const chartData = useMemo(() => lawyers.map((lawyer) => ({
    name: `${lawyer.firstName} ${lawyer.lastName?.charAt(0) || ""}.`,
    completed: lawyer.totalReviewsCompleted || 0,
    approvalRate: lawyer.successRate == null ? null : lawyer.successRate,
  })), [lawyers]);

  const openAdd = () => {
    setSelected(null);
    setEditorMode("add");
    setForm(emptyForm);
    setEditorOpen(true);
  };

  const openEdit = (lawyer: Lawyer) => {
    setSelected(lawyer);
    setEditorMode("edit");
    setForm(toForm(lawyer));
    setEditorOpen(true);
  };

  const openAvailability = (lawyer: Lawyer) => {
    setSelected(lawyer);
    setAvailability({ isAvailable: lawyer.isAvailable, maxConcurrentReviews: String(lawyer.maxConcurrentReviews || 5) });
    setAvailabilityOpen(true);
  };

  const openPerformance = (lawyer: Lawyer) => {
    setSelected(lawyer);
    setPerformance(null);
    setPerformanceOpen(true);
    performanceMutation.mutate(lawyer);
  };

  useEffect(() => {
    if (!profileOpen && !editorOpen && !availabilityOpen && !performanceOpen && !removeOpen) return;
    if (selected && !lawyers.some((lawyer) => lawyer.id === selected.id) && editorMode !== "add") {
      setProfileOpen(false);
      setEditorOpen(false);
      setAvailabilityOpen(false);
      setPerformanceOpen(false);
      setRemoveOpen(false);
      setSelected(null);
    }
  }, [lawyers, selected, profileOpen, editorOpen, availabilityOpen, performanceOpen, removeOpen, editorMode]);

  return (
    <div className="space-y-4" data-testid="lawyer-team-management">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total Lawyers" value={lawyers.length} icon={<Users className="h-5 w-5 text-blue-600" />} />
        <MetricCard label="Available" value={lawyers.filter((lawyer) => lawyer.isAvailable).length} icon={<UserCheck className="h-5 w-5 text-emerald-600" />} />
        <MetricCard label="Active Reviews" value={totalCurrentReviews} icon={<Activity className="h-5 w-5 text-amber-600" />} />
        <MetricCard label="Total Completed" value={totalCompleted} icon={<CheckCircle2 className="h-5 w-5 text-violet-600" />} />
        <MetricCard label="Avg. Rating" value={averageRating} icon={<Star className="h-5 w-5 text-cyan-600" />} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base"><UserCog className="h-4 w-4 text-blue-600" /> Immigration Lawyer Team</CardTitle>
              <CardDescription>Manage professional profiles, availability, capacity and access to review work.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}><RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> Refresh</Button>
              <Button size="sm" onClick={openAdd} data-testid="button-add-lawyer"><Plus className="mr-2 h-4 w-4" /> Add Lawyer</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[0, 1, 2].map((item) => <Skeleton key={item} className="h-32 w-full rounded-2xl" />)}</div>
          ) : lawyers.length === 0 ? (
            <div className="py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50"><UserCog className="h-6 w-6 text-blue-600" /></div>
              <h3 className="mt-4 font-semibold">No lawyers in the active team</h3>
              <p className="mx-auto mt-1 max-w-lg text-sm text-muted-foreground">Add a professional to make them available for document-review work. Removed professionals stay in historical records.</p>
              <Button className="mt-4" onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Add First Lawyer</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {lawyers.map((lawyer) => (
                <Card key={lawyer.id} className={!lawyer.isAvailable ? "bg-muted/25" : ""}>
                  <CardContent className="p-4">
                    <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
                      <div className="flex min-w-0 items-start gap-3">
                        {lawyer.profileImageUrl ? <img src={lawyer.profileImageUrl} alt="" className="h-11 w-11 rounded-full border object-cover" /> : <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-blue-100 text-sm font-bold text-emerald-700">{initials(lawyer)}</div>}
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{lawyer.firstName} {lawyer.lastName}</p><Badge variant={lawyer.isAvailable ? "default" : "secondary"}>{lawyer.isAvailable ? "Online" : "Offline"}</Badge>{lawyer.status === "suspended" && <Badge variant="destructive">Suspended</Badge>}</div>
                          <p className="truncate text-xs text-muted-foreground">{lawyer.email}</p>
                          {lawyer.firmName && <p className="truncate text-xs text-muted-foreground">{lawyer.firmName}</p>}
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {(lawyer.specializations?.length ? lawyer.specializations : ["Immigration Law", "Business Visa", "Innovator Founder"]).slice(0, 4).map((item) => <Badge key={item} variant="outline" className="font-normal">{item.replaceAll("_", " ")}</Badge>)}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                        <div className="min-w-24 rounded-xl border p-3 text-center"><p className="text-sm font-bold">{lawyer.currentReviewCount}/{lawyer.maxConcurrentReviews}</p><p className="text-[11px] text-muted-foreground">Workload</p></div>
                        <div className="min-w-24 rounded-xl border p-3 text-center"><p className="text-sm font-bold">{lawyer.totalReviewsCompleted}</p><p className="text-[11px] text-muted-foreground">Completed</p></div>
                        <div className="min-w-24 rounded-xl border p-3 text-center"><p className="flex items-center justify-center gap-1 text-sm font-bold"><Star className="h-3.5 w-3.5 text-amber-500" /> {lawyer.averageRating || "—"}</p><p className="text-[11px] text-muted-foreground">Rating</p></div>
                        <div className="min-w-24 rounded-xl border p-3 text-center"><p className="text-sm font-bold text-emerald-600">{approvalDisplay(lawyer.successRate)}</p><p className="text-[11px] text-muted-foreground">Approval Rate</p></div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Actions for ${lawyer.firstName} ${lawyer.lastName}`}><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setSelected(lawyer); setProfileOpen(true); }}><Eye className="mr-2 h-4 w-4" /> View Profile</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(lawyer)}><Edit className="mr-2 h-4 w-4" /> Edit Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openPerformance(lawyer)}><BarChart3 className="mr-2 h-4 w-4" /> View Performance</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openAvailability(lawyer)}><CalendarIcon className="mr-2 h-4 w-4" /> Set Availability</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => { setSelected(lawyer); setRemoveOpen(true); }}><Trash2 className="mr-2 h-4 w-4" /> Remove</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {lawyers.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm"><BarChart3 className="h-4 w-4 text-violet-600" /> Team Performance Comparison</CardTitle>
            <CardDescription>Real completed-review totals and approval rates recorded for each professional.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis yAxisId="reviews" allowDecimals={false} fontSize={11} />
                <YAxis yAxisId="percent" orientation="right" domain={[0, 100]} fontSize={11} unit="%" />
                <RechartsTooltip />
                <Bar yAxisId="reviews" dataKey="completed" name="Completed reviews" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="percent" dataKey="approvalRate" name="Approval rate %" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader><DialogTitle>{editorMode === "add" ? "Add Lawyer" : "Edit Lawyer"}</DialogTitle><DialogDescription>{editorMode === "add" ? "Create an active professional record for the review team." : "Update the professional profile and review settings."}</DialogDescription></DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="First name"><Input value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} /></Field>
            <Field label="Last name"><Input value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} /></Field>
            <Field label="Professional email"><Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field>
            <Field label="Firm / organisation"><Input value={form.firmName} onChange={(event) => setForm({ ...form, firmName: event.target.value })} /></Field>
            <Field label="IAA / OISC level"><Select value={form.oiscLevel} onValueChange={(value) => setForm({ ...form, oiscLevel: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Not provided</SelectItem><SelectItem value="Level 1">Level 1</SelectItem><SelectItem value="Level 2">Level 2</SelectItem><SelectItem value="Level 3">Level 3</SelectItem></SelectContent></Select></Field>
            <Field label="IAA / OISC registration number"><Input value={form.oiscRegistrationNumber} onChange={(event) => setForm({ ...form, oiscRegistrationNumber: event.target.value })} /></Field>
            <Field label="SRA number"><Input value={form.sraNumber} onChange={(event) => setForm({ ...form, sraNumber: event.target.value })} /></Field>
            <Field label="Years of experience"><Input type="number" min="0" max="80" value={form.yearsExperience} onChange={(event) => setForm({ ...form, yearsExperience: event.target.value })} /></Field>
            <Field label="Review capacity"><Input type="number" min="1" max="50" value={form.maxConcurrentReviews} onChange={(event) => setForm({ ...form, maxConcurrentReviews: event.target.value })} /></Field>
            <Field label="Profile image URL"><Input value={form.profileImageUrl} onChange={(event) => setForm({ ...form, profileImageUrl: event.target.value })} /></Field>
            <div className="md:col-span-2"><Field label="Specialisations (comma separated)"><Input value={form.specializations} onChange={(event) => setForm({ ...form, specializations: event.target.value })} /></Field></div>
            <div className="md:col-span-2"><Field label="Public bio"><Textarea value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} /></Field></div>
            <div className="md:col-span-2"><Field label="Admin notes"><Textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></Field></div>
            <div className="flex items-center justify-between rounded-lg border p-3 md:col-span-2"><div><p className="text-sm font-medium">Available for new reviews</p><p className="text-xs text-muted-foreground">Turn this off to keep the profile but prevent new review assignments.</p></div><Switch checked={form.isAvailable} onCheckedChange={(checked) => setForm({ ...form, isAvailable: checked })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setEditorOpen(false)}>Cancel</Button><Button onClick={() => saveMutation.mutate({ mode: editorMode, lawyerId: selected?.id, values: form })} disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving..." : editorMode === "add" ? "Add Lawyer" : "Save Changes"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Professional Profile</DialogTitle><DialogDescription>Current review-team record.</DialogDescription></DialogHeader>
          {selected && <div className="grid gap-3 sm:grid-cols-2"><ProfileRow label="Name" value={`${selected.firstName} ${selected.lastName}`} /><ProfileRow label="Email" value={selected.email} /><ProfileRow label="Firm" value={selected.firmName || "Not provided"} /><ProfileRow label="Status" value={selected.isAvailable ? "Available" : "Unavailable"} /><ProfileRow label="IAA / OISC" value={[selected.oiscLevel, selected.oiscRegistrationNumber].filter(Boolean).join(" · ") || "Not provided"} /><ProfileRow label="SRA" value={selected.sraNumber || "Not provided"} /><ProfileRow label="Experience" value={selected.yearsExperience == null ? "Not provided" : `${selected.yearsExperience} years`} /><ProfileRow label="Capacity" value={`${selected.currentReviewCount}/${selected.maxConcurrentReviews} active reviews`} /><ProfileRow label="Completed" value={String(selected.totalReviewsCompleted)} /><ProfileRow label="Approval rate" value={approvalDisplay(selected.successRate)} /><ProfileRow label="Average rating" value={selected.averageRating ? `${selected.averageRating}/5` : "No ratings yet"} /><ProfileRow label="Avg. turnaround" value={selected.averageTurnaroundHours ? `${selected.averageTurnaroundHours}h` : "No completed timing data"} />{selected.bio && <div className="sm:col-span-2"><ProfileRow label="Bio" value={selected.bio} /></div>}{selected.notes && <div className="sm:col-span-2"><ProfileRow label="Admin notes" value={selected.notes} /></div>}</div>}
          <DialogFooter><Button variant="outline" onClick={() => setProfileOpen(false)}>Close</Button>{selected && <Button onClick={() => { setProfileOpen(false); openEdit(selected); }}>Edit Details</Button>}</DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={availabilityOpen} onOpenChange={setAvailabilityOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Set Availability</DialogTitle><DialogDescription>{selected ? `Control whether ${selected.firstName} ${selected.lastName} can receive new document reviews.` : "Update review availability."}</DialogDescription></DialogHeader>
          <div className="space-y-4"><div className="flex items-center justify-between rounded-lg border p-4"><div><p className="font-medium">Accept new reviews</p><p className="text-sm text-muted-foreground">Existing assigned work remains attached even when switched off.</p></div><Switch checked={availability.isAvailable} onCheckedChange={(checked) => setAvailability({ ...availability, isAvailable: checked })} /></div><Field label="Maximum concurrent reviews"><Input type="number" min="1" max="50" value={availability.maxConcurrentReviews} onChange={(event) => setAvailability({ ...availability, maxConcurrentReviews: event.target.value })} /></Field></div>
          <DialogFooter><Button variant="outline" onClick={() => setAvailabilityOpen(false)}>Cancel</Button><Button onClick={() => availabilityMutation.mutate()} disabled={availabilityMutation.isPending}>{availabilityMutation.isPending ? "Saving..." : "Save Availability"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={performanceOpen} onOpenChange={setPerformanceOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Performance</DialogTitle><DialogDescription>{selected ? `${selected.firstName} ${selected.lastName}'s review performance is calculated from real review records.` : "Review performance."}</DialogDescription></DialogHeader>
          {performanceMutation.isPending && !performance ? <div className="grid grid-cols-2 gap-3">{[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-20" />)}</div> : performance ? <div className="grid grid-cols-2 gap-3"><PerformanceCard label="Reviews assigned" value={performance.totalReviews} /><PerformanceCard label="Completed" value={performance.completedReviews} /><PerformanceCard label="Approval rate" value={`${performance.approvalRate ?? 0}%`} /><PerformanceCard label="Average rating" value={performance.averageRating ? `${performance.averageRating}/5` : "—"} /><PerformanceCard label="Avg. turnaround" value={performance.averageTurnaroundHours ? `${performance.averageTurnaroundHours}h` : "—"} /></div> : <p className="text-sm text-muted-foreground">Performance data could not be loaded.</p>}
          <DialogFooter><Button variant="outline" onClick={() => setPerformanceOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Remove this professional?</AlertDialogTitle><AlertDialogDescription>{selected ? `${selected.firstName} ${selected.lastName} will disappear from the active Lawyer Team and will no longer receive new reviews or public consultation bookings. Historical reviews and bookings are preserved.` : "The professional will be removed from the active team."}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={(event) => { event.preventDefault(); if (selected) removeMutation.mutate(selected); }} disabled={removeMutation.isPending}>{removeMutation.isPending ? "Removing..." : "Remove"}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return <Card><CardContent className="flex items-center justify-between p-4"><div><p className="text-2xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div><div className="rounded-xl bg-muted p-3">{icon}</div></CardContent></Card>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 break-words text-sm font-medium">{value}</p></div>;
}

function PerformanceCard({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-xl border p-4"><p className="text-xl font-bold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>;
}

export default LawyerTeamManagement;
