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
import { CheckCircle2, XCircle, AlertTriangle, Users, TrendingUp, Award, Calendar } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'advisory-board-builder',
  toolName: 'Advisory Board Builder',
  agent: 'atlas',
  greeting: "Hello! I'm Atlas, your Growth Strategist. Building a strong advisory board is essential for your UK Innovator Founder Visa. Endorsers want to see you've assembled credible advisors who validate your innovation and support your growth. Let's build your dream board!",
  questions: [
    {
      id: 'board-composition',
      question: "How many advisors do you plan to have, and what's your ideal board composition in terms of expertise areas?",
      hint: "Typically 3-5 advisors covering technology, market, finance, operations, and industry expertise",
      fieldKey: 'board_composition',
      minLength: 80
    },
    {
      id: 'current-advisors',
      question: "Who are your current or confirmed advisors? Share their names, titles, companies, and key expertise.",
      hint: "Include their industry experience, notable achievements, and relevance to your business",
      fieldKey: 'current_advisors',
      minLength: 100
    },
    {
      id: 'expertise-coverage',
      question: "What expertise areas are covered by your current advisors? What gaps remain?",
      hint: "Map each advisor to specific areas: technology, go-to-market, finance, legal, operations, industry",
      fieldKey: 'expertise_coverage',
      minLength: 80
    },
    {
      id: 'meeting-structure',
      question: "How will you structure your advisory board meetings? Describe your planned cadence and format.",
      hint: "Quarterly formal meetings, monthly 1-on-1s, shared communication channel, agenda format",
      fieldKey: 'meeting_structure',
      minLength: 80
    },
    {
      id: 'equity-budget',
      question: "What's your total equity budget for advisors? How will you allocate it across the board?",
      hint: "Total advisory pool typically 2-5%, individual grants 0.25-1% based on contribution level",
      fieldKey: 'equity_budget',
      minLength: 50
    },
    {
      id: 'engagement-plan',
      question: "How will you keep advisors engaged and maximize their value? Describe your engagement strategy.",
      hint: "Regular updates, specific asks, recognition, milestone celebrations, annual reviews",
      fieldKey: 'engagement_plan',
      minLength: 100
    }
  ],
  completionMessage: "Brilliant planning! You've designed a comprehensive advisory board structure. This thoughtful approach will demonstrate to endorsers that you understand how to leverage expert guidance for business growth. I'm now setting up your board tracker."
};

type OnboardingStatus = 'not-started' | 'in-progress' | 'completed';
type EngagementLevel = 'high' | 'medium' | 'low' | 'none';

type Advisor = {
  id: string;
  name: string;
  title: string;
  company: string;
  expertise: string[];
  industryYears: number;
  linkedinUrl: string;
  email: string;
  visaRelevance: 'critical' | 'high' | 'medium' | 'low';
  onboardingStatus: OnboardingStatus;
  onboardingDate: string;
  agreementSigned: boolean;
  equityGranted: number;
  meetingsAttended: number;
  totalMeetingsScheduled: number;
  lastEngagementDate: string;
  engagementLevel: EngagementLevel;
  supportLetterReceived: boolean;
  notes: string;
};

type BoardComposition = {
  targetAdvisors: number;
  minIndustryExperience: number;
  requiredExpertiseAreas: string[];
  meetingFrequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  equityBudget: number;
};

const EXPERTISE_AREAS = [
  'Industry Expertise',
  'Technology/Product',
  'Go-to-Market/Sales',
  'Finance/Fundraising',
  'Legal/Compliance',
  'Operations/Scaling',
  'Marketing/Branding',
  'HR/Talent',
  'International Expansion',
  'Strategic Partnerships'
];

const INITIAL_COMPOSITION: BoardComposition = {
  targetAdvisors: 4,
  minIndustryExperience: 10,
  requiredExpertiseAreas: [],
  meetingFrequency: 'quarterly',
  equityBudget: 2.0
};

const INITIAL_ADVISOR: Advisor = {
  id: '1',
  name: '',
  title: '',
  company: '',
  expertise: [],
  industryYears: 0,
  linkedinUrl: '',
  email: '',
  visaRelevance: 'medium',
  onboardingStatus: 'not-started',
  onboardingDate: '',
  agreementSigned: false,
  equityGranted: 0,
  meetingsAttended: 0,
  totalMeetingsScheduled: 0,
  lastEngagementDate: '',
  engagementLevel: 'none',
  supportLetterReceived: false,
  notes: ''
};

export default function AdvisoryBoardBuilder() {
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('advisory-board-builder-mode');
    return (saved === 'traditional') ? 'traditional' : 'ai';
  });
  const [composition, setComposition] = useState<BoardComposition>(INITIAL_COMPOSITION);
  const [advisors, setAdvisors] = useState<Advisor[]>([INITIAL_ADVISOR]);
  const [activeTab, setActiveTab] = useState('composition');
  const [savedDate, setSavedDate] = useState('');

  useEffect(() => {
    localStorage.setItem('advisory-board-builder-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    if (answers.current_advisors) {
      const newAdvisor: Advisor = {
        ...INITIAL_ADVISOR,
        id: 'ai-' + Date.now(),
        name: answers.current_advisors?.split(',')[0]?.trim() || 'Advisor',
        expertise: answers.expertise_coverage?.split(',').slice(0, 3).map((e: string) => e.trim()) || [],
        notes: answers.engagement_plan || ''
      };
      setAdvisors([newAdvisor]);
    }
    if (answers.board_composition) {
      const targetMatch = answers.board_composition.match(/(\d+)/);
      if (targetMatch) {
        setComposition(prev => ({
          ...prev,
          targetSize: parseInt(targetMatch[1]) || 4
        }));
      }
    }
    if (answers.equity_budget) {
      const budgetMatch = answers.equity_budget.match(/(\d+)/);
      if (budgetMatch) {
        setComposition(prev => ({
          ...prev,
          equityBudgetPercent: parseFloat(budgetMatch[1]) || 3
        }));
      }
    }
    setMode('traditional');
  };

  const addAdvisor = () => {
    const newAdvisor: Advisor = {
      ...INITIAL_ADVISOR,
      id: Date.now().toString()
    };
    setAdvisors([...advisors, newAdvisor]);
  };

  const updateAdvisor = (id: string, field: keyof Advisor, value: any) => {
    setAdvisors(advisors.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const removeAdvisor = (id: string) => {
    if (advisors.length > 1) {
      setAdvisors(advisors.filter(a => a.id !== id));
    }
  };

  const toggleExpertise = (id: string, expertiseArea: string) => {
    setAdvisors(advisors.map(a => {
      if (a.id === id) {
        const hasExpertise = a.expertise.includes(expertiseArea);
        return {
          ...a,
          expertise: hasExpertise 
            ? a.expertise.filter(e => e !== expertiseArea)
            : [...a.expertise, expertiseArea]
        };
      }
      return a;
    }));
  };

  const toggleRequiredExpertise = (area: string) => {
    setComposition(prev => ({
      ...prev,
      requiredExpertiseAreas: prev.requiredExpertiseAreas.includes(area)
        ? prev.requiredExpertiseAreas.filter(e => e !== area)
        : [...prev.requiredExpertiseAreas, area]
    }));
  };

  const onboardedAdvisors = advisors.filter(a => a.onboardingStatus === 'completed').length;
  const activeAdvisors = advisors.filter(a => a.name && a.onboardingStatus !== 'not-started').length;
  const totalEquityAllocated = advisors.reduce((sum, a) => sum + (a.equityGranted || 0), 0);
  const boardStrength = calculateBoardStrength();
  const expertiseCoverage = calculateExpertiseCoverage();
  const avgEngagement = calculateAvgEngagement();

  function calculateBoardStrength(): number {
    if (advisors.length === 0 || advisors.filter(a => a.name).length === 0) return 0;
    
    let score = 0;
    const maxScore = 100;
    
    const onboardedWeight = 30;
    const expertiseWeight = 25;
    const experienceWeight = 20;
    const engagementWeight = 15;
    const complianceWeight = 10;
    
    const onboardedScore = Math.min((onboardedAdvisors / composition.targetAdvisors) * onboardedWeight, onboardedWeight);
    score += onboardedScore;
    
    const allExpertise = new Set<string>();
    advisors.filter(a => a.onboardingStatus === 'completed').forEach(a => {
      a.expertise.forEach(e => allExpertise.add(e));
    });
    const expertiseCoverageScore = Math.min(allExpertise.size / EXPERTISE_AREAS.length, 1) * expertiseWeight;
    score += expertiseCoverageScore;
    
    const avgYears = advisors
      .filter(a => a.onboardingStatus === 'completed' && a.industryYears > 0)
      .reduce((sum, a) => sum + a.industryYears, 0) / Math.max(onboardedAdvisors, 1);
    const experienceScore = Math.min(avgYears / 20, 1) * experienceWeight;
    score += experienceScore;
    
    const advisorsWithEngagement = advisors.filter(a => 
      a.onboardingStatus === 'completed' && a.totalMeetingsScheduled > 0
    );
    const avgAttendance = advisorsWithEngagement.length > 0
      ? advisorsWithEngagement.reduce((sum, a) => 
          sum + (a.meetingsAttended / Math.max(a.totalMeetingsScheduled, 1)), 0
        ) / advisorsWithEngagement.length
      : 0;
    const engagementScore = avgAttendance * engagementWeight;
    score += engagementScore;
    
    const advisorsWithAgreements = advisors.filter(a => a.agreementSigned).length;
    const advisorsWithLetters = advisors.filter(a => a.supportLetterReceived).length;
    const complianceScore = ((advisorsWithAgreements + advisorsWithLetters) / (onboardedAdvisors * 2)) * complianceWeight;
    score += complianceScore;
    
    return Math.round(Math.min(score, maxScore));
  }

  function calculateExpertiseCoverage(): number {
    const onboarded = advisors.filter(a => a.onboardingStatus === 'completed');
    if (onboarded.length === 0) return 0;
    
    const allExpertise = new Set<string>();
    onboarded.forEach(a => a.expertise.forEach(e => allExpertise.add(e)));
    
    return Math.round((allExpertise.size / EXPERTISE_AREAS.length) * 100);
  }

  function calculateAvgEngagement(): number {
    const withMeetings = advisors.filter(a => 
      a.onboardingStatus === 'completed' && a.totalMeetingsScheduled > 0
    );
    
    if (withMeetings.length === 0) return 0;
    
    const avgAttendance = withMeetings.reduce((sum, a) => 
      sum + ((a.meetingsAttended / a.totalMeetingsScheduled) * 100), 0
    ) / withMeetings.length;
    
    return Math.round(avgAttendance);
  }

  const expertiseRadarData = EXPERTISE_AREAS.map(area => {
    const advisorCount = advisors.filter(a => 
      a.onboardingStatus === 'completed' && a.expertise.includes(area)
    ).length;
    return {
      expertise: area.length > 20 ? area.substring(0, 20) + '...' : area,
      fullName: area,
      advisors: advisorCount,
      required: composition.requiredExpertiseAreas.includes(area) ? 1 : 0
    };
  });

  const engagementTimelineData = advisors
    .filter(a => a.onboardingDate)
    .sort((a, b) => new Date(a.onboardingDate).getTime() - new Date(b.onboardingDate).getTime())
    .map(a => ({
      name: a.name || 'Unnamed',
      date: a.onboardingDate ? new Date(a.onboardingDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '',
      meetings: a.meetingsAttended,
      scheduled: a.totalMeetingsScheduled,
      attendance: a.totalMeetingsScheduled > 0 
        ? Math.round((a.meetingsAttended / a.totalMeetingsScheduled) * 100)
        : 0
    }));

  const onboardingStatusData = [
    { status: 'Not Started', count: advisors.filter(a => a.onboardingStatus === 'not-started').length, color: '#6b7280' },
    { status: 'In Progress', count: advisors.filter(a => a.onboardingStatus === 'in-progress').length, color: '#f59e0b' },
    { status: 'Completed', count: advisors.filter(a => a.onboardingStatus === 'completed').length, color: '#10b981' },
  ].filter(item => item.count > 0);

  const visaRelevanceData = [
    { level: 'Critical', count: advisors.filter(a => a.onboardingStatus === 'completed' && a.visaRelevance === 'critical').length, color: '#ef4444' },
    { level: 'High', count: advisors.filter(a => a.onboardingStatus === 'completed' && a.visaRelevance === 'high').length, color: '#f59e0b' },
    { level: 'Medium', count: advisors.filter(a => a.onboardingStatus === 'completed' && a.visaRelevance === 'medium').length, color: '#3b82f6' },
    { level: 'Low', count: advisors.filter(a => a.onboardingStatus === 'completed' && a.visaRelevance === 'low').length, color: '#6b7280' },
  ].filter(item => item.count > 0);

  const equityAllocationData = advisors
    .filter(a => a.onboardingStatus === 'completed' && a.equityGranted > 0)
    .map(a => ({
      name: a.name || 'Unnamed',
      value: a.equityGranted,
      color: getAdvisorColor(a.id)
    }));

  function getAdvisorColor(id: string): string {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316'];
    const index = advisors.findIndex(a => a.id === id);
    return colors[index % colors.length];
  }

  const getSerializedState = () => {
    return {
      composition,
      advisors,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if (state && typeof state === 'object') {
      if ('composition' in state) setComposition(state.composition);
      if ('advisors' in state) setAdvisors(state.advisors);
      if ('activeTab' in state) setActiveTab(state.activeTab);
      if ('savedDate' in state) setSavedDate(state.savedDate || '');
    }
  };

  useEffect(() => {
    const handoffKey = 'advisory-board-builder_handoff';
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
      const saved = localStorage.getItem('advisory-board-builder-state');
      if (saved) {
        const state = JSON.parse(saved);
        restoreSerializedState(state);
      }
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('advisory-board-builder-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('advisory-board-builder-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (onboardedAdvisors < composition.targetAdvisors) {
      tips.push(`You have ${onboardedAdvisors} of ${composition.targetAdvisors} target advisors onboarded. UK visa endorsers expect a fully-formed advisory board with diverse expertise to validate your business credibility`);
    }
    
    if (expertiseCoverage < 50) {
      tips.push("Expertise coverage below 50% suggests gaps in your advisory support. Aim to cover at least 5 key areas: industry expertise, technology, go-to-market, finance, and operations to demonstrate comprehensive business validation");
    }
    
    if (boardStrength < 60) {
      tips.push("Board strength score below 60% may weaken your visa application. Focus on securing signed agreements, equity grants, and support letters from each advisor to strengthen documentation");
    }
    
    const advisorsWithoutAgreements = advisors.filter(a => 
      a.onboardingStatus === 'completed' && !a.agreementSigned
    ).length;
    if (advisorsWithoutAgreements > 0) {
      tips.push(`${advisorsWithoutAgreements} onboarded advisor(s) lack signed agreements. Formal advisory agreements with equity compensation (0.25-1%) are critical evidence for UK visa applications`);
    }
    
    const advisorsWithoutLetters = advisors.filter(a => 
      a.onboardingStatus === 'completed' && !a.supportLetterReceived
    ).length;
    if (advisorsWithoutLetters > 0) {
      tips.push(`${advisorsWithoutLetters} advisor(s) have not provided support letters. Letters of support specifically endorsing your innovation and visa application are essential documentation for endorsing bodies`);
    }
    
    if (avgEngagement < 60 && onboardedAdvisors > 0) {
      tips.push("Average meeting attendance below 60% indicates low advisor engagement. UK visa officers look for evidence of active advisory relationships - schedule regular quarterly meetings and document attendance");
    }
    
    const avgExperience = advisors
      .filter(a => a.onboardingStatus === 'completed' && a.industryYears > 0)
      .reduce((sum, a) => sum + a.industryYears, 0) / Math.max(onboardedAdvisors, 1);
    if (avgExperience < composition.minIndustryExperience) {
      tips.push(`Average advisor experience (${Math.round(avgExperience)} years) is below your target (${composition.minIndustryExperience} years). UK visa applications favor advisors with 10+ years of senior industry experience and proven track records`);
    }
    
    if (totalEquityAllocated > composition.equityBudget) {
      tips.push(`You have allocated ${totalEquityAllocated.toFixed(2)}% equity, exceeding your ${composition.equityBudget}% budget. Review equity grants to ensure sustainable advisor compensation without excessive founder dilution`);
    }
    
    const criticalAdvisors = advisors.filter(a => 
      a.onboardingStatus === 'completed' && a.visaRelevance === 'critical'
    ).length;
    if (criticalAdvisors < 2) {
      tips.push("Secure at least 2 advisors with 'critical' visa relevance who can directly validate your business innovation, market potential, and scalability for UK endorsing bodies");
    }
    
    if (boardStrength >= 75 && onboardedAdvisors >= composition.targetAdvisors) {
      tips.push("Excellent board strength! Ensure you have documented evidence of all advisor relationships: signed agreements, equity schedules, meeting notes, email correspondence, and support letters ready for visa submission");
    }
    
    return tips.slice(0, 7);
  };

  const generateActionPlan = () => {
    return [
      {
        week: "Week 1",
        action: "Define ideal advisory board composition: identify 3-5 critical expertise gaps (technology, market, finance, operations) and set target number of advisors",
        priority: "Critical"
      },
      {
        week: "Week 1",
        action: "Draft advisory board value proposition document: outline your vision, advisor expectations, time commitment (2-4 hours/month), and equity compensation (0.25-1% with 2-4 year vesting)",
        priority: "Critical"
      },
      {
        week: "Week 1-2",
        action: "Research and identify 10-15 potential advisors using LinkedIn, industry events, accelerator networks, and warm introductions - prioritize senior professionals with 10+ years experience",
        priority: "High"
      },
      {
        week: "Week 2",
        action: "Prepare standard advisory agreement template covering expectations, equity grants, time commitment, termination clauses, confidentiality, and IP assignment",
        priority: "Critical"
      },
      {
        week: "Week 2",
        action: "Begin outreach to top prospects with personalized messages highlighting mutual value, your vision, and specific ways they can contribute to your success",
        priority: "Critical"
      },
      {
        week: "Week 2-3",
        action: "Conduct 30-minute intro calls with interested prospects to share vision, discuss advisory approach, assess fit, and gauge time availability",
        priority: "High"
      },
      {
        week: "Week 3",
        action: "Finalize advisor selection based on expertise alignment, visa credibility contribution, network value, and commitment level - aim for 3-5 advisors",
        priority: "Critical"
      },
      {
        week: "Week 3",
        action: "Execute signed advisory agreements with all selected advisors including equity grants, vesting schedules, and clear expectations",
        priority: "Critical"
      },
      {
        week: "Week 3-4",
        action: "Complete advisor onboarding: grant equity in cap table, add to team page, create advisor profiles with bios/photos, and establish communication channels",
        priority: "High"
      },
      {
        week: "Week 4",
        action: "Request letters of support from each advisor specifically endorsing your innovation, market potential, team capability, and visa worthiness",
        priority: "Critical"
      },
      {
        week: "Week 4",
        action: "Schedule and conduct first quarterly advisory board meeting - document agenda, discussion topics, and meeting notes as visa evidence",
        priority: "Critical"
      },
      {
        week: "Week 4",
        action: "Create comprehensive advisory board documentation package: agreements, equity schedules, bios, LinkedIn profiles, support letters, and meeting notes for visa application",
        priority: "High"
      }
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - ADVISORY BOARD BUILDER
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

ADVISORY BOARD SUMMARY
${'-'.repeat(80)}
Target Advisors: ${composition.targetAdvisors}
Active Advisors: ${activeAdvisors}
Onboarded Advisors: ${onboardedAdvisors}
Board Strength Score: ${boardStrength}%
Expertise Coverage: ${expertiseCoverage}%
Average Engagement: ${avgEngagement}%
Total Equity Allocated: ${totalEquityAllocated.toFixed(2)}%
Equity Budget: ${composition.equityBudget}%

Meeting Frequency: ${composition.meetingFrequency.charAt(0).toUpperCase() + composition.meetingFrequency.slice(1)}
Minimum Industry Experience: ${composition.minIndustryExperience} years

STATUS: ${boardStrength >= 75 ? 'STRONG ADVISORY BOARD' : boardStrength >= 50 ? 'DEVELOPING BOARD' : 'NEEDS IMPROVEMENT'}

BOARD COMPOSITION REQUIREMENTS
${'-'.repeat(80)}
Required Expertise Areas: ${composition.requiredExpertiseAreas.length > 0 ? composition.requiredExpertiseAreas.join(', ') : 'Not specified'}

Current Expertise Coverage:
${EXPERTISE_AREAS.map(area => {
  const count = advisors.filter(a => a.onboardingStatus === 'completed' && a.expertise.includes(area)).length;
  const required = composition.requiredExpertiseAreas.includes(area);
  return `${area}: ${count} advisor${count !== 1 ? 's' : ''} ${required ? '(REQUIRED)' : ''} ${count > 0 ? 'COVERED' : 'GAP'}`;
}).join('\n')}

ONBOARDED ADVISORS PORTFOLIO
${'-'.repeat(80)}
${advisors.filter(a => a.onboardingStatus === 'completed').map((advisor, i) => `
${i + 1}. ${advisor.name || 'Unnamed Advisor'}
   Title: ${advisor.title || 'Not specified'}
   Company: ${advisor.company || 'Not specified'}
   Expertise: ${advisor.expertise.join(', ') || 'Not specified'}
   Industry Experience: ${advisor.industryYears} years
   Visa Relevance: ${advisor.visaRelevance.toUpperCase()}
   
   Onboarding Date: ${advisor.onboardingDate || 'Not specified'}
   Agreement Signed: ${advisor.agreementSigned ? 'YES' : 'NO'}
   Equity Granted: ${advisor.equityGranted}%
   Support Letter Received: ${advisor.supportLetterReceived ? 'YES' : 'NO'}
   
   Meetings Attended: ${advisor.meetingsAttended} of ${advisor.totalMeetingsScheduled}
   Attendance Rate: ${advisor.totalMeetingsScheduled > 0 ? Math.round((advisor.meetingsAttended / advisor.totalMeetingsScheduled) * 100) : 0}%
   Last Engagement: ${advisor.lastEngagementDate || 'None recorded'}
   Engagement Level: ${advisor.engagementLevel.toUpperCase()}
   
   Contact: ${advisor.email || 'Not provided'}
   LinkedIn: ${advisor.linkedinUrl || 'Not provided'}
   Notes: ${advisor.notes || 'None'}
`).join('')}

${advisors.filter(a => a.onboardingStatus === 'completed').length === 0 ? 'No fully onboarded advisors yet - continue recruitment and onboarding process' : ''}

IN-PROGRESS ONBOARDING
${'-'.repeat(80)}
${advisors.filter(a => a.onboardingStatus === 'in-progress').map((advisor, i) => `
${i + 1}. ${advisor.name || 'Unnamed Advisor'}
   Title: ${advisor.title || 'Not specified'}
   Status: IN PROGRESS
   Agreement Signed: ${advisor.agreementSigned ? 'YES' : 'NO'}
   Equity Granted: ${advisor.equityGranted}%
   Next Steps: ${advisor.notes || 'Complete onboarding checklist'}
`).join('')}

${advisors.filter(a => a.onboardingStatus === 'in-progress').length === 0 ? 'No advisors currently in onboarding process' : ''}

NOT STARTED
${'-'.repeat(80)}
${advisors.filter(a => a.onboardingStatus === 'not-started').map((advisor, i) => `
${i + 1}. ${advisor.name || 'Unnamed Advisor'}
   Status: NOT STARTED
   Next Steps: Begin outreach and intro calls
`).join('')}

ENGAGEMENT METRICS
${'-'.repeat(80)}
${advisors.filter(a => a.onboardingStatus === 'completed' && a.totalMeetingsScheduled > 0).map(a => {
  const attendance = Math.round((a.meetingsAttended / a.totalMeetingsScheduled) * 100);
  return `${a.name}: ${a.meetingsAttended}/${a.totalMeetingsScheduled} meetings (${attendance}%)`;
}).join('\n')}

${advisors.filter(a => a.onboardingStatus === 'completed' && a.totalMeetingsScheduled > 0).length === 0 ? 'No engagement data available - schedule first advisory board meeting' : ''}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK RECRUITMENT & ONBOARDING PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

UK VISA ADVISORY BOARD REQUIREMENTS
${'-'.repeat(80)}
Endorser Expectations:
- Minimum 2-3 credible advisors with relevant industry expertise
- Advisors should hold senior positions (VP, Director, C-suite level)
- Demonstrated track record in startup ecosystems or your specific industry
- Formal advisory agreements with equity compensation (0.25-1%)
- Letters of support specifically endorsing your visa application
- Evidence of active engagement (meeting notes, email correspondence)

Ideal Advisory Board Composition:
1. Industry Expert - 10+ years in your target market, validates market need
2. Technical Advisor - CTO/Engineering leader, validates your innovation
3. Go-to-Market Advisor - Sales/Marketing executive, validates scalability
4. Finance/Fundraising Advisor - VC, angel investor, validates business model
5. Optional: Legal, Operations, or International Expansion advisor

Advisory Agreement Best Practices:
- Equity grant: 0.25-1% with 2-4 year vesting schedule
- Time commitment: 2-4 hours per month, quarterly board meetings
- Termination clause: Either party can exit with 30-60 days notice
- Confidentiality and IP assignment provisions
- Clear expectations on introductions, strategic guidance, fundraising

Red Flags to Avoid:
- Advisors with no relevant expertise or track record
- Too many advisors (5+ dilutes value and complicates governance)
- No formal agreements or equity grants (suggests weak commitment)
- Advisors who do not respond to emails or attend meetings
- Friends or family masquerading as credible advisors

Required Documentation for Visa Application:
- Advisory board profile document with photos, bios, LinkedIn URLs
- Signed advisor agreements with equity schedules attached
- Letters of support from each advisor endorsing your visa application
- Meeting notes from first 2-3 advisory board meetings
- Email correspondence demonstrating active advisor engagement
- Cap table showing advisor equity grants and vesting schedules

Onboarding Checklist:
1. Sign advisory agreement with equity terms
2. Grant equity and update cap table
3. Collect advisor bio, photo, and LinkedIn profile
4. Request letter of support for visa application
5. Schedule first quarterly advisory board meeting
6. Add advisor to team page and internal communications
7. Document onboarding completion date

Meeting Best Practices:
- Schedule quarterly meetings in advance (aligned with visa timing)
- Prepare agenda with specific asks for each advisor
- Document meeting notes with action items and advice given
- Follow up within 48 hours with summary email
- Track advisor attendance and engagement levels
- Store meeting documentation as visa application evidence

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `advisory-board-builder-report-${Date.now()}.txt`;
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
              <h1 className="text-4xl font-bold mb-2" data-testid="heading-advisory-board-builder">Advisory Board Builder</h1>
              <p className="text-lg text-muted-foreground">Build and manage a credible advisory board for UK visa application</p>
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
            toolId="advisory-board-builder"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Advisory Board Builder"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-advisory-board-builder">
              <TabsTrigger value="composition" data-testid="tab-composition">Composition</TabsTrigger>
              <TabsTrigger value="advisors" data-testid="tab-advisors">Advisors</TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="composition" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Board Composition Strategy</CardTitle>
                  <CardDescription>Define your ideal advisory board structure and requirements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className={onboardedAdvisors >= composition.targetAdvisors ? "border-green-500" : "border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Board Progress</p>
                          <p className="text-3xl font-bold" data-testid="text-board-progress">{onboardedAdvisors}/{composition.targetAdvisors}</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {onboardedAdvisors >= composition.targetAdvisors ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-orange-500" />
                            )}
                            <span className="text-sm">{onboardedAdvisors >= composition.targetAdvisors ? 'Target Met' : 'In Progress'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={boardStrength >= 70 ? "border-green-500" : "border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Board Strength</p>
                          <p className="text-3xl font-bold text-primary" data-testid="text-board-strength">{boardStrength}%</p>
                          <Progress value={boardStrength} className="mt-2" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Expertise Coverage</p>
                          <p className="text-3xl font-bold" data-testid="text-expertise-coverage">{expertiseCoverage}%</p>
                          <Progress value={expertiseCoverage} className="mt-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {onboardedAdvisors < composition.targetAdvisors && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        You need {composition.targetAdvisors - onboardedAdvisors} more advisor(s) to meet your target board composition. Focus on recruiting advisors with required expertise areas.
                      </AlertDescription>
                    </Alert>
                  )}

                  {boardStrength >= 75 && onboardedAdvisors >= composition.targetAdvisors && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Excellent board strength! Your advisory board is well-positioned to support your UK visa application. Ensure all documentation is complete.
                      </AlertDescription>
                    </Alert>
                  )}

                  <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-4">Board Parameters</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="target-advisors">Target Number of Advisors</Label>
                        <Input
                          id="target-advisors"
                          type="number"
                          min="1"
                          max="10"
                          value={composition.targetAdvisors}
                          onChange={(e) => setComposition({...composition, targetAdvisors: parseInt(e.target.value) || 1})}
                          data-testid="input-target-advisors"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Recommended: 3-5 advisors</p>
                      </div>
                      <div>
                        <Label htmlFor="min-experience">Minimum Industry Experience (years)</Label>
                        <Input
                          id="min-experience"
                          type="number"
                          min="0"
                          max="50"
                          value={composition.minIndustryExperience}
                          onChange={(e) => setComposition({...composition, minIndustryExperience: parseInt(e.target.value) || 0})}
                          data-testid="input-min-experience"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Recommended: 10+ years</p>
                      </div>
                      <div>
                        <Label htmlFor="meeting-frequency">Meeting Frequency</Label>
                        <select
                          id="meeting-frequency"
                          value={composition.meetingFrequency}
                          onChange={(e) => setComposition({...composition, meetingFrequency: e.target.value as any})}
                          className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                          data-testid="select-meeting-frequency"
                        >
                          <option value="weekly">Weekly</option>
                          <option value="biweekly">Biweekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                        </select>
                        <p className="text-xs text-muted-foreground mt-1">Recommended: Quarterly</p>
                      </div>
                      <div>
                        <Label htmlFor="equity-budget">Total Equity Budget (%)</Label>
                        <Input
                          id="equity-budget"
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={composition.equityBudget}
                          onChange={(e) => setComposition({...composition, equityBudget: parseFloat(e.target.value) || 0})}
                          data-testid="input-equity-budget"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Allocated: {totalEquityAllocated.toFixed(2)}%</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-4">Required Expertise Areas</h3>
                    <p className="text-sm text-muted-foreground mb-4">Select critical expertise areas you need on your advisory board</p>
                    <div className="grid md:grid-cols-2 gap-2">
                      {EXPERTISE_AREAS.map((area) => {
                        const isRequired = composition.requiredExpertiseAreas.includes(area);
                        const isCovered = advisors.some(a => 
                          a.onboardingStatus === 'completed' && a.expertise.includes(area)
                        );
                        return (
                          <div key={area} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`required-${area}`}
                              checked={isRequired}
                              onChange={() => toggleRequiredExpertise(area)}
                              className="h-4 w-4"
                              data-testid={`checkbox-required-${area}`}
                            />
                            <Label htmlFor={`required-${area}`} className="flex-1 cursor-pointer">
                              {area}
                            </Label>
                            {isCovered && <Badge variant="outline" className="text-xs">Covered</Badge>}
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advisors" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Advisory Board Management</CardTitle>
                  <CardDescription>Track advisor recruitment, onboarding, and engagement</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                          <p className="text-sm text-muted-foreground">Active Advisors</p>
                          <p className="text-2xl font-bold" data-testid="text-active-advisors">{activeAdvisors}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                          <p className="text-sm text-muted-foreground">Onboarded</p>
                          <p className="text-2xl font-bold" data-testid="text-onboarded">{onboardedAdvisors}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                          <p className="text-sm text-muted-foreground">Avg Engagement</p>
                          <p className="text-2xl font-bold" data-testid="text-avg-engagement">{avgEngagement}%</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Award className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                          <p className="text-sm text-muted-foreground">Equity Allocated</p>
                          <p className="text-2xl font-bold" data-testid="text-equity-allocated">{totalEquityAllocated.toFixed(2)}%</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Advisors</h3>
                    <Button onClick={addAdvisor} size="sm" data-testid="button-add-advisor">
                      Add Advisor
                    </Button>
                  </div>

                  {advisors.map((advisor) => (
                    <Card key={advisor.id} className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              advisor.onboardingStatus === 'completed' ? 'default' : 
                              advisor.onboardingStatus === 'in-progress' ? 'secondary' : 
                              'outline'
                            }>
                              {advisor.onboardingStatus.replace('-', ' ')}
                            </Badge>
                            {advisor.visaRelevance === 'critical' && (
                              <Badge variant="destructive">Critical for Visa</Badge>
                            )}
                          </div>
                          {advisors.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAdvisor(advisor.id)}
                              data-testid={`button-remove-advisor-${advisor.id}`}
                            >
                              Remove
                            </Button>
                          )}
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`advisor-name-${advisor.id}`}>Name</Label>
                            <Input
                              id={`advisor-name-${advisor.id}`}
                              value={advisor.name}
                              onChange={(e) => updateAdvisor(advisor.id, 'name', e.target.value)}
                              placeholder="Full Name"
                              data-testid={`input-advisor-name-${advisor.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`advisor-title-${advisor.id}`}>Title</Label>
                            <Input
                              id={`advisor-title-${advisor.id}`}
                              value={advisor.title}
                              onChange={(e) => updateAdvisor(advisor.id, 'title', e.target.value)}
                              placeholder="e.g., VP Engineering"
                              data-testid={`input-advisor-title-${advisor.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`advisor-company-${advisor.id}`}>Company</Label>
                            <Input
                              id={`advisor-company-${advisor.id}`}
                              value={advisor.company}
                              onChange={(e) => updateAdvisor(advisor.id, 'company', e.target.value)}
                              placeholder="Current Company"
                              data-testid={`input-advisor-company-${advisor.id}`}
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`advisor-years-${advisor.id}`}>Industry Years</Label>
                            <Input
                              id={`advisor-years-${advisor.id}`}
                              type="number"
                              min="0"
                              value={advisor.industryYears || ''}
                              onChange={(e) => updateAdvisor(advisor.id, 'industryYears', parseInt(e.target.value) || 0)}
                              placeholder="0"
                              data-testid={`input-advisor-years-${advisor.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`advisor-visa-relevance-${advisor.id}`}>Visa Relevance</Label>
                            <select
                              id={`advisor-visa-relevance-${advisor.id}`}
                              value={advisor.visaRelevance}
                              onChange={(e) => updateAdvisor(advisor.id, 'visaRelevance', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-advisor-visa-relevance-${advisor.id}`}
                            >
                              <option value="critical">Critical</option>
                              <option value="high">High</option>
                              <option value="medium">Medium</option>
                              <option value="low">Low</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor={`advisor-onboarding-${advisor.id}`}>Onboarding Status</Label>
                            <select
                              id={`advisor-onboarding-${advisor.id}`}
                              value={advisor.onboardingStatus}
                              onChange={(e) => updateAdvisor(advisor.id, 'onboardingStatus', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-advisor-onboarding-${advisor.id}`}
                            >
                              <option value="not-started">Not Started</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <Label className="mb-2 block">Expertise Areas</Label>
                          <div className="grid md:grid-cols-3 gap-2">
                            {EXPERTISE_AREAS.slice(0, 6).map((area) => (
                              <div key={area} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={`expertise-${advisor.id}-${area}`}
                                  checked={advisor.expertise.includes(area)}
                                  onChange={() => toggleExpertise(advisor.id, area)}
                                  className="h-4 w-4"
                                  data-testid={`checkbox-expertise-${advisor.id}-${area}`}
                                />
                                <Label htmlFor={`expertise-${advisor.id}-${area}`} className="text-xs cursor-pointer">
                                  {area}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`advisor-email-${advisor.id}`}>Email</Label>
                            <Input
                              id={`advisor-email-${advisor.id}`}
                              type="email"
                              value={advisor.email}
                              onChange={(e) => updateAdvisor(advisor.id, 'email', e.target.value)}
                              placeholder="advisor@example.com"
                              data-testid={`input-advisor-email-${advisor.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`advisor-linkedin-${advisor.id}`}>LinkedIn URL</Label>
                            <Input
                              id={`advisor-linkedin-${advisor.id}`}
                              value={advisor.linkedinUrl}
                              onChange={(e) => updateAdvisor(advisor.id, 'linkedinUrl', e.target.value)}
                              placeholder="linkedin.com/in/advisor"
                              data-testid={`input-advisor-linkedin-${advisor.id}`}
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`advisor-onboarding-date-${advisor.id}`}>Onboarding Date</Label>
                            <Input
                              id={`advisor-onboarding-date-${advisor.id}`}
                              type="date"
                              value={advisor.onboardingDate}
                              onChange={(e) => updateAdvisor(advisor.id, 'onboardingDate', e.target.value)}
                              data-testid={`input-advisor-onboarding-date-${advisor.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`advisor-equity-${advisor.id}`}>Equity Granted (%)</Label>
                            <Input
                              id={`advisor-equity-${advisor.id}`}
                              type="number"
                              step="0.01"
                              min="0"
                              max="5"
                              value={advisor.equityGranted || ''}
                              onChange={(e) => updateAdvisor(advisor.id, 'equityGranted', parseFloat(e.target.value) || 0)}
                              placeholder="0.5"
                              data-testid={`input-advisor-equity-${advisor.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`advisor-last-engagement-${advisor.id}`}>Last Engagement</Label>
                            <Input
                              id={`advisor-last-engagement-${advisor.id}`}
                              type="date"
                              value={advisor.lastEngagementDate}
                              onChange={(e) => updateAdvisor(advisor.id, 'lastEngagementDate', e.target.value)}
                              data-testid={`input-advisor-last-engagement-${advisor.id}`}
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`advisor-meetings-attended-${advisor.id}`}>Meetings Attended</Label>
                            <Input
                              id={`advisor-meetings-attended-${advisor.id}`}
                              type="number"
                              min="0"
                              value={advisor.meetingsAttended || ''}
                              onChange={(e) => updateAdvisor(advisor.id, 'meetingsAttended', parseInt(e.target.value) || 0)}
                              placeholder="0"
                              data-testid={`input-advisor-meetings-attended-${advisor.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`advisor-meetings-scheduled-${advisor.id}`}>Total Scheduled</Label>
                            <Input
                              id={`advisor-meetings-scheduled-${advisor.id}`}
                              type="number"
                              min="0"
                              value={advisor.totalMeetingsScheduled || ''}
                              onChange={(e) => updateAdvisor(advisor.id, 'totalMeetingsScheduled', parseInt(e.target.value) || 0)}
                              placeholder="0"
                              data-testid={`input-advisor-meetings-scheduled-${advisor.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`advisor-engagement-level-${advisor.id}`}>Engagement Level</Label>
                            <select
                              id={`advisor-engagement-level-${advisor.id}`}
                              value={advisor.engagementLevel}
                              onChange={(e) => updateAdvisor(advisor.id, 'engagementLevel', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-advisor-engagement-level-${advisor.id}`}
                            >
                              <option value="none">None</option>
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={advisor.agreementSigned}
                              onChange={(e) => updateAdvisor(advisor.id, 'agreementSigned', e.target.checked)}
                              className="h-4 w-4"
                              data-testid={`checkbox-agreement-signed-${advisor.id}`}
                            />
                            <span className="text-sm">Agreement Signed</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={advisor.supportLetterReceived}
                              onChange={(e) => updateAdvisor(advisor.id, 'supportLetterReceived', e.target.checked)}
                              className="h-4 w-4"
                              data-testid={`checkbox-support-letter-${advisor.id}`}
                            />
                            <span className="text-sm">Support Letter Received</span>
                          </label>
                        </div>

                        <div>
                          <Label htmlFor={`advisor-notes-${advisor.id}`}>Notes</Label>
                          <Textarea
                            id={`advisor-notes-${advisor.id}`}
                            value={advisor.notes}
                            onChange={(e) => updateAdvisor(advisor.id, 'notes', e.target.value)}
                            placeholder="Add notes about this advisor's contributions, follow-ups, etc."
                            className="h-20"
                            data-testid={`textarea-advisor-notes-${advisor.id}`}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Expertise Coverage Radar</CardTitle>
                    <CardDescription>Board expertise distribution across key areas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {expertiseRadarData.some(d => d.advisors > 0) ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <RadarChart data={expertiseRadarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="expertise" tick={{ fontSize: 11 }} />
                          <PolarRadiusAxis angle={90} domain={[0, composition.targetAdvisors]} />
                          <Radar
                            name="Advisors"
                            dataKey="advisors"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.5}
                          />
                          <Tooltip
                            content={({ payload }) => {
                              if (payload && payload.length > 0) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-background border rounded-lg p-3 shadow-lg">
                                    <p className="font-semibold text-sm mb-1">{data.fullName}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {data.advisors} advisor{data.advisors !== 1 ? 's' : ''}
                                    </p>
                                    {data.required > 0 && (
                                      <Badge variant="destructive" className="text-xs mt-1">Required</Badge>
                                    )}
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add onboarded advisors to see expertise coverage</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Equity Allocation Breakdown</CardTitle>
                    <CardDescription>Distribution of equity grants across advisors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {equityAllocationData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                          <Pie
                            data={equityAllocationData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            label={(entry) => `${entry.name}: ${entry.value}%`}
                          >
                            {equityAllocationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number) => `${value}%`}
                            content={({ payload }) => {
                              if (payload && payload.length > 0) {
                                const data = payload[0];
                                return (
                                  <div className="bg-background border rounded-lg p-3 shadow-lg">
                                    <p className="font-semibold text-sm mb-1">{data.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      Equity: {data.value}%
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {((data.value as number / composition.equityBudget) * 100).toFixed(1)}% of budget
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add equity grants to advisors to see allocation</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Board Composition by Visa Relevance</CardTitle>
                    <CardDescription>Advisory board members categorized by visa impact</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {visaRelevanceData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                          <Pie
                            data={visaRelevanceData}
                            dataKey="count"
                            nameKey="level"
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            label={(entry) => `${entry.level}: ${entry.count}`}
                          >
                            {visaRelevanceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `${value} advisor${value !== 1 ? 's' : ''}`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add onboarded advisors to see visa relevance distribution</p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Engagement Timeline</CardTitle>
                    <CardDescription>Advisor meeting attendance over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {engagementTimelineData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={engagementTimelineData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={100} />
                          <YAxis />
                          <Tooltip
                            content={({ payload }) => {
                              if (payload && payload.length > 0) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-background border rounded-lg p-3 shadow-lg">
                                    <p className="font-semibold text-sm mb-1">{data.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      Onboarded: {data.date}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Attended: {data.meetings}/{data.scheduled} ({data.attendance}%)
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend />
                          <Bar dataKey="meetings" name="Attended" fill="#10b981" />
                          <Bar dataKey="scheduled" name="Scheduled" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add onboarding dates and meeting data to see timeline</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Onboarding Pipeline Status</CardTitle>
                    <CardDescription>Current status of all advisors in pipeline</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {onboardingStatusData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={onboardingStatusData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="status" type="category" width={120} />
                          <Tooltip />
                          <Bar dataKey="count" name="Advisors">
                            {onboardingStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add advisors to see onboarding status</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics Summary</CardTitle>
                  <CardDescription>Board health indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Board Strength Score</span>
                        <span className="text-sm font-bold">{boardStrength}%</span>
                      </div>
                      <Progress value={boardStrength} />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Expertise Coverage</span>
                        <span className="text-sm font-bold">{expertiseCoverage}%</span>
                      </div>
                      <Progress value={expertiseCoverage} />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Average Engagement</span>
                        <span className="text-sm font-bold">{avgEngagement}%</span>
                      </div>
                      <Progress value={avgEngagement} />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Equity Utilization</span>
                        <span className="text-sm font-bold">
                          {totalEquityAllocated.toFixed(2)}% / {composition.equityBudget}%
                        </span>
                      </div>
                      <Progress value={(totalEquityAllocated / composition.equityBudget) * 100} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 pt-4">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm">Advisors with Agreements</span>
                        <span className="text-lg font-bold">
                          {advisors.filter(a => a.agreementSigned).length}/{onboardedAdvisors}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm">Support Letters Received</span>
                        <span className="text-lg font-bold">
                          {advisors.filter(a => a.supportLetterReceived).length}/{onboardedAdvisors}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Recommendations</CardTitle>
                  <CardDescription>AI-powered guidance for strengthening your advisory board</CardDescription>
                </CardHeader>
                <CardContent>
                  {getSmartTips().length > 0 ? (
                    <div className="space-y-3">
                      {getSmartTips().map((tip, index) => (
                        <Alert key={index}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{tip}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Add advisors and update their details to receive personalized recommendations
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>UK Visa Advisory Board Requirements</CardTitle>
                  <CardDescription>Critical compliance criteria for endorsing bodies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Minimum 2-3 Credible Advisors</p>
                        <p className="text-sm text-muted-foreground">Endorsing bodies expect a professional advisory board with relevant industry expertise to validate your business</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Senior-Level Advisors (VP, Director, C-suite)</p>
                        <p className="text-sm text-muted-foreground">Advisors should hold senior positions with 10+ years industry experience and proven track records</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Formal Advisory Agreements</p>
                        <p className="text-sm text-muted-foreground">Signed agreements with equity compensation (0.25-1%) demonstrate serious commitment</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Letters of Support</p>
                        <p className="text-sm text-muted-foreground">Each advisor should provide a letter specifically endorsing your visa application, innovation, and business potential</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Evidence of Active Engagement</p>
                        <p className="text-sm text-muted-foreground">Meeting notes, email correspondence, and documented advice demonstrate active advisory relationships</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Diverse Expertise Coverage</p>
                        <p className="text-sm text-muted-foreground">Board should cover key areas: industry expertise, technology, go-to-market, finance, and operations</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Advisory Board Recruitment Plan</CardTitle>
                  <CardDescription>Structured timeline for building your advisory board</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {generateActionPlan().map((item, index) => (
                      <div key={index} className="flex gap-4 p-4 border rounded-lg hover-elevate">
                        <div className="flex-shrink-0">
                          <Badge variant={
                            item.priority === 'Critical' ? 'destructive' : 
                            item.priority === 'High' ? 'default' : 
                            'secondary'
                          }>
                            {item.priority}
                          </Badge>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold text-sm">{item.week}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Advisor Onboarding Checklist</CardTitle>
                  <CardDescription>Essential steps for each advisor</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      'Sign advisory agreement with equity terms and vesting schedule',
                      'Grant equity and update cap table with advisor allocation',
                      'Collect advisor bio, professional photo, and LinkedIn profile',
                      'Request letter of support specifically for visa application',
                      'Schedule first quarterly advisory board meeting',
                      'Add advisor to team page and internal communication channels',
                      'Document onboarding completion date and initial engagement'
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{item}</p>
                      </div>
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
