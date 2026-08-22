import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { AlertCircle, BookOpen, Loader2, Mic, Play, Square } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useApplicationContextPrefill } from "@/hooks/useToolPlatform";
import FeatureNavigation from "@/components/FeatureNavigation";

type Scenario = {
  id: string;
  category: string;
  question: string;
  evidenceAvailable: string[];
  preparationPrompt: string;
};

function hasValue(value: unknown) {
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value) && value !== 0;
  return Boolean(value);
}

function evidence(...entries: Array<[string, unknown]>) {
  return entries.filter(([, value]) => hasValue(value)).map(([label]) => label);
}

export default function InterviewPrep() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const contextQuery = useApplicationContextPrefill("interview-prep");
  const plan = contextQuery.data?.businessPlan;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const scenarios = useMemo<Scenario[]>(() => {
    if (!plan) return [];
    const target = plan.targetEndorser ? ` for ${plan.targetEndorser}` : "";
    return [
      {
        id: "innovation",
        category: "Innovation",
        question: `What is genuinely different about ${plan.businessName || "your business"}, and what evidence supports that difference?`,
        evidenceAvailable: evidence(["Uniqueness statement", plan.uniqueness], ["Technology explanation", plan.technology], ["Competitive differentiation", plan.competitiveDifferentiation], ["IP / defensibility", plan.patentStatus]),
        preparationPrompt: "Explain the problem, the specific difference from alternatives, why that difference matters to customers, and which saved evidence supports each claim.",
      },
      {
        id: "validation",
        category: "Market Validation",
        question: "What evidence shows that the target customer actually has this problem and is willing to adopt or pay for your solution?",
        evidenceAvailable: evidence(["Existing customers", plan.existingCustomers], ["Traction evidence", plan.tractionEvidence], ["Customer interviews", plan.customerInterviews], ["Letters of intent", plan.lettersOfIntent], ["Willingness to pay", plan.willingnessToPay]),
        preparationPrompt: "Separate assumptions from evidence. Use actual interview, LOI, usage, sales or other validation data already available in your plan.",
      },
      {
        id: "viability",
        category: "Viability",
        question: "Walk through the key commercial assumptions behind the business and explain how you would respond if growth is slower than expected.",
        evidenceAvailable: evidence(["Monthly projections", plan.monthlyProjections], ["Detailed costs", plan.detailedCosts], ["Funding sources", plan.fundingSources], ["Revenue narrative", plan.revenue]),
        preparationPrompt: "Explain revenue logic, major costs, funding runway and downside actions. Do not quote numbers you cannot trace back to the saved model or plan.",
      },
      {
        id: "scalability",
        category: "Scalability",
        question: "How does the business scale, what has to happen first, and how are hiring or expansion decisions tied to commercial milestones?",
        evidenceAvailable: evidence(["Hiring plan", plan.hiringPlan], ["Job-creation plan", plan.jobCreation], ["Expansion strategy", plan.expansion], ["Target regions", plan.specificRegions], ["International plan", plan.internationalPlan]),
        preparationPrompt: "Describe sequencing, resources and measurable milestones. There is no need to invent a generic job target; explain the plan that your business evidence can support.",
      },
      {
        id: "founder",
        category: "Founder Capability",
        question: "Why are you capable of executing this particular business plan, and where would you need additional expertise?",
        evidenceAvailable: evidence(["Education", plan.founderEducation], ["Work history", plan.founderWorkHistory], ["Achievements", plan.founderAchievements], ["Relevant projects", plan.relevantProjects]),
        preparationPrompt: "Connect specific experience to delivery responsibilities. Acknowledge genuine capability gaps and explain how they will be covered.",
      },
      {
        id: "endorser",
        category: "Endorser Preparation",
        question: `How have you prepared for the endorsement process${target}, including evidence, milestones and ongoing contact points?`,
        evidenceAvailable: evidence(["Target endorser", plan.targetEndorser], ["Contact-point strategy", plan.contactPointsStrategy], ["Supporting evidence", plan.supportingEvidence]),
        preparationPrompt: "Use only current information you have verified about the relevant endorsing body. If its requirements are uncertain, say what must be checked rather than guessing.",
      },
    ];
  }, [plan]);

  const selected = scenarios.find((scenario) => scenario.id === selectedId) || scenarios[0] || null;

  useEffect(() => {
    setAnswerText("");
    setFeedback(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
  }, [selected?.id]);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  const startRecording = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      toast({ title: "Recording is not supported here", description: "Use the written answer box instead.", variant: "destructive" });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setAudioUrl((current) => { if (current) URL.revokeObjectURL(current); return URL.createObjectURL(blob); });
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({ title: "Microphone access failed", description: error instanceof Error ? error.message : "Allow microphone access or use the written answer box.", variant: "destructive" });
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
    setIsRecording(false);
  }, []);

  const reviewAnswer = async () => {
    if (!selected || !answerText.trim()) {
      toast({ title: "Write your answer first", description: "Audio is for self-review. Paste or type the answer you want the AI coach to assess.", variant: "destructive" });
      return;
    }
    setIsReviewing(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: [
            "Act as an interview-preparation coach for the UK Innovator Founder route. Do not give legal advice or predict approval.",
            `Business: ${plan?.businessName || "Not stated"}. Industry: ${plan?.industry || "Not stated"}. Target endorser: ${plan?.targetEndorser || "Not stated"}.`,
            `Question: ${selected.question}`,
            `Evidence currently available in the saved application context: ${selected.evidenceAvailable.join(", ") || "None detected"}.`,
            `Candidate answer: ${answerText.trim()}`,
            "Review the answer for clarity, specificity, consistency with the listed evidence, unsupported claims, missing evidence, and likely follow-up questions. Give a concise improved answer structure, but do not invent facts or numbers.",
          ].join("\n\n"),
          conversationHistory: [],
        }),
      });
      if (!response.ok) throw new Error(`Coaching request failed (${response.status}).`);
      const body = await response.json();
      if (typeof body?.response !== "string" || !body.response.trim()) throw new Error("The coaching service returned no usable feedback.");
      setFeedback(body.response.trim());
    } catch (error) {
      toast({ title: "Coaching feedback unavailable", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    } finally {
      setIsReviewing(false);
    }
  };

  if (contextQuery.isLoading) return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (contextQuery.isError) return <div className="responsive-container py-16"><Card className="mx-auto max-w-2xl border-red-500/30 p-8 text-center"><AlertCircle className="mx-auto h-8 w-8 text-red-600" /><h1 className="mt-3 text-xl font-bold">Interview context could not be loaded</h1><p className="mt-2 text-sm text-muted-foreground">No generic business facts or endorser requirements have been substituted.</p><Button className="mt-5" variant="outline" onClick={() => contextQuery.refetch()}>Retry</Button></Card></div>;
  if (!plan) return <div className="responsive-container py-16"><Card className="mx-auto max-w-2xl p-8 text-center"><AlertCircle className="mx-auto h-8 w-8 text-amber-600" /><h1 className="mt-3 text-xl font-bold">Save a business plan before practising</h1><p className="mt-2 text-sm text-muted-foreground">Interview questions are now personalised from your actual application context rather than a fixed scenario list.</p><Button className="mt-5" onClick={() => setLocation("/questionnaire")}>Open Business Plan Builder</Button></Card></div>;

  return (
    <div className="min-h-screen">
      <div className="responsive-container py-12">
        <div className="mx-auto max-w-6xl">
          <FeatureNavigation currentPage="questionnaire" />
          <div className="mb-8"><span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-300">INTERVIEW PREP</span><h1 className="mt-3 text-xl font-bold">Personalised Interview Practice</h1><p className="mt-2 text-muted-foreground">Questions and evidence prompts generated from <strong>{plan.businessName || "your saved plan"}</strong>. The coach will flag unsupported claims rather than supplying facts for you.</p></div>

          <Tabs defaultValue="scenarios" className="space-y-5">
            <TabsList className="grid w-full grid-cols-3"><TabsTrigger value="scenarios">Questions</TabsTrigger><TabsTrigger value="practice">Practice Answer</TabsTrigger><TabsTrigger value="evidence">Evidence Prompts</TabsTrigger></TabsList>

            <TabsContent value="scenarios">
              <div className="grid gap-5 md:grid-cols-[320px_minmax(0,1fr)]">
                <div className="space-y-2">{scenarios.map((scenario) => <Card key={scenario.id} className={`cursor-pointer p-4 ${selected?.id === scenario.id ? "border-red-500 bg-red-500/5" : "hover:bg-muted/40"}`} onClick={() => setSelectedId(scenario.id)} data-testid={`card-scenario-${scenario.id}`}><p className="text-xs font-semibold text-red-700 dark:text-red-300">{scenario.category}</p><p className="mt-1 text-sm font-medium">{scenario.question}</p></Card>)}</div>
                {selected && <Card className="p-6"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{selected.category}</p><h2 className="mt-2 text-xl font-semibold">{selected.question}</h2><div className="mt-5 rounded-lg border bg-muted/30 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">How to prepare</p><p className="mt-2 text-sm leading-6">{selected.preparationPrompt}</p></div><Button className="mt-5 bg-red-600 hover:bg-red-700" onClick={() => document.querySelector<HTMLButtonElement>('[data-state="inactive"][value="practice"]')?.click()}><Play className="mr-2 h-4 w-4" /> Practise This Question</Button></Card>}
              </div>
            </TabsContent>

            <TabsContent value="practice">
              {selected && <Card className="p-6"><h2 className="font-semibold">{selected.question}</h2><p className="mt-2 text-sm text-muted-foreground">Record yourself for playback, then type or paste the wording you want reviewed. The platform does not pretend an audio transcription succeeded when no transcription service is available.</p><div className="mt-5 flex flex-wrap gap-2"><Button variant={isRecording ? "destructive" : "outline"} onClick={isRecording ? stopRecording : startRecording} data-testid="button-record-response">{isRecording ? <><Square className="mr-2 h-4 w-4" /> Stop Recording</> : <><Mic className="mr-2 h-4 w-4" /> Record for Playback</>}</Button>{audioUrl && <audio controls src={audioUrl} className="h-10 max-w-full" />}</div><Textarea className="mt-5 min-h-[180px]" value={answerText} onChange={(event) => setAnswerText(event.target.value)} placeholder="Type or paste your spoken answer here for evidence-aware feedback..." /><Button className="mt-4 w-full bg-red-600 hover:bg-red-700" onClick={reviewAnswer} disabled={isReviewing}>{isReviewing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Reviewing...</> : "Review My Answer"}</Button>{feedback && <div className="prose prose-sm mt-6 max-w-none rounded-lg border p-5 dark:prose-invert"><p className="whitespace-pre-wrap">{feedback}</p></div>}</Card>}
            </TabsContent>

            <TabsContent value="evidence">
              {selected && <Card className="p-6"><div className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-red-600" /><h2 className="font-semibold">Evidence currently available for this answer</h2></div>{selected.evidenceAvailable.length ? <div className="mt-4 flex flex-wrap gap-2">{selected.evidenceAvailable.map((item) => <span key={item} className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-700 dark:text-emerald-300">{item}</span>)}</div> : <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-sm">No supporting signal was detected in the saved plan for this question. Avoid making unsupported claims in practice.</div>}<div className="mt-5 flex flex-wrap gap-2"><Button variant="outline" onClick={() => setLocation("/evidence-graph")}>Open Evidence Graph</Button><Button variant="outline" onClick={() => setLocation("/documents")}>Manage Documents</Button></div></Card>}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
