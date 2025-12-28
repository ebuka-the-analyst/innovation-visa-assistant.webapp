import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Plus, X, Target, Users, TrendingUp, AlertCircle, Layers, Building2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ScatterChart, Scatter, Cell, PieChart, Pie } from "recharts";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'role-designer',
  toolName: 'Role Designer',
  agent: 'nova',
  greeting: "Hello! I'm Nova, your Innovation Advisor. A well-designed organizational structure demonstrates your capability to build and scale a UK-based team. Let's create role definitions that align with your growth plans and visa requirements.",
  questions: [
    {
      id: 'current-team',
      question: "Describe your current team structure. How many people and what roles do you have?",
      hint: "Include founders, employees, contractors, and advisors.",
      fieldKey: 'currentTeam',
      minLength: 20
    },
    {
      id: 'first-hires',
      question: "What are the first 3 roles you plan to hire for, and why are they critical?",
      hint: "Consider technical, commercial, and operational needs.",
      fieldKey: 'firstHires',
      minLength: 40
    },
    {
      id: 'uk-job-creation',
      question: "How many UK-based jobs do you plan to create in the first 2 years?",
      hint: "Job creation is a key ILR criterion. Include full-time and part-time positions.",
      fieldKey: 'ukJobCreation',
      minLength: 20
    },
    {
      id: 'skill-gaps',
      question: "What are the key skill gaps in your current team that new hires will address?",
      hint: "Consider technical skills, market knowledge, and operational experience.",
      fieldKey: 'skillGaps',
      minLength: 30
    },
    {
      id: 'hiring-timeline',
      question: "What is your hiring timeline and budget for the first 12 months?",
      hint: "Include expected salaries, recruitment costs, and onboarding investments.",
      fieldKey: 'hiringTimeline',
      minLength: 30
    },
    {
      id: 'organizational-structure',
      question: "How will your organizational structure evolve as you scale?",
      hint: "Describe department structure, reporting lines, and leadership development.",
      fieldKey: 'organizationalStructure',
      minLength: 30
    }
  ],
  completionMessage: "Excellent organizational planning! I've captured your team structure and hiring strategy. I'm now populating your role definitions with detailed job descriptions aligned with your growth trajectory."
};

// UK Innovator Founder Visa Context (November 2025)
// Scalability Criterion: Clear organizational structure demonstrates growth potential
// Viability Criterion: Realistic role definitions show capability to execute business plan
// Key Focus: Job creation roadmap, team structure for scaling, skill requirements

interface RoleDefinition {
  id: string;
  title: string;
  department: string;
  seniority: string; // Founder, C-Level, Senior, Mid, Junior
  purpose: string; // Why this role exists
  responsibilities: string[];
  keySkills: string[];
  hiringPriority: number; // 1-10 (1=hire first, 10=hire last)
  hiringMonth: number; // Month 1-36 (3-year visa period)
  fullTime: boolean;
  estimatedSalary: number;
  impactOnScaling: string; // How role contributes to scalability
}

export default function RoleDesigner() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('role-designer-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [roles, setRoles] = useState<RoleDefinition[]>([
    {
      id: "1",
      title: "Lead Engineer",
      department: "Engineering",
      seniority: "Senior",
      purpose: "Build core product and technical infrastructure",
      responsibilities: ["Design system architecture", "Lead technical development", "Code review and quality assurance", "Mentor junior engineers"],
      keySkills: ["Full-stack development", "System design", "Team leadership", "Cloud infrastructure"],
      hiringPriority: 1,
      hiringMonth: 1,
      fullTime: true,
      estimatedSalary: 80000,
      impactOnScaling: "Critical - enables product development and technical foundation for growth"
    }
  ]);

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('role-designer-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('role-designer-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, string>) => {
    if (answers.firstHires) {
      setRoles([{
        id: "1",
        title: "Priority Hire",
        department: "To Be Defined",
        seniority: "Senior",
        purpose: answers.firstHires,
        responsibilities: answers.skillGaps ? [answers.skillGaps] : [""],
        keySkills: [""],
        hiringPriority: 1,
        hiringMonth: 3,
        fullTime: true,
        estimatedSalary: 65000,
        impactOnScaling: answers.ukJobCreation || ""
      }]);
    }
    setMode('traditional');
  };

  const saveProgress = () => {
    localStorage.setItem('roleDesignerFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('roleDesignerData', JSON.stringify({ roles }));
    localStorage.setItem('roleDesignerDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const addRole = () => {
    setRoles([...roles, {
      id: Date.now().toString(),
      title: "New Role",
      department: "Operations",
      seniority: "Mid",
      purpose: "",
      responsibilities: [""],
      keySkills: [""],
      hiringPriority: 5,
      hiringMonth: 6,
      fullTime: true,
      estimatedSalary: 50000,
      impactOnScaling: ""
    }]);
  };

  const removeRole = (id: string) => setRoles(roles.filter(r => r.id !== id));

  const updateRole = (id: string, field: string, value: any) => {
    setRoles(roles.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const addArrayItem = (id: string, field: 'responsibilities' | 'keySkills') => {
    setRoles(roles.map(r => r.id === id ? { ...r, [field]: [...r[field], ""] } : r));
  };

  const updateArrayItem = (id: string, field: 'responsibilities' | 'keySkills', index: number, value: string) => {
    setRoles(roles.map(r => {
      if (r.id === id) {
        const newArray = [...r[field]];
        newArray[index] = value;
        return { ...r, [field]: newArray };
      }
      return r;
    }));
  };

  const removeArrayItem = (id: string, field: 'responsibilities' | 'keySkills', index: number) => {
    setRoles(roles.map(r => {
      if (r.id === id) {
        return { ...r, [field]: r[field].filter((_, i) => i !== index) };
      }
      return r;
    }));
  };

  // Advanced: Organizational Clarity Score
  // Formula: Measures how well-defined and scalable the organizational structure is
  // Based on: Role definition completeness, clear hierarchy, balanced team structure
  const getOrganizationalClarityScore = (): { score: number; wellDefinedRoles: number; scalabilityGrade: string } => {
    let score = 0;
    let wellDefinedRoles = 0;
    
    roles.forEach(role => {
      let roleScore = 0;
      
      // Purpose clarity (20 points)
      if (role.purpose && role.purpose.length > 20) roleScore += 20;
      
      // Responsibility definition (25 points)
      const validResp = role.responsibilities.filter(r => r.trim().length > 0);
      if (validResp.length >= 4) roleScore += 25;
      else if (validResp.length >= 2) roleScore += 15;
      
      // Skill requirements (25 points)
      const validSkills = role.keySkills.filter(s => s.trim().length > 0);
      if (validSkills.length >= 4) roleScore += 25;
      else if (validSkills.length >= 2) roleScore += 15;
      
      // Scalability impact (20 points)
      if (role.impactOnScaling && role.impactOnScaling.length > 30) roleScore += 20;
      
      // Hiring strategy (10 points)
      if (role.hiringPriority > 0 && role.hiringMonth > 0 && role.hiringMonth <= 36) roleScore += 10;
      
      if (roleScore >= 70) wellDefinedRoles++;
      score += roleScore;
    });
    
    const avgScore = roles.length > 0 ? score / roles.length : 0;
    
    let scalabilityGrade = 'C - Needs Work';
    if (avgScore >= 90) scalabilityGrade = 'A+ - Excellent';
    else if (avgScore >= 80) scalabilityGrade = 'A - Very Good';
    else if (avgScore >= 70) scalabilityGrade = 'B - Good';
    else if (avgScore >= 60) scalabilityGrade = 'C - Acceptable';
    
    return { score: Math.round(avgScore), wellDefinedRoles, scalabilityGrade };
  };

  // Advanced: Team Structure Balance Analysis
  // Formula: Evaluates organizational hierarchy balance (too flat vs too hierarchical)
  // Optimal balance: Mix of leadership (10-20%), senior (20-30%), mid (30-40%), junior (20-30%)
  const getTeamStructureBalance = (): { balance: string; departmentCount: number; seniorityDistribution: Record<string, number> } => {
    const depts = new Set(roles.filter(r => r.department).map(r => r.department));
    const departmentCount = depts.size;
    
    const seniorityDistribution: Record<string, number> = {};
    roles.forEach(role => {
      seniorityDistribution[role.seniority] = (seniorityDistribution[role.seniority] || 0) + 1;
    });
    
    const total = roles.length;
    const leadershipCount = (seniorityDistribution['Founder'] || 0) + (seniorityDistribution['C-Level'] || 0);
    const seniorCount = seniorityDistribution['Senior'] || 0;
    const midCount = seniorityDistribution['Mid'] || 0;
    const juniorCount = seniorityDistribution['Junior'] || 0;
    
    const leadershipPct = total > 0 ? (leadershipCount / total) * 100 : 0;
    const seniorPct = total > 0 ? (seniorCount / total) * 100 : 0;
    const midPct = total > 0 ? (midCount / total) * 100 : 0;
    const juniorPct = total > 0 ? (juniorCount / total) * 100 : 0;
    
    let balance = 'Balanced';
    if (leadershipPct > 30) balance = 'Top-heavy (too many leaders)';
    else if (juniorPct > 50) balance = 'Junior-heavy (needs senior talent)';
    else if (midPct < 20 && total > 5) balance = 'Missing mid-level bridge';
    else if (total > 8 && departmentCount < 3) balance = 'Department consolidation needed';
    
    return { balance, departmentCount, seniorityDistribution };
  };

  // Advanced: Hiring Roadmap Analysis
  // Formula: Analyzes hiring timeline feasibility and capacity planning
  const getHiringRoadmapAnalysis = (): { monthlyHiring: { month: number; count: number }[]; peakMonth: number; phasing: string } => {
    const monthlyHiring: { month: number; count: number }[] = [];
    
    for (let month = 1; month <= 36; month++) {
      const hiresInMonth = roles.filter(r => r.hiringMonth === month).length;
      if (hiresInMonth > 0) {
        monthlyHiring.push({ month, count: hiresInMonth });
      }
    }
    
    const maxHires = Math.max(...monthlyHiring.map(m => m.count), 0);
    const peakMonth = monthlyHiring.find(m => m.count === maxHires)?.month || 0;
    
    let phasing = 'Gradual (recommended)';
    if (maxHires > 3) phasing = 'Aggressive (high risk)';
    else if (maxHires === 0) phasing = 'No hiring planned';
    else if (monthlyHiring.length < 4 && roles.length > 5) phasing = 'Front-loaded (risky)';
    
    return { monthlyHiring, peakMonth, phasing };
  };

  // Advanced: Skill Coverage Gap Analysis
  // Formula: Identifies missing skills across team for comprehensive capability
  const getSkillCoverageAnalysis = (): { totalUniqueSkills: number; skillFrequency: Record<string, number>; criticalGaps: string[] } => {
    const skillFrequency: Record<string, number> = {};
    
    roles.forEach(role => {
      role.keySkills.filter(s => s.trim().length > 0).forEach(skill => {
        const normalized = skill.trim().toLowerCase();
        skillFrequency[normalized] = (skillFrequency[normalized] || 0) + 1;
      });
    });
    
    const totalUniqueSkills = Object.keys(skillFrequency).length;
    
    // Identify critical startup skills often missing
    const criticalSkillsToCheck = [
      'sales', 'marketing', 'product management', 'finance', 'legal',
      'customer support', 'data analysis', 'design', 'leadership', 'operations'
    ];
    
    const criticalGaps = criticalSkillsToCheck.filter(skill => {
      return !Object.keys(skillFrequency).some(s => s.includes(skill));
    });
    
    return { totalUniqueSkills, skillFrequency, criticalGaps };
  };

  const exportPlan = () => {
    const { score: orgScore, wellDefinedRoles, scalabilityGrade } = getOrganizationalClarityScore();
    const { balance, departmentCount } = getTeamStructureBalance();
    const { phasing } = getHiringRoadmapAnalysis();
    const { totalUniqueSkills, criticalGaps } = getSkillCoverageAnalysis();
    
    const content = `UK INNOVATOR FOUNDER VISA - ORGANIZATIONAL DESIGN & ROLE FRAMEWORK
Generated: ${new Date().toLocaleDateString()}

═══════════════════════════════════════════════════════════
EXECUTIVE SUMMARY (Innovator Founder Visa Context)
═══════════════════════════════════════════════════════════
Total Roles Defined: ${roles.length}
Departments: ${departmentCount}
Full-Time Positions: ${roles.filter(r => r.fullTime).length}

SCALABILITY ASSESSMENT:
Organizational Clarity Score: ${orgScore}%
Scalability Grade: ${scalabilityGrade}
Well-Defined Roles: ${wellDefinedRoles}/${roles.length}
Team Structure: ${balance}

HIRING ROADMAP:
Hiring Phasing: ${phasing}
Total Unique Skills: ${totalUniqueSkills}
${criticalGaps.length > 0 ? `Critical Skill Gaps: ${criticalGaps.join(', ')}` : 'No critical skill gaps identified'}

═══════════════════════════════════════════════════════════
INNOVATOR FOUNDER VISA: ORGANIZATIONAL SCALABILITY
═══════════════════════════════════════════════════════════
GOV.UK Endorsement Criteria - Scalability:
• Evidence of potential to create jobs
• Plans for expanding into national/international markets
• Organizational structure demonstrates growth capability
• Clear hiring roadmap with realistic timeline

CURRENT ORGANIZATIONAL STRUCTURE:
${roles.map(r => `${r.title} (${r.department}) - ${r.seniority} - Month ${r.hiringMonth}`).join('\n')}

SCALABILITY EVIDENCE:
✓ ${roles.length} distinct roles demonstrate organizational planning
✓ ${departmentCount} departments show functional specialization
✓ Hiring timeline spans ${Math.max(...roles.map(r => r.hiringMonth), 0)} months (realistic growth)
✓ ${roles.filter(r => r.fullTime && r.estimatedSalary >= 25000).length} roles contribute to ILR job creation criterion

${roles.map((r, idx) => {
  const validResp = r.responsibilities.filter(x => x.trim().length > 0);
  const validSkills = r.keySkills.filter(x => x.trim().length > 0);
  
  return `
═══════════════════════════════════════════════════════════
ROLE ${idx + 1}: ${r.title}
═══════════════════════════════════════════════════════════
Department: ${r.department}
Seniority: ${r.seniority}
Employment: ${r.fullTime ? 'Full-Time' : 'Part-Time'}
Estimated Salary: £${r.estimatedSalary.toLocaleString()}

STRATEGIC PURPOSE:
${r.purpose || 'Not defined'}

KEY RESPONSIBILITIES:
${validResp.length > 0 ? validResp.map((resp, i) => `${i + 1}. ${resp}`).join('\n') : 'Not defined'}

REQUIRED SKILLS:
${validSkills.length > 0 ? validSkills.map(skill => `• ${skill}`).join('\n') : 'Not defined'}

HIRING STRATEGY:
Priority: ${r.hiringPriority}/10 ${r.hiringPriority <= 3 ? '(Critical hire)' : r.hiringPriority <= 6 ? '(Important)' : '(Later stage)'}
Planned Hiring: Month ${r.hiringMonth} of 36-month visa period

SCALABILITY CONTRIBUTION:
${r.impactOnScaling || 'Not defined - consider adding scalability impact description'}
${r.fullTime && r.estimatedSalary >= 25000 ? '\n✓ Counts toward ILR job creation criterion (full-time, £25k+)' : ''}
`}).join('\n')}

═══════════════════════════════════════════════════════════
ORGANIZATIONAL VIABILITY RECOMMENDATIONS
═══════════════════════════════════════════════════════════
${getViabilityRecommendations().join('\n')}

═══════════════════════════════════════════════════════════
SCALABILITY EVIDENCE FOR ENDORSING BODY
═══════════════════════════════════════════════════════════
${getScalabilityEvidence().join('\n')}

Source: GOV.UK Innovator Founder Visa Guidance (November 2025)
Criteria: Innovation, Viability, Scalability
Endorsement: Required from approved body (Envestors, UKES, Innovator International, GEP)
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'innovator-founder-organizational-design.txt';
    a.click();
  };

  // GOV.UK-Aligned Viability Recommendations
  const getViabilityRecommendations = (): string[] => {
    const tips: string[] = [];
    const { score, wellDefinedRoles } = getOrganizationalClarityScore();
    const { balance, departmentCount } = getTeamStructureBalance();
    const { criticalGaps } = getSkillCoverageAnalysis();
    
    if (score < 70) {
      tips.push(`🚨 CRITICAL: Organizational clarity score ${score}% below recommended 70% threshold`);
      tips.push(`   Endorsing bodies assess organizational capability during application review`);
      tips.push(`   Action: Complete role definitions with purpose, responsibilities, skills, scalability impact`);
    }
    
    if (wellDefinedRoles < roles.length * 0.7) {
      tips.push(`⚠️ WARNING: Only ${wellDefinedRoles}/${roles.length} roles are well-defined (target: 70%+)`);
      tips.push(`   Each role needs: clear purpose, 3+ responsibilities, 3+ skills, scalability description`);
    }
    
    if (departmentCount < 3 && roles.length > 5) {
      tips.push(`📋 Consider adding functional specialization - currently ${departmentCount} departments for ${roles.length} roles`);
      tips.push(`   Typical startup departments: Engineering, Product, Sales/Marketing, Operations, Finance`);
    }
    
    if (balance.includes('heavy') || balance.includes('Missing')) {
      tips.push(`⚠️ Team structure imbalance detected: ${balance}`);
      tips.push(`   Optimal balance: 10-20% leadership, 20-30% senior, 30-40% mid, 20-30% junior`);
    }
    
    if (criticalGaps.length > 0) {
      tips.push(`💡 Critical skill gaps identified: ${criticalGaps.slice(0, 5).join(', ')}`);
      tips.push(`   Consider adding roles to cover essential startup functions`);
    }
    
    const fullTimeRoles = roles.filter(r => r.fullTime);
    const ilrQualifyingJobs = fullTimeRoles.filter(r => r.estimatedSalary >= 25000).length;
    if (ilrQualifyingJobs >= 5) {
      tips.push(`✅ EXCELLENT: ${ilrQualifyingJobs} full-time jobs at £25k+ = meets ILR job creation criterion`);
    } else if (fullTimeRoles.length >= 5) {
      tips.push(`💡 ${fullTimeRoles.length} full-time roles planned - increase salaries to £25k+ for ILR eligibility`);
    }
    
    return tips.length > 0 ? tips : ['✅ Organizational structure demonstrates viability and scalability'];
  };

  // Scalability Evidence for Endorsement Application
  const getScalabilityEvidence = (): string[] => {
    const evidence: string[] = [];
    const { departmentCount } = getTeamStructureBalance();
    const { monthlyHiring } = getHiringRoadmapAnalysis();
    
    evidence.push(`1. ORGANIZATIONAL STRUCTURE:`);
    evidence.push(`   • ${roles.length} distinct roles demonstrate planned growth`);
    evidence.push(`   • ${departmentCount} functional departments show specialization`);
    evidence.push(`   • ${roles.filter(r => r.fullTime).length} full-time positions create employment opportunities`);
    
    evidence.push(`\n2. HIRING ROADMAP (36-Month Visa Period):`);
    const sortedHiring = monthlyHiring.sort((a, b) => a.month - b.month);
    sortedHiring.slice(0, 5).forEach(h => {
      const rolesInMonth = roles.filter(r => r.hiringMonth === h.month);
      evidence.push(`   • Month ${h.month}: ${h.count} hire(s) - ${rolesInMonth.map(r => r.title).join(', ')}`);
    });
    if (sortedHiring.length > 5) {
      evidence.push(`   • ... and ${sortedHiring.length - 5} more hiring milestones`);
    }
    
    evidence.push(`\n3. JOB CREATION FOR ILR:`);
    const ilrJobs = roles.filter(r => r.fullTime && r.estimatedSalary >= 25000);
    evidence.push(`   • ${ilrJobs.length} roles at £25k+ (ILR criterion: 5 needed)`);
    evidence.push(`   • ${roles.filter(r => r.fullTime).length} total full-time jobs (ILR criterion: 10 needed)`);
    
    evidence.push(`\n4. SCALABILITY INDICATORS:`);
    roles.filter(r => r.impactOnScaling).slice(0, 3).forEach(r => {
      evidence.push(`   • ${r.title}: ${r.impactOnScaling.substring(0, 80)}...`);
    });
    
    return evidence;
  };

  const getSerializedState = () => ({ uploadedFiles, roles, savedDate });

  // Chart 1: Hiring Timeline by Department
  const getHiringTimeline = () => {
    const data: { month: number; Engineering: number; Product: number; Sales: number; Operations: number; Other: number }[] = [];
    
    for (let month = 0; month <= 36; month += 3) {
      const byDept = { month, Engineering: 0, Product: 0, Sales: 0, Operations: 0, Other: 0 };
      
      roles.forEach(role => {
        if (role.hiringMonth <= month) {
          if (role.department === 'Engineering') byDept.Engineering++;
          else if (role.department === 'Product') byDept.Product++;
          else if (role.department === 'Sales' || role.department === 'Marketing') byDept.Sales++;
          else if (role.department === 'Operations') byDept.Operations++;
          else byDept.Other++;
        }
      });
      
      data.push(byDept);
    }
    
    return data;
  };

  // Chart 2: Seniority Distribution
  const getSeniorityDistribution = () => {
    const { seniorityDistribution } = getTeamStructureBalance();
    return Object.entries(seniorityDistribution).map(([level, count]) => ({ level, count }));
  };

  // Chart 3: Role Clarity Scores
  const getRoleClarityScores = () => {
    return roles.map(role => {
      const validResp = role.responsibilities.filter(r => r.trim().length > 0).length;
      const validSkills = role.keySkills.filter(s => s.trim().length > 0).length;
      const purposeScore = role.purpose && role.purpose.length > 20 ? 20 : 0;
      const impactScore = role.impactOnScaling && role.impactOnScaling.length > 30 ? 20 : 0;
      
      const score = purposeScore + Math.min(25, validResp * 8) + Math.min(25, validSkills * 8) + impactScore;
      
      return {
        role: role.title.substring(0, 12),
        clarity: Math.round(score),
        target: 80
      };
    });
  };

  // Chart 4: Skill Coverage Radar
  const getSkillCoverageRadar = () => {
    const { skillFrequency } = getSkillCoverageAnalysis();
    
    // Categorize skills
    const categories = {
      Technical: 0,
      Product: 0,
      Sales: 0,
      Operations: 0,
      Leadership: 0
    };
    
    Object.keys(skillFrequency).forEach(skill => {
      const count = skillFrequency[skill];
      if (skill.includes('engineer') || skill.includes('develop') || skill.includes('technical') || skill.includes('code')) {
        categories.Technical += count;
      } else if (skill.includes('product') || skill.includes('design') || skill.includes('ux')) {
        categories.Product += count;
      } else if (skill.includes('sales') || skill.includes('marketing') || skill.includes('customer')) {
        categories.Sales += count;
      } else if (skill.includes('operations') || skill.includes('finance') || skill.includes('legal')) {
        categories.Operations += count;
      } else if (skill.includes('leader') || skill.includes('management') || skill.includes('strategy')) {
        categories.Leadership += count;
      }
    });
    
    return Object.entries(categories).map(([category, count]) => ({
      category,
      coverage: Math.min(100, count * 20),
      fullMark: 100
    }));
  };

  useEffect(() => {
    const s = localStorage.getItem('roleDesignerData');
    if (s) setRoles(JSON.parse(s).roles || []);
    const f = localStorage.getItem('roleDesignerFiles');
    if (f) setUploadedFiles(JSON.parse(f));
    const d = localStorage.getItem('roleDesignerDate');
    if (d) setSavedDate(d);
  }, []);

  const { score: orgScore, wellDefinedRoles, scalabilityGrade } = getOrganizationalClarityScore();
  const { balance, departmentCount } = getTeamStructureBalance();
  const { phasing } = getHiringRoadmapAnalysis();
  const { totalUniqueSkills } = getSkillCoverageAnalysis();

  const COLORS = ['#005EB8', '#41B6E6', '#8b5cf6', '#10b981', '#ef4444'];

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold">Organizational Design & Role Framework</h1>
            <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
          </div>
          <p className="text-muted-foreground mb-6">Build scalable team structure with clear roles (Innovator Founder Visa)</p>

          {mode === 'ai' ? (
            <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} userTier={userTier} />
          ) : (
          <>
          <ToolUtilityBar
            toolId="role-designer"
            toolName="Organizational Design & Role Framework"
            onSave={saveProgress}
            onExport={exportPlan}
            getSerializedState={getSerializedState}
          />

          {savedDate && (
            <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 dark:text-green-300">Last saved: {savedDate}</AlertDescription>
            </Alert>
          )}

          {/* Advanced KPI Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Org Clarity</span>
              </div>
              <p className="text-3xl font-bold">{orgScore}%</p>
              <p className="text-xs text-muted-foreground mt-1">{scalabilityGrade}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Team Structure</span>
              </div>
              <p className="text-3xl font-bold">{roles.length}</p>
              <p className="text-xs text-muted-foreground mt-1">{departmentCount} departments</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Hiring Phasing</span>
              </div>
              <p className="text-3xl font-bold">{phasing.split(' ')[0]}</p>
              <p className="text-xs text-muted-foreground mt-1">{wellDefinedRoles} well-defined</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Layers className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Skill Coverage</span>
              </div>
              <p className="text-3xl font-bold">{totalUniqueSkills}</p>
              <p className="text-xs text-muted-foreground mt-1">Unique skills</p>
            </Card>
          </div>

          {/* Advanced: 4-Chart Analytics Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Team Growth Timeline (Scalability)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getHiringTimeline()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Cumulative Team Size', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Engineering" stackId="a" fill="#005EB8" />
                  <Bar dataKey="Product" stackId="a" fill="#41B6E6" />
                  <Bar dataKey="Sales" stackId="a" fill="#8b5cf6" />
                  <Bar dataKey="Operations" stackId="a" fill="#10b981" />
                  <Bar dataKey="Other" stackId="a" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Seniority Distribution (Structure Balance)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={getSeniorityDistribution()} dataKey="count" nameKey="level" cx="50%" cy="50%" outerRadius={80} label>
                    {getSeniorityDistribution().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Role Clarity Scores (Viability)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getRoleClarityScores()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="role" angle={-15} textAnchor="end" height={60} />
                  <YAxis label={{ value: 'Clarity %', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="clarity" fill="#005EB8" name="Clarity Score" />
                  <Bar dataKey="target" fill="#10b981" fillOpacity={0.3} name="Target (80%)" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Skill Coverage by Category</h3>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={getSkillCoverageRadar()}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Skill Coverage" dataKey="coverage" stroke="#005EB8" fill="#005EB8" fillOpacity={0.6} />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* GOV.UK-Aligned Recommendations */}
          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Viability & Scalability Recommendations</h3>
            <div className="space-y-3">
              {getViabilityRecommendations().map((tip, i) => {
                const isCritical = tip.includes('CRITICAL');
                const isWarning = tip.includes('WARNING');
                return (
                  <Alert key={i} className={isCritical ? "border-red-200 bg-red-50 dark:bg-red-950" : isWarning ? "border-orange-200 bg-orange-50 dark:bg-orange-950" : "border-blue-200 bg-blue-50 dark:bg-blue-950"}>
                    <AlertDescription className={isCritical ? "text-red-700 dark:text-red-300" : isWarning ? "text-orange-700 dark:text-orange-300" : "text-blue-700 dark:text-blue-300"}>{tip}</AlertDescription>
                  </Alert>
                );
              })}
            </div>
          </Card>

          {/* Role Editor */}
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Organizational Roles</h3>
              <Button onClick={addRole} size="sm" data-testid="button-add-role">
                <Plus className="w-4 h-4 mr-1" /> Add Role
              </Button>
            </div>

            <div className="space-y-6">
              {roles.map((role) => (
                <Card key={role.id} className="p-6 border-l-4 border-l-primary">
                  <div className="flex justify-between items-start mb-4">
                    <Input
                      value={role.title}
                      onChange={(e) => updateRole(role.id, 'title', e.target.value)}
                      className="font-semibold text-xl w-2/3"
                      placeholder="Role Title"
                      data-testid={`input-title-${role.id}`}
                    />
                    <Button variant="ghost" size="sm" onClick={() => removeRole(role.id)} data-testid={`button-remove-${role.id}`}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Department</label>
                      <Select value={role.department} onValueChange={(v) => updateRole(role.id, 'department', v)}>
                        <SelectTrigger data-testid={`select-dept-${role.id}`}><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Engineering">Engineering</SelectItem>
                          <SelectItem value="Product">Product</SelectItem>
                          <SelectItem value="Sales">Sales</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Operations">Operations</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Customer Success">Customer Success</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Seniority</label>
                      <Select value={role.seniority} onValueChange={(v) => updateRole(role.id, 'seniority', v)}>
                        <SelectTrigger data-testid={`select-seniority-${role.id}`}><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Founder">Founder</SelectItem>
                          <SelectItem value="C-Level">C-Level</SelectItem>
                          <SelectItem value="Senior">Senior</SelectItem>
                          <SelectItem value="Mid">Mid</SelectItem>
                          <SelectItem value="Junior">Junior</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Hiring Priority (1-10)</label>
                      <Input type="number" min="1" max="10" value={role.hiringPriority} onChange={(e) => updateRole(role.id, 'hiringPriority', Number(e.target.value))} data-testid={`input-priority-${role.id}`} />
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Hiring Month (1-36)</label>
                      <Input type="number" min="1" max="36" value={role.hiringMonth} onChange={(e) => updateRole(role.id, 'hiringMonth', Number(e.target.value))} data-testid={`input-month-${role.id}`} />
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Estimated Salary (£)</label>
                      <Input type="number" value={role.estimatedSalary} onChange={(e) => updateRole(role.id, 'estimatedSalary', Number(e.target.value))} data-testid={`input-salary-${role.id}`} />
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        checked={role.fullTime}
                        onChange={(e) => updateRole(role.id, 'fullTime', e.target.checked)}
                        data-testid={`checkbox-fulltime-${role.id}`}
                        className="h-4 w-4"
                      />
                      <label className="text-sm">Full-Time</label>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-sm font-medium block mb-2">Strategic Purpose</label>
                    <Textarea
                      value={role.purpose}
                      onChange={(e) => updateRole(role.id, 'purpose', e.target.value)}
                      placeholder="Why this role exists and its strategic importance..."
                      rows={2}
                      data-testid={`textarea-purpose-${role.id}`}
                    />
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium">Key Responsibilities</label>
                      <Button size="sm" variant="ghost" onClick={() => addArrayItem(role.id, 'responsibilities')} data-testid={`button-add-resp-${role.id}`}>
                        <Plus className="w-3 h-3 mr-1" /> Add
                      </Button>
                    </div>
                    {role.responsibilities.map((resp, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <Input
                          value={resp}
                          onChange={(e) => updateArrayItem(role.id, 'responsibilities', idx, e.target.value)}
                          placeholder="Responsibility..."
                          data-testid={`input-resp-${role.id}-${idx}`}
                        />
                        <Button size="sm" variant="ghost" onClick={() => removeArrayItem(role.id, 'responsibilities', idx)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium">Key Skills Required</label>
                      <Button size="sm" variant="ghost" onClick={() => addArrayItem(role.id, 'keySkills')} data-testid={`button-add-skill-${role.id}`}>
                        <Plus className="w-3 h-3 mr-1" /> Add
                      </Button>
                    </div>
                    {role.keySkills.map((skill, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <Input
                          value={skill}
                          onChange={(e) => updateArrayItem(role.id, 'keySkills', idx, e.target.value)}
                          placeholder="Skill..."
                          data-testid={`input-skill-${role.id}-${idx}`}
                        />
                        <Button size="sm" variant="ghost" onClick={() => removeArrayItem(role.id, 'keySkills', idx)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Impact on Scalability</label>
                    <Textarea
                      value={role.impactOnScaling}
                      onChange={(e) => updateRole(role.id, 'impactOnScaling', e.target.value)}
                      placeholder="How does this role contribute to business growth and scaling? (e.g., enables product development, drives revenue, builds infrastructure...)"
                      rows={2}
                      data-testid={`textarea-impact-${role.id}`}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Upload Supporting Documents</h3>
            <FileUploadButton onFileSelected={handleFileUpload} config={fileUploadConfigs.companyDocuments} />
            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <FileList files={uploadedFiles} onRemove={handleRemoveFile} />
              </div>
            )}
          </Card>
          </>
          )}
        </div>
      </div>
    </>
  );
}
