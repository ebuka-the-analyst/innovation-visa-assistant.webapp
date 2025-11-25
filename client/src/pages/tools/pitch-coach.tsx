import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { ToolAccessGuard } from "@/components/ToolAccessGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertTriangle, Timer, Mic, MessageSquare } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { SEOHead } from "@/components/SEOHead";
import { organizationSchema, createBreadcrumbSchema, createArticleSchema } from "@/lib/seo-schemas";
import { useWordExport } from "@/hooks/useWordExport";
import { useToast } from "@/hooks/use-toast";

type PitchDuration = '30s' | '3min' | '10min' | '20min';

type PitchScript = {
  duration: PitchDuration;
  content: string;
  keyPoints: string[];
  completed: boolean;
  lastPracticed: string;
};

type PracticeSession = {
  id: string;
  date: string;
  duration: PitchDuration;
  actualTime: number;
  targetTime: number;
  confidenceLevel: number;
  strengths: string;
  weaknesses: string;
  notes: string;
};

type QAItem = {
  id: string;
  question: string;
  answer: string;
  evidence: string;
  prepared: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
};

type DeliveryTip = {
  id: string;
  category: 'body-language' | 'voice' | 'timing' | 'content' | 'visual-aids' | 'engagement';
  tip: string;
  mastered: boolean;
};

type PresentationMaterial = {
  id: string;
  name: string;
  type: 'slide-deck' | 'handout' | 'demo' | 'video' | 'prototype' | 'data-sheet';
  prepared: boolean;
  reviewed: boolean;
};

const PITCH_DURATION_INFO: Record<PitchDuration, { name: string; targetSeconds: number; context: string }> = {
  '30s': { name: '30-Second Elevator Pitch', targetSeconds: 30, context: 'Quick networking introduction or chance encounter' },
  '3min': { name: '3-Minute Pitch', targetSeconds: 180, context: 'Initial endorser meeting or screening call' },
  '10min': { name: '10-Minute Presentation', targetSeconds: 600, context: 'Detailed endorser interview or panel presentation' },
  '20min': { name: '20-Minute Full Pitch', targetSeconds: 1200, context: 'Comprehensive pitch with Q&A time' },
};

const COMMON_QA_QUESTIONS: Omit<QAItem, 'answer' | 'evidence' | 'prepared'>[] = [
  { id: 'q1', question: 'What problem does your business solve?', difficulty: 'easy' },
  { id: 'q2', question: 'Who are your target customers and what is your market size?', difficulty: 'medium' },
  { id: 'q3', question: 'How is your solution innovative compared to existing alternatives?', difficulty: 'medium' },
  { id: 'q4', question: 'What is your business model and revenue strategy?', difficulty: 'medium' },
  { id: 'q5', question: 'What traction have you achieved so far?', difficulty: 'medium' },
  { id: 'q6', question: 'Who are your key team members and what relevant experience do they have?', difficulty: 'easy' },
  { id: 'q7', question: 'What are your financial projections for the next 3 years?', difficulty: 'hard' },
  { id: 'q8', question: 'How will you use the £50,000 investment?', difficulty: 'medium' },
  { id: 'q9', question: 'What are the key risks and how will you mitigate them?', difficulty: 'hard' },
  { id: 'q10', question: 'Why the UK specifically? What makes it the right market for your business?', difficulty: 'medium' },
  { id: 'q11', question: 'How many jobs will you create in the UK over the next 3 years?', difficulty: 'easy' },
  { id: 'q12', question: 'What is your competitive advantage and how defensible is it?', difficulty: 'hard' },
  { id: 'q13', question: 'Do you have any intellectual property or patents?', difficulty: 'medium' },
  { id: 'q14', question: 'What are your key milestones for the next 12-24 months?', difficulty: 'medium' },
  { id: 'q15', question: 'How will you scale the business?', difficulty: 'hard' },
];

const DELIVERY_TIPS: Omit<DeliveryTip, 'mastered'>[] = [
  { id: 't1', category: 'body-language', tip: 'Maintain steady eye contact with panel members, rotating attention naturally' },
  { id: 't2', category: 'body-language', tip: 'Use open hand gestures to emphasize key points and convey confidence' },
  { id: 't3', category: 'body-language', tip: 'Stand or sit upright with shoulders back to project authority and preparation' },
  { id: 't4', category: 'voice', tip: 'Vary your tone and pace to maintain engagement and emphasize important information' },
  { id: 't5', category: 'voice', tip: 'Pause strategically after key statements to let information sink in' },
  { id: 't6', category: 'voice', tip: 'Project your voice clearly without shouting, ensuring everyone can hear comfortably' },
  { id: 't7', category: 'timing', tip: 'Practice with a timer until you can deliver consistently within your target time' },
  { id: 't8', category: 'timing', tip: 'Allocate time proportionally: 40% problem/solution, 30% business model, 20% team, 10% ask' },
  { id: 't9', category: 'timing', tip: 'Build in buffer time for interruptions or clarifying questions during presentation' },
  { id: 't10', category: 'content', tip: 'Lead with your strongest value proposition in the first 30 seconds' },
  { id: 't11', category: 'content', tip: 'Use specific numbers and data points rather than vague qualitative statements' },
  { id: 't12', category: 'content', tip: 'Tell a compelling story that connects emotionally while remaining professional' },
  { id: 't13', category: 'visual-aids', tip: 'Keep slides minimal with large fonts and high-contrast colors for readability' },
  { id: 't14', category: 'visual-aids', tip: 'Use charts and visuals to illustrate complex data rather than text-heavy slides' },
  { id: 't15', category: 'visual-aids', tip: 'Have backup materials ready in case technical issues prevent screen sharing' },
  { id: 't16', category: 'engagement', tip: 'Read the room and adjust your energy level to match panel engagement' },
  { id: 't17', category: 'engagement', tip: 'Invite questions at natural transition points rather than only at the end' },
  { id: 't18', category: 'engagement', tip: 'Acknowledge feedback positively and show flexibility in your thinking' },
];

const PRESENTATION_MATERIALS: Omit<PresentationMaterial, 'prepared' | 'reviewed'>[] = [
  { id: 'm1', name: 'Pitch Deck (10-15 slides maximum)', type: 'slide-deck' },
  { id: 'm2', name: 'One-Page Executive Summary', type: 'handout' },
  { id: 'm3', name: 'Product Demo or Prototype', type: 'demo' },
  { id: 'm4', name: 'Financial Projections Summary', type: 'data-sheet' },
  { id: 'm5', name: 'Market Research Data Sheet', type: 'data-sheet' },
  { id: 'm6', name: 'Team Credentials Document', type: 'handout' },
  { id: 'm7', name: 'Customer Testimonial Video (if available)', type: 'video' },
  { id: 'm8', name: 'Technology Stack Overview', type: 'data-sheet' },
];

export default function PitchCoach() {
  const { generateWord } = useWordExport();
  const { toast } = useToast();
  const [pitchScripts, setPitchScripts] = useState<PitchScript[]>([
    { duration: '30s', content: '', keyPoints: [], completed: false, lastPracticed: '' },
    { duration: '3min', content: '', keyPoints: [], completed: false, lastPracticed: '' },
    { duration: '10min', content: '', keyPoints: [], completed: false, lastPracticed: '' },
    { duration: '20min', content: '', keyPoints: [], completed: false, lastPracticed: '' },
  ]);

  const [practiceSessions, setPracticeSessions] = useState<PracticeSession[]>([]);
  const [qaItems, setQaItems] = useState<QAItem[]>(
    COMMON_QA_QUESTIONS.map(q => ({ ...q, answer: '', evidence: '', prepared: false }))
  );
  const [deliveryTips, setDeliveryTips] = useState<DeliveryTip[]>(
    DELIVERY_TIPS.map(t => ({ ...t, mastered: false }))
  );
  const [materials, setMaterials] = useState<PresentationMaterial[]>(
    PRESENTATION_MATERIALS.map(m => ({ ...m, prepared: false, reviewed: false }))
  );

  const [activeTab, setActiveTab] = useState('scripts');
  const [savedDate, setSavedDate] = useState('');
  const [showTips, setShowTips] = useState(false);
  const [showActionPlan, setShowActionPlan] = useState(false);
  const [selectedPitchDuration, setSelectedPitchDuration] = useState<PitchDuration>('3min');

  const updatePitchScript = (duration: PitchDuration, field: keyof PitchScript, value: any) => {
    setPitchScripts(pitchScripts.map(p => p.duration === duration ? { ...p, [field]: value } : p));
  };

  const addPracticeSession = () => {
    const newSession: PracticeSession = {
      id: `ps-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      duration: selectedPitchDuration,
      actualTime: 0,
      targetTime: PITCH_DURATION_INFO[selectedPitchDuration].targetSeconds,
      confidenceLevel: 5,
      strengths: '',
      weaknesses: '',
      notes: '',
    };
    setPracticeSessions([...practiceSessions, newSession]);
  };

  const updatePracticeSession = (id: string, field: keyof PracticeSession, value: any) => {
    setPracticeSessions(practiceSessions.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removePracticeSession = (id: string) => {
    setPracticeSessions(practiceSessions.filter(s => s.id !== id));
  };

  const updateQAItem = (id: string, field: keyof QAItem, value: any) => {
    setQaItems(qaItems.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const toggleDeliveryTip = (id: string) => {
    setDeliveryTips(deliveryTips.map(t => t.id === id ? { ...t, mastered: !t.mastered } : t));
  };

  const updateMaterial = (id: string, field: keyof PresentationMaterial, value: any) => {
    setMaterials(materials.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const completedScripts = pitchScripts.filter(p => p.completed).length;
  const totalScripts = pitchScripts.length;
  const scriptsWithContent = pitchScripts.filter(p => p.content.length > 100).length;
  const totalPracticeSessions = practiceSessions.length;
  const recentPracticeSessions = practiceSessions.filter(s => {
    const sessionDate = new Date(s.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sessionDate >= weekAgo;
  }).length;
  const preparedQA = qaItems.filter(q => q.prepared).length;
  const totalQA = qaItems.length;
  const qaWithAnswers = qaItems.filter(q => q.answer.length > 50).length;
  const masteredTips = deliveryTips.filter(t => t.mastered).length;
  const totalTips = deliveryTips.length;
  const preparedMaterials = materials.filter(m => m.prepared).length;
  const totalMaterials = materials.length;
  const reviewedMaterials = materials.filter(m => m.reviewed).length;

  const avgConfidence = practiceSessions.length > 0
    ? Math.round(practiceSessions.reduce((sum, s) => sum + s.confidenceLevel, 0) / practiceSessions.length)
    : 0;

  const timingAccuracy = practiceSessions.length > 0
    ? Math.round(
        practiceSessions.reduce((sum, s) => {
          const deviation = Math.abs(s.actualTime - s.targetTime);
          const accuracy = Math.max(0, 100 - (deviation / s.targetTime) * 100);
          return sum + accuracy;
        }, 0) / practiceSessions.length
      )
    : 0;

  const pitchReadinessScore = Math.round(
    ((completedScripts / totalScripts) * 20) +
    ((scriptsWithContent / totalScripts) * 15) +
    ((totalPracticeSessions >= 5 ? 5 : totalPracticeSessions) * 3) +
    ((preparedQA / totalQA) * 20) +
    ((qaWithAnswers / totalQA) * 15) +
    ((masteredTips / totalTips) * 10) +
    ((preparedMaterials / totalMaterials) * 10) +
    ((avgConfidence / 10) * 5) +
    ((timingAccuracy / 100) * 5)
  );

  const getReadinessLevel = () => {
    if (pitchReadinessScore >= 90) return { label: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950' };
    if (pitchReadinessScore >= 75) return { label: 'Strong', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950' };
    if (pitchReadinessScore >= 60) return { label: 'Good', color: 'text-yellow-600', bgColor: 'bg-yellow-50 dark:bg-yellow-950' };
    if (pitchReadinessScore >= 40) return { label: 'Developing', color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-950' };
    return { label: 'Needs Work', color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-950' };
  };

  const readinessLevel = getReadinessLevel();

  const radarData = [
    { category: 'Content', score: Math.round(((scriptsWithContent / totalScripts) * 100)) },
    { category: 'Delivery', score: Math.round(((masteredTips / totalTips) * 100)) },
    { category: 'Timing', score: timingAccuracy },
    { category: 'Q&A Prep', score: Math.round(((qaWithAnswers / totalQA) * 100)) },
    { category: 'Materials', score: Math.round(((preparedMaterials / totalMaterials) * 100)) },
    { category: 'Confidence', score: avgConfidence * 10 },
  ];

  const practiceProgressData = practiceSessions
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((session, index) => ({
      session: `Session ${index + 1}`,
      confidence: session.confidenceLevel,
      timingAccuracy: Math.max(0, 100 - Math.abs((session.actualTime - session.targetTime) / session.targetTime) * 100),
      date: session.date,
    }));

  const weakPointsData = [
    { name: 'Content Gaps', value: totalScripts - scriptsWithContent, color: '#ef4444' },
    { name: 'Practice Needed', value: Math.max(0, 5 - totalPracticeSessions), color: '#f59e0b' },
    { name: 'Q&A Unprepared', value: totalQA - qaWithAnswers, color: '#eab308' },
    { name: 'Tips Not Mastered', value: totalTips - masteredTips, color: '#f97316' },
    { name: 'Materials Missing', value: totalMaterials - preparedMaterials, color: '#dc2626' },
  ].filter(item => item.value > 0);

  const getSerializedState = () => {
    return {
      pitchScripts,
      practiceSessions,
      qaItems,
      deliveryTips,
      materials,
      activeTab,
      selectedPitchDuration,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('pitchScripts' in state) setPitchScripts(state.pitchScripts);
    if ('practiceSessions' in state) setPracticeSessions(state.practiceSessions);
    if ('qaItems' in state) setQaItems(state.qaItems);
    if ('deliveryTips' in state) setDeliveryTips(state.deliveryTips);
    if ('materials' in state) setMaterials(state.materials);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('selectedPitchDuration' in state) setSelectedPitchDuration(state.selectedPitchDuration);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const handoffKey = 'pitch-coach_handoff';
    const handoffData = localStorage.getItem(handoffKey);
    
    if (handoffData) {
      try {
        const payload = JSON.parse(handoffData);
        restoreSerializedState(payload);
        localStorage.removeItem(handoffKey);
      } catch (err) {
        console.error('Failed to restore handoff data:', err);
      }
    } else {
      const saved = localStorage.getItem('pitch-coach-state');
      if (saved) {
        const state = JSON.parse(saved);
        restoreSerializedState(state);
      }
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('pitch-coach-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('pitch-coach-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];

    if (pitchReadinessScore < 40) {
      tips.push("Start by writing your 3-minute pitch first - it is the most commonly used format for endorser meetings");
    }

    if (scriptsWithContent < 2) {
      tips.push("Develop multiple pitch lengths - you never know how much time you will actually have");
    }

    if (totalPracticeSessions < 3) {
      tips.push("Practice at least 5 times before your endorser meeting - muscle memory matters for confident delivery");
    }

    if (avgConfidence < 7 && practiceSessions.length > 0) {
      tips.push("Low confidence indicates more practice needed - record yourself and review to build comfort");
    }

    if (timingAccuracy < 70 && practiceSessions.length > 0) {
      tips.push("Your timing is inconsistent - practice with a visible timer and pace yourself more deliberately");
    }

    if (qaWithAnswers < totalQA * 0.6) {
      tips.push("Prepare answers to at least 80% of common questions - endorsers will probe your preparedness");
    }

    if (masteredTips < totalTips * 0.5) {
      tips.push("Focus on mastering delivery fundamentals - content means nothing if delivery undermines credibility");
    }

    if (preparedMaterials < totalMaterials * 0.7) {
      tips.push("Ensure all presentation materials are prepared and reviewed at least 3 days before the pitch");
    }

    const weakestArea = radarData.reduce((min, item) => item.score < min.score ? item : min);
    if (weakestArea.score < 60) {
      tips.push(`Your weakest area is ${weakestArea.category} at ${weakestArea.score}% - prioritize improving this first`);
    }

    if (pitchReadinessScore >= 75) {
      tips.push("Strong preparation - now focus on polish and confidence through repeated practice with feedback");
    }

    tips.push("Practice your pitch in front of someone unfamiliar with your business - fresh perspectives reveal gaps");
    tips.push("Prepare for interruptions - endorsers often ask clarifying questions mid-pitch, practice handling this smoothly");

    return tips.slice(0, 10);
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Write all four pitch script versions (30s, 3min, 10min, 20min) with clear structure", priority: "Critical" },
      { week: "Week 1", action: "Identify 5-7 key points that must be in every pitch regardless of duration", priority: "High" },
      { week: "Week 1-2", action: "Practice each pitch version at least twice with a timer to establish baseline", priority: "Critical" },
      { week: "Week 2", action: "Prepare comprehensive answers to all 15 common endorser questions with evidence", priority: "Critical" },
      { week: "Week 2", action: "Create or finalize all presentation materials (pitch deck, handouts, demos)", priority: "Critical" },
      { week: "Week 2-3", action: "Conduct at least 3 practice sessions per week, recording each for self-review", priority: "High" },
      { week: "Week 3", action: "Get feedback from mentor, advisor, or colleague on pitch delivery and content", priority: "Critical" },
      { week: "Week 3", action: "Master delivery fundamentals - eye contact, gestures, pacing, voice modulation", priority: "High" },
      { week: "Week 3-4", action: "Practice handling difficult questions and interruptions gracefully", priority: "High" },
      { week: "Week 4", action: "Do final run-throughs with all materials in presentation mode", priority: "Critical" },
      { week: "Week 4", action: "Prepare backup materials and contingency plans for technical issues", priority: "Medium" },
      { week: "Week 4", action: "Rest well before pitch day - confidence comes from preparation, not cramming", priority: "Critical" },
    ];
  };

  const handleExportPdf = () => {
    const report = `ENDORSER PITCH COACHING REPORT
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

PITCH READINESS SUMMARY
${'-'.repeat(80)}
Overall Readiness Score: ${pitchReadinessScore}%
Readiness Level: ${readinessLevel.label}
Scripts Completed: ${completedScripts}/${totalScripts}
Scripts with Full Content: ${scriptsWithContent}/${totalScripts}
Total Practice Sessions: ${totalPracticeSessions}
Recent Practice Sessions (Last 7 Days): ${recentPracticeSessions}
Average Confidence Level: ${avgConfidence}/10
Timing Accuracy: ${timingAccuracy}%
Q&A Items Prepared: ${preparedQA}/${totalQA}
Q&A with Complete Answers: ${qaWithAnswers}/${totalQA}
Delivery Tips Mastered: ${masteredTips}/${totalTips}
Presentation Materials Prepared: ${preparedMaterials}/${totalMaterials}
Materials Reviewed: ${reviewedMaterials}/${totalMaterials}

READINESS BREAKDOWN BY CATEGORY
${'-'.repeat(80)}
${radarData.map(item => `${item.category}: ${item.score}%`).join('\n')}

PITCH SCRIPTS STATUS
${'-'.repeat(80)}
${pitchScripts.map(script => {
  const info = PITCH_DURATION_INFO[script.duration];
  return '\n' + info.name + '\n' +
'Target Duration: ' + info.targetSeconds + ' seconds\n' +
'Context: ' + info.context + '\n' +
'Status: ' + (script.completed ? 'COMPLETED' : 'IN PROGRESS') + '\n' +
'Content Length: ' + script.content.length + ' characters\n' +
'Last Practiced: ' + (script.lastPracticed || 'Never') + '\n' +
'Key Points: ' + (script.keyPoints.length > 0 ? script.keyPoints.join(', ') : 'Not defined') + '\n\n' +
(script.content ? 'SCRIPT CONTENT:\n' + script.content + '\n' : 'Script not yet written\n');
}).join('\n' + '-'.repeat(80) + '\n')}

PRACTICE SESSIONS LOG
${'-'.repeat(80)}
${practiceSessions.length > 0 ? practiceSessions.map((session, i) => {
  const info = PITCH_DURATION_INFO[session.duration];
  const timingDiff = session.actualTime - session.targetTime;
  return '\nSession ' + (i + 1) + ' - ' + session.date + '\n' +
'Pitch Duration: ' + info.name + '\n' +
'Target Time: ' + session.targetTime + ' seconds\n' +
'Actual Time: ' + session.actualTime + ' seconds\n' +
'Timing Variance: ' + (timingDiff > 0 ? '+' : '') + timingDiff + ' seconds\n' +
'Confidence Level: ' + session.confidenceLevel + '/10\n\n' +
'Strengths:\n' + (session.strengths || 'Not recorded') + '\n\n' +
'Weaknesses:\n' + (session.weaknesses || 'Not recorded') + '\n\n' +
'Notes:\n' + (session.notes || 'No additional notes');
}).join('\n' + '-'.repeat(80) + '\n') : 'No practice sessions recorded yet'}

Q&A PREPARATION STATUS
${'-'.repeat(80)}
${qaItems.map((qa, i) => '\n' + (i + 1) + '. [' + qa.difficulty.toUpperCase() + '] ' + qa.question + '\n' +
'Status: ' + (qa.prepared ? 'PREPARED' : 'NOT PREPARED') + '\n' +
'Answer Length: ' + qa.answer.length + ' characters\n' +
'Evidence: ' + (qa.evidence.length > 0 ? 'PROVIDED' : 'MISSING') + '\n\n' +
(qa.answer ? 'ANSWER:\n' + qa.answer + '\n' : 'Answer not yet prepared\n') +
(qa.evidence ? 'EVIDENCE:\n' + qa.evidence + '\n' : 'Evidence not yet documented\n')
).join('\n' + '-'.repeat(80) + '\n')}

DELIVERY TIPS MASTERY CHECKLIST
${'-'.repeat(80)}
${Object.entries(
  deliveryTips.reduce((acc, tip) => {
    if (!acc[tip.category]) acc[tip.category] = [];
    acc[tip.category].push(tip);
    return acc;
  }, {} as Record<string, DeliveryTip[]>)
).map(([category, tips]) => '\n' + category.toUpperCase().replace(/-/g, ' ') + ':\n' +
tips.map(t => (t.mastered ? '[X]' : '[ ]') + ' ' + t.tip).join('\n') + '\n'
).join('\n')}

PRESENTATION MATERIALS CHECKLIST
${'-'.repeat(80)}
${materials.map(m => '\n' + (m.prepared ? '[X]' : '[ ]') + ' ' + m.name + '\n' +
'Type: ' + m.type.replace(/-/g, ' ').toUpperCase() + '\n' +
'Reviewed: ' + (m.reviewed ? 'YES' : 'NO') + '\n'
).join('')}

ENDORSER PRESENTATION BEST PRACTICES
${'-'.repeat(80)}
1. STRUCTURE YOUR PITCH
   - Hook (15 seconds): Grab attention with compelling problem statement
   - Problem (20%): Clearly articulate the pain point you are addressing
   - Solution (30%): Explain your innovative approach and how it works
   - Market (15%): Demonstrate market size and opportunity
   - Business Model (15%): Show how you will make money
   - Traction (10%): Prove you can execute with evidence
   - Team (5%): Highlight relevant expertise and credibility
   - Ask (5%): Clear call to action for endorsement

2. DELIVERY EXCELLENCE
   - Practice until comfortable, not memorized - you want natural delivery
   - Maintain eye contact with all panel members, not just the senior person
   - Use strategic pauses after key points to emphasize importance
   - Speak at a measured pace - nervous speakers rush, confident ones control timing
   - Vary your tone to maintain engagement and emphasize critical information
   - Use hand gestures naturally to illustrate concepts and show passion

3. HANDLING Q&A
   - Listen fully to each question before answering - do not interrupt
   - Pause briefly before responding to show thoughtfulness
   - Reframe hostile questions neutrally before addressing them
   - If you do not know an answer, admit it and offer to follow up
   - Use the STAR method: Situation, Task, Action, Result for storytelling
   - Bridge back to your key messages when opportunities arise

4. VISUAL AIDS EFFECTIVENESS
   - One idea per slide - avoid cluttered, text-heavy presentations
   - Use high-contrast colors and large fonts (minimum 24pt)
   - Leverage charts and diagrams to explain complex concepts quickly
   - Animate transitions sparingly - focus on content, not effects
   - Have printed backup materials in case of technical failures
   - Practice with your actual presentation setup before the real pitch

5. CONFIDENCE BUILDING
   - Arrive early to acclimate to the environment and test equipment
   - Dress professionally in business attire appropriate for the setting
   - Bring physical copies of all critical documents as backup
   - Take slow, deep breaths before entering to calm nerves
   - Remember: endorsers want to approve you - show them you are ready
   - View tough questions as opportunities to demonstrate depth of knowledge

6. POST-PITCH FOLLOW-UP
   - Send thank-you email within 24 hours reiterating key points
   - Address any unanswered questions or information requests promptly
   - Provide additional materials if relevant questions emerged
   - Maintain professional communication throughout decision period

SMART TIPS & RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => (i + 1) + '. ' + tip).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => '[' + item.priority + '] ' + item.week + ': ' + item.action).join('\n')}

PITCH DAY PREPARATION CHECKLIST
${'-'.repeat(80)}
Materials to Bring:
- Laptop with pitch deck loaded and tested
- Backup pitch deck on USB drive
- Printed pitch deck copies for all panel members
- One-page executive summary handouts
- Business plan hard copy
- Financial projections printout
- Product demo ready (if applicable)
- All evidence documents organized in folder
- Power adapter and any necessary cables/adapters
- Phone fully charged with backup slides accessible

Mental Preparation:
- Full night of sleep before pitch day
- Light meal 1-2 hours before to maintain energy
- Review key talking points (not full script memorization)
- Visualize successful pitch delivery
- Prepare confident, enthusiastic mindset
- Plan route and arrive 20 minutes early

During the Pitch:
- Greet each panel member professionally
- Maintain positive, confident body language throughout
- Speak clearly and at measured pace
- Make eye contact with all panel members
- Listen actively to questions before responding
- Stay flexible if discussion goes off planned structure
- Thank panel genuinely at conclusion

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pitch-coach-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportWord = async () => {
    await generateWord({
      title: 'Endorser Pitch Coaching Report',
      subtitle: 'Comprehensive Pitch Preparation for UK Innovator Founder Visa',
      filename: `pitch-coach-report-${new Date().toISOString().split('T')[0]}`,
      sections: [
        { type: 'heading', content: 'Pitch Readiness Summary', level: 1 },
        { type: 'score', score: { value: pitchReadinessScore, max: 100, label: 'Overall Readiness' } },
        { type: 'table', tableData: {
          headers: ['Metric', 'Value'],
          rows: [
            ['Readiness Level', readinessLevel.label],
            ['Scripts Completed', `${completedScripts}/${totalScripts}`],
            ['Scripts with Content', `${scriptsWithContent}/${totalScripts}`],
            ['Practice Sessions', `${totalPracticeSessions}`],
            ['Average Confidence', `${avgConfidence}/10`],
            ['Timing Accuracy', `${timingAccuracy}%`],
            ['Q&A Prepared', `${preparedQA}/${totalQA}`],
            ['Delivery Tips Mastered', `${masteredTips}/${totalTips}`],
            ['Materials Prepared', `${preparedMaterials}/${totalMaterials}`],
          ]
        }},
        { type: 'divider' },
        { type: 'heading', content: 'Readiness Breakdown', level: 1 },
        { type: 'table', tableData: {
          headers: ['Category', 'Score'],
          rows: radarData.map(item => [item.category, `${item.score}%`])
        }},
        { type: 'divider' },
        { type: 'heading', content: 'Pitch Scripts Status', level: 1 },
        { type: 'table', tableData: {
          headers: ['Duration', 'Status', 'Content Length', 'Last Practiced'],
          rows: pitchScripts.map(script => {
            const info = PITCH_DURATION_INFO[script.duration];
            return [
              info.name,
              script.completed ? 'Completed' : 'In Progress',
              `${script.content.length} chars`,
              script.lastPracticed || 'Never'
            ];
          })
        }},
        { type: 'divider' },
        { type: 'heading', content: 'Q&A Preparation Status', level: 1 },
        { type: 'table', tableData: {
          headers: ['Question', 'Difficulty', 'Status'],
          rows: qaItems.slice(0, 10).map(qa => [
            qa.question.substring(0, 50) + '...',
            qa.difficulty.toUpperCase(),
            qa.prepared ? 'Prepared' : 'Not Prepared'
          ])
        }},
        { type: 'divider' },
        { type: 'heading', content: 'Smart Tips', level: 1 },
        { type: 'list', items: getSmartTips().slice(0, 8) },
        { type: 'divider' },
        { type: 'heading', content: 'Action Plan', level: 1 },
        { type: 'table', tableData: {
          headers: ['Week', 'Action', 'Priority'],
          rows: generateActionPlan().slice(0, 8).map(item => [item.week, item.action, item.priority])
        }},
      ],
      metadata: {
        subject: 'Endorser Pitch Coaching Report',
        keywords: ['pitch', 'endorser', 'visa', 'presentation'],
      }
    });
    toast({
      title: "Word Document Exported Successfully",
      description: "Your document has been downloaded as a Word document (.docx).",
    });
  };

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "https://innovatorfoundervisaassistant.co.uk/" },
    { name: "Tools Hub", url: "https://innovatorfoundervisaassistant.co.uk/tools-hub" },
    { name: "Pitch Practice Coach", url: "https://innovatorfoundervisaassistant.co.uk/tools/pitch-coach" }
  ]);

  const articleSchema = createArticleSchema(
    "Endorser Pitch Practice Coach for UK Innovator Founder Visa",
    "Master your endorsement pitch with practice scripts, Q&A prep, delivery coaching, and practice session tracking. Perfect your 30-second to 20-minute presentations.",
    "2025-11-24"
  );

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [organizationSchema, breadcrumbSchema, articleSchema]
  };

  return (
    <ToolAccessGuard requiredTier="enterprise" toolName="Pitch Practice Coach">
      <SEOHead
        title="Endorser Pitch Coach | UK Innovator Founder Visa Interview Prep"
        description="Practice and perfect your endorser pitch for UK Innovator Founder Visa applications. Includes 30s to 20-minute scripts, Q&A preparation, delivery coaching, and progress tracking."
        canonical="https://innovatorfoundervisaassistant.co.uk/tools/pitch-coach"
        keywords="endorser pitch practice, UK visa interview prep, innovator visa presentation, pitch coaching, endorsement interview preparation"
        schema={combinedSchema}
      />
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          <ToolNavigation />
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-pitch-coach">
              Endorser Pitch Coach
            </h1>
            <p className="text-lg text-muted-foreground">
              Master your pitch delivery with practice tracking, Q&A prep, and delivery coaching
            </p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2" data-testid="text-saved-date">
                Last saved: {savedDate}
              </p>
            )}
          </div>

          <ToolUtilityBar
            toolId="pitch-coach"
            toolName="Pitch Coach"
            onSave={handleSave}
            onRestore={handleRestore}
            onExportPdf={handleExportPdf}
            onExportWord={handleExportWord}
            onSmartTips={() => setShowTips(!showTips)}
            onActionPlan={() => setShowActionPlan(!showActionPlan)}
            getSerializedState={getSerializedState}
          />

          {showTips && (
            <Card className="mb-6 border-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Smart Tips & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getSmartTips().map((tip, index) => (
                    <div key={index} className="flex items-start gap-3" data-testid={`tip-${index}`}>
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400">
                        {index + 1}
                      </div>
                      <p className="text-sm text-foreground">{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {showActionPlan && (
            <Card className="mb-6 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  4-Week Pitch Preparation Action Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {generateActionPlan().map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50" data-testid={`action-${index}`}>
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                          item.priority === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                          item.priority === 'High' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.week}</p>
                        <p className="text-sm text-muted-foreground mt-1">{item.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Pitch Readiness</p>
                  <p className="text-3xl font-bold text-primary" data-testid="text-readiness-score">{pitchReadinessScore}%</p>
                  <Progress value={pitchReadinessScore} className="mt-2" />
                  <p className={`text-sm mt-2 font-semibold ${readinessLevel.color}`} data-testid="text-readiness-level">
                    {readinessLevel.label}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Practice Sessions</p>
                  <p className="text-3xl font-bold" data-testid="text-practice-sessions">{totalPracticeSessions}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{recentPracticeSessions} this week</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Avg Confidence</p>
                  <p className="text-3xl font-bold" data-testid="text-avg-confidence">{avgConfidence}/10</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Mic className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Timing: {timingAccuracy}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Q&A Prepared</p>
                  <p className="text-3xl font-bold" data-testid="text-qa-prepared">{preparedQA}/{totalQA}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{Math.round((preparedQA/totalQA)*100)}% ready</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-pitch-coach">
              <TabsTrigger value="scripts" data-testid="tab-scripts">Pitch Scripts</TabsTrigger>
              <TabsTrigger value="practice" data-testid="tab-practice">Practice Log</TabsTrigger>
              <TabsTrigger value="qa" data-testid="tab-qa">Q&A Prep</TabsTrigger>
              <TabsTrigger value="delivery" data-testid="tab-delivery">Delivery Tips</TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="scripts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pitch Script Development</CardTitle>
                  <CardDescription>Prepare multiple pitch versions for different time constraints</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {pitchScripts.map((script) => {
                    const info = PITCH_DURATION_INFO[script.duration];
                    return (
                      <Card key={script.duration} className={script.completed ? "border-green-500" : ""}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">{info.name}</CardTitle>
                              <CardDescription>Target: {info.targetSeconds} seconds - {info.context}</CardDescription>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={script.completed}
                                onChange={(e) => updatePitchScript(script.duration, 'completed', e.target.checked)}
                                className="h-4 w-4"
                                data-testid={`checkbox-script-completed-${script.duration}`}
                              />
                              <span className="text-sm font-medium">Completed</span>
                            </label>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label htmlFor={`script-content-${script.duration}`}>Pitch Script</Label>
                            <Textarea
                              id={`script-content-${script.duration}`}
                              value={script.content}
                              onChange={(e) => updatePitchScript(script.duration, 'content', e.target.value)}
                              placeholder={`Write your ${info.name.toLowerCase()} here... Focus on problem, solution, market, and ask.`}
                              className="min-h-32"
                              data-testid={`textarea-script-${script.duration}`}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {script.content.length} characters - Estimated {Math.round(script.content.split(' ').length / 150 * 60)} seconds
                            </p>
                          </div>

                          <div>
                            <Label htmlFor={`script-points-${script.duration}`}>Key Points (comma-separated)</Label>
                            <Input
                              id={`script-points-${script.duration}`}
                              value={script.keyPoints.join(', ')}
                              onChange={(e) => updatePitchScript(script.duration, 'keyPoints', e.target.value.split(',').map(p => p.trim()).filter(Boolean))}
                              placeholder="Problem statement, Solution innovation, Market size, Ask for endorsement"
                              data-testid={`input-key-points-${script.duration}`}
                            />
                          </div>

                          {script.lastPracticed && (
                            <Alert>
                              <CheckCircle2 className="h-4 w-4" />
                              <AlertDescription>
                                Last practiced: {script.lastPracticed}
                              </AlertDescription>
                            </Alert>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="practice" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Practice Session Log</CardTitle>
                      <CardDescription>Track your practice sessions to monitor improvement over time</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedPitchDuration}
                        onChange={(e) => setSelectedPitchDuration(e.target.value as PitchDuration)}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                        data-testid="select-pitch-duration"
                      >
                        <option value="30s">30-Second</option>
                        <option value="3min">3-Minute</option>
                        <option value="10min">10-Minute</option>
                        <option value="20min">20-Minute</option>
                      </select>
                      <Button onClick={addPracticeSession} size="sm" data-testid="button-add-practice">
                        Add Session
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {practiceSessions.length === 0 ? (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        No practice sessions logged yet. Start practicing and track your progress!
                      </AlertDescription>
                    </Alert>
                  ) : (
                    practiceSessions.map((session, index) => {
                      const info = PITCH_DURATION_INFO[session.duration];
                      const timingDiff = session.actualTime - session.targetTime;
                      return (
                        <Card key={session.id} className="p-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold">Session {practiceSessions.length - index}</h4>
                                <p className="text-sm text-muted-foreground">{info.name}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removePracticeSession(session.id)}
                                data-testid={`button-remove-session-${session.id}`}
                              >
                                Remove
                              </Button>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                              <div>
                                <Label htmlFor={`session-date-${session.id}`}>Date</Label>
                                <Input
                                  id={`session-date-${session.id}`}
                                  type="date"
                                  value={session.date}
                                  onChange={(e) => updatePracticeSession(session.id, 'date', e.target.value)}
                                  data-testid={`input-session-date-${session.id}`}
                                />
                              </div>

                              <div>
                                <Label htmlFor={`session-actual-time-${session.id}`}>Actual Time (seconds)</Label>
                                <Input
                                  id={`session-actual-time-${session.id}`}
                                  type="number"
                                  value={session.actualTime || ''}
                                  onChange={(e) => updatePracticeSession(session.id, 'actualTime', parseFloat(e.target.value) || 0)}
                                  placeholder={`Target: ${session.targetTime}s`}
                                  data-testid={`input-actual-time-${session.id}`}
                                />
                                {timingDiff !== 0 && (
                                  <p className={`text-xs mt-1 ${timingDiff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {timingDiff > 0 ? '+' : ''}{timingDiff}s from target
                                  </p>
                                )}
                              </div>

                              <div>
                                <Label htmlFor={`session-confidence-${session.id}`}>Confidence (1-10)</Label>
                                <Input
                                  id={`session-confidence-${session.id}`}
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={session.confidenceLevel}
                                  onChange={(e) => updatePracticeSession(session.id, 'confidenceLevel', parseInt(e.target.value) || 5)}
                                  data-testid={`input-confidence-${session.id}`}
                                />
                              </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`session-strengths-${session.id}`}>Strengths</Label>
                                <Textarea
                                  id={`session-strengths-${session.id}`}
                                  value={session.strengths}
                                  onChange={(e) => updatePracticeSession(session.id, 'strengths', e.target.value)}
                                  placeholder="What went well in this session?"
                                  className="h-20"
                                  data-testid={`textarea-strengths-${session.id}`}
                                />
                              </div>

                              <div>
                                <Label htmlFor={`session-weaknesses-${session.id}`}>Areas for Improvement</Label>
                                <Textarea
                                  id={`session-weaknesses-${session.id}`}
                                  value={session.weaknesses}
                                  onChange={(e) => updatePracticeSession(session.id, 'weaknesses', e.target.value)}
                                  placeholder="What needs improvement?"
                                  className="h-20"
                                  data-testid={`textarea-weaknesses-${session.id}`}
                                />
                              </div>
                            </div>

                            <div>
                              <Label htmlFor={`session-notes-${session.id}`}>Session Notes</Label>
                              <Textarea
                                id={`session-notes-${session.id}`}
                                value={session.notes}
                                onChange={(e) => updatePracticeSession(session.id, 'notes', e.target.value)}
                                placeholder="Additional observations, feedback received, etc."
                                className="h-16"
                                data-testid={`textarea-notes-${session.id}`}
                              />
                            </div>
                          </div>
                        </Card>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="qa" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Q&A Preparation</CardTitle>
                  <CardDescription>Prepare comprehensive answers to common endorser questions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {qaItems.map((qa, index) => (
                    <Card key={qa.id} className={`p-4 ${qa.prepared ? 'border-green-500' : ''}`}>
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                                qa.difficulty === 'hard' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                                qa.difficulty === 'medium' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
                                'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              }`}>
                                {qa.difficulty}
                              </span>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={qa.prepared}
                                  onChange={(e) => updateQAItem(qa.id, 'prepared', e.target.checked)}
                                  className="h-4 w-4"
                                  data-testid={`checkbox-qa-prepared-${qa.id}`}
                                />
                                <span className="text-sm font-medium">Prepared</span>
                              </label>
                            </div>
                            <h4 className="font-semibold text-sm mb-3">{index + 1}. {qa.question}</h4>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`qa-answer-${qa.id}`}>Your Answer</Label>
                          <Textarea
                            id={`qa-answer-${qa.id}`}
                            value={qa.answer}
                            onChange={(e) => updateQAItem(qa.id, 'answer', e.target.value)}
                            placeholder="Prepare a clear, concise answer with specific examples and data points..."
                            className="min-h-24"
                            data-testid={`textarea-qa-answer-${qa.id}`}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {qa.answer.length} characters
                          </p>
                        </div>

                        <div>
                          <Label htmlFor={`qa-evidence-${qa.id}`}>Supporting Evidence</Label>
                          <Textarea
                            id={`qa-evidence-${qa.id}`}
                            value={qa.evidence}
                            onChange={(e) => updateQAItem(qa.id, 'evidence', e.target.value)}
                            placeholder="List specific evidence, documents, data, or examples that support your answer..."
                            className="h-16"
                            data-testid={`textarea-qa-evidence-${qa.id}`}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="delivery" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Delivery Tips Mastery</CardTitle>
                    <CardDescription>Track your progress mastering delivery fundamentals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {Object.entries(
                      deliveryTips.reduce((acc, tip) => {
                        if (!acc[tip.category]) acc[tip.category] = [];
                        acc[tip.category].push(tip);
                        return acc;
                      }, {} as Record<string, DeliveryTip[]>)
                    ).map(([category, tips]) => (
                      <div key={category} className="mb-6 last:mb-0">
                        <h4 className="font-semibold text-sm mb-3 uppercase text-muted-foreground">
                          {category.replace(/-/g, ' ')}
                        </h4>
                        <div className="space-y-2">
                          {tips.map(tip => (
                            <label
                              key={tip.id}
                              className="flex items-start gap-3 p-2 rounded hover-elevate cursor-pointer"
                              data-testid={`label-tip-${tip.id}`}
                            >
                              <input
                                type="checkbox"
                                checked={tip.mastered}
                                onChange={() => toggleDeliveryTip(tip.id)}
                                className="h-4 w-4 mt-0.5 flex-shrink-0"
                                data-testid={`checkbox-tip-${tip.id}`}
                              />
                              <span className="text-sm">{tip.tip}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Presentation Materials Checklist</CardTitle>
                    <CardDescription>Ensure all materials are prepared and reviewed</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {materials.map(material => (
                        <div
                          key={material.id}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                          data-testid={`material-${material.id}`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={material.prepared}
                                  onChange={(e) => updateMaterial(material.id, 'prepared', e.target.checked)}
                                  className="h-4 w-4"
                                  data-testid={`checkbox-material-prepared-${material.id}`}
                                />
                                <span className="text-sm font-medium">Prepared</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={material.reviewed}
                                  onChange={(e) => updateMaterial(material.id, 'reviewed', e.target.checked)}
                                  className="h-4 w-4"
                                  data-testid={`checkbox-material-reviewed-${material.id}`}
                                />
                                <span className="text-sm font-medium">Reviewed</span>
                              </label>
                            </div>
                            <p className="text-sm font-semibold">{material.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Type: {material.type.replace(/-/g, ' ').toUpperCase()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Alert className="mt-6">
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>
                        Materials Prepared: {preparedMaterials}/{totalMaterials} - Reviewed: {reviewedMaterials}/{totalMaterials}
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Pitch Readiness Radar</CardTitle>
                    <CardDescription>Overall preparation across all dimensions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="category" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar
                          name="Readiness"
                          dataKey="score"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.6}
                        />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Weak Points Identification</CardTitle>
                    <CardDescription>Areas requiring additional focus</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {weakPointsData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={weakPointsData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.name}: ${entry.value}`}
                          >
                            {weakPointsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                          <p className="font-semibold text-green-600">Excellent Progress!</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            No major weak points identified
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Practice Session Progress</CardTitle>
                    <CardDescription>Confidence and timing accuracy over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {practiceProgressData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={practiceProgressData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="session" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="confidence"
                            stroke="#10b981"
                            strokeWidth={2}
                            name="Confidence (scaled to 100)"
                          />
                          <Line
                            type="monotone"
                            dataKey="timingAccuracy"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            name="Timing Accuracy %"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                          <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-3" />
                          <p className="font-semibold">No Practice Data Yet</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Log practice sessions to track your improvement over time
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ToolAccessGuard>
  );
}
