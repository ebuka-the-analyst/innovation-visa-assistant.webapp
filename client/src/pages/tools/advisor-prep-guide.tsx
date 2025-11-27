import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle, Calendar, FileText, Users, TrendingUp, Clock } from "lucide-react";
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'advisor-prep-guide',
  toolName: 'Advisor Preparation Guide',
  agent: 'sage',
  greeting: "Hello! I'm Sage, your Compliance Expert. I'll help you prepare for effective advisor onboarding and engagement - crucial evidence for your UK Innovator Founder Visa application. Endorsers want to see you can build and manage meaningful advisory relationships. Let's work through this together!",
  questions: [
    {
      id: 'advisor-background',
      question: "Tell me about the advisor you're onboarding. What's their name, title, and key expertise area?",
      hint: "Include their industry experience, current role, and why they're a valuable addition to your advisory board",
      fieldKey: 'advisor_background',
      minLength: 50
    },
    {
      id: 'onboarding-goals',
      question: "What are your top 3 objectives for this advisor relationship? What specific value do you expect them to bring?",
      hint: "Think introductions, strategic guidance, technical validation, fundraising support, or industry insights",
      fieldKey: 'onboarding_goals',
      minLength: 80
    },
    {
      id: 'first-meeting-agenda',
      question: "What will you cover in your first advisory meeting? What key topics and questions will you discuss?",
      hint: "Include your company overview, current challenges, specific asks, and their advisory approach",
      fieldKey: 'first_meeting_agenda',
      minLength: 100
    },
    {
      id: 'deliverables-expected',
      question: "What specific deliverables do you expect from this advisor in the first 3 months?",
      hint: "Customer introductions, strategic feedback on business plan, fundraising connections, technical reviews",
      fieldKey: 'deliverables_expected',
      minLength: 80
    },
    {
      id: 'meeting-cadence',
      question: "How often will you meet with this advisor? What's your planned communication cadence?",
      hint: "Best practice is quarterly formal meetings with monthly async updates via email",
      fieldKey: 'meeting_cadence',
      minLength: 40
    },
    {
      id: 'success-metrics',
      question: "How will you measure the success of this advisor relationship? What KPIs will you track?",
      hint: "Consider introductions made, strategic decisions influenced, support letters provided, meeting attendance",
      fieldKey: 'success_metrics',
      minLength: 60
    }
  ],
  completionMessage: "Excellent preparation! You've created a solid foundation for a productive advisor relationship. This level of planning will impress endorsing bodies - they want to see founders who maximize advisory value. I'm now populating your preparation guide."
};

type OnboardingTask = {
  id: string;
  advisorName: string;
  task: string;
  completed: boolean;
  dueDate: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
};

type Meeting = {
  id: string;
  date: string;
  attendees: string[];
  agenda: string;
  notes: string;
  actionItems: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
};

type Deliverable = {
  id: string;
  title: string;
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
};

type AdvisorRelationship = {
  advisorName: string;
  lastContact: string;
  totalMeetings: number;
  responsiveness: number;
  valueContribution: number;
  relationshipHealth: 'excellent' | 'good' | 'needs-attention' | 'poor';
};

export default function AdvisorPrepGuide() {
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('advisor-prep-guide-mode');
    return (saved === 'traditional') ? 'traditional' : 'ai';
  });
  const [onboardingTasks, setOnboardingTasks] = useState<OnboardingTask[]>([
    {
      id: '1',
      advisorName: '',
      task: 'Send welcome email with company overview',
      completed: false,
      dueDate: '',
      priority: 'critical'
    }
  ]);

  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: '1',
      date: '',
      attendees: [],
      agenda: '',
      notes: '',
      actionItems: '',
      duration: 60,
      status: 'scheduled'
    }
  ]);

  const [deliverables, setDeliverables] = useState<Deliverable[]>([
    {
      id: '1',
      title: '',
      assignedTo: '',
      dueDate: '',
      status: 'pending',
      description: '',
      priority: 'high'
    }
  ]);

  const [relationships, setRelationships] = useState<AdvisorRelationship[]>([
    {
      advisorName: '',
      lastContact: '',
      totalMeetings: 0,
      responsiveness: 5,
      valueContribution: 5,
      relationshipHealth: 'good'
    }
  ]);

  const [activeTab, setActiveTab] = useState('onboarding');
  const [savedDate, setSavedDate] = useState('');

  useEffect(() => {
    localStorage.setItem('advisor-prep-guide-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    if (answers.advisor_background) {
      const newTask: OnboardingTask = {
        id: 'ai-' + Date.now(),
        advisorName: answers.advisor_background?.split(',')[0]?.trim() || 'New Advisor',
        task: answers.first_meeting_agenda || 'Complete advisor onboarding',
        completed: false,
        dueDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
        priority: 'critical'
      };
      setOnboardingTasks([newTask]);
    }
    if (answers.first_meeting_agenda) {
      const newMeeting: Meeting = {
        id: 'ai-' + Date.now(),
        date: new Date(Date.now() + 14*24*60*60*1000).toISOString().split('T')[0],
        attendees: [answers.advisor_background?.split(',')[0]?.trim() || 'Advisor'],
        agenda: answers.first_meeting_agenda,
        notes: answers.onboarding_goals || '',
        actionItems: answers.deliverables_expected || '',
        duration: 60,
        status: 'scheduled'
      };
      setMeetings([newMeeting]);
    }
    if (answers.deliverables_expected) {
      const newDeliverable: Deliverable = {
        id: 'ai-' + Date.now(),
        title: 'Advisory deliverables',
        assignedTo: answers.advisor_background?.split(',')[0]?.trim() || 'Advisor',
        dueDate: new Date(Date.now() + 90*24*60*60*1000).toISOString().split('T')[0],
        status: 'pending',
        description: answers.deliverables_expected,
        priority: 'high'
      };
      setDeliverables([newDeliverable]);
    }
    setMode('traditional');
  };

  const addOnboardingTask = () => {
    const newTask: OnboardingTask = {
      id: Date.now().toString(),
      advisorName: '',
      task: '',
      completed: false,
      dueDate: '',
      priority: 'medium'
    };
    setOnboardingTasks([...onboardingTasks, newTask]);
  };

  const updateOnboardingTask = (id: string, field: keyof OnboardingTask, value: any) => {
    setOnboardingTasks(onboardingTasks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const removeOnboardingTask = (id: string) => {
    if (onboardingTasks.length > 1) {
      setOnboardingTasks(onboardingTasks.filter(t => t.id !== id));
    }
  };

  const addMeeting = () => {
    const newMeeting: Meeting = {
      id: Date.now().toString(),
      date: '',
      attendees: [],
      agenda: '',
      notes: '',
      actionItems: '',
      duration: 60,
      status: 'scheduled'
    };
    setMeetings([...meetings, newMeeting]);
  };

  const updateMeeting = (id: string, field: keyof Meeting, value: any) => {
    setMeetings(meetings.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const removeMeeting = (id: string) => {
    if (meetings.length > 1) {
      setMeetings(meetings.filter(m => m.id !== id));
    }
  };

  const addDeliverable = () => {
    const newDeliverable: Deliverable = {
      id: Date.now().toString(),
      title: '',
      assignedTo: '',
      dueDate: '',
      status: 'pending',
      description: '',
      priority: 'medium'
    };
    setDeliverables([...deliverables, newDeliverable]);
  };

  const updateDeliverable = (id: string, field: keyof Deliverable, value: any) => {
    setDeliverables(deliverables.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const removeDeliverable = (id: string) => {
    if (deliverables.length > 1) {
      setDeliverables(deliverables.filter(d => d.id !== id));
    }
  };

  const addRelationship = () => {
    const newRelationship: AdvisorRelationship = {
      advisorName: '',
      lastContact: '',
      totalMeetings: 0,
      responsiveness: 5,
      valueContribution: 5,
      relationshipHealth: 'good'
    };
    setRelationships([...relationships, newRelationship]);
  };

  const updateRelationship = (index: number, field: keyof AdvisorRelationship, value: any) => {
    const updated = [...relationships];
    updated[index] = { ...updated[index], [field]: value };
    setRelationships(updated);
  };

  const removeRelationship = (index: number) => {
    if (relationships.length > 1) {
      setRelationships(relationships.filter((_, i) => i !== index));
    }
  };

  const calculateEngagementScore = (): number => {
    let score = 0;
    const maxScore = 100;

    const onboardingCompleteWeight = 20;
    const completedTasks = onboardingTasks.filter(t => t.completed).length;
    const totalTasks = Math.max(onboardingTasks.length, 1);
    score += (completedTasks / totalTasks) * onboardingCompleteWeight;

    const meetingFrequencyWeight = 25;
    const completedMeetings = meetings.filter(m => m.status === 'completed').length;
    const totalMeetings = Math.max(meetings.length, 1);
    score += (completedMeetings / totalMeetings) * meetingFrequencyWeight;

    const deliverableCompletionWeight = 25;
    const completedDeliverables = deliverables.filter(d => d.status === 'completed').length;
    const totalDeliverables = Math.max(deliverables.length, 1);
    score += (completedDeliverables / totalDeliverables) * deliverableCompletionWeight;

    const relationshipQualityWeight = 30;
    const avgResponsiveness = relationships.reduce((sum, r) => sum + r.responsiveness, 0) / Math.max(relationships.length, 1);
    const avgValueContribution = relationships.reduce((sum, r) => sum + r.valueContribution, 0) / Math.max(relationships.length, 1);
    const relationshipScore = ((avgResponsiveness + avgValueContribution) / 20) * relationshipQualityWeight;
    score += relationshipScore;

    return Math.min(Math.round(score), maxScore);
  };

  const engagementScore = calculateEngagementScore();
  const completedOnboarding = onboardingTasks.filter(t => t.completed).length;
  const totalOnboarding = onboardingTasks.length;
  const completedMeetings = meetings.filter(m => m.status === 'completed').length;
  const scheduledMeetings = meetings.filter(m => m.status === 'scheduled').length;
  const completedDeliverables = deliverables.filter(d => d.status === 'completed').length;
  const overdueDeliverables = deliverables.filter(d => {
    if (d.status === 'completed') return false;
    if (!d.dueDate) return false;
    return new Date(d.dueDate) < new Date();
  }).length;

  const engagementTimelineData = meetings
    .filter(m => m.date && m.status === 'completed')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((m, index) => ({
      meeting: `M${index + 1}`,
      date: new Date(m.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
      attendees: m.attendees.length,
      duration: m.duration
    }));

  const deliverableStatusData = [
    { name: 'Completed', value: deliverables.filter(d => d.status === 'completed').length, color: '#10b981' },
    { name: 'In Progress', value: deliverables.filter(d => d.status === 'in-progress').length, color: '#3b82f6' },
    { name: 'Pending', value: deliverables.filter(d => d.status === 'pending').length, color: '#f59e0b' },
    { name: 'Overdue', value: overdueDeliverables, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const getSerializedState = () => {
    return {
      onboardingTasks,
      meetings,
      deliverables,
      relationships,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('onboardingTasks' in state) setOnboardingTasks(state.onboardingTasks);
    if ('meetings' in state) setMeetings(state.meetings);
    if ('deliverables' in state) setDeliverables(state.deliverables);
    if ('relationships' in state) setRelationships(state.relationships);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const handoffKey = 'advisor-prep-guide_handoff';
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
      const saved = localStorage.getItem('advisor-prep-guide-state');
      if (saved) {
        const state = JSON.parse(saved);
        restoreSerializedState(state);
      }
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('advisor-prep-guide-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('advisor-prep-guide-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (completedOnboarding < totalOnboarding * 0.5) {
      tips.push("Complete onboarding tasks promptly - first impressions set the tone for long-term advisor relationships and demonstrate organizational professionalism");
    }
    
    if (scheduledMeetings > 0 && completedMeetings === 0) {
      tips.push("Schedule your first advisory board meeting within 2 weeks of advisor commitment - early engagement validates their value to visa officers");
    }
    
    if (completedMeetings < 3) {
      tips.push("UK visa endorsers expect evidence of active advisor engagement - aim for at least quarterly board meetings with documented agendas and outcomes");
    }
    
    if (overdueDeliverables > 0) {
      tips.push(`${overdueDeliverables} deliverable(s) overdue - follow up immediately to maintain momentum and demonstrate effective relationship management`);
    }
    
    const avgRelationshipHealth = relationships.filter(r => r.relationshipHealth === 'excellent' || r.relationshipHealth === 'good').length / Math.max(relationships.length, 1);
    if (avgRelationshipHealth < 0.7) {
      tips.push("Relationship health below optimal - schedule 1-on-1 check-ins with advisors to address concerns and strengthen engagement");
    }
    
    if (engagementScore < 50) {
      tips.push("Engagement score below 50% suggests weak advisory board activation - visa officers look for sustained, documented advisor involvement");
    }
    
    const hasNoMeetingNotes = meetings.filter(m => m.status === 'completed' && !m.notes).length > 0;
    if (hasNoMeetingNotes) {
      tips.push("Document all meeting notes and action items - detailed records provide visa evidence of substantive advisor contributions to business strategy");
    }
    
    if (deliverables.length < 5) {
      tips.push("Define clear advisor deliverables (introductions, strategic feedback, fundraising support) - specific commitments demonstrate advisor value beyond titles");
    }
    
    const recentContact = relationships.filter(r => {
      if (!r.lastContact) return false;
      const daysSince = (new Date().getTime() - new Date(r.lastContact).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 30;
    }).length;
    if (recentContact < relationships.length * 0.5) {
      tips.push("Over half of advisors haven't been contacted in 30+ days - maintain regular touchpoints to keep relationships warm and advisors engaged");
    }
    
    if (engagementScore >= 70 && completedMeetings >= 2) {
      tips.push("Strong advisory board management - prepare advisor letters of support highlighting specific contributions for visa application submission");
    }
    
    return tips.slice(0, 8);
  };

  const generateActionPlan = () => {
    return [
      {
        week: "Week 1",
        action: "Complete advisor onboarding - send welcome packet with company overview, vision deck, current traction, and equity agreement details",
        priority: "Critical"
      },
      {
        week: "Week 1",
        action: "Schedule individual 30-minute orientation calls with each advisor to align on expectations, time commitment, and specific ways they can contribute",
        priority: "Critical"
      },
      {
        week: "Week 1-2",
        action: "Define clear deliverables for each advisor based on expertise - introductions, strategic reviews, fundraising support, technical validation",
        priority: "High"
      },
      {
        week: "Week 2",
        action: "Schedule first official advisory board meeting within 2 weeks - prepare detailed agenda covering business update, key challenges, and advisor asks",
        priority: "Critical"
      },
      {
        week: "Week 2",
        action: "Set up communication channels (Slack, email group) and establish meeting cadence (quarterly formal meetings, monthly async updates)",
        priority: "High"
      },
      {
        week: "Week 2-3",
        action: "Document first advisory board meeting with comprehensive notes, decisions made, and action items - critical visa evidence of active engagement",
        priority: "Critical"
      },
      {
        week: "Week 3",
        action: "Follow up on action items from first meeting and provide progress updates - demonstrates execution and advisor impact on business decisions",
        priority: "High"
      },
      {
        week: "Week 3",
        action: "Request specific deliverables from advisors (customer introductions, fundraising connections, technical reviews) and set deadlines",
        priority: "High"
      },
      {
        week: "Week 3-4",
        action: "Conduct 1-on-1 check-ins with each advisor to assess relationship health, gather feedback, and address any concerns early",
        priority: "Medium"
      },
      {
        week: "Week 4",
        action: "Prepare monthly advisor update email template covering traction metrics, wins, challenges, and specific asks - maintain engagement between meetings",
        priority: "High"
      },
      {
        week: "Week 4",
        action: "Request letters of support from advisors for visa application - provide template highlighting their credentials and endorsement of your innovation",
        priority: "Critical"
      },
      {
        week: "Week 4",
        action: "Compile advisor engagement evidence package - meeting notes, email correspondence, deliverable completions, strategic contributions for visa submission",
        priority: "Critical"
      }
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - ADVISORY BOARD PREPARATION & MANAGEMENT GUIDE
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

ADVISOR ENGAGEMENT SUMMARY
${'-'.repeat(80)}
Overall Engagement Score: ${engagementScore}%
Onboarding Progress: ${completedOnboarding}/${totalOnboarding} tasks completed (${Math.round((completedOnboarding/totalOnboarding)*100)}%)
Total Meetings: ${meetings.length} (${completedMeetings} completed, ${scheduledMeetings} scheduled)
Active Deliverables: ${deliverables.length} (${completedDeliverables} completed, ${overdueDeliverables} overdue)
Advisor Relationships Tracked: ${relationships.length}

ENGAGEMENT STATUS: ${engagementScore >= 70 ? 'EXCELLENT - VISA READY' : engagementScore >= 50 ? 'GOOD - NEEDS IMPROVEMENT' : 'WEAK - REQUIRES IMMEDIATE ACTION'}

ONBOARDING CHECKLIST
${'-'.repeat(80)}
${onboardingTasks.map((task, i) => `
${i + 1}. [${task.completed ? 'X' : ' '}] ${task.task}
   Advisor: ${task.advisorName || 'Not assigned'}
   Due Date: ${task.dueDate || 'Not set'}
   Priority: ${task.priority.toUpperCase()}
   Status: ${task.completed ? 'COMPLETED' : 'PENDING'}
`).join('')}

Onboarding Completion: ${Math.round((completedOnboarding/totalOnboarding)*100)}%
${completedOnboarding === totalOnboarding ? 'All onboarding tasks completed - ready for active engagement phase' : `${totalOnboarding - completedOnboarding} task(s) remaining`}

ADVISORY BOARD MEETINGS
${'-'.repeat(80)}
${meetings.map((meeting, i) => `
Meeting ${i + 1}: ${meeting.date || 'Date not set'}
Status: ${meeting.status.toUpperCase()}
Attendees: ${meeting.attendees.length > 0 ? meeting.attendees.join(', ') : 'None specified'}
Duration: ${meeting.duration} minutes

Agenda:
${meeting.agenda || 'Not provided'}

Meeting Notes:
${meeting.notes || 'Not documented'}

Action Items:
${meeting.actionItems || 'None specified'}

${'-'.repeat(40)}
`).join('')}

Meeting Statistics:
- Total Meetings: ${meetings.length}
- Completed: ${completedMeetings}
- Scheduled: ${scheduledMeetings}
- Cancelled: ${meetings.filter(m => m.status === 'cancelled').length}
- Average Duration: ${Math.round(meetings.reduce((sum, m) => sum + m.duration, 0) / Math.max(meetings.length, 1))} minutes

DELIVERABLES TRACKING
${'-'.repeat(80)}
${deliverables.map((deliverable, i) => `
${i + 1}. ${deliverable.title || 'Untitled Deliverable'}
   Assigned To: ${deliverable.assignedTo || 'Unassigned'}
   Due Date: ${deliverable.dueDate || 'Not set'}
   Status: ${deliverable.status.toUpperCase()}
   Priority: ${deliverable.priority.toUpperCase()}
   
   Description:
   ${deliverable.description || 'No description provided'}
   
   ${deliverable.status === 'overdue' ? 'WARNING: OVERDUE - FOLLOW UP REQUIRED' : ''}
`).join('')}

Deliverable Statistics:
- Total Deliverables: ${deliverables.length}
- Completed: ${completedDeliverables} (${Math.round((completedDeliverables/deliverables.length)*100)}%)
- In Progress: ${deliverables.filter(d => d.status === 'in-progress').length}
- Pending: ${deliverables.filter(d => d.status === 'pending').length}
- Overdue: ${overdueDeliverables}

ADVISOR RELATIONSHIP MANAGEMENT
${'-'.repeat(80)}
${relationships.map((rel, i) => `
${i + 1}. ${rel.advisorName || 'Unnamed Advisor'}
   Last Contact: ${rel.lastContact || 'No contact recorded'}
   Total Meetings: ${rel.totalMeetings}
   Responsiveness: ${rel.responsiveness}/10
   Value Contribution: ${rel.valueContribution}/10
   Relationship Health: ${rel.relationshipHealth.toUpperCase()}
   
   ${rel.relationshipHealth === 'needs-attention' || rel.relationshipHealth === 'poor' 
     ? 'WARNING: ACTION REQUIRED - Schedule check-in to address relationship concerns' 
     : 'Relationship in good standing'}
`).join('')}

Average Relationship Metrics:
- Avg Responsiveness: ${(relationships.reduce((sum, r) => sum + r.responsiveness, 0) / Math.max(relationships.length, 1)).toFixed(1)}/10
- Avg Value Contribution: ${(relationships.reduce((sum, r) => sum + r.valueContribution, 0) / Math.max(relationships.length, 1)).toFixed(1)}/10
- Healthy Relationships: ${relationships.filter(r => r.relationshipHealth === 'excellent' || r.relationshipHealth === 'good').length}/${relationships.length}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

ADVISORY BOARD BEST PRACTICES FOR UK VISA APPLICATIONS
${'-'.repeat(80)}

1. ONBOARDING EXCELLENCE
   - Welcome packet with company overview, vision, and current state
   - Individual orientation calls to align expectations
   - Formal advisor agreements with equity compensation (0.25-1%)
   - Clear role definition and deliverable expectations
   - Access to key documentation and communication channels

2. MEETING MANAGEMENT
   - Quarterly formal advisory board meetings (minimum)
   - Monthly async updates between meetings
   - Detailed agendas sent 3-5 days in advance
   - Comprehensive meeting notes documenting discussions
   - Action items with owners and deadlines
   - Evidence of advisor input influencing business decisions

3. DELIVERABLE TRACKING
   - Specific, measurable deliverables for each advisor
   - Customer/investor introductions tracked and followed up
   - Strategic feedback incorporated into business planning
   - Technical reviews documented with advisor validation
   - Fundraising support quantified (connections, pitch feedback)
   - Regular deliverable status updates and acknowledgment

4. RELATIONSHIP NURTURING
   - 1-on-1 check-ins every 6-8 weeks
   - Responsiveness to advisor communications within 48 hours
   - Recognition of advisor contributions (public thanks, updates)
   - Flexibility on time commitments and meeting formats
   - Early communication of any challenges or pivots
   - Invitation to key company events and milestones

5. VISA DOCUMENTATION REQUIREMENTS
   - Meeting notes from first 2-3 advisory board meetings
   - Email correspondence showing active advisor engagement
   - Advisor letters of support endorsing innovation and visa application
   - Advisor biographies highlighting credentials and relevance
   - Deliverable completion evidence (intro emails, strategic docs)
   - Advisor equity agreements demonstrating formal commitment
   - LinkedIn profiles or CVs of advisors validating expertise

6. RED FLAGS TO AVOID
   - No meetings held within first month of advisor commitment
   - Generic, unfocused meeting agendas without clear asks
   - No documented meeting notes or action items
   - Advisors unresponsive to emails or meeting invitations
   - Zero deliverable completions from advisors
   - Advisors with no relevant industry expertise or credibility
   - No evidence of advisor impact on business strategy

7. ENGAGEMENT OPTIMIZATION
   - Monthly email updates keeping advisors informed and engaged
   - Specific, actionable asks in every communication
   - Quick wins and traction updates to maintain enthusiasm
   - Recognition of advisor contributions in investor updates
   - Annual advisor review and compensation adjustment discussions
   - Exit protocol for non-engaged advisors (replace if necessary)

ENGAGEMENT SCORE CALCULATION METHODOLOGY
${'-'.repeat(80)}
The ${engagementScore}% engagement score is calculated as follows:

1. Onboarding Completion (20 points):
   ${completedOnboarding}/${totalOnboarding} tasks completed = ${Math.round((completedOnboarding/totalOnboarding)*20)} points

2. Meeting Frequency (25 points):
   ${completedMeetings}/${meetings.length} meetings held = ${Math.round((completedMeetings/meetings.length)*25)} points

3. Deliverable Completion (25 points):
   ${completedDeliverables}/${deliverables.length} deliverables completed = ${Math.round((completedDeliverables/deliverables.length)*25)} points

4. Relationship Quality (30 points):
   Average responsiveness (${(relationships.reduce((sum, r) => sum + r.responsiveness, 0) / Math.max(relationships.length, 1)).toFixed(1)}/10) + 
   Average value contribution (${(relationships.reduce((sum, r) => sum + r.valueContribution, 0) / Math.max(relationships.length, 1)).toFixed(1)}/10) = 
   ${Math.round(((relationships.reduce((sum, r) => sum + r.responsiveness, 0) / Math.max(relationships.length, 1)) + 
   (relationships.reduce((sum, r) => sum + r.valueContribution, 0) / Math.max(relationships.length, 1))) / 20 * 30)} points

Target: 70%+ for strong visa application evidence
Current: ${engagementScore}% - ${engagementScore >= 70 ? 'VISA READY' : engagementScore >= 50 ? 'NEEDS IMPROVEMENT' : 'REQUIRES IMMEDIATE ACTION'}

NEXT STEPS
${'-'.repeat(80)}
${engagementScore < 50 
  ? `1. URGENT: Complete onboarding tasks and schedule first advisory board meeting
2. Define clear deliverables for each advisor
3. Increase meeting frequency to quarterly minimum
4. Document all advisor interactions for visa evidence` 
  : engagementScore < 70
  ? `1. Complete remaining onboarding tasks
2. Ensure quarterly meeting cadence is established
3. Follow up on pending deliverables
4. Strengthen advisor relationships through 1-on-1 check-ins
5. Begin compiling visa evidence package` 
  : `1. Maintain quarterly meeting cadence with detailed documentation
2. Request formal letters of support from advisors for visa
3. Compile comprehensive advisor engagement evidence package
4. Prepare advisor bio/credential summaries for visa application
5. Continue relationship nurturing through regular updates`}

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `advisor-prep-guide-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          
          
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2" data-testid="heading-advisor-prep-guide">Advisor Prep Guide</h1>
              <p className="text-lg text-muted-foreground">Advisory board onboarding, meeting management, and engagement tracking</p>
              {savedDate && (
                <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
              )}
            </div>
            <AiTraditionalToggle mode={mode} onModeChange={setMode} />
          </div>

          {mode === 'ai' ? (
            <AiToolGuide 
              config={AI_TOOL_CONFIG} 
              onComplete={handleAiComplete}
              onSwitchToTraditional={() => setMode('traditional')}
            />
          ) : (
          <>
          <ToolUtilityBar
            toolId="advisor-prep-guide"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Advisor Prep Guide"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6" data-testid="tabs-advisor-prep-guide">
              <TabsTrigger value="onboarding" data-testid="tab-onboarding">Onboarding</TabsTrigger>
              <TabsTrigger value="meetings" data-testid="tab-meetings">Meetings</TabsTrigger>
              <TabsTrigger value="deliverables" data-testid="tab-deliverables">Deliverables</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="onboarding" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Advisor Engagement Overview</CardTitle>
                  <CardDescription>Track advisory board onboarding and engagement quality</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className={engagementScore >= 70 ? "border-green-500" : engagementScore >= 50 ? "border-orange-500" : "border-destructive"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Engagement Score</p>
                          <p className="text-3xl font-bold text-primary" data-testid="text-engagement-score">{engagementScore}%</p>
                          <Progress value={engagementScore} className="mt-2" />
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {engagementScore >= 70 ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : engagementScore >= 50 ? (
                              <AlertTriangle className="h-5 w-5 text-orange-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-destructive" />
                            )}
                            <span className="text-sm">
                              {engagementScore >= 70 ? 'Visa Ready' : engagementScore >= 50 ? 'Needs Work' : 'Action Required'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Onboarding Progress</p>
                          <p className="text-3xl font-bold" data-testid="text-onboarding-progress">{completedOnboarding}/{totalOnboarding}</p>
                          <Progress value={(completedOnboarding/totalOnboarding)*100} className="mt-2" />
                          <p className="text-sm text-muted-foreground mt-2">{Math.round((completedOnboarding/totalOnboarding)*100)}% Complete</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Completed Meetings</p>
                          <p className="text-3xl font-bold" data-testid="text-completed-meetings">{completedMeetings}</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{scheduledMeetings} scheduled</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {engagementScore < 50 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Engagement score below 50% indicates weak advisory board activation. UK visa endorsers expect sustained, documented advisor involvement.
                      </AlertDescription>
                    </Alert>
                  )}

                  {engagementScore >= 50 && engagementScore < 70 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Good progress, but aim for 70%+ engagement to strengthen visa application. Focus on completing onboarding and scheduling regular meetings.
                      </AlertDescription>
                    </Alert>
                  )}

                  {engagementScore >= 70 && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Excellent engagement score! Your advisory board management demonstrates active advisor involvement suitable for visa evidence.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Onboarding Checklist</h3>
                      <Button onClick={addOnboardingTask} size="sm" data-testid="button-add-onboarding-task">
                        Add Task
                      </Button>
                    </div>

                    {onboardingTasks.map((task) => (
                      <Card key={task.id} className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={(e) => updateOnboardingTask(task.id, 'completed', e.target.checked)}
                              className="h-5 w-5"
                              data-testid={`checkbox-task-completed-${task.id}`}
                            />
                            <div className="flex-1 grid md:grid-cols-3 gap-3">
                              <div>
                                <Label htmlFor={`task-advisor-${task.id}`}>Advisor Name</Label>
                                <Input
                                  id={`task-advisor-${task.id}`}
                                  value={task.advisorName}
                                  onChange={(e) => updateOnboardingTask(task.id, 'advisorName', e.target.value)}
                                  placeholder="Advisor name"
                                  data-testid={`input-task-advisor-${task.id}`}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`task-due-${task.id}`}>Due Date</Label>
                                <Input
                                  id={`task-due-${task.id}`}
                                  type="date"
                                  value={task.dueDate}
                                  onChange={(e) => updateOnboardingTask(task.id, 'dueDate', e.target.value)}
                                  data-testid={`input-task-due-${task.id}`}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`task-priority-${task.id}`}>Priority</Label>
                                <select
                                  id={`task-priority-${task.id}`}
                                  value={task.priority}
                                  onChange={(e) => updateOnboardingTask(task.id, 'priority', e.target.value as any)}
                                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                  data-testid={`select-task-priority-${task.id}`}
                                >
                                  <option value="critical">Critical</option>
                                  <option value="high">High</option>
                                  <option value="medium">Medium</option>
                                  <option value="low">Low</option>
                                </select>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-end gap-3">
                            <div className="flex-1">
                              <Label htmlFor={`task-description-${task.id}`}>Task Description</Label>
                              <Input
                                id={`task-description-${task.id}`}
                                value={task.task}
                                onChange={(e) => updateOnboardingTask(task.id, 'task', e.target.value)}
                                placeholder="e.g., Send welcome email with company overview"
                                data-testid={`input-task-description-${task.id}`}
                              />
                            </div>
                            {onboardingTasks.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeOnboardingTask(task.id)}
                                data-testid={`button-remove-task-${task.id}`}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="meetings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Advisory Board Meetings</CardTitle>
                  <CardDescription>Schedule and document advisory board meetings for visa evidence</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Completed: {completedMeetings} | Scheduled: {scheduledMeetings} | Total: {meetings.length}
                      </p>
                    </div>
                    <Button onClick={addMeeting} size="sm" data-testid="button-add-meeting">
                      Add Meeting
                    </Button>
                  </div>

                  {meetings.map((meeting) => (
                    <Card key={meeting.id} className="p-4">
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-4 gap-3">
                          <div>
                            <Label htmlFor={`meeting-date-${meeting.id}`}>Date</Label>
                            <Input
                              id={`meeting-date-${meeting.id}`}
                              type="date"
                              value={meeting.date}
                              onChange={(e) => updateMeeting(meeting.id, 'date', e.target.value)}
                              data-testid={`input-meeting-date-${meeting.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`meeting-duration-${meeting.id}`}>Duration (min)</Label>
                            <Input
                              id={`meeting-duration-${meeting.id}`}
                              type="number"
                              value={meeting.duration}
                              onChange={(e) => updateMeeting(meeting.id, 'duration', parseInt(e.target.value) || 60)}
                              data-testid={`input-meeting-duration-${meeting.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`meeting-status-${meeting.id}`}>Status</Label>
                            <select
                              id={`meeting-status-${meeting.id}`}
                              value={meeting.status}
                              onChange={(e) => updateMeeting(meeting.id, 'status', e.target.value as any)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-meeting-status-${meeting.id}`}
                            >
                              <option value="scheduled">Scheduled</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                          <div className="flex items-end">
                            <Badge variant={meeting.status === 'completed' ? 'default' : 'secondary'} data-testid={`badge-meeting-status-${meeting.id}`}>
                              {meeting.status}
                            </Badge>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`meeting-attendees-${meeting.id}`}>Attendees (comma-separated)</Label>
                          <Input
                            id={`meeting-attendees-${meeting.id}`}
                            value={meeting.attendees.join(', ')}
                            onChange={(e) => updateMeeting(meeting.id, 'attendees', e.target.value.split(',').map(a => a.trim()).filter(a => a))}
                            placeholder="Advisor 1, Advisor 2, Founder"
                            data-testid={`input-meeting-attendees-${meeting.id}`}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`meeting-agenda-${meeting.id}`}>Agenda</Label>
                          <Textarea
                            id={`meeting-agenda-${meeting.id}`}
                            value={meeting.agenda}
                            onChange={(e) => updateMeeting(meeting.id, 'agenda', e.target.value)}
                            placeholder="Meeting agenda topics..."
                            rows={3}
                            data-testid={`textarea-meeting-agenda-${meeting.id}`}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`meeting-notes-${meeting.id}`}>Meeting Notes</Label>
                          <Textarea
                            id={`meeting-notes-${meeting.id}`}
                            value={meeting.notes}
                            onChange={(e) => updateMeeting(meeting.id, 'notes', e.target.value)}
                            placeholder="Document key discussions, decisions, and advisor input..."
                            rows={4}
                            data-testid={`textarea-meeting-notes-${meeting.id}`}
                          />
                        </div>

                        <div className="flex items-end gap-3">
                          <div className="flex-1">
                            <Label htmlFor={`meeting-actions-${meeting.id}`}>Action Items</Label>
                            <Textarea
                              id={`meeting-actions-${meeting.id}`}
                              value={meeting.actionItems}
                              onChange={(e) => updateMeeting(meeting.id, 'actionItems', e.target.value)}
                              placeholder="Action items with owners and deadlines..."
                              rows={2}
                              data-testid={`textarea-meeting-actions-${meeting.id}`}
                            />
                          </div>
                          {meetings.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMeeting(meeting.id)}
                              data-testid={`button-remove-meeting-${meeting.id}`}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="deliverables" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Advisor Deliverables</CardTitle>
                  <CardDescription>Track specific commitments and contributions from advisors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Completed: {completedDeliverables} | Overdue: {overdueDeliverables} | Total: {deliverables.length}
                      </p>
                    </div>
                    <Button onClick={addDeliverable} size="sm" data-testid="button-add-deliverable">
                      Add Deliverable
                    </Button>
                  </div>

                  {overdueDeliverables > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {overdueDeliverables} deliverable(s) overdue. Follow up with advisors to maintain engagement and momentum.
                      </AlertDescription>
                    </Alert>
                  )}

                  {deliverables.map((deliverable) => (
                    <Card key={deliverable.id} className="p-4">
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-4 gap-3">
                          <div className="md:col-span-2">
                            <Label htmlFor={`deliverable-title-${deliverable.id}`}>Deliverable Title</Label>
                            <Input
                              id={`deliverable-title-${deliverable.id}`}
                              value={deliverable.title}
                              onChange={(e) => updateDeliverable(deliverable.id, 'title', e.target.value)}
                              placeholder="e.g., Customer intro to enterprise buyers"
                              data-testid={`input-deliverable-title-${deliverable.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`deliverable-assigned-${deliverable.id}`}>Assigned To</Label>
                            <Input
                              id={`deliverable-assigned-${deliverable.id}`}
                              value={deliverable.assignedTo}
                              onChange={(e) => updateDeliverable(deliverable.id, 'assignedTo', e.target.value)}
                              placeholder="Advisor name"
                              data-testid={`input-deliverable-assigned-${deliverable.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`deliverable-due-${deliverable.id}`}>Due Date</Label>
                            <Input
                              id={`deliverable-due-${deliverable.id}`}
                              type="date"
                              value={deliverable.dueDate}
                              onChange={(e) => updateDeliverable(deliverable.id, 'dueDate', e.target.value)}
                              data-testid={`input-deliverable-due-${deliverable.id}`}
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-3">
                          <div>
                            <Label htmlFor={`deliverable-status-${deliverable.id}`}>Status</Label>
                            <select
                              id={`deliverable-status-${deliverable.id}`}
                              value={deliverable.status}
                              onChange={(e) => updateDeliverable(deliverable.id, 'status', e.target.value as any)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-deliverable-status-${deliverable.id}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="overdue">Overdue</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor={`deliverable-priority-${deliverable.id}`}>Priority</Label>
                            <select
                              id={`deliverable-priority-${deliverable.id}`}
                              value={deliverable.priority}
                              onChange={(e) => updateDeliverable(deliverable.id, 'priority', e.target.value as any)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-deliverable-priority-${deliverable.id}`}
                            >
                              <option value="critical">Critical</option>
                              <option value="high">High</option>
                              <option value="medium">Medium</option>
                              <option value="low">Low</option>
                            </select>
                          </div>
                          <div className="flex items-end">
                            <Badge
                              variant={deliverable.status === 'completed' ? 'default' : deliverable.status === 'overdue' ? 'destructive' : 'secondary'}
                              data-testid={`badge-deliverable-status-${deliverable.id}`}
                            >
                              {deliverable.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-end gap-3">
                          <div className="flex-1">
                            <Label htmlFor={`deliverable-description-${deliverable.id}`}>Description</Label>
                            <Textarea
                              id={`deliverable-description-${deliverable.id}`}
                              value={deliverable.description}
                              onChange={(e) => updateDeliverable(deliverable.id, 'description', e.target.value)}
                              placeholder="Detailed description of expected deliverable..."
                              rows={2}
                              data-testid={`textarea-deliverable-description-${deliverable.id}`}
                            />
                          </div>
                          {deliverables.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDeliverable(deliverable.id)}
                              data-testid={`button-remove-deliverable-${deliverable.id}`}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Relationship Management</CardTitle>
                  <CardDescription>Track advisor engagement and relationship health</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Total Advisors: {relationships.length}</p>
                    <Button onClick={addRelationship} size="sm" data-testid="button-add-relationship">
                      Add Advisor
                    </Button>
                  </div>

                  {relationships.map((rel, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-3">
                          <div>
                            <Label htmlFor={`rel-name-${index}`}>Advisor Name</Label>
                            <Input
                              id={`rel-name-${index}`}
                              value={rel.advisorName}
                              onChange={(e) => updateRelationship(index, 'advisorName', e.target.value)}
                              placeholder="Advisor name"
                              data-testid={`input-rel-name-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`rel-contact-${index}`}>Last Contact</Label>
                            <Input
                              id={`rel-contact-${index}`}
                              type="date"
                              value={rel.lastContact}
                              onChange={(e) => updateRelationship(index, 'lastContact', e.target.value)}
                              data-testid={`input-rel-contact-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`rel-meetings-${index}`}>Total Meetings</Label>
                            <Input
                              id={`rel-meetings-${index}`}
                              type="number"
                              value={rel.totalMeetings}
                              onChange={(e) => updateRelationship(index, 'totalMeetings', parseInt(e.target.value) || 0)}
                              data-testid={`input-rel-meetings-${index}`}
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-3">
                          <div>
                            <Label htmlFor={`rel-responsiveness-${index}`}>Responsiveness (1-10)</Label>
                            <Input
                              id={`rel-responsiveness-${index}`}
                              type="number"
                              min="1"
                              max="10"
                              value={rel.responsiveness}
                              onChange={(e) => updateRelationship(index, 'responsiveness', Math.min(10, Math.max(1, parseInt(e.target.value) || 5)))}
                              data-testid={`input-rel-responsiveness-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`rel-value-${index}`}>Value Contribution (1-10)</Label>
                            <Input
                              id={`rel-value-${index}`}
                              type="number"
                              min="1"
                              max="10"
                              value={rel.valueContribution}
                              onChange={(e) => updateRelationship(index, 'valueContribution', Math.min(10, Math.max(1, parseInt(e.target.value) || 5)))}
                              data-testid={`input-rel-value-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`rel-health-${index}`}>Relationship Health</Label>
                            <select
                              id={`rel-health-${index}`}
                              value={rel.relationshipHealth}
                              onChange={(e) => updateRelationship(index, 'relationshipHealth', e.target.value as any)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-rel-health-${index}`}
                            >
                              <option value="excellent">Excellent</option>
                              <option value="good">Good</option>
                              <option value="needs-attention">Needs Attention</option>
                              <option value="poor">Poor</option>
                            </select>
                          </div>
                        </div>

                        {relationships.length > 1 && (
                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeRelationship(index)}
                              data-testid={`button-remove-relationship-${index}`}
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Engagement Timeline</CardTitle>
                    <CardDescription>Advisory board meeting attendance and duration</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {engagementTimelineData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={engagementTimelineData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip />
                          <Legend />
                          <Line yAxisId="left" type="monotone" dataKey="attendees" stroke="#3b82f6" name="Attendees" strokeWidth={2} />
                          <Line yAxisId="right" type="monotone" dataKey="duration" stroke="#10b981" name="Duration (min)" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12" data-testid="text-no-timeline-data">Complete meetings to see engagement timeline</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Deliverable Completion</CardTitle>
                    <CardDescription>Status distribution of advisor deliverables</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {deliverableStatusData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={deliverableStatusData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.name}: ${entry.value}`}
                          >
                            {deliverableStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12" data-testid="text-no-deliverable-data">Add deliverables to see status distribution</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Advisory Board Best Practices</CardTitle>
                  <CardDescription>UK visa application requirements for advisor engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Quarterly Meeting Cadence</p>
                        <p className="text-sm text-muted-foreground">Hold formal advisory board meetings every 3 months minimum with documented agendas and outcomes</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Comprehensive Documentation</p>
                        <p className="text-sm text-muted-foreground">Maintain detailed meeting notes, action items, and email correspondence as visa evidence</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Specific Deliverables</p>
                        <p className="text-sm text-muted-foreground">Define clear advisor commitments - customer introductions, strategic feedback, fundraising support</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Letters of Support</p>
                        <p className="text-sm text-muted-foreground">Request formal endorsement letters from advisors specifically for visa application</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Prompt Onboarding</p>
                        <p className="text-sm text-muted-foreground">Complete advisor onboarding within 2 weeks of commitment to demonstrate organizational readiness</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Tips</CardTitle>
                  <CardDescription>Personalized recommendations based on your advisory board management</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getSmartTips().map((tip, index) => (
                      <Alert key={index}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription data-testid={`text-smart-tip-${index}`}>{tip}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Action Plan</CardTitle>
                  <CardDescription>Step-by-step guide to activate and manage your advisory board</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-start gap-3">
                          <Badge
                            variant={item.priority === 'Critical' ? 'destructive' : item.priority === 'High' ? 'default' : 'secondary'}
                            data-testid={`badge-action-priority-${index}`}
                          >
                            {item.priority}
                          </Badge>
                          <div className="flex-1">
                            <p className="font-medium mb-1" data-testid={`text-action-week-${index}`}>{item.week}</p>
                            <p className="text-sm text-muted-foreground" data-testid={`text-action-description-${index}`}>{item.action}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          </>
          )}
        </div>
      </div>
    </>
  );
}
