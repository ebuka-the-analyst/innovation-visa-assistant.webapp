import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, AlertTriangle, Users, Mail, Phone, Linkedin, TrendingUp, Award } from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'advisors-finder',
  toolName: 'Advisors Finder',
  agent: 'atlas',
  greeting: "Hi there! I'm Atlas, your Growth Strategist. I'll help you identify and recruit the perfect advisory board for your UK Innovator Founder Visa application. A strong advisory board demonstrates credibility and validates your business potential. Let's find the right advisors!",
  questions: [
    {
      id: 'expertise-gaps',
      question: "What expertise gaps do you need to fill with advisors? What areas of your business need the most strategic guidance?",
      hint: "Consider technology, go-to-market, finance, operations, legal, or industry-specific knowledge",
      fieldKey: 'expertise_gaps',
      minLength: 80
    },
    {
      id: 'ideal-advisor-profile',
      question: "Describe your ideal advisor profile. What background, seniority level, and industry experience should they have?",
      hint: "Think VP/Director level, 10+ years experience, specific company backgrounds, or network connections",
      fieldKey: 'ideal_profile',
      minLength: 80
    },
    {
      id: 'target-advisors',
      question: "Do you have any specific people in mind? Who would be dream advisors for your business?",
      hint: "List names, companies, or types of professionals you'd like to approach",
      fieldKey: 'target_advisors',
      minLength: 50
    },
    {
      id: 'outreach-strategy',
      question: "How will you approach potential advisors? What's your outreach strategy and value proposition for them?",
      hint: "Consider warm introductions, LinkedIn outreach, conference networking, or accelerator connections",
      fieldKey: 'outreach_strategy',
      minLength: 100
    },
    {
      id: 'compensation-offer',
      question: "What will you offer advisors in return? Describe your proposed equity grant and time commitment expectations.",
      hint: "Typical: 0.25-1% equity vesting over 2-4 years, 2-4 hours/month commitment",
      fieldKey: 'compensation_offer',
      minLength: 60
    },
    {
      id: 'visa-relevance',
      question: "How will these advisors strengthen your visa application? What specific credibility do they add?",
      hint: "Industry validation, technical expertise, UK market knowledge, or investor connections",
      fieldKey: 'visa_relevance',
      minLength: 80
    }
  ],
  completionMessage: "Fantastic strategy! You've outlined a clear plan for building a credible advisory board. Endorsers love seeing founders who thoughtfully select advisors aligned with their business needs. I'm now creating your advisor prospect tracker."
};

type OutreachStatus = 'not-contacted' | 'contacted' | 'responded' | 'meeting-scheduled' | 'committed' | 'declined';

type AdvisorProspect = {
  id: string;
  name: string;
  title: string;
  company: string;
  expertise: string[];
  industryYears: number;
  visaRelevance: 'critical' | 'high' | 'medium' | 'low';
  outreachStatus: OutreachStatus;
  outreachDate: string;
  notes: string;
  linkedinUrl: string;
  email: string;
  phone: string;
  commitment: boolean;
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

const INITIAL_PROSPECTS: AdvisorProspect[] = [
  {
    id: '1',
    name: '',
    title: '',
    company: '',
    expertise: [],
    industryYears: 0,
    visaRelevance: 'medium',
    outreachStatus: 'not-contacted',
    outreachDate: '',
    notes: '',
    linkedinUrl: '',
    email: '',
    phone: '',
    commitment: false
  }
];

export default function AdvisorsFinder() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('advisors-finder-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });
  const [prospects, setProspects] = useState<AdvisorProspect[]>(INITIAL_PROSPECTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('finder');
  const [savedDate, setSavedDate] = useState('');

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('advisors-finder-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('advisors-finder-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    if (answers.target_advisors) {
      const newProspect: AdvisorProspect = {
        id: 'ai-' + Date.now(),
        name: answers.target_advisors?.split(',')[0]?.trim() || 'Target Advisor',
        title: answers.ideal_profile?.split(',')[0]?.trim() || 'Industry Expert',
        company: '',
        expertise: answers.expertise_gaps?.split(',').slice(0, 3).map((e: string) => e.trim()) || [],
        industryYears: 10,
        visaRelevance: 'high',
        outreachStatus: 'not-contacted',
        outreachDate: '',
        notes: answers.outreach_strategy || '',
        linkedinUrl: '',
        email: '',
        phone: '',
        commitment: false
      };
      setProspects([newProspect]);
    }
    if (answers.expertise_gaps) {
      setAdvisorNeeds(prev => ({
        ...prev,
        priorityExpertise: answers.expertise_gaps?.split(',').slice(0, 5).map((e: string) => e.trim()) || []
      }));
    }
    setMode('traditional');
  };

  const [advisorNeeds, setAdvisorNeeds] = useState({
    targetNumber: 3,
    priorityExpertise: [] as string[],
    industryFocus: '',
    geographicPreference: '',
    minimumYearsExperience: 10
  });

  const addProspect = () => {
    const newProspect: AdvisorProspect = {
      id: Date.now().toString(),
      name: '',
      title: '',
      company: '',
      expertise: [],
      industryYears: 0,
      visaRelevance: 'medium',
      outreachStatus: 'not-contacted',
      outreachDate: '',
      notes: '',
      linkedinUrl: '',
      email: '',
      phone: '',
      commitment: false
    };
    setProspects([...prospects, newProspect]);
  };

  const updateProspect = (id: string, field: keyof AdvisorProspect, value: any) => {
    setProspects(prospects.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removeProspect = (id: string) => {
    if (prospects.length > 1) {
      setProspects(prospects.filter(p => p.id !== id));
    }
  };

  const toggleExpertise = (id: string, expertiseArea: string) => {
    setProspects(prospects.map(p => {
      if (p.id === id) {
        const hasExpertise = p.expertise.includes(expertiseArea);
        return {
          ...p,
          expertise: hasExpertise 
            ? p.expertise.filter(e => e !== expertiseArea)
            : [...p.expertise, expertiseArea]
        };
      }
      return p;
    }));
  };

  const filteredProspects = prospects.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalProspects = prospects.length;
  const committedAdvisors = prospects.filter(p => p.commitment).length;
  const contactedProspects = prospects.filter(p => p.outreachStatus !== 'not-contacted').length;
  const respondedProspects = prospects.filter(p => 
    ['responded', 'meeting-scheduled', 'committed'].includes(p.outreachStatus)
  ).length;
  const declinedProspects = prospects.filter(p => p.outreachStatus === 'declined').length;

  const portfolioStrength = calculatePortfolioStrength();
  const diversityScore = calculateDiversityScore();
  const outreachEfficiency = contactedProspects > 0 
    ? Math.round((respondedProspects / contactedProspects) * 100)
    : 0;

  function calculatePortfolioStrength(): number {
    if (prospects.length === 0) return 0;
    
    let score = 0;
    const maxScore = 100;
    
    const committedWeight = 40;
    const expertiseWeight = 30;
    const experienceWeight = 20;
    const relevanceWeight = 10;
    
    const committedScore = Math.min((committedAdvisors / advisorNeeds.targetNumber) * committedWeight, committedWeight);
    score += committedScore;
    
    const allExpertise = new Set<string>();
    prospects.filter(p => p.commitment).forEach(p => {
      p.expertise.forEach(e => allExpertise.add(e));
    });
    const expertiseCoverage = Math.min(allExpertise.size / EXPERTISE_AREAS.length, 1);
    score += expertiseCoverage * expertiseWeight;
    
    const avgYears = prospects.filter(p => p.commitment && p.industryYears > 0)
      .reduce((sum, p) => sum + p.industryYears, 0) / Math.max(committedAdvisors, 1);
    const experienceScore = Math.min(avgYears / 20, 1) * experienceWeight;
    score += experienceScore;
    
    const criticalAdvisors = prospects.filter(p => p.commitment && p.visaRelevance === 'critical').length;
    const relevanceScore = Math.min((criticalAdvisors / 2) * relevanceWeight, relevanceWeight);
    score += relevanceScore;
    
    return Math.round(score);
  }

  function calculateDiversityScore(): number {
    const committedProspects = prospects.filter(p => p.commitment);
    if (committedProspects.length === 0) return 0;
    
    const expertiseSet = new Set<string>();
    committedProspects.forEach(p => p.expertise.forEach(e => expertiseSet.add(e)));
    
    return Math.round((expertiseSet.size / EXPERTISE_AREAS.length) * 100);
  }

  const expertiseDistribution = EXPERTISE_AREAS.map(area => {
    const count = prospects.filter(p => p.commitment && p.expertise.includes(area)).length;
    return {
      name: area.length > 15 ? area.substring(0, 15) + '...' : area,
      fullName: area,
      value: count,
      color: getExpertiseColor(area)
    };
  }).filter(item => item.value > 0);

  function getExpertiseColor(expertise: string): string {
    const colors: { [key: string]: string } = {
      'Industry Expertise': '#3b82f6',
      'Technology/Product': '#10b981',
      'Go-to-Market/Sales': '#f59e0b',
      'Finance/Fundraising': '#8b5cf6',
      'Legal/Compliance': '#ef4444',
      'Operations/Scaling': '#06b6d4',
      'Marketing/Branding': '#ec4899',
      'HR/Talent': '#84cc16',
      'International Expansion': '#f97316',
      'Strategic Partnerships': '#6366f1'
    };
    return colors[expertise] || '#6b7280';
  }

  const outreachStatusData = [
    { status: 'Not Contacted', count: prospects.filter(p => p.outreachStatus === 'not-contacted').length, color: '#6b7280' },
    { status: 'Contacted', count: prospects.filter(p => p.outreachStatus === 'contacted').length, color: '#3b82f6' },
    { status: 'Responded', count: prospects.filter(p => p.outreachStatus === 'responded').length, color: '#f59e0b' },
    { status: 'Meeting Scheduled', count: prospects.filter(p => p.outreachStatus === 'meeting-scheduled').length, color: '#8b5cf6' },
    { status: 'Committed', count: prospects.filter(p => p.outreachStatus === 'committed').length, color: '#10b981' },
    { status: 'Declined', count: prospects.filter(p => p.outreachStatus === 'declined').length, color: '#ef4444' },
  ].filter(item => item.count > 0);

  const visaRelevanceData = [
    { level: 'Critical', count: prospects.filter(p => p.commitment && p.visaRelevance === 'critical').length, color: '#ef4444' },
    { level: 'High', count: prospects.filter(p => p.commitment && p.visaRelevance === 'high').length, color: '#f59e0b' },
    { level: 'Medium', count: prospects.filter(p => p.commitment && p.visaRelevance === 'medium').length, color: '#3b82f6' },
    { level: 'Low', count: prospects.filter(p => p.commitment && p.visaRelevance === 'low').length, color: '#6b7280' },
  ].filter(item => item.count > 0);

  const getSerializedState = () => {
    return {
      prospects,
      searchTerm,
      activeTab,
      advisorNeeds,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('prospects' in state) setProspects(state.prospects);
    if ('searchTerm' in state) setSearchTerm(state.searchTerm);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('advisorNeeds' in state) setAdvisorNeeds(state.advisorNeeds);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const handoffKey = 'advisors-finder_handoff';
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
      const saved = localStorage.getItem('advisors-finder-state');
      if (saved) {
        const state = JSON.parse(saved);
        restoreSerializedState(state);
      }
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('advisors-finder-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('advisors-finder-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (committedAdvisors < advisorNeeds.targetNumber) {
      tips.push(`Target ${advisorNeeds.targetNumber} advisors - you currently have ${committedAdvisors} committed. UK visa endorsers expect a credible advisory board with diverse expertise`);
    }
    
    if (diversityScore < 40) {
      tips.push("Aim for at least 4-5 different expertise areas represented across your advisory board to demonstrate comprehensive business support");
    }
    
    if (portfolioStrength < 60) {
      tips.push("Portfolio strength below 60% may weaken your visa application - focus on securing advisors with critical visa-relevant expertise");
    }
    
    const criticalAdvisors = prospects.filter(p => p.commitment && p.visaRelevance === 'critical').length;
    if (criticalAdvisors < 2) {
      tips.push("Secure at least 2 'critical' visa-relevance advisors who can directly validate your business innovation and market potential");
    }
    
    if (outreachEfficiency < 30 && contactedProspects > 3) {
      tips.push("Low response rate detected - refine your outreach messaging to emphasize mutual value and advisor impact on innovation");
    }
    
    const avgExperience = prospects.filter(p => p.commitment && p.industryYears > 0)
      .reduce((sum, p) => sum + p.industryYears, 0) / Math.max(committedAdvisors, 1);
    if (avgExperience < 10) {
      tips.push("UK visa applications favor advisors with 10+ years industry experience - prioritize senior professionals with proven track records");
    }
    
    const noLinkedIn = prospects.filter(p => p.commitment && !p.linkedinUrl).length;
    if (noLinkedIn > 0) {
      tips.push("All committed advisors should have LinkedIn profiles documented - this provides verifiable credentials for visa officers");
    }
    
    if (committedAdvisors >= advisorNeeds.targetNumber && portfolioStrength >= 70) {
      tips.push("Strong advisory board assembled - prepare formal advisor agreements and letters of support for visa submission");
    }
    
    return tips.slice(0, 7);
  };

  const generateActionPlan = () => {
    return [
      {
        week: "Week 1",
        action: "Define advisor needs - identify 3-5 expertise gaps critical to your visa application (technology, market, finance, operations)",
        priority: "Critical"
      },
      {
        week: "Week 1",
        action: "Research and list 15-20 potential advisors using LinkedIn, industry events, accelerator networks, and warm introductions",
        priority: "Critical"
      },
      {
        week: "Week 1-2",
        action: "Prepare compelling advisor outreach template highlighting mutual value, your vision, and specific ways they can contribute",
        priority: "High"
      },
      {
        week: "Week 2",
        action: "Begin outreach to top 10 prospects - personalize each message referencing their specific expertise and recent work",
        priority: "Critical"
      },
      {
        week: "Week 2",
        action: "Track all outreach in this tool including dates, responses, and follow-up actions to maintain organized pipeline",
        priority: "High"
      },
      {
        week: "Week 2-3",
        action: "Schedule 30-minute intro calls with responding prospects - share your vision, ask about their advisory approach",
        priority: "Critical"
      },
      {
        week: "Week 3",
        action: "Evaluate advisor fit based on expertise alignment, time commitment, network value, and visa credibility contribution",
        priority: "High"
      },
      {
        week: "Week 3",
        action: "Draft advisor agreements outlining expectations, equity/cash compensation, meeting frequency, and termination clauses",
        priority: "High"
      },
      {
        week: "Week 3-4",
        action: "Secure formal commitments from 3-5 advisors with signed agreements and equity grants (typically 0.25-1% vesting over 2-4 years)",
        priority: "Critical"
      },
      {
        week: "Week 4",
        action: "Obtain letters of support from each advisor specifically endorsing your innovation, market potential, and visa worthiness",
        priority: "Critical"
      },
      {
        week: "Week 4",
        action: "Create advisor board profile document with photos, bios, LinkedIn URLs, and relevance to visa application",
        priority: "High"
      },
      {
        week: "Week 4",
        action: "Schedule first official advisory board meeting to demonstrate active engagement and capture meeting notes for visa evidence",
        priority: "Medium"
      }
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - ADVISORY BOARD RECRUITMENT TRACKER
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

ADVISORY BOARD SUMMARY
${'-'.repeat(80)}
Total Prospects Tracked: ${totalProspects}
Committed Advisors: ${committedAdvisors}
Target Number of Advisors: ${advisorNeeds.targetNumber}
Portfolio Strength Score: ${portfolioStrength}%
Expertise Diversity Score: ${diversityScore}%
Outreach Efficiency: ${outreachEfficiency}%

Outreach Pipeline:
- Not Contacted: ${prospects.filter(p => p.outreachStatus === 'not-contacted').length}
- Contacted: ${prospects.filter(p => p.outreachStatus === 'contacted').length}
- Responded: ${prospects.filter(p => p.outreachStatus === 'responded').length}
- Meeting Scheduled: ${prospects.filter(p => p.outreachStatus === 'meeting-scheduled').length}
- Committed: ${prospects.filter(p => p.outreachStatus === 'committed').length}
- Declined: ${prospects.filter(p => p.outreachStatus === 'declined').length}

STATUS: ${portfolioStrength >= 70 ? 'STRONG BOARD ASSEMBLED' : portfolioStrength >= 50 ? 'GOOD PROGRESS' : 'NEEDS MORE ADVISORS'}

ADVISOR NEEDS ANALYSIS
${'-'.repeat(80)}
Target Number of Advisors: ${advisorNeeds.targetNumber}
Priority Expertise Areas: ${advisorNeeds.priorityExpertise.join(', ') || 'Not specified'}
Industry Focus: ${advisorNeeds.industryFocus || 'Not specified'}
Geographic Preference: ${advisorNeeds.geographicPreference || 'Not specified'}
Minimum Years Experience: ${advisorNeeds.minimumYearsExperience}

COMMITTED ADVISORS PORTFOLIO
${'-'.repeat(80)}
${prospects.filter(p => p.commitment).map((advisor, i) => `
${i + 1}. ${advisor.name || 'Unnamed Advisor'}
   Title: ${advisor.title || 'Not specified'}
   Company: ${advisor.company || 'Not specified'}
   Expertise: ${advisor.expertise.join(', ') || 'Not specified'}
   Industry Years: ${advisor.industryYears}
   Visa Relevance: ${advisor.visaRelevance.toUpperCase()}
   Outreach Status: ${advisor.outreachStatus}
   LinkedIn: ${advisor.linkedinUrl || 'Not provided'}
   Email: ${advisor.email || 'Not provided'}
   Phone: ${advisor.phone || 'Not provided'}
   Notes: ${advisor.notes || 'None'}
`).join('')}

${prospects.filter(p => p.commitment).length === 0 ? 'No committed advisors yet - continue outreach efforts' : ''}

PROSPECT PIPELINE
${'-'.repeat(80)}
${prospects.filter(p => !p.commitment).map((prospect, i) => `
${i + 1}. ${prospect.name || 'Unnamed Prospect'}
   Title: ${prospect.title || 'Not specified'}
   Company: ${prospect.company || 'Not specified'}
   Expertise: ${prospect.expertise.join(', ') || 'Not specified'}
   Outreach Status: ${prospect.outreachStatus}
   ${prospect.outreachDate ? `Outreach Date: ${prospect.outreachDate}` : ''}
   Notes: ${prospect.notes || 'None'}
`).join('')}

EXPERTISE COVERAGE ANALYSIS
${'-'.repeat(80)}
${EXPERTISE_AREAS.map(area => {
  const count = prospects.filter(p => p.commitment && p.expertise.includes(area)).length;
  return `${area}: ${count} advisor${count !== 1 ? 's' : ''} ${count > 0 ? '✓' : '○'}`;
}).join('\n')}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK RECRUITMENT ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

UK VISA ADVISORY BOARD REQUIREMENTS
${'-'.repeat(80)}
Endorser Expectations:
- Minimum 2-3 credible advisors with relevant industry expertise
- Advisors should have senior roles (VP, Director, C-suite level)
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
- Clear expectations on introductions, strategic guidance, fundraising support

Red Flags to Avoid:
- Advisors with no relevant expertise or track record
- Too many advisors (5+ dilutes value and complicates governance)
- No formal agreements or equity grants (suggests weak commitment)
- Advisors who don't respond to emails or attend meetings
- Friends/family masquerading as credible advisors

Documentation for Visa Application:
- Advisory board profile document with bios and credentials
- Signed advisor agreements with equity schedules
- Letters of support from each advisor (template provided by immigration lawyer)
- LinkedIn profiles demonstrating advisor credibility
- Meeting notes from first 2-3 advisory board meetings
- Email correspondence showing active advisor engagement

OUTREACH STRATEGY TIPS
${'-'.repeat(80)}
Effective Outreach Template Structure:
1. Subject Line: "Advisory Role at [Your Company] - [Specific Expertise]"
2. Opening: Warm intro or mutual connection reference
3. Context: 2-3 sentences on your vision and traction
4. Ask: Specific invitation to discuss advisory role
5. Value Prop: How they uniquely can contribute + what's in it for them
6. Close: Suggest specific times for 15-minute intro call

Follow-Up Cadence:
- Day 0: Initial outreach email
- Day 3-4: Polite follow-up if no response
- Day 7-10: Final follow-up offering alternative connection methods
- After 10 days: Move to "low priority" and focus on other prospects

Meeting Preparation:
- Research advisor's background, recent work, and portfolio companies
- Prepare 5-minute pitch deck highlighting traction and vision
- Specific questions about their advisory approach and time availability
- Clear ask: "Would you be interested in joining as a formal advisor?"
- Be ready to discuss equity compensation and expectations

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `advisors-finder-report-${Date.now()}.txt`;
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
              <h1 className="text-xl font-bold mb-2" data-testid="heading-advisors-finder">Advisors Finder</h1>
              <p className="text-lg text-muted-foreground">Build a credible advisory board for UK visa application</p>
              {savedDate && (
                <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
              )}
            </div>
            <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
          </div>

          {mode === 'ai' ? (
            <AiToolGuide 
              config={AI_TOOL_CONFIG} 
              onComplete={handleAiComplete}
              onSwitchToTraditional={() => setMode('traditional')}
              userTier={userTier}
            />
          ) : (
          <>
          <ToolUtilityBar
            toolId="advisors-finder"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Advisors Finder"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-advisors-finder">
              <TabsTrigger value="finder" data-testid="tab-finder">Finder</TabsTrigger>
              <TabsTrigger value="needs" data-testid="tab-needs">Needs</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="finder" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Advisory Board Status</CardTitle>
                  <CardDescription>Track advisor prospects and recruitment progress</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card className={committedAdvisors >= advisorNeeds.targetNumber ? "border-green-500" : "border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Committed Advisors</p>
                          <p className="text-xl font-bold" data-testid="text-committed-advisors">{committedAdvisors}/{advisorNeeds.targetNumber}</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {committedAdvisors >= advisorNeeds.targetNumber ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-orange-500" />
                            )}
                            <span className="text-sm">{committedAdvisors >= advisorNeeds.targetNumber ? 'Target Met' : 'Below Target'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={portfolioStrength >= 70 ? "border-green-500" : "border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Portfolio Strength</p>
                          <p className="text-xl font-bold text-primary" data-testid="text-portfolio-strength">{portfolioStrength}%</p>
                          <Progress value={portfolioStrength} className="mt-2" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Expertise Diversity</p>
                          <p className="text-xl font-bold" data-testid="text-diversity-score">{diversityScore}%</p>
                          <Progress value={diversityScore} className="mt-2" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Outreach Efficiency</p>
                          <p className="text-xl font-bold text-green-600" data-testid="text-outreach-efficiency">{outreachEfficiency}%</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            <span className="text-sm">{respondedProspects}/{contactedProspects}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {committedAdvisors < advisorNeeds.targetNumber && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        You need {advisorNeeds.targetNumber - committedAdvisors} more committed advisor{advisorNeeds.targetNumber - committedAdvisors !== 1 ? 's' : ''} to meet your target. UK visa endorsers expect a credible advisory board.
                      </AlertDescription>
                    </Alert>
                  )}

                  {portfolioStrength < 60 && committedAdvisors > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Portfolio strength below 60% may weaken your visa application. Focus on advisors with critical expertise and 10+ years experience.
                      </AlertDescription>
                    </Alert>
                  )}

                  {portfolioStrength >= 70 && committedAdvisors >= advisorNeeds.targetNumber && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Excellent advisory board strength! Prepare formal agreements and letters of support for visa submission.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex items-center justify-between gap-4">
                    <Input
                      placeholder="Search advisors by name, company, or title..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                      data-testid="input-search-advisors"
                    />
                    <Button onClick={addProspect} data-testid="button-add-prospect">
                      Add Prospect
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {filteredProspects.map((prospect) => (
                      <Card key={prospect.id} className={prospect.commitment ? "border-green-500" : ""}>
                        <CardContent className="pt-6 space-y-4">
                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor={`name-${prospect.id}`}>Name</Label>
                              <Input
                                id={`name-${prospect.id}`}
                                value={prospect.name}
                                onChange={(e) => updateProspect(prospect.id, 'name', e.target.value)}
                                placeholder="Advisor name"
                                data-testid={`input-name-${prospect.id}`}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`title-${prospect.id}`}>Title</Label>
                              <Input
                                id={`title-${prospect.id}`}
                                value={prospect.title}
                                onChange={(e) => updateProspect(prospect.id, 'title', e.target.value)}
                                placeholder="e.g., VP Engineering"
                                data-testid={`input-title-${prospect.id}`}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`company-${prospect.id}`}>Company</Label>
                              <Input
                                id={`company-${prospect.id}`}
                                value={prospect.company}
                                onChange={(e) => updateProspect(prospect.id, 'company', e.target.value)}
                                placeholder="Current company"
                                data-testid={`input-company-${prospect.id}`}
                              />
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`years-${prospect.id}`}>Industry Years</Label>
                              <Input
                                id={`years-${prospect.id}`}
                                type="number"
                                value={prospect.industryYears || ''}
                                onChange={(e) => updateProspect(prospect.id, 'industryYears', parseInt(e.target.value) || 0)}
                                placeholder="0"
                                data-testid={`input-years-${prospect.id}`}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`relevance-${prospect.id}`}>Visa Relevance</Label>
                              <select
                                id={`relevance-${prospect.id}`}
                                value={prospect.visaRelevance}
                                onChange={(e) => updateProspect(prospect.id, 'visaRelevance', e.target.value)}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                data-testid={`select-relevance-${prospect.id}`}
                              >
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <Label>Expertise Areas</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {EXPERTISE_AREAS.map((area) => (
                                <Badge
                                  key={area}
                                  variant={prospect.expertise.includes(area) ? "default" : "outline"}
                                  className="cursor-pointer hover-elevate"
                                  onClick={() => toggleExpertise(prospect.id, area)}
                                  data-testid={`badge-expertise-${prospect.id}-${area.toLowerCase().replace(/\//g, '-').replace(/\s+/g, '-')}`}
                                >
                                  {area}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`status-${prospect.id}`}>Outreach Status</Label>
                              <select
                                id={`status-${prospect.id}`}
                                value={prospect.outreachStatus}
                                onChange={(e) => updateProspect(prospect.id, 'outreachStatus', e.target.value)}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                data-testid={`select-status-${prospect.id}`}
                              >
                                <option value="not-contacted">Not Contacted</option>
                                <option value="contacted">Contacted</option>
                                <option value="responded">Responded</option>
                                <option value="meeting-scheduled">Meeting Scheduled</option>
                                <option value="committed">Committed</option>
                                <option value="declined">Declined</option>
                              </select>
                            </div>
                            <div>
                              <Label htmlFor={`outreach-date-${prospect.id}`}>Outreach Date</Label>
                              <Input
                                id={`outreach-date-${prospect.id}`}
                                type="date"
                                value={prospect.outreachDate}
                                onChange={(e) => updateProspect(prospect.id, 'outreachDate', e.target.value)}
                                data-testid={`input-outreach-date-${prospect.id}`}
                              />
                            </div>
                          </div>

                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor={`linkedin-${prospect.id}`}>LinkedIn URL</Label>
                              <Input
                                id={`linkedin-${prospect.id}`}
                                value={prospect.linkedinUrl}
                                onChange={(e) => updateProspect(prospect.id, 'linkedinUrl', e.target.value)}
                                placeholder="https://linkedin.com/in/..."
                                data-testid={`input-linkedin-${prospect.id}`}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`email-${prospect.id}`}>Email</Label>
                              <Input
                                id={`email-${prospect.id}`}
                                type="email"
                                value={prospect.email}
                                onChange={(e) => updateProspect(prospect.id, 'email', e.target.value)}
                                placeholder="advisor@example.com"
                                data-testid={`input-email-${prospect.id}`}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`phone-${prospect.id}`}>Phone</Label>
                              <Input
                                id={`phone-${prospect.id}`}
                                value={prospect.phone}
                                onChange={(e) => updateProspect(prospect.id, 'phone', e.target.value)}
                                placeholder="+44 ..."
                                data-testid={`input-phone-${prospect.id}`}
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor={`notes-${prospect.id}`}>Notes</Label>
                            <Textarea
                              id={`notes-${prospect.id}`}
                              value={prospect.notes}
                              onChange={(e) => updateProspect(prospect.id, 'notes', e.target.value)}
                              placeholder="Conversation notes, follow-up actions, key insights..."
                              rows={3}
                              data-testid={`textarea-notes-${prospect.id}`}
                            />
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={prospect.commitment}
                                onChange={(e) => updateProspect(prospect.id, 'commitment', e.target.checked)}
                                className="h-4 w-4"
                                data-testid={`checkbox-commitment-${prospect.id}`}
                              />
                              <span className="text-sm font-medium">Committed Advisor</span>
                            </label>
                            {prospects.length > 1 && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeProspect(prospect.id)}
                                data-testid={`button-remove-${prospect.id}`}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="needs" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Define Advisor Needs</CardTitle>
                  <CardDescription>Specify your ideal advisory board composition</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="target-number">Target Number of Advisors</Label>
                      <Input
                        id="target-number"
                        type="number"
                        value={advisorNeeds.targetNumber}
                        onChange={(e) => setAdvisorNeeds({ ...advisorNeeds, targetNumber: parseInt(e.target.value) || 3 })}
                        data-testid="input-target-number"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Recommended: 3-5 advisors for visa applications</p>
                    </div>

                    <div>
                      <Label htmlFor="min-experience">Minimum Years Experience</Label>
                      <Input
                        id="min-experience"
                        type="number"
                        value={advisorNeeds.minimumYearsExperience}
                        onChange={(e) => setAdvisorNeeds({ ...advisorNeeds, minimumYearsExperience: parseInt(e.target.value) || 10 })}
                        data-testid="input-min-experience"
                      />
                      <p className="text-xs text-muted-foreground mt-1">UK visa favors 10+ years industry experience</p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="industry-focus">Industry Focus</Label>
                    <Input
                      id="industry-focus"
                      value={advisorNeeds.industryFocus}
                      onChange={(e) => setAdvisorNeeds({ ...advisorNeeds, industryFocus: e.target.value })}
                      placeholder="e.g., FinTech, HealthTech, AI/ML, SaaS"
                      data-testid="input-industry-focus"
                    />
                  </div>

                  <div>
                    <Label htmlFor="geographic-preference">Geographic Preference</Label>
                    <Input
                      id="geographic-preference"
                      value={advisorNeeds.geographicPreference}
                      onChange={(e) => setAdvisorNeeds({ ...advisorNeeds, geographicPreference: e.target.value })}
                      placeholder="e.g., UK-based, US-based, Global"
                      data-testid="input-geographic-preference"
                    />
                  </div>

                  <div>
                    <Label>Priority Expertise Areas</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {EXPERTISE_AREAS.map((area) => (
                        <Badge
                          key={area}
                          variant={advisorNeeds.priorityExpertise.includes(area) ? "default" : "outline"}
                          className="cursor-pointer hover-elevate"
                          onClick={() => {
                            const hasPriority = advisorNeeds.priorityExpertise.includes(area);
                            setAdvisorNeeds({
                              ...advisorNeeds,
                              priorityExpertise: hasPriority
                                ? advisorNeeds.priorityExpertise.filter(e => e !== area)
                                : [...advisorNeeds.priorityExpertise, area]
                            });
                          }}
                          data-testid={`badge-priority-${area.toLowerCase().replace(/\//g, '-').replace(/\s+/g, '-')}`}
                        >
                          {area}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Select 3-5 critical expertise areas for your business</p>
                  </div>

                  <Alert>
                    <Users className="h-4 w-4" />
                    <AlertDescription>
                      <strong>UK Visa Advisory Board Best Practices:</strong> Aim for 3-5 advisors with diverse expertise covering technology, market, finance, and operations. Each advisor should have 10+ years experience and formal agreement with equity compensation (0.25-1%).
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>UK Visa Requirements</CardTitle>
                  <CardDescription>Endorser expectations for advisory boards</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Credible Industry Expertise</p>
                        <p className="text-sm text-muted-foreground">Advisors should have senior roles (VP, Director, C-suite) in relevant industries with 10+ years experience</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Formal Advisory Agreements</p>
                        <p className="text-sm text-muted-foreground">Signed contracts with equity compensation (typically 0.25-1% vesting over 2-4 years)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Letters of Support</p>
                        <p className="text-sm text-muted-foreground">Each advisor provides letter specifically endorsing your innovation and visa worthiness</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Active Engagement Evidence</p>
                        <p className="text-sm text-muted-foreground">Meeting notes, email correspondence demonstrating advisors are actively involved</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Verifiable Credentials</p>
                        <p className="text-sm text-muted-foreground">LinkedIn profiles, company websites, media coverage proving advisor credibility</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Expertise Distribution</CardTitle>
                    <CardDescription>Committed advisors by expertise area</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {expertiseDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={expertiseDistribution}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.fullName}: ${entry.value}`}
                          >
                            {expertiseDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `${value} advisor${value !== 1 ? 's' : ''}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Mark advisors as committed to see expertise distribution</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Outreach Status</CardTitle>
                    <CardDescription>Pipeline progress tracking</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {outreachStatusData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={outreachStatusData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="status" angle={-45} textAnchor="end" height={100} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#3b82f6">
                            {outreachStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add prospects to see outreach pipeline</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Visa Relevance Breakdown</CardTitle>
                    <CardDescription>Committed advisors by visa importance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {visaRelevanceData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={visaRelevanceData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="level" />
                          <Tooltip />
                          <Bar dataKey="count" fill="#3b82f6">
                            {visaRelevanceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Mark advisors as committed to see visa relevance</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recruitment Metrics</CardTitle>
                    <CardDescription>Key performance indicators</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Prospects</span>
                        <span className="font-bold" data-testid="metric-total-prospects">{totalProspects}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Contacted</span>
                        <span className="font-bold" data-testid="metric-contacted">{contactedProspects}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Response Rate</span>
                        <span className="font-bold" data-testid="metric-response-rate">{outreachEfficiency}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Committed</span>
                        <span className="font-bold text-green-600" data-testid="metric-committed">{committedAdvisors}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Declined</span>
                        <span className="font-bold text-red-600" data-testid="metric-declined">{declinedProspects}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm text-muted-foreground">Conversion Rate</span>
                        <span className="font-bold text-primary" data-testid="metric-conversion">
                          {contactedProspects > 0 ? Math.round((committedAdvisors / contactedProspects) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Recommendations</CardTitle>
                  <CardDescription>AI-powered insights based on your recruitment progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getSmartTips().map((tip, index) => (
                      <Alert key={index}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription data-testid={`tip-${index}`}>{tip}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Advisor Recruitment Best Practices</CardTitle>
                  <CardDescription>Proven strategies for building a strong advisory board</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2">Ideal Board Composition</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                          <span><strong>Industry Expert:</strong> 10+ years in your target market, validates market need and opportunity</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                          <span><strong>Technical Advisor:</strong> CTO or Engineering leader who validates your innovation and technology approach</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                          <span><strong>Go-to-Market Advisor:</strong> Sales or Marketing executive who validates scalability and growth strategy</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                          <span><strong>Finance/Fundraising Advisor:</strong> VC, angel investor, or CFO who validates business model and fundraising strategy</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Outreach Best Practices</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <Award className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                          <span>Leverage warm introductions through mutual connections whenever possible (10x higher response rate)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Award className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                          <span>Personalize every outreach message referencing specific advisor work, achievements, or portfolio companies</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Award className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                          <span>Clearly articulate mutual value - how they can contribute AND what they gain (equity, learning, network)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Award className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                          <span>Follow up 2-3 times with value-added touches (relevant article, traction update) before moving on</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Red Flags to Avoid</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <XCircle className="h-4 w-4 mt-0.5 text-red-500 flex-shrink-0" />
                          <span>Friends or family with no relevant expertise masquerading as credible advisors</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <XCircle className="h-4 w-4 mt-0.5 text-red-500 flex-shrink-0" />
                          <span>Too many advisors (5+) dilutes value and complicates governance</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <XCircle className="h-4 w-4 mt-0.5 text-red-500 flex-shrink-0" />
                          <span>No formal agreements or equity grants suggests weak commitment and undermines credibility</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <XCircle className="h-4 w-4 mt-0.5 text-red-500 flex-shrink-0" />
                          <span>Advisors who don't respond to emails or attend meetings within first 3 months</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Advisor Recruitment Action Plan</CardTitle>
                  <CardDescription>Step-by-step roadmap to build your advisory board</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0">
                        <div className="flex-shrink-0">
                          <Badge 
                            variant={item.priority === 'Critical' ? 'destructive' : item.priority === 'High' ? 'default' : 'secondary'}
                            data-testid={`badge-priority-${index}`}
                          >
                            {item.priority}
                          </Badge>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm mb-1" data-testid={`week-${index}`}>{item.week}</p>
                          <p className="text-sm text-muted-foreground" data-testid={`action-${index}`}>{item.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Advisor Agreement Template</CardTitle>
                  <CardDescription>Key clauses for formal advisory agreements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-md">
                      <h4 className="font-semibold mb-2">Equity Compensation</h4>
                      <p className="text-sm text-muted-foreground">
                        Typical range: 0.25-1% equity grant with 2-4 year vesting schedule (monthly or quarterly vesting). 
                        Include 1-year cliff to ensure advisor demonstrates value before earning equity.
                      </p>
                    </div>
                    <div className="p-4 bg-muted rounded-md">
                      <h4 className="font-semibold mb-2">Time Commitment</h4>
                      <p className="text-sm text-muted-foreground">
                        Expected 2-4 hours per month including quarterly board meetings, ad-hoc emails/calls, and strategic introductions. 
                        Be specific about expectations to avoid misalignment.
                      </p>
                    </div>
                    <div className="p-4 bg-muted rounded-md">
                      <h4 className="font-semibold mb-2">Termination Clause</h4>
                      <p className="text-sm text-muted-foreground">
                        Either party can terminate with 30-60 days written notice. Unvested equity typically forfeited upon termination. 
                        Include provision for accelerated vesting in acquisition scenarios.
                      </p>
                    </div>
                    <div className="p-4 bg-muted rounded-md">
                      <h4 className="font-semibold mb-2">Confidentiality & IP</h4>
                      <p className="text-sm text-muted-foreground">
                        Standard NDA covering company confidential information. Any advisor contributions to IP are assigned to company. 
                        Essential for protecting your innovation and visa application.
                      </p>
                    </div>
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
