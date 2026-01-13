import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Shield, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  ExternalLink,
  FileText,
  Lock,
  Users,
  Database,
  Eye,
  Bell,
  Calendar,
  Download,
  RefreshCw
} from "lucide-react";
import { Link } from "wouter";
import { ComplianceBadges } from "@/components/ComplianceBadges";

interface ComplianceItem {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'pending' | 'in-progress' | 'requires-action';
  category: 'ico' | 'gdpr' | 'oisc' | 'security';
  dueDate?: string;
  actionUrl?: string;
  actionLabel?: string;
}

export default function ComplianceDashboardPage() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set([
    'ico-1', 'gdpr-1', 'gdpr-2', 'gdpr-3', 'gdpr-4', 'oisc-1', 'oisc-2', 'oisc-3', 'sec-1', 'sec-2', 'sec-3'
  ]));

  const complianceItems: ComplianceItem[] = [
    {
      id: 'ico-1',
      title: 'ICO Registration',
      description: 'Register with Information Commissioner\'s Office as a data controller',
      status: 'pending',
      category: 'ico',
      actionUrl: 'https://ico.org.uk/for-organisations/data-protection-fee/register/',
      actionLabel: 'Register Now (£40)'
    },
    {
      id: 'ico-2',
      title: 'Annual Fee Payment',
      description: 'Pay annual data protection fee (Tier 1: £40/year)',
      status: 'pending',
      category: 'ico',
      dueDate: 'Upon registration'
    },
    {
      id: 'gdpr-1',
      title: 'Privacy Policy',
      description: 'Comprehensive privacy policy explaining data processing',
      status: 'completed',
      category: 'gdpr'
    },
    {
      id: 'gdpr-2',
      title: 'Cookie Consent',
      description: 'Cookie banner with consent management',
      status: 'completed',
      category: 'gdpr'
    },
    {
      id: 'gdpr-3',
      title: 'Data Subject Rights',
      description: 'Mechanisms for access, deletion, and portability requests',
      status: 'completed',
      category: 'gdpr'
    },
    {
      id: 'gdpr-4',
      title: 'Lawful Basis Documentation',
      description: 'Document lawful basis for all data processing activities',
      status: 'completed',
      category: 'gdpr'
    },
    {
      id: 'gdpr-5',
      title: 'Data Protection Impact Assessment',
      description: 'DPIA for AI processing activities',
      status: 'pending',
      category: 'gdpr',
      actionUrl: 'https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/accountability-and-governance/data-protection-impact-assessments/',
      actionLabel: 'Complete DPIA'
    },
    {
      id: 'gdpr-6',
      title: 'Records of Processing Activities',
      description: 'Maintain records of all data processing activities',
      status: 'in-progress',
      category: 'gdpr'
    },
    {
      id: 'oisc-1',
      title: 'Legal Disclaimer on Homepage',
      description: 'Clear disclaimer that platform does not provide immigration advice',
      status: 'completed',
      category: 'oisc'
    },
    {
      id: 'oisc-2',
      title: 'Tool-Level Disclaimers',
      description: 'OISC disclaimer displayed on all tool pages',
      status: 'completed',
      category: 'oisc'
    },
    {
      id: 'oisc-3',
      title: 'Export Document Disclaimers',
      description: 'Legal notices included in all exported documents',
      status: 'completed',
      category: 'oisc'
    },
    {
      id: 'oisc-4',
      title: 'OISC Adviser Signposting',
      description: 'Direct users to find regulated immigration advisers',
      status: 'completed',
      category: 'oisc'
    },
    {
      id: 'sec-1',
      title: 'HTTPS Encryption',
      description: 'All traffic encrypted with TLS 1.3',
      status: 'completed',
      category: 'security'
    },
    {
      id: 'sec-2',
      title: 'Secure Authentication',
      description: 'Password hashing (bcrypt) and session management',
      status: 'completed',
      category: 'security'
    },
    {
      id: 'sec-3',
      title: 'Database Encryption',
      description: 'Data encrypted at rest in PostgreSQL',
      status: 'completed',
      category: 'security'
    },
    {
      id: 'sec-4',
      title: 'Bot Protection',
      description: 'Cloudflare Turnstile for bot prevention',
      status: 'completed',
      category: 'security'
    }
  ];

  const toggleItem = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  const getStatusBadge = (status: ComplianceItem['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle2 className="h-3 w-3 mr-1" /> Complete</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-amber-600 border-amber-300"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"><RefreshCw className="h-3 w-3 mr-1" /> In Progress</Badge>;
      case 'requires-action':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" /> Action Required</Badge>;
    }
  };

  const getCategoryIcon = (category: ComplianceItem['category']) => {
    switch (category) {
      case 'ico': return <Shield className="h-4 w-4" />;
      case 'gdpr': return <Lock className="h-4 w-4" />;
      case 'oisc': return <FileText className="h-4 w-4" />;
      case 'security': return <Database className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: ComplianceItem['category']) => {
    switch (category) {
      case 'ico': return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
      case 'gdpr': return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'oisc': return 'text-amber-600 bg-amber-100 dark:bg-amber-900';
      case 'security': return 'text-purple-600 bg-purple-100 dark:bg-purple-900';
    }
  };

  const completedCount = complianceItems.filter(i => i.status === 'completed').length;
  const totalCount = complianceItems.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  const icoItems = complianceItems.filter(i => i.category === 'ico');
  const gdprItems = complianceItems.filter(i => i.category === 'gdpr');
  const oiscItems = complianceItems.filter(i => i.category === 'oisc');
  const securityItems = complianceItems.filter(i => i.category === 'security');

  return (
    <div className="min-h-screen bg-background">
      <div className="responsive-container py-8 max-w-5xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold" data-testid="text-page-title">Compliance Dashboard</h1>
              <p className="text-muted-foreground">Track regulatory compliance across ICO, GDPR, OISC, and Security</p>
            </div>
          </div>
          <ComplianceBadges variant="compact" />
        </div>

        <Card className="mb-8" data-testid="card-compliance-overview">
          <CardHeader>
            <CardTitle>Overall Compliance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span>Compliance Progress</span>
                  <span className="font-semibold">{completedCount}/{totalCount} ({completionPercentage}%)</span>
                </div>
                <Progress value={completionPercentage} className="h-3" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-3 border rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">ICO</span>
                </div>
                <p className="text-lg font-bold text-blue-600">
                  {icoItems.filter(i => i.status === 'completed').length}/{icoItems.length}
                </p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Lock className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">GDPR</span>
                </div>
                <p className="text-lg font-bold text-green-600">
                  {gdprItems.filter(i => i.status === 'completed').length}/{gdprItems.length}
                </p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium">OISC</span>
                </div>
                <p className="text-lg font-bold text-amber-600">
                  {oiscItems.filter(i => i.status === 'completed').length}/{oiscItems.length}
                </p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Database className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Security</span>
                </div>
                <p className="text-lg font-bold text-purple-600">
                  {securityItems.filter(i => i.status === 'completed').length}/{securityItems.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card data-testid="card-ico-compliance">
            <CardHeader className="bg-blue-50/50 dark:bg-blue-950/20">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                ICO Registration
              </CardTitle>
              <CardDescription>
                Information Commissioner's Office requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-800 dark:text-amber-200">Action Required</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      ICO registration is mandatory before processing personal data. Register now to avoid penalties up to £4,350.
                    </p>
                    <Button size="sm" className="mt-2" asChild>
                      <a href="https://ico.org.uk/for-organisations/data-protection-fee/register/" target="_blank" rel="noopener noreferrer">
                        Register with ICO (£40) <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {icoItems.map(item => (
                  <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Checkbox 
                      checked={checkedItems.has(item.id)}
                      onCheckedChange={() => toggleItem(item.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{item.title}</p>
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-gdpr-compliance">
            <CardHeader className="bg-green-50/50 dark:bg-green-950/20">
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-green-600" />
                GDPR Compliance
              </CardTitle>
              <CardDescription>
                UK General Data Protection Regulation requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {gdprItems.map(item => (
                  <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Checkbox 
                      checked={checkedItems.has(item.id)}
                      onCheckedChange={() => toggleItem(item.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <p className="font-medium">{item.title}</p>
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      {item.actionUrl && item.status !== 'completed' && (
                        <Button size="sm" variant="outline" className="mt-2" asChild>
                          <a href={item.actionUrl} target="_blank" rel="noopener noreferrer">
                            {item.actionLabel} <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-oisc-compliance">
            <CardHeader className="bg-amber-50/50 dark:bg-amber-950/20">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-600" />
                OISC Compliance
              </CardTitle>
              <CardDescription>
                Office of the Immigration Services Commissioner requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-800 dark:text-green-200">Compliant</p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Platform operates as a preparation tool with clear disclaimers. All outputs include OISC notices directing users to regulated advisers.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {oiscItems.map(item => (
                  <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Checkbox 
                      checked={checkedItems.has(item.id)}
                      onCheckedChange={() => toggleItem(item.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{item.title}</p>
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-security-compliance">
            <CardHeader className="bg-purple-50/50 dark:bg-purple-950/20">
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-600" />
                Security Measures
              </CardTitle>
              <CardDescription>
                Technical security controls and data protection
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {securityItems.map(item => (
                  <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Checkbox 
                      checked={checkedItems.has(item.id)}
                      onCheckedChange={() => toggleItem(item.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{item.title}</p>
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8" data-testid="card-next-steps">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Immediate Action Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/20 rounded-r-lg">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Register with ICO</p>
                  <p className="text-sm text-muted-foreground">Mandatory before processing personal data. £40 annual fee.</p>
                  <Button size="sm" className="mt-2" asChild>
                    <a href="https://ico.org.uk/for-organisations/data-protection-fee/register/" target="_blank" rel="noopener noreferrer">
                      Register Now <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20 rounded-r-lg">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900">
                  <FileText className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Complete DPIA</p>
                  <p className="text-sm text-muted-foreground">Data Protection Impact Assessment for AI processing.</p>
                  <Button size="sm" variant="outline" className="mt-2" asChild>
                    <a href="https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/accountability-and-governance/data-protection-impact-assessments/" target="_blank" rel="noopener noreferrer">
                      View DPIA Template <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4 mt-8">
          <Button asChild>
            <Link href="/ai-transparency">
              AI Transparency
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/testing-validation">
              Testing & Validation
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
