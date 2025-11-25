import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Gift, 
  Users, 
  PoundSterling, 
  TrendingUp, 
  Copy, 
  Share2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ExternalLink,
  Mail,
  Twitter,
  Linkedin,
  MessageCircle,
  QrCode,
  ArrowRight,
  Eye,
  UserPlus,
  CreditCard,
  Wallet
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import QRCode from "qrcode";

interface ReferralDashboardData {
  code: {
    id: string;
    code: string;
    rewardType: string;
    rewardValue: number;
    refereeDiscount: number;
    status: string;
    totalReferrals: number;
    successfulReferrals: number;
    pendingReferrals: number;
    totalEarnings: number;
    paidEarnings: number;
  } | null;
  stats: {
    totalClicks: number;
    signups: number;
    qualified: number;
    pendingEarnings: number;
    totalEarnings: number;
  };
  events: Array<{
    id: string;
    status: string;
    refereeEmail: string | null;
    visitedAt: string;
    signedUpAt: string | null;
    qualifiedAt: string | null;
    rewardAmount: number | null;
  }>;
  rewards: Array<{
    id: string;
    type: string;
    amount: number;
    status: string;
    createdAt: string;
    paidAt: string | null;
  }>;
}

function ReferralStats({ stats }: { stats: ReferralDashboardData['stats'] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="text-total-clicks">{stats.totalClicks}</div>
          <p className="text-xs text-muted-foreground">People who clicked your link</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sign Ups</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="text-signups">{stats.signups}</div>
          <p className="text-xs text-muted-foreground">People who registered</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Qualified</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="text-qualified">{stats.qualified}</div>
          <p className="text-xs text-muted-foreground">Made a purchase</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          <PoundSterling className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="text-earnings">
            {stats.pendingEarnings > 0 && (
              <span className="text-orange-500">£{stats.pendingEarnings.toFixed(2)} pending</span>
            )}
            {stats.pendingEarnings > 0 && stats.totalEarnings > 0 && <span className="mx-1">/</span>}
            {stats.totalEarnings > 0 && (
              <span className="text-green-500">£{stats.totalEarnings.toFixed(2)} paid</span>
            )}
            {stats.pendingEarnings === 0 && stats.totalEarnings === 0 && "£0.00"}
          </div>
          <p className="text-xs text-muted-foreground">Your commission earnings</p>
        </CardContent>
      </Card>
    </div>
  );
}

function ReferralJourneyFunnel({ stats }: { stats: ReferralDashboardData['stats'] }) {
  const steps = [
    { 
      icon: Eye, 
      label: "Link Clicked", 
      value: stats.totalClicks, 
      color: "bg-blue-500",
      description: "Visitors who clicked your referral link"
    },
    { 
      icon: UserPlus, 
      label: "Signed Up", 
      value: stats.signups, 
      color: "bg-purple-500",
      description: "Users who created an account"
    },
    { 
      icon: CreditCard, 
      label: "Subscribed", 
      value: stats.qualified, 
      color: "bg-orange-500",
      description: "Users who made a purchase"
    },
    { 
      icon: Wallet, 
      label: "Rewards Earned", 
      value: `£${(stats.pendingEarnings + stats.totalEarnings).toFixed(2)}`, 
      color: "bg-green-500",
      description: "Your total commission earnings"
    },
  ];

  const conversionRate = stats.totalClicks > 0 
    ? ((stats.qualified / stats.totalClicks) * 100).toFixed(1)
    : '0';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Referral Journey
        </CardTitle>
        <CardDescription>
          Track how your referrals progress through each stage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="flex items-center gap-2 flex-1">
                <div className="flex flex-col items-center text-center flex-1">
                  <div className={`${step.color} p-3 rounded-full mb-2`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-2xl font-bold">{step.value}</div>
                  <div className="text-sm font-medium">{step.label}</div>
                  <div className="text-xs text-muted-foreground">{step.description}</div>
                </div>
                {idx < steps.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-muted-foreground hidden md:block" />
                )}
              </div>
            );
          })}
        </div>

        <Separator className="my-4" />
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{conversionRate}%</div>
            <div className="text-sm text-muted-foreground">Conversion Rate</div>
            <div className="text-xs text-muted-foreground mt-1">
              (Clicks to Purchases)
            </div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold">
              {stats.pendingEarnings > 0 ? (
                <span className="text-orange-500">£{stats.pendingEarnings.toFixed(2)}</span>
              ) : (
                <span className="text-green-500">£{stats.totalEarnings.toFixed(2)}</span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {stats.pendingEarnings > 0 ? "Pending Payout" : "Total Paid"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.pendingEarnings > 0 ? "Awaiting approval" : "Successfully paid out"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ReferralLink({ code, refereeDiscount }: { code: string; refereeDiscount: number }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  
  const referralUrl = `${window.location.origin}?ref=${code}`;
  
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast({
      title: "Link Copied!",
      description: "Your referral link has been copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };
  
  const shareVia = (platform: string) => {
    const message = `Get ${refereeDiscount}% off your UK Innovator Founder Visa application with my referral link!`;
    const encodedMessage = encodeURIComponent(message);
    const encodedUrl = encodeURIComponent(referralUrl);
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedMessage}%20${encodedUrl}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=UK Innovator Founder Visa Assistant - ${refereeDiscount}% Off&body=${encodedMessage}%0A%0A${referralUrl}`;
        break;
    }
    window.open(shareUrl, '_blank');
  };
  
  const generateQR = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(referralUrl, { width: 200 });
      setQrDataUrl(dataUrl);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Your Referral Link
        </CardTitle>
        <CardDescription>
          Share this link and earn {refereeDiscount}% commission when your referrals make a purchase.
          They also get {refereeDiscount}% off their first purchase!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input 
            value={referralUrl} 
            readOnly 
            className="font-mono text-sm"
            data-testid="input-referral-url"
          />
          <Button 
            onClick={copyToClipboard} 
            variant={copied ? "default" : "outline"}
            data-testid="button-copy-link"
          >
            {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => shareVia('twitter')} data-testid="button-share-twitter">
            <Twitter className="h-4 w-4 mr-2" />
            Twitter
          </Button>
          <Button variant="outline" size="sm" onClick={() => shareVia('linkedin')} data-testid="button-share-linkedin">
            <Linkedin className="h-4 w-4 mr-2" />
            LinkedIn
          </Button>
          <Button variant="outline" size="sm" onClick={() => shareVia('whatsapp')} data-testid="button-share-whatsapp">
            <MessageCircle className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
          <Button variant="outline" size="sm" onClick={() => shareVia('email')} data-testid="button-share-email">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
          <Button variant="outline" size="sm" onClick={generateQR} data-testid="button-generate-qr">
            <QrCode className="h-4 w-4 mr-2" />
            QR Code
          </Button>
        </div>
        
        {qrDataUrl && (
          <div className="flex justify-center p-4 bg-white rounded-lg">
            <img src={qrDataUrl} alt="Referral QR Code" className="max-w-[200px]" />
          </div>
        )}
        
        <div className="bg-muted/50 rounded-lg p-4 text-sm">
          <p className="font-medium mb-2">How it works:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Share your unique referral link with friends and colleagues</li>
            <li>They sign up and get {refereeDiscount}% off their first purchase</li>
            <li>When they make a purchase, you earn {refereeDiscount}% commission</li>
            <li>Track your referrals and earnings in real-time on this dashboard</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}

function ReferralEventsTable({ events }: { events: ReferralDashboardData['events'] }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'visited':
        return <Badge variant="secondary">Visited</Badge>;
      case 'signed_up':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Signed Up</Badge>;
      case 'qualified':
        return <Badge variant="outline" className="border-orange-500 text-orange-500">Qualified</Badge>;
      case 'rewarded':
        return <Badge variant="default" className="bg-green-500">Rewarded</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No referrals yet. Start sharing your link!</p>
      </div>
    );
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Visited</TableHead>
          <TableHead>Signed Up</TableHead>
          <TableHead>Qualified</TableHead>
          <TableHead className="text-right">Reward</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => (
          <TableRow key={event.id} data-testid={`row-referral-event-${event.id}`}>
            <TableCell>{getStatusBadge(event.status)}</TableCell>
            <TableCell className="font-mono text-sm">
              {event.refereeEmail || <span className="text-muted-foreground">Anonymous</span>}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {format(new Date(event.visitedAt), 'MMM d, yyyy')}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {event.signedUpAt ? format(new Date(event.signedUpAt), 'MMM d, yyyy') : '-'}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {event.qualifiedAt ? format(new Date(event.qualifiedAt), 'MMM d, yyyy') : '-'}
            </TableCell>
            <TableCell className="text-right">
              {event.rewardAmount ? (
                <span className="font-medium text-green-500">£{(event.rewardAmount / 100).toFixed(2)}</span>
              ) : '-'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function RewardsTable({ rewards }: { rewards: ReferralDashboardData['rewards'] }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-orange-500 text-orange-500"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="border-blue-500 text-blue-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'paid':
        return <Badge variant="default" className="bg-green-500"><PoundSterling className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  
  if (rewards.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <PoundSterling className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No rewards yet. You'll earn rewards when your referrals make a purchase!</p>
      </div>
    );
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Paid On</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rewards.map((reward) => (
          <TableRow key={reward.id} data-testid={`row-reward-${reward.id}`}>
            <TableCell className="text-sm">
              {format(new Date(reward.createdAt), 'MMM d, yyyy')}
            </TableCell>
            <TableCell className="capitalize">{reward.type}</TableCell>
            <TableCell className="font-medium">£{(reward.amount / 100).toFixed(2)}</TableCell>
            <TableCell>{getStatusBadge(reward.status)}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {reward.paidAt ? format(new Date(reward.paidAt), 'MMM d, yyyy') : '-'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function ReferralDashboard() {
  const { data, isLoading, error } = useQuery<ReferralDashboardData>({
    queryKey: ['/api/referrals/dashboard'],
  });
  
  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <p className="text-lg font-medium mb-2">Failed to load referral dashboard</p>
            <p className="text-muted-foreground mb-4">Please try again later or contact support.</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/referrals/dashboard'] })}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            Referral Programme
          </h1>
          <p className="text-muted-foreground">
            Earn money by referring others to UK Innovator Founder Visa Assistant
          </p>
        </div>
        {data.code && (
          <Badge variant="outline" className="text-lg px-4 py-2 font-mono" data-testid="text-referral-code">
            {data.code.code}
          </Badge>
        )}
      </div>
      
      <ReferralStats stats={data.stats} />
      
      <ReferralJourneyFunnel stats={data.stats} />
      
      {data.code && (
        <ReferralLink code={data.code.code} refereeDiscount={data.code.refereeDiscount} />
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
          <CardDescription>Track your referrals and earnings</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="referrals">
            <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
              <TabsTrigger value="referrals" data-testid="tab-referrals">Referrals</TabsTrigger>
              <TabsTrigger value="rewards" data-testid="tab-rewards">Rewards</TabsTrigger>
            </TabsList>
            <TabsContent value="referrals" className="mt-4">
              <ReferralEventsTable events={data.events} />
            </TabsContent>
            <TabsContent value="rewards" className="mt-4">
              <RewardsTable rewards={data.rewards} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Programme Terms
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>1. Rewards are only issued after the referred user completes a qualifying purchase.</p>
          <p>2. Self-referrals are not permitted and will be automatically rejected.</p>
          <p>3. Rewards are typically processed within 30 days of the qualifying purchase.</p>
          <p>4. UK Innovator Founder Visa Assistant reserves the right to modify or terminate the programme at any time.</p>
          <p>5. Fraudulent activity will result in immediate disqualification and forfeiture of rewards.</p>
        </CardContent>
      </Card>
    </div>
  );
}
