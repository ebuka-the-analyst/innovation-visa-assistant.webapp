import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar, Plus, Download, Trash2, Bell, Clock, ChevronRight,
  FileText, AlertTriangle, CheckCircle, RefreshCw, CalendarCheck,
  CalendarDays, ListTodo
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SEOHead } from "@/components/SEOHead";
import { format, addDays, addWeeks, addMonths, isBefore, isAfter, startOfDay } from "date-fns";

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

const defaultDeadlines = [
  {
    title: "Endorsement Application Submitted",
    description: "Initial endorsement application submitted to chosen endorsing body",
    type: "application",
    offsetDays: 0
  },
  {
    title: "Additional Information Due (if requested)",
    description: "Provide any additional information requested by endorser within deadline",
    type: "deadline",
    offsetDays: 14
  },
  {
    title: "Endorsement Decision (expected)",
    description: "Expected decision from endorsing body (usually 4-8 weeks)",
    type: "milestone",
    offsetDays: 42
  },
  {
    title: "Visa Application Submitted",
    description: "Submit visa application within 3 months of endorsement",
    type: "application",
    offsetDays: 56
  },
  {
    title: "Biometrics Appointment",
    description: "Attend biometrics appointment at visa application centre",
    type: "appointment",
    offsetDays: 70
  },
  {
    title: "Visa Decision (expected)",
    description: "Expected visa decision (typically 3-8 weeks after biometrics)",
    type: "milestone",
    offsetDays: 98
  },
  {
    title: "First Contact Point Check (Year 1)",
    description: "First progress report to endorsing body",
    type: "checkpoint",
    offsetDays: 365
  },
  {
    title: "Second Contact Point Check (Year 2)",
    description: "Second progress report to endorsing body",
    type: "checkpoint",
    offsetDays: 730
  },
  {
    title: "Settlement Application Eligible",
    description: "Eligible to apply for Indefinite Leave to Remain after 3 years",
    type: "milestone",
    offsetDays: 1095
  }
];

const eventTypeColors: Record<string, string> = {
  application: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  deadline: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  milestone: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  appointment: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  checkpoint: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  custom: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
};

const eventTypeIcons: Record<string, typeof Calendar> = {
  application: FileText,
  deadline: AlertTriangle,
  milestone: CheckCircle,
  appointment: CalendarCheck,
  checkpoint: ListTodo,
  custom: Calendar
};

function EventCard({ event, onDelete }: { event: CalendarEvent; onDelete: () => void }) {
  const eventDate = new Date(event.startDate);
  const today = startOfDay(new Date());
  const isPast = isBefore(eventDate, today);
  const isUpcoming = !isPast && isBefore(eventDate, addDays(today, 7));
  const IconComponent = eventTypeIcons[event.eventType] || Calendar;

  return (
    <Card className={`hover-elevate ${event.isCompleted ? 'opacity-60' : ''}`} data-testid={`event-card-${event.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${eventTypeColors[event.eventType]}`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className={`font-medium ${event.isCompleted ? 'line-through' : ''}`}>
                {event.title}
              </h3>
              {event.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {event.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className={`text-xs ${eventTypeColors[event.eventType]}`}>
                  {event.eventType}
                </Badge>
                {event.reminder && (
                  <Badge variant="secondary" className="text-xs">
                    <Bell className="w-3 h-3 mr-1" />
                    {event.reminderDays}d reminder
                  </Badge>
                )}
                {isUpcoming && !event.isCompleted && (
                  <Badge className="bg-amber-500 text-white border-none text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Upcoming
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className={`text-lg font-bold ${
              isPast ? 'text-muted-foreground' : 
              isUpcoming ? 'text-amber-500' : 'text-foreground'
            }`}>
              {format(eventDate, 'MMM d')}
            </div>
            <p className="text-xs text-muted-foreground">{format(eventDate, 'yyyy')}</p>
          </div>
        </div>
        <div className="flex justify-end mt-4 gap-2">
          <Button variant="outline" size="sm" onClick={onDelete} data-testid={`button-delete-event-${event.id}`}>
            <Trash2 className="w-4 h-4 mr-1" />
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AddEventDialog({ onAddEvent }: { onAddEvent: (event: any) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("custom");
  const [startDate, setStartDate] = useState("");
  const [reminder, setReminder] = useState(true);
  const [reminderDays, setReminderDays] = useState("7");

  const handleSubmit = () => {
    if (!title.trim() || !startDate) return;
    onAddEvent({
      title: title.trim(),
      description: description.trim() || null,
      eventType,
      startDate,
      reminder,
      reminderDays: reminder ? parseInt(reminderDays) : null
    });
    setOpen(false);
    setTitle("");
    setDescription("");
    setEventType("custom");
    setStartDate("");
    setReminder(true);
    setReminderDays("7");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-add-event">
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Calendar Event</DialogTitle>
          <DialogDescription>
            Add a custom deadline or milestone to track
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="event-title">Title</Label>
            <Input
              id="event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Submit evidence package"
              data-testid="input-event-title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-desc">Description (optional)</Label>
            <Textarea
              id="event-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details..."
              data-testid="textarea-event-description"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event-type">Type</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger id="event-type" data-testid="select-event-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="application">Application</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="milestone">Milestone</SelectItem>
                  <SelectItem value="appointment">Appointment</SelectItem>
                  <SelectItem value="checkpoint">Checkpoint</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-date">Date</Label>
              <Input
                id="event-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                data-testid="input-event-date"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={reminder}
                onChange={(e) => setReminder(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Email reminder</span>
            </label>
            {reminder && (
              <Select value={reminderDays} onValueChange={setReminderDays}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day before</SelectItem>
                  <SelectItem value="3">3 days before</SelectItem>
                  <SelectItem value="7">7 days before</SelectItem>
                  <SelectItem value="14">14 days before</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || !startDate} data-testid="button-save-event">
            Add Event
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CalendarSync() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const { data: events, isLoading, refetch } = useQuery<CalendarEvent[]>({
    queryKey: ['/api/calendar-events'],
    enabled: !!user
  });

  const createEventMutation = useMutation({
    mutationFn: async (event: any) => {
      const response = await apiRequest("POST", "/api/calendar-events", event);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar-events'] });
      toast({ title: "Event added", description: "Calendar event created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add event", variant: "destructive" });
    }
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/calendar-events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar-events'] });
      toast({ title: "Event removed" });
    }
  });

  const addDefaultDeadlines = () => {
    const baseDate = new Date();
    defaultDeadlines.forEach((deadline, index) => {
      setTimeout(() => {
        createEventMutation.mutate({
          title: deadline.title,
          description: deadline.description,
          eventType: deadline.type,
          startDate: addDays(baseDate, deadline.offsetDays).toISOString().split('T')[0],
          reminder: true,
          reminderDays: 7
        });
      }, index * 100);
    });
  };

  const exportToICS = () => {
    window.open('/api/calendar-events/export', '_blank');
  };

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <SEOHead
          title="Calendar Integration | UK Innovator Founder Visa Assistant"
          description="Track your visa application deadlines and milestones with calendar integration."
        />
        <div className="container mx-auto py-8 px-4 max-w-2xl text-center">
          <CalendarDays className="w-16 h-16 mx-auto text-primary mb-4" />
          <h1 className="text-lg font-bold mb-4">Sign In for Calendar Integration</h1>
          <p className="text-muted-foreground mb-6">
            Track your visa deadlines, milestones, and checkpoints with smart reminders.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link href="/login" data-testid="link-login">Sign In</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/signup" data-testid="link-signup">Create Account</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  const allEvents = events || [];
  const upcomingEvents = allEvents.filter(e => 
    isAfter(new Date(e.startDate), startOfDay(new Date())) && !e.isCompleted
  ).slice(0, 5);
  const overdueEvents = allEvents.filter(e => 
    isBefore(new Date(e.startDate), startOfDay(new Date())) && !e.isCompleted
  );

  return (
    <>
      <SEOHead
        title="Calendar Integration | UK Innovator Founder Visa Assistant"
        description="Track your UK Innovator Founder Visa application deadlines, milestones, and checkpoint meetings with smart calendar integration and email reminders."
      />

      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold mb-2 flex items-center gap-3" data-testid="heading-calendar">
              <CalendarDays className="w-8 h-8 text-primary" />
              Calendar & Deadlines
            </h1>
            <p className="text-muted-foreground">
              Track your visa application timeline with smart reminders
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToICS} data-testid="button-export">
              <Download className="w-4 h-4 mr-2" />
              Export ICS
            </Button>
            <AddEventDialog onAddEvent={(event) => createEventMutation.mutate(event)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-primary" data-testid="text-total-events">{allEvents.length}</div>
              <p className="text-sm text-muted-foreground">Total Events</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-amber-500" data-testid="text-upcoming">{upcomingEvents.length}</div>
              <p className="text-sm text-muted-foreground">Upcoming</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-red-500" data-testid="text-overdue">{overdueEvents.length}</div>
              <p className="text-sm text-muted-foreground">Past Due</p>
            </CardContent>
          </Card>
        </div>

        {allEvents.length === 0 && (
          <Card className="mb-6">
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Events Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding the standard visa application timeline
              </p>
              <Button onClick={addDefaultDeadlines} data-testid="button-add-defaults">
                <Plus className="w-4 h-4 mr-2" />
                Add Standard Timeline
              </Button>
            </CardContent>
          </Card>
        )}

        {overdueEvents.length > 0 && (
          <Alert className="mb-6 border-red-500" variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <strong>{overdueEvents.length} past due events</strong> require your attention
            </AlertDescription>
          </Alert>
        )}

        {allEvents.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Your Timeline</h3>
              <Button variant="ghost" size="sm" onClick={() => refetch()} data-testid="button-refresh">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
            <div className="grid gap-4">
              {allEvents
                .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                .map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onDelete={() => deleteEventMutation.mutate(event.id)}
                  />
                ))}
            </div>
          </div>
        )}

        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-500" />
              Smart Reminders
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get email reminders before important deadlines. Make sure your notification 
              preferences are enabled in your profile settings.
            </p>
            <Button variant="outline" asChild>
              <Link href="/profile" data-testid="link-profile-settings">
                Notification Settings <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
