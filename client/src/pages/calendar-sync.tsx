import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format, isBefore, startOfDay } from "date-fns";
import {
  AlertTriangle,
  Bell,
  Calendar,
  CalendarDays,
  Download,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Link } from "wouter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SEOHead } from "@/components/SEOHead";

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  eventType: string;
  startDate: string;
  endDate: string | null;
  reminder: boolean;
  reminderDays: number | null;
  isCompleted: boolean;
  completedAt: string | null;
}

const eventTypeStyles: Record<string, string> = {
  application: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  deadline: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  milestone: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  appointment: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  checkpoint: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  custom: "bg-muted text-foreground",
};

function AddEventDialog({ onAddEvent, pending }: { onAddEvent: (event: Record<string, unknown>) => void; pending: boolean }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("custom");
  const [startDate, setStartDate] = useState("");
  const [reminder, setReminder] = useState(true);
  const [reminderDays, setReminderDays] = useState("7");

  const submit = () => {
    if (!title.trim() || !startDate) return;
    onAddEvent({
      title: title.trim(),
      description: description.trim() || null,
      eventType,
      startDate,
      reminder,
      reminderDays: reminder ? Number(reminderDays) : null,
    });
    setOpen(false);
    setTitle("");
    setDescription("");
    setEventType("custom");
    setStartDate("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button data-testid="button-add-event"><Plus className="mr-2 h-4 w-4" />Add Event</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a verified date</DialogTitle>
          <DialogDescription>Enter a date from your own decision letter, endorsement correspondence, appointment booking or another source you have verified. The platform does not invent visa deadlines.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-3">
          <div className="space-y-2"><Label htmlFor="event-title">Title</Label><Input id="event-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Endorser response deadline" data-testid="input-event-title" /></div>
          <div className="space-y-2"><Label htmlFor="event-desc">Source / notes</Label><Textarea id="event-desc" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Where did this date come from? Add the email, letter or official source reference." data-testid="textarea-event-description" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Type</Label><Select value={eventType} onValueChange={setEventType}><SelectTrigger data-testid="select-event-type"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="application">Application</SelectItem><SelectItem value="deadline">Deadline</SelectItem><SelectItem value="milestone">Milestone</SelectItem><SelectItem value="appointment">Appointment</SelectItem><SelectItem value="checkpoint">Checkpoint</SelectItem><SelectItem value="custom">Custom</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="event-date">Date</Label><Input id="event-date" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} data-testid="input-event-date" /></div>
          </div>
          <div className="flex flex-wrap items-center gap-3"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={reminder} onChange={(event) => setReminder(event.target.checked)} />Email reminder</label>{reminder && <Select value={reminderDays} onValueChange={setReminderDays}><SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">1 day before</SelectItem><SelectItem value="3">3 days before</SelectItem><SelectItem value="7">7 days before</SelectItem><SelectItem value="14">14 days before</SelectItem></SelectContent></Select>}</div>
        </div>
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit} disabled={pending || !title.trim() || !startDate} data-testid="button-save-event">{pending ? "Saving..." : "Add Event"}</Button></div>
      </DialogContent>
    </Dialog>
  );
}

export default function CalendarSync() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { data: events = [], isLoading, isError, refetch } = useQuery<CalendarEvent[]>({ queryKey: ["/api/calendar-events"], enabled: !!user });

  const createEvent = useMutation({
    mutationFn: async (event: Record<string, unknown>) => (await apiRequest("POST", "/api/calendar-events", event)).json(),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["/api/calendar-events"] }); toast({ title: "Event added", description: "The verified date is now in your calendar." }); },
    onError: (error: Error) => toast({ title: "Could not add event", description: error.message, variant: "destructive" }),
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/calendar-events/${id}`),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["/api/calendar-events"] }); toast({ title: "Event removed" }); },
    onError: (error: Error) => toast({ title: "Could not remove event", description: error.message, variant: "destructive" }),
  });

  if (authLoading || isLoading) return <div className="flex min-h-[50vh] items-center justify-center"><RefreshCw className="h-7 w-7 animate-spin text-primary" /></div>;
  if (!user) return <div className="container mx-auto max-w-2xl px-4 py-16 text-center"><CalendarDays className="mx-auto h-14 w-14 text-primary" /><h1 className="mt-4 text-xl font-bold">Sign in for Calendar & Deadlines</h1><p className="mt-2 text-muted-foreground">Save your own verified dates and reminders.</p><Button asChild className="mt-5"><Link href="/login">Sign In</Link></Button></div>;

  const today = startOfDay(new Date());
  const sorted = [...events].sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate));
  const overdue = sorted.filter((event) => !event.isCompleted && isBefore(new Date(event.startDate), today));
  const upcoming = sorted.filter((event) => !event.isCompleted && !isBefore(new Date(event.startDate), today));

  return (
    <>
      <SEOHead title="Calendar & Deadlines | UK Innovator Founder Visa Assistant" description="Save verified application dates, appointments and reminders without relying on guessed visa timelines." />
      <div className="container mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h1 className="flex items-center gap-3 text-xl font-bold"><CalendarDays className="h-7 w-7 text-red-600" />Calendar & Deadlines</h1><p className="mt-1 text-muted-foreground">Your own verified deadlines, appointments and milestones.</p></div>
          <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => window.open("/api/calendar-events/export", "_blank")} disabled={!events.length} data-testid="button-export"><Download className="mr-2 h-4 w-4" />Export ICS</Button><AddEventDialog pending={createEvent.isPending} onAddEvent={(event) => createEvent.mutate(event)} /></div>
        </div>

        <Alert className="mt-6 border-amber-500/30 bg-amber-500/5"><AlertTriangle className="h-4 w-4 text-amber-600" /><AlertDescription><strong>No automatic legal timeline:</strong> processing times, endorsement validity, contact points and settlement requirements can change and can depend on your circumstances. Add only dates you have verified from your own documents or current official guidance.</AlertDescription></Alert>

        <div className="mt-6 grid gap-3 sm:grid-cols-3"><Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold">{events.length}</div><p className="text-xs text-muted-foreground">Saved events</p></CardContent></Card><Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-amber-600">{upcoming.length}</div><p className="text-xs text-muted-foreground">Upcoming</p></CardContent></Card><Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-red-600">{overdue.length}</div><p className="text-xs text-muted-foreground">Past dates</p></CardContent></Card></div>

        {isError ? <Card className="mt-6 border-red-500/30 p-8 text-center"><p className="font-semibold">Calendar could not be loaded</p><Button className="mt-4" variant="outline" onClick={() => refetch()}><RefreshCw className="mr-2 h-4 w-4" />Retry</Button></Card> : sorted.length === 0 ? <Card className="mt-6 p-8 text-center"><Calendar className="mx-auto h-10 w-10 text-muted-foreground" /><h2 className="mt-3 font-semibold">No verified dates saved yet</h2><p className="mt-1 text-sm text-muted-foreground">Use “Add Event” when you have a real date to track. The app will not create a generic timeline for you.</p></Card> : <div className="mt-6 space-y-3">{sorted.map((event) => <Card key={event.id}><CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><p className={event.isCompleted ? "font-semibold line-through" : "font-semibold"}>{event.title}</p><Badge className={eventTypeStyles[event.eventType] || eventTypeStyles.custom}>{event.eventType}</Badge>{event.reminder && <Badge variant="outline"><Bell className="mr-1 h-3 w-3" />{event.reminderDays || 0}d reminder</Badge>}</div>{event.description && <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>}<p className="mt-2 text-sm font-medium">{format(new Date(event.startDate), "dd MMM yyyy")}</p></div><Button variant="outline" size="sm" onClick={() => deleteEvent.mutate(event.id)} disabled={deleteEvent.isPending}><Trash2 className="mr-2 h-4 w-4" />Remove</Button></CardContent></Card>)}</div>}

        <Card className="mt-8 p-5"><h2 className="flex items-center gap-2 font-semibold"><Bell className="h-5 w-5 text-red-600" />Reminder settings</h2><p className="mt-2 text-sm text-muted-foreground">Email reminder delivery depends on your notification settings and configured email service.</p><Button asChild variant="outline" className="mt-4"><Link href="/settings">Open Settings</Link></Button></Card>
      </div>
    </>
  );
}
