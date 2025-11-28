import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp, Info, Shield, Zap, Globe, Code, Database, Server, GitBranch } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LineChart, Line
} from 'recharts';

type TechStackCategories = {
  frontend: number;
  backend: number;
  database: number;
  infrastructure: number;
  devops: number;
};

type TechStackDetails = {
  frontendTech: string;
  backendTech: string;
  databaseTech: string;
  infrastructureTech: string;
  devopsTech: string;
};

type ScoreFactors = {
  scalability: number;
  security: number;
  costEfficiency: number;
  teamExpertise: number;
  modernization: number;
};

type IndustryBenchmark = {
  sector: string;
  avgScore: number;
};

const INDUSTRY_BENCHMARKS: IndustryBenchmark[] = [
  { sector: "FinTech", avgScore: 82 },
  { sector: "HealthTech", avgScore: 78 },
  { sector: "E-commerce", avgScore: 75 },
  { sector: "SaaS", avgScore: 85 },
  { sector: "AI/ML", avgScore: 88 },
  { sector: "EdTech", avgScore: 72 },
];

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'tech-stack-assess',
  toolName: 'Tech Stack Assessment',
  agent: 'nova',
  greeting: "Hello! I'm Nova, your Innovation Specialist. I'll help you assess your technology stack to demonstrate technical innovation and scalability - critical factors that endorsing bodies evaluate. Let's review your tech architecture together!",
  questions: [
    {
      id: 'frontend-tech',
      question: "What frontend technologies and frameworks does your product use? Rate your frontend architecture maturity from 1-100.",
      hint: "Include frameworks (React, Vue, Angular), state management, and design systems",
      fieldKey: 'frontend_tech'
    },
    {
      id: 'backend-tech',
      question: "What backend technologies power your product? Rate your backend architecture maturity from 1-100.",
      hint: "Include languages, frameworks, API design (REST/GraphQL), and microservices if applicable",
      fieldKey: 'backend_tech'
    },
    {
      id: 'database-tech',
      question: "What database technologies do you use? Rate your database architecture maturity from 1-100.",
      hint: "Include SQL/NoSQL choices, indexing strategies, and data modeling approach",
      fieldKey: 'database_tech'
    },
    {
      id: 'infrastructure',
      question: "What cloud infrastructure do you use? Rate your infrastructure maturity from 1-100.",
      hint: "Include AWS/Azure/GCP services, containerization, and auto-scaling capabilities",
      fieldKey: 'infrastructure_tech'
    },
    {
      id: 'devops',
      question: "Describe your DevOps practices. Rate your DevOps maturity from 1-100.",
      hint: "Include CI/CD pipelines, automated testing, monitoring, and deployment automation",
      fieldKey: 'devops_tech'
    },
    {
      id: 'security',
      question: "What security measures are implemented in your stack? Rate your security posture from 1-100.",
      hint: "Include encryption, authentication, vulnerability scanning, and GDPR compliance",
      fieldKey: 'security_rating'
    },
    {
      id: 'scalability',
      question: "How scalable is your current architecture? What evidence do you have of scalability (load tests, user growth)?",
      hint: "Endorsers want to see technical capability to support growth projections",
      fieldKey: 'scalability_evidence'
    }
  ]
};

export default function TechStackAssess() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('tech-stack-assess-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('tech-stack-assess-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('tech-stack-assess-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, string>) => {
    if (answers.frontend_tech) {
      const score = parseInt(answers.frontend_tech.match(/\d+/)?.[0] || '50');
      setCategories(prev => ({ ...prev, frontend: Math.min(100, score) }));
      setDetails(prev => ({ ...prev, frontendTech: answers.frontend_tech }));
    }
    if (answers.backend_tech) {
      const score = parseInt(answers.backend_tech.match(/\d+/)?.[0] || '50');
      setCategories(prev => ({ ...prev, backend: Math.min(100, score) }));
      setDetails(prev => ({ ...prev, backendTech: answers.backend_tech }));
    }
    if (answers.database_tech) {
      const score = parseInt(answers.database_tech.match(/\d+/)?.[0] || '50');
      setCategories(prev => ({ ...prev, database: Math.min(100, score) }));
      setDetails(prev => ({ ...prev, databaseTech: answers.database_tech }));
    }
    if (answers.infrastructure_tech) {
      const score = parseInt(answers.infrastructure_tech.match(/\d+/)?.[0] || '50');
      setCategories(prev => ({ ...prev, infrastructure: Math.min(100, score) }));
      setDetails(prev => ({ ...prev, infrastructureTech: answers.infrastructure_tech }));
    }
    if (answers.devops_tech) {
      const score = parseInt(answers.devops_tech.match(/\d+/)?.[0] || '50');
      setCategories(prev => ({ ...prev, devops: Math.min(100, score) }));
      setDetails(prev => ({ ...prev, devopsTech: answers.devops_tech }));
    }
    if (answers.security_rating) {
      const score = parseInt(answers.security_rating.match(/\d+/)?.[0] || '50');
      setFactors(prev => ({ ...prev, security: Math.min(100, score) }));
    }
    setMode('traditional');
  };

  const [categories, setCategories] = useState<TechStackCategories>({
    frontend: 50,
    backend: 50,
    database: 50,
    infrastructure: 50,
    devops: 50
  });

  const [details, setDetails] = useState<TechStackDetails>({
    frontendTech: '',
    backendTech: '',
    databaseTech: '',
    infrastructureTech: '',
    devopsTech: ''
  });

  const [factors, setFactors] = useState<ScoreFactors>({
    scalability: 50,
    security: 50,
    costEfficiency: 50,
    teamExpertise: 50,
    modernization: 50
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [savedDate, setSavedDate] = useState('');
  const [selectedSector, setSelectedSector] = useState('SaaS');

  const updateCategory = (field: keyof TechStackCategories, value: number) => {
    setCategories(prev => ({ ...prev, [field]: value }));
  };

  const updateDetail = (field: keyof TechStackDetails, value: string) => {
    setDetails(prev => ({ ...prev, [field]: value }));
  };

  const updateFactor = (field: keyof ScoreFactors, value: number) => {
    setFactors(prev => ({ ...prev, [field]: value }));
  };

  const techStackScore = Math.round(
    (categories.frontend * 0.20) +
    (categories.backend * 0.20) +
    (categories.database * 0.20) +
    (categories.infrastructure * 0.20) +
    (categories.devops * 0.20)
  );

  const qualityScore = Math.round(
    (factors.scalability * 0.25) +
    (factors.security * 0.25) +
    (factors.costEfficiency * 0.20) +
    (factors.teamExpertise * 0.15) +
    (factors.modernization * 0.15)
  );

  const overallScore = Math.round((techStackScore * 0.5) + (qualityScore * 0.5));

  const passThreshold = 65;
  const strongThreshold = 75;
  const meetsMinimum = overallScore >= passThreshold;
  const isStrongCandidate = overallScore >= strongThreshold;

  const radarData = [
    { category: 'Frontend', value: categories.frontend, fullMark: 100 },
    { category: 'Backend', value: categories.backend, fullMark: 100 },
    { category: 'Database', value: categories.database, fullMark: 100 },
    { category: 'Infrastructure', value: categories.infrastructure, fullMark: 100 },
    { category: 'DevOps', value: categories.devops, fullMark: 100 },
  ];

  const factorsRadarData = [
    { factor: 'Scalability', value: factors.scalability, fullMark: 100 },
    { factor: 'Security', value: factors.security, fullMark: 100 },
    { factor: 'Cost Efficiency', value: factors.costEfficiency, fullMark: 100 },
    { factor: 'Team Expertise', value: factors.teamExpertise, fullMark: 100 },
    { factor: 'Modernization', value: factors.modernization, fullMark: 100 },
  ];

  const benchmarkData = INDUSTRY_BENCHMARKS.map(b => ({
    sector: b.sector,
    yourScore: overallScore,
    industryAvg: b.avgScore,
    gap: overallScore - b.avgScore
  }));

  const getSerializedState = () => {
    return {
      categories,
      details,
      factors,
      activeTab,
      selectedSector,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('categories' in state) setCategories(state.categories);
    if ('details' in state) setDetails(state.details);
    if ('factors' in state) setFactors(state.factors);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('selectedSector' in state) setSelectedSector(state.selectedSector);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const handoffKey = 'tech-stack-assess_handoff';
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
      const saved = localStorage.getItem('tech-stack-assess-state');
      if (saved) {
        const state = JSON.parse(saved);
        restoreSerializedState(state);
      }
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('tech-stack-assess-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('tech-stack-assess-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (categories.frontend < 60) {
      tips.push("Frontend Technology Gap: Modern, scalable frontend architecture is critical for innovation visa. Document component-based architecture, state management strategy, and responsive design implementation. UK immigration values technical sophistication in user-facing applications.");
    }
    if (categories.frontend >= 75) {
      tips.push("Strong Frontend Architecture: Excellent frontend tech stack. Prepare technical documentation showing React/Vue/Angular architecture, performance optimization strategies, and accessibility compliance for visa evidence.");
    }
    if (categories.backend < 60) {
      tips.push("Backend Infrastructure Weakness: Robust backend architecture demonstrates technical capability crucial for innovation visa. Document API design, microservices architecture if applicable, data processing pipelines, and scalability strategies.");
    }
    if (categories.backend >= 75) {
      tips.push("Exceptional Backend Architecture: Your backend infrastructure is strong. Document RESTful/GraphQL API design, authentication/authorization implementation, database optimization, and system architecture diagrams for immigration evidence.");
    }
    if (categories.database < 60) {
      tips.push("Database Architecture Concerns: Scalable database design is essential for demonstrating technical innovation. Document data modeling decisions, indexing strategies, replication/backup procedures, and performance optimization approaches.");
    }
    if (categories.database >= 75) {
      tips.push("Robust Database Design: Strong database architecture. Prepare entity-relationship diagrams, query optimization documentation, data migration strategies, and disaster recovery procedures for visa application evidence.");
    }
    if (categories.infrastructure < 60) {
      tips.push("Infrastructure Deficiency: Cloud-native infrastructure demonstrates scalability required for innovation visa approval. Document cloud architecture (AWS/Azure/GCP), containerization strategy, load balancing, and auto-scaling configuration.");
    }
    if (categories.infrastructure >= 75) {
      tips.push("Excellent Infrastructure Strategy: Your cloud infrastructure is well-architected. Document infrastructure-as-code implementation, multi-region deployment capability, CDN configuration, and disaster recovery procedures.");
    }
    if (categories.devops < 60) {
      tips.push("DevOps Maturity Gap: Modern DevOps practices demonstrate operational excellence valued in innovation visa applications. Document CI/CD pipelines, automated testing frameworks, monitoring/alerting systems, and deployment automation.");
    }
    if (categories.devops >= 75) {
      tips.push("Advanced DevOps Practices: Strong DevOps maturity. Document CI/CD pipeline architecture, infrastructure automation, observability stack, security scanning integration, and deployment rollback procedures.");
    }
    if (factors.scalability < 65) {
      tips.push("Scalability Critical Weakness: UK innovation visa requires demonstrating growth capability. Document horizontal/vertical scaling strategies, caching implementation, database sharding plans, and load testing results proving scalability.");
    }
    if (factors.security < 65) {
      tips.push("Security Posture Insufficient: Security is non-negotiable for innovation visa approval. Document encryption standards, authentication/authorization mechanisms, vulnerability scanning procedures, GDPR/data protection compliance, and security audit results.");
    }
    if (factors.security >= 80) {
      tips.push("Excellent Security Posture: Strong security implementation. Prepare security architecture documentation, penetration testing results, compliance certifications (ISO 27001, SOC 2), and data protection impact assessments for immigration evidence.");
    }
    if (factors.costEfficiency < 60) {
      tips.push("Cost Optimization Needed: Demonstrating cost-effective architecture shows business acumen required for innovation visa. Document cloud cost optimization strategies, resource utilization monitoring, reserved instance usage, and cost per user metrics.");
    }
    if (factors.teamExpertise < 55) {
      tips.push("Team Skills Gap: Technical team capability is assessed in innovation visa applications. Document team technical certifications, training programs, knowledge sharing processes, and hiring plans for critical skill gaps.");
    }
    if (factors.modernization < 60) {
      tips.push("Technology Modernization Required: Using current, industry-standard technologies demonstrates innovation. Document migration from legacy systems, adoption of modern frameworks, containerization efforts, and technology roadmap for next 12-24 months.");
    }
    if (overallScore < passThreshold) {
      tips.push("Overall Tech Stack Below Threshold: Your technology stack needs significant strengthening before endorsing body submission. Prioritize weakest categories first - most immigration rejections cite inadequate technical sophistication as a factor.");
    }
    if (overallScore >= strongThreshold) {
      tips.push("Outstanding Technology Stack: Your tech stack positions you as a strong innovation visa candidate. Ensure comprehensive technical documentation including architecture diagrams, technology decision rationales, and scalability evidence.");
    }
    
    const weakestCategory = Object.entries(categories).reduce((min, [key, val]) => val < min[1] ? [key, val] : min, ['', 100]);
    if (weakestCategory[1] < 55) {
      tips.push(`Critical Focus Area - ${weakestCategory[0]}: This is your weakest technology category at ${weakestCategory[1]}%. Immigration assessors will identify this gap. Prioritize modernizing this area with evidence of recent improvements and future roadmap.`);
    }

    if (Math.max(...Object.values(categories)) - Math.min(...Object.values(categories)) > 35) {
      tips.push("Unbalanced Technology Stack: Large gaps between category scores may indicate architectural inconsistencies. UK immigration values cohesive, well-integrated technology stacks over strong performance in isolated areas.");
    }

    if (factors.scalability >= 75 && factors.security >= 75 && categories.devops >= 70) {
      tips.push("Production-Ready Architecture: Your combination of scalability, security, and DevOps maturity demonstrates enterprise-grade architecture - a significant advantage for innovation visa approval. Document these capabilities comprehensively.");
    }

    return tips.slice(0, 10);
  };

  const generateActionPlan = () => {
    const actions = [];
    
    actions.push({
      week: "Week 1",
      action: "Complete comprehensive technology stack audit documenting all components from frontend to infrastructure with version numbers and deployment configurations",
      priority: "Critical"
    });
    
    if (categories.frontend < 70) {
      actions.push({
        week: "Week 1",
        action: "Document frontend architecture: component hierarchy diagrams, state management flow, routing strategy, performance optimization techniques, and accessibility compliance measures",
        priority: "Critical"
      });
    }
    
    if (categories.backend < 70) {
      actions.push({
        week: "Week 1-2",
        action: "Prepare backend architecture documentation: API specifications (Swagger/OpenAPI), database schema diagrams, authentication flows, error handling strategies, and rate limiting implementation",
        priority: "Critical"
      });
    }
    
    if (categories.database < 65) {
      actions.push({
        week: "Week 1-2",
        action: "Document database architecture: entity-relationship diagrams, indexing strategies, query optimization examples, backup/recovery procedures, and data migration plans for scaling",
        priority: "Critical"
      });
    }
    
    if (categories.infrastructure < 70) {
      actions.push({
        week: "Week 2",
        action: "Create infrastructure documentation: cloud architecture diagrams, containerization setup (Docker/Kubernetes), load balancing configuration, CDN implementation, and auto-scaling policies",
        priority: "High"
      });
    }
    
    if (categories.devops < 70) {
      actions.push({
        week: "Week 2-3",
        action: "Document DevOps practices: CI/CD pipeline diagrams, automated testing coverage reports, deployment automation scripts, monitoring/alerting configurations, and incident response procedures",
        priority: "High"
      });
    }
    
    if (factors.scalability < 70) {
      actions.push({
        week: "Week 2-3",
        action: "Prepare scalability evidence: load testing results, horizontal scaling demonstrations, caching strategy documentation, database sharding plans, and capacity planning calculations",
        priority: "High"
      });
    }
    
    if (factors.security < 70) {
      actions.push({
        week: "Week 2-3",
        action: "Compile security documentation: encryption protocols, authentication/authorization architecture, vulnerability scanning results, GDPR compliance measures, and security incident response plans",
        priority: "Critical"
      });
    }
    
    actions.push({
      week: "Week 3",
      action: "Create technology decision rationale document explaining why each technology choice supports your innovation goals and business scalability requirements",
      priority: "High"
    });
    
    actions.push({
      week: "Week 3",
      action: "Prepare team expertise evidence: technical certifications, relevant experience documentation, knowledge transfer processes, and technical hiring roadmap for next 12 months",
      priority: "Medium"
    });
    
    actions.push({
      week: "Week 3-4",
      action: "Document modernization roadmap: planned technology upgrades, migration strategies from legacy systems, adoption timeline for emerging technologies relevant to your sector",
      priority: "Medium"
    });
    
    actions.push({
      week: "Week 4",
      action: "Compile technology stack evidence portfolio organized by category: architecture diagrams, technical specifications, performance benchmarks, security assessments, and third-party audits",
      priority: "High"
    });
    
    actions.push({
      week: "Week 4",
      action: "Practice technical interview responses - be prepared to defend technology choices, explain scalability strategies, and demonstrate deep technical understanding to endorsing body assessors",
      priority: "Medium"
    });
    
    actions.push({
      week: "Ongoing",
      action: "Monitor technology stack health metrics: uptime, performance, security vulnerabilities, and cost efficiency - maintain evidence of operational excellence throughout application period",
      priority: "Medium"
    });
    
    return actions.slice(0, 14);
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - TECHNOLOGY STACK ASSESSMENT
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

OVERALL TECHNOLOGY ASSESSMENT
${'-'.repeat(80)}
Overall Tech Stack Score: ${overallScore}/100
Tech Categories Score: ${techStackScore}/100
Quality Factors Score: ${qualityScore}/100
Status: ${meetsMinimum ? (isStrongCandidate ? 'STRONG TECHNICAL CAPABILITY' : 'MEETS MINIMUM TECHNICAL THRESHOLD') : 'BELOW TECHNICAL THRESHOLD'}
Pass Threshold: ${passThreshold}/100
Strong Candidate Threshold: ${strongThreshold}/100
Selected Industry Sector: ${selectedSector}

TECHNOLOGY STACK CATEGORIES BREAKDOWN
${'-'.repeat(80)}

1. FRONTEND TECHNOLOGY (20% weighting): ${categories.frontend}/100
   Technologies Used: ${details.frontendTech || 'Not specified'}
   Assessment: ${categories.frontend >= 70 ? 'STRONG - Modern frontend architecture' : categories.frontend >= 60 ? 'ADEQUATE - Basic frontend capability' : 'NEEDS IMPROVEMENT - Frontend modernization required'}
   
   Innovation Visa Relevance: Frontend technology demonstrates user experience innovation
   and technical sophistication. Modern frameworks (React, Vue, Angular) with component-based
   architecture, state management, and responsive design show technical capability valued in
   UK innovation visa applications.
   
   Evidence Required:
   - Component hierarchy and architecture diagrams
   - State management strategy documentation (Redux, Vuex, Context API)
   - Performance optimization techniques and metrics
   - Accessibility compliance (WCAG 2.1) implementation
   - Progressive Web App capabilities if applicable
   - Responsive design across device types
   - Browser compatibility matrix

2. BACKEND TECHNOLOGY (20% weighting): ${categories.backend}/100
   Technologies Used: ${details.backendTech || 'Not specified'}
   Assessment: ${categories.backend >= 70 ? 'EXCELLENT - Robust backend infrastructure' : categories.backend >= 60 ? 'ADEQUATE - Basic backend functionality' : 'WEAK - Backend modernization critical'}
   
   Innovation Visa Relevance: Backend architecture demonstrates scalability and technical
   depth required for innovation visa approval. RESTful/GraphQL APIs, microservices,
   asynchronous processing, and data pipeline sophistication indicate genuine technical
   innovation beyond basic CRUD operations.
   
   Evidence Required:
   - API architecture documentation (REST/GraphQL specifications)
   - Microservices architecture diagrams if applicable
   - Authentication/authorization implementation (OAuth, JWT)
   - Rate limiting and API security measures
   - Asynchronous job processing architecture
   - Data validation and error handling strategies
   - Third-party API integrations documentation

3. DATABASE TECHNOLOGY (20% weighting): ${categories.database}/100
   Technologies Used: ${details.databaseTech || 'Not specified'}
   Assessment: ${categories.database >= 70 ? 'STRONG - Scalable database architecture' : categories.database >= 60 ? 'MODERATE - Basic database implementation' : 'WEAK - Database optimization required'}
   
   Innovation Visa Relevance: Database architecture demonstrates data management sophistication
   and scalability essential for growing businesses. Proper data modeling, indexing strategies,
   replication, and backup procedures show operational maturity valued in visa assessment.
   
   Evidence Required:
   - Entity-relationship diagrams (ERD) or NoSQL data models
   - Database indexing strategy and query optimization examples
   - Replication/sharding configuration for scalability
   - Backup and disaster recovery procedures
   - Data migration strategies and versioning
   - Performance benchmarks and optimization history
   - Data security and encryption at rest/in transit

4. INFRASTRUCTURE TECHNOLOGY (20% weighting): ${categories.infrastructure}/100
   Technologies Used: ${details.infrastructureTech || 'Not specified'}
   Assessment: ${categories.infrastructure >= 70 ? 'EXCELLENT - Cloud-native architecture' : categories.infrastructure >= 60 ? 'ADEQUATE - Basic cloud deployment' : 'NEEDS IMPROVEMENT - Infrastructure modernization required'}
   
   Innovation Visa Relevance: Cloud-native infrastructure demonstrates scalability and global
   reach potential required for innovation visa. Multi-region deployments, containerization,
   auto-scaling, and infrastructure-as-code show operational sophistication beyond basic hosting.
   
   Evidence Required:
   - Cloud architecture diagrams (AWS/Azure/GCP/multi-cloud)
   - Containerization setup (Docker, Kubernetes) documentation
   - Load balancing and auto-scaling configuration
   - CDN implementation for global content delivery
   - Infrastructure-as-code (Terraform, CloudFormation) examples
   - Multi-region deployment strategy if applicable
   - Disaster recovery and business continuity plans

5. DEVOPS & AUTOMATION (20% weighting): ${categories.devops}/100
   Technologies Used: ${details.devopsTech || 'Not specified'}
   Assessment: ${categories.devops >= 70 ? 'ADVANCED - Mature DevOps practices' : categories.devops >= 60 ? 'BASIC - Some automation present' : 'MINIMAL - DevOps maturity needed'}
   
   Innovation Visa Relevance: DevOps maturity demonstrates operational excellence and rapid
   iteration capability essential for innovative startups. CI/CD pipelines, automated testing,
   monitoring, and deployment automation show engineering discipline valued in visa applications.
   
   Evidence Required:
   - CI/CD pipeline architecture diagrams (GitHub Actions, GitLab CI, Jenkins)
   - Automated testing framework and coverage reports
   - Monitoring and observability stack (Prometheus, Grafana, ELK)
   - Deployment automation and rollback procedures
   - Infrastructure monitoring and alerting configuration
   - Security scanning integration (SAST/DAST)
   - Incident response and postmortem documentation

QUALITY FACTORS ASSESSMENT
${'-'.repeat(80)}

1. SCALABILITY (25% weighting): ${factors.scalability}/100
   Assessment: ${factors.scalability >= 70 ? 'STRONG - Proven scalability capability' : factors.scalability >= 60 ? 'MODERATE - Some scalability measures' : 'WEAK - Scalability concerns present'}
   
   Critical for innovation visa - must demonstrate ability to scale from startup to growth
   stage. Horizontal scaling, database sharding, caching layers, and load testing evidence
   required to prove technical scalability matching business growth projections.

2. SECURITY (25% weighting): ${factors.security}/100
   Assessment: ${factors.security >= 70 ? 'EXCELLENT - Strong security posture' : factors.security >= 60 ? 'ADEQUATE - Basic security measures' : 'INSUFFICIENT - Security improvements critical'}
   
   Non-negotiable for innovation visa approval. Must demonstrate encryption standards,
   secure authentication, vulnerability management, GDPR compliance, and security audit
   procedures. UK immigration scrutinizes data protection given regulatory environment.

3. COST EFFICIENCY (20% weighting): ${factors.costEfficiency}/100
   Assessment: ${factors.costEfficiency >= 70 ? 'OPTIMIZED - Cost-effective architecture' : factors.costEfficiency >= 60 ? 'ACCEPTABLE - Reasonable cost management' : 'INEFFICIENT - Cost optimization needed'}
   
   Demonstrates business acumen and operational efficiency valued in visa assessment.
   Cloud cost optimization, resource utilization monitoring, and cost-per-user metrics
   show financial discipline essential for sustainable business growth.

4. TEAM EXPERTISE (15% weighting): ${factors.teamExpertise}/100
   Assessment: ${factors.teamExpertise >= 70 ? 'STRONG - Skilled technical team' : factors.teamExpertise >= 60 ? 'ADEQUATE - Competent team' : 'WEAK - Team skills gap present'}
   
   Technical team capability directly assessed in innovation visa applications. Must
   document team certifications, relevant experience, knowledge transfer processes,
   and hiring plans for critical skill gaps to demonstrate execution capability.

5. MODERNIZATION (15% weighting): ${factors.modernization}/100
   Assessment: ${factors.modernization >= 70 ? 'MODERN - Current technology stack' : factors.modernization >= 60 ? 'ACCEPTABLE - Mostly current technologies' : 'OUTDATED - Modernization required'}
   
   Using current, industry-standard technologies demonstrates innovation and technical
   awareness. Legacy technology reliance may indicate insufficient innovation for visa
   approval. Document technology roadmap showing adoption of emerging relevant technologies.

TECHNOLOGY STACK ANALYSIS
${'-'.repeat(80)}
Strongest Category: ${Object.entries(categories).reduce((max, [key, val]) => val > max[1] ? [key, val] : max, ['', 0])[0]} (${Object.entries(categories).reduce((max, [key, val]) => val > max[1] ? [key, val] : max, ['', 0])[1]}%)
Weakest Category: ${Object.entries(categories).reduce((min, [key, val]) => val < min[1] ? [key, val] : min, ['', 100])[0]} (${Object.entries(categories).reduce((min, [key, val]) => val < min[1] ? [key, val] : min, ['', 100])[1]}%)
Category Range: ${Math.max(...Object.values(categories)) - Math.min(...Object.values(categories))}%
${Math.max(...Object.values(categories)) - Math.min(...Object.values(categories)) > 30 ? '[WARNING] Large variation between categories - aim for balanced architecture' : '[OK] Reasonably balanced technology stack'}

Strongest Factor: ${Object.entries(factors).reduce((max, [key, val]) => val > max[1] ? [key, val] : max, ['', 0])[0]} (${Object.entries(factors).reduce((max, [key, val]) => val > max[1] ? [key, val] : max, ['', 0])[1]}%)
Weakest Factor: ${Object.entries(factors).reduce((min, [key, val]) => val < min[1] ? [key, val] : min, ['', 100])[0]} (${Object.entries(factors).reduce((min, [key, val]) => val < min[1] ? [key, val] : min, ['', 100])[1]}%)
Factor Range: ${Math.max(...Object.values(factors)) - Math.min(...Object.values(factors))}%

INDUSTRY BENCHMARK COMPARISON
${'-'.repeat(80)}
Your Overall Tech Stack Score: ${overallScore}%
Selected Sector: ${selectedSector}
${benchmarkData.find(b => b.sector === selectedSector) ? `
${selectedSector} Industry Average: ${benchmarkData.find(b => b.sector === selectedSector)?.industryAvg}%
Performance vs Sector: ${benchmarkData.find(b => b.sector === selectedSector)?.gap}% ${(benchmarkData.find(b => b.sector === selectedSector)?.gap ?? 0) >= 0 ? 'ABOVE' : 'BELOW'} average
Percentile Estimate: ${overallScore > (benchmarkData.find(b => b.sector === selectedSector)?.industryAvg ?? 0) + 10 ? 'Top 25%' : overallScore > (benchmarkData.find(b => b.sector === selectedSector)?.industryAvg ?? 0) ? 'Top 50%' : 'Bottom 50%'}
` : ''}
Cross-Sector Comparison:
${benchmarkData.map(b => `  ${b.sector}: Industry Avg ${b.avgScore}% | Your Score ${b.yourScore}% | Gap: ${b.gap >= 0 ? '+' : ''}${b.gap}%`).join('\n')}

INNOVATION CRITERION ALIGNMENT
${'-'.repeat(80)}
Technology Stack Innovation Assessment for UK Innovator Founder Visa:

${overallScore >= 75 ? '[STRONG ALIGNMENT]' : overallScore >= 65 ? '[ACCEPTABLE ALIGNMENT]' : '[WEAK ALIGNMENT]'} Technical Innovation Criterion
  - Modern technology stack demonstrates genuine technical innovation beyond basic implementation
  - Your score: ${overallScore}% ${overallScore >= 75 ? '- Excellent technical sophistication' : overallScore >= 65 ? '- Adequate technical capability' : '- Needs significant technical strengthening'}

${factors.scalability >= 70 ? '[STRONG]' : factors.scalability >= 60 ? '[MODERATE]' : '[WEAK]'} Scalability Criterion
  - Scalability demonstrates growth potential required for innovation visa approval
  - Your score: ${factors.scalability}% ${factors.scalability >= 70 ? '- Proven scaling capability' : factors.scalability >= 60 ? '- Basic scaling measures' : '- Scaling strategy needed'}

${factors.security >= 75 ? '[EXCELLENT]' : factors.security >= 65 ? '[ACCEPTABLE]' : '[INSUFFICIENT]'} Security & Compliance Criterion
  - Security demonstrates operational maturity essential for UK business environment
  - Your score: ${factors.security}% ${factors.security >= 75 ? '- Robust security posture' : factors.security >= 65 ? '- Basic security compliance' : '- Security improvements critical'}

${categories.devops >= 70 ? '[ADVANCED]' : categories.devops >= 60 ? '[BASIC]' : '[MINIMAL]'} Operational Excellence Criterion
  - DevOps maturity demonstrates rapid iteration capability valued in innovative startups
  - Your score: ${categories.devops}% ${categories.devops >= 70 ? '- Mature operational practices' : categories.devops >= 60 ? '- Some automation present' : '- DevOps modernization needed'}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n\n')}

4-WEEK TECHNOLOGY DOCUMENTATION ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n\n')}

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant - Technology Stack Assessment
© 2025 innovatorfoundervisaassistant.co.uk
Based on GOV.UK Innovator Founder visa technical innovation requirements

DISCLAIMER: This assessment is self-evaluated and for planning purposes only.
Actual endorsing body technical evaluation may differ. Seek professional immigration
and technical architecture review for official assessment and application preparation.
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tech-stack-assessment-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2" data-testid="heading-tech-stack-assess">Technology Stack Assessment</h1>
              <p className="text-lg text-muted-foreground">Evaluate technical architecture for innovation visa compliance</p>
              {savedDate && (
                <p className="text-sm text-muted-foreground mt-2" data-testid="text-saved-date">Last saved: {savedDate}</p>
              )}
            </div>
            <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
          </div>

          {mode === 'ai' ? (
            <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} userTier={userTier} />
          ) : (
          <>

          <ToolUtilityBar
            toolId="tech-stack-assess"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Technology Stack Assessment"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4" data-testid="tabs-tech-stack">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="assessment" data-testid="tab-assessment">Assessment</TabsTrigger>
              <TabsTrigger value="benchmarks" data-testid="tab-benchmarks">Benchmarks</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Technology Stack Score</CardTitle>
                  <CardDescription>Overall technical architecture assessment for UK Innovation Visa</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className={meetsMinimum ? "border-green-500" : "border-destructive"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Overall Score</p>
                          <p className="text-3xl font-bold" data-testid="text-overall-score">{overallScore}/100</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {meetsMinimum ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-destructive" />
                            )}
                            <span className="text-sm">{meetsMinimum ? 'Meets Threshold' : 'Below Threshold'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={isStrongCandidate ? "border-green-500" : "border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Tech Categories</p>
                          <p className="text-3xl font-bold text-blue-600" data-testid="text-tech-score">{techStackScore}/100</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            <Code className="h-5 w-5 text-blue-600" />
                            <span className="text-sm">Stack Rating</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Quality Factors</p>
                          <p className="text-3xl font-bold text-primary" data-testid="text-quality-score">{qualityScore}/100</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            <Shield className="h-5 w-5 text-primary" />
                            <span className="text-sm">Quality Rating</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {!meetsMinimum && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription data-testid="alert-below-threshold">
                        Your technology stack scores {overallScore}/100, below the {passThreshold} threshold. Strengthen weak categories before endorsing body submission.
                      </AlertDescription>
                    </Alert>
                  )}

                  {meetsMinimum && !isStrongCandidate && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription data-testid="alert-moderate-score">
                        You meet the minimum threshold but score below {strongThreshold}. Consider strengthening documentation and addressing weak areas for competitive advantage.
                      </AlertDescription>
                    </Alert>
                  )}

                  {isStrongCandidate && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400" data-testid="alert-strong-score">
                        Excellent technology stack! Your {overallScore}/100 score demonstrates strong technical capability. Ensure comprehensive documentation across all categories.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Technology Categories</CardTitle>
                        <CardDescription>5 core technical architecture areas</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <RadarChart data={radarData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="category" />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} />
                            <Radar name="Your Stack" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                            <Tooltip />
                          </RadarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Quality Factors</CardTitle>
                        <CardDescription>5 critical success criteria</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <RadarChart data={factorsRadarData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="factor" />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} />
                            <Radar name="Your Factors" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                            <Tooltip />
                          </RadarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Smart Recommendations</CardTitle>
                  <CardDescription>AI-powered insights for your technology stack</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getSmartTips().map((tip, i) => (
                      <Alert key={i}>
                        <Info className="h-4 w-4" />
                        <AlertDescription data-testid={`tip-${i}`}>{tip}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assessment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Technology Categories Assessment</CardTitle>
                  <CardDescription>Rate your technology stack across 5 core areas (0-100 scale)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="flex items-center gap-2">
                          <Code className="h-4 w-4" />
                          Frontend Technology
                        </Label>
                        <span className="text-sm font-bold" data-testid="value-frontend">{categories.frontend}/100</span>
                      </div>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[categories.frontend]}
                        onValueChange={(v) => updateCategory('frontend', v[0])}
                        data-testid="slider-frontend"
                      />
                      <Input
                        value={details.frontendTech}
                        onChange={(e) => updateDetail('frontendTech', e.target.value)}
                        placeholder="e.g., React 18, Next.js, TypeScript, Redux Toolkit"
                        className="mt-2"
                        data-testid="input-frontend-tech"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Specify frameworks, libraries, and state management</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="flex items-center gap-2">
                          <Server className="h-4 w-4" />
                          Backend Technology
                        </Label>
                        <span className="text-sm font-bold" data-testid="value-backend">{categories.backend}/100</span>
                      </div>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[categories.backend]}
                        onValueChange={(v) => updateCategory('backend', v[0])}
                        data-testid="slider-backend"
                      />
                      <Input
                        value={details.backendTech}
                        onChange={(e) => updateDetail('backendTech', e.target.value)}
                        placeholder="e.g., Node.js, Express, GraphQL, Microservices"
                        className="mt-2"
                        data-testid="input-backend-tech"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Specify runtime, frameworks, and architecture patterns</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          Database Technology
                        </Label>
                        <span className="text-sm font-bold" data-testid="value-database">{categories.database}/100</span>
                      </div>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[categories.database]}
                        onValueChange={(v) => updateCategory('database', v[0])}
                        data-testid="slider-database"
                      />
                      <Input
                        value={details.databaseTech}
                        onChange={(e) => updateDetail('databaseTech', e.target.value)}
                        placeholder="e.g., PostgreSQL, MongoDB, Redis, ElasticSearch"
                        className="mt-2"
                        data-testid="input-database-tech"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Specify primary database, caching, and search solutions</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Infrastructure Technology
                        </Label>
                        <span className="text-sm font-bold" data-testid="value-infrastructure">{categories.infrastructure}/100</span>
                      </div>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[categories.infrastructure]}
                        onValueChange={(v) => updateCategory('infrastructure', v[0])}
                        data-testid="slider-infrastructure"
                      />
                      <Input
                        value={details.infrastructureTech}
                        onChange={(e) => updateDetail('infrastructureTech', e.target.value)}
                        placeholder="e.g., AWS, Docker, Kubernetes, Cloudflare CDN"
                        className="mt-2"
                        data-testid="input-infrastructure-tech"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Specify cloud provider, containerization, and CDN</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="flex items-center gap-2">
                          <GitBranch className="h-4 w-4" />
                          DevOps & Automation
                        </Label>
                        <span className="text-sm font-bold" data-testid="value-devops">{categories.devops}/100</span>
                      </div>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[categories.devops]}
                        onValueChange={(v) => updateCategory('devops', v[0])}
                        data-testid="slider-devops"
                      />
                      <Input
                        value={details.devopsTech}
                        onChange={(e) => updateDetail('devopsTech', e.target.value)}
                        placeholder="e.g., GitHub Actions, Jest, Datadog, Terraform"
                        className="mt-2"
                        data-testid="input-devops-tech"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Specify CI/CD, testing, monitoring, and IaC tools</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quality Factors Assessment</CardTitle>
                  <CardDescription>Evaluate quality attributes of your technology stack (0-100 scale)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Scalability
                      </Label>
                      <span className="text-sm font-bold" data-testid="value-scalability">{factors.scalability}/100</span>
                    </div>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[factors.scalability]}
                      onValueChange={(v) => updateFactor('scalability', v[0])}
                      data-testid="slider-scalability"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Horizontal scaling, load balancing, auto-scaling capability</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Security
                      </Label>
                      <span className="text-sm font-bold" data-testid="value-security">{factors.security}/100</span>
                    </div>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[factors.security]}
                      onValueChange={(v) => updateFactor('security', v[0])}
                      data-testid="slider-security"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Encryption, authentication, vulnerability management, compliance</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Cost Efficiency</Label>
                      <span className="text-sm font-bold" data-testid="value-cost">{factors.costEfficiency}/100</span>
                    </div>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[factors.costEfficiency]}
                      onValueChange={(v) => updateFactor('costEfficiency', v[0])}
                      data-testid="slider-cost"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Cloud cost optimization, resource utilization, cost per user</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Team Expertise</Label>
                      <span className="text-sm font-bold" data-testid="value-expertise">{factors.teamExpertise}/100</span>
                    </div>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[factors.teamExpertise]}
                      onValueChange={(v) => updateFactor('teamExpertise', v[0])}
                      data-testid="slider-expertise"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Team skills, certifications, experience with tech stack</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Modernization
                      </Label>
                      <span className="text-sm font-bold" data-testid="value-modernization">{factors.modernization}/100</span>
                    </div>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[factors.modernization]}
                      onValueChange={(v) => updateFactor('modernization', v[0])}
                      data-testid="slider-modernization"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Use of current technologies, migration from legacy systems</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="benchmarks" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Industry Benchmark Comparison</CardTitle>
                  <CardDescription>How your technology stack compares to industry standards</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Label>Select Your Industry:</Label>
                    <select
                      value={selectedSector}
                      onChange={(e) => setSelectedSector(e.target.value)}
                      className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                      data-testid="select-sector"
                    >
                      {INDUSTRY_BENCHMARKS.map((sector) => (
                        <option key={sector.sector} value={sector.sector}>
                          {sector.sector}
                        </option>
                      ))}
                    </select>
                  </div>

                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={benchmarkData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="sector" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="yourScore" fill="#3b82f6" name="Your Score" />
                      <Bar dataKey="industryAvg" fill="#10b981" name="Industry Average" />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground mb-2">Your Score vs {selectedSector}</p>
                        <p className="text-2xl font-bold" data-testid="text-sector-comparison">
                          {benchmarkData.find(b => b.sector === selectedSector)?.gap ?? 0 >= 0 ? '+' : ''}
                          {benchmarkData.find(b => b.sector === selectedSector)?.gap ?? 0}%
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {(benchmarkData.find(b => b.sector === selectedSector)?.gap ?? 0) >= 0 ? 'Above' : 'Below'} industry average
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground mb-2">Estimated Percentile</p>
                        <p className="text-2xl font-bold" data-testid="text-percentile">
                          {overallScore > (benchmarkData.find(b => b.sector === selectedSector)?.industryAvg ?? 0) + 10 ? 'Top 25%' : 
                           overallScore > (benchmarkData.find(b => b.sector === selectedSector)?.industryAvg ?? 0) ? 'Top 50%' : 'Bottom 50%'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">Within {selectedSector} sector</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Innovation Visa Technical Requirements</CardTitle>
                  <CardDescription>Technology stack alignment with UK Innovator Founder visa criteria</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      {categories.frontend >= 65 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">Modern Frontend Architecture</p>
                        <p className="text-sm text-muted-foreground">Component-based design with state management demonstrates technical sophistication</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      {categories.backend >= 65 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">Scalable Backend Infrastructure</p>
                        <p className="text-sm text-muted-foreground">API design and data processing capability show technical depth</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      {categories.database >= 60 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">Robust Database Architecture</p>
                        <p className="text-sm text-muted-foreground">Optimization and backup procedures demonstrate operational maturity</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      {categories.infrastructure >= 60 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">Cloud-Native Infrastructure</p>
                        <p className="text-sm text-muted-foreground">Containerization and auto-scaling show scalability potential</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      {categories.devops >= 60 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">DevOps Maturity</p>
                        <p className="text-sm text-muted-foreground">CI/CD automation demonstrates rapid iteration capability</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      {factors.security >= 70 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">Strong Security Posture</p>
                        <p className="text-sm text-muted-foreground">Encryption and compliance measures essential for UK regulatory environment</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Technology Documentation Action Plan</CardTitle>
                  <CardDescription>Prioritized roadmap to strengthen your technology stack evidence</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {generateActionPlan().map((item, i) => (
                      <Card key={i} className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`px-2 py-1 rounded text-xs font-semibold ${
                            item.priority === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' :
                            item.priority === 'High' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                          }`}>
                            {item.priority}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm mb-1" data-testid={`action-week-${i}`}>{item.week}</p>
                            <p className="text-sm text-muted-foreground" data-testid={`action-text-${i}`}>{item.action}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Next Steps</CardTitle>
                  <CardDescription>Immediate actions to improve your technology stack assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Alert>
                      <TrendingUp className="h-4 w-4" />
                      <AlertDescription>
                        Address your weakest category first: <strong>{Object.entries(categories).reduce((min, [key, val]) => val < min[1] ? [key, val] : min, ['', 100])[0]}</strong> (currently {Object.entries(categories).reduce((min, [key, val]) => val < min[1] ? [key, val] : min, ['', 100])[1]}%)
                      </AlertDescription>
                    </Alert>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Prepare architecture diagrams using industry-standard notation (UML, C4, ArchiMate) for each technology category
                      </AlertDescription>
                    </Alert>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Document technology decision rationale explaining how each choice supports your innovation goals
                      </AlertDescription>
                    </Alert>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Compile performance benchmarks, load testing results, and scalability evidence for endorsing body review
                      </AlertDescription>
                    </Alert>
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
