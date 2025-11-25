import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format, formatDistance } from "date-fns";
import {
  Users,
  TrendingUp,
  Activity,
  Tag,
  Percent,
  Copy,
  PoundSterling,
  Mail,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  BarChart3,
  Target,
  RefreshCw,
  CheckCircle,
  Clock,
  Crown,
  Sparkles,
  Gift,
  ExternalLink
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import type { User, PromoCode } from "@shared/schema";

interface PartnerStatus {
  isPartner: boolean;
  promoCodeCount: number;
}

interface PartnerAnalytics {
  promoCodes: PromoCode[];
  totalRedemptions: number;
  totalDiscountGiven: number;
  totalVisits: number;
  conversions: number;
  conversionRate: number;
  usersByPromoCode: Array<{
    promoCode: PromoCode;
    users: Array<{ userId: string; redeemedAt: Date; discountApplied: number }>;
  }>;
}

interface PartnerUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  tier: string;
  promoCode: string;
  promoCodeName: string;
  redeemedAt: Date;
  discountApplied: number;
}

export default function PartnerDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<PartnerUser | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [usersPage, setUsersPage] = useState(1);
  const usersPerPage = 10;

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/auth/user'],
  });

  const { data: partnerStatus, isLoading: statusLoading } = useQuery<PartnerStatus>({
    queryKey: ['/api/partner/status'],
    enabled: !!user,
  });

  const { data: analytics, isLoading: analyticsLoading, refetch: refetchAnalytics } = useQuery<PartnerAnalytics>({
    queryKey: ['/api/partner/analytics'],
    enabled: partnerStatus?.isPartner === true,
  });

  const { data: partnerUsers, isLoading: usersLoading, refetch: refetchUsers } = useQuery<PartnerUser[]>({
    queryKey: ['/api/partner/users'],
    enabled: partnerStatus?.isPartner === true,
  });

  const contactUserMutation = useMutation({
    mutationFn: async ({ userId, subject, message }: { userId: string; subject: string; message: string }) => {
      return apiRequest('/api/partner/contact-user', 'POST', { userId, subject, message });
    },
    onSuccess: () => {
      toast({ title: "Message sent successfully" });
      setContactDialogOpen(false);
      setMessageSubject("");
      setMessageBody("");
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({ title: "Failed to send message", description: error.message, variant: "destructive" });
    }
  });

  useEffect(() => {
    if (!userLoading && !user) {
      setLocation('/login');
    }
  }, [user, userLoading, setLocation]);

  useEffect(() => {
    if (!statusLoading && partnerStatus && !partnerStatus.isPartner) {
      toast({
        title: "Access Denied",
        description: "You are not a partner. Contact admin to get a promo code.",
        variant: "destructive"
      });
      setLocation('/');
    }
  }, [partnerStatus, statusLoading, setLocation, toast]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Promo code copied to clipboard" });
  };

  const handleContactUser = (user: PartnerUser) => {
    setSelectedUser(user);
    setContactDialogOpen(true);
  };

  const handleSendMessage = () => {
    if (!selectedUser || !messageSubject || !messageBody) return;
    contactUserMutation.mutate({
      userId: selectedUser.userId,
      subject: messageSubject,
      message: messageBody
    });
  };

  const filteredUsers = partnerUsers?.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.promoCode.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const paginatedUsers = filteredUsers.slice(
    (usersPage - 1) * usersPerPage,
    usersPage * usersPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const tierColors: Record<string, string> = {
    free: "bg-gray-500",
    basic: "bg-blue-500",
    premium: "bg-purple-500",
    enterprise: "bg-orange-500",
    ultimate: "bg-gradient-to-r from-orange-500 to-amber-400"
  };

  const pieColors = ["#f97316", "#3b82f6", "#8b5cf6", "#22c55e", "#eab308"];

  if (userLoading || statusLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!partnerStatus?.isPartner) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">
                Partner Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Track your promo code performance and manage referred users
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  refetchAnalytics();
                  refetchUsers();
                  toast({ title: "Data refreshed" });
                }}
                data-testid="button-refresh-partner-data"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/')}
                data-testid="button-back-to-home"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/20 to-transparent rounded-bl-full" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Promo Codes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-promo-code-count">
                {analytics?.promoCodes.length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Active promotion codes</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/20 to-transparent rounded-bl-full" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-total-users">
                {analytics?.totalRedemptions || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Users using your codes</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-transparent rounded-bl-full" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <PoundSterling className="w-4 h-4" />
                Discounts Given
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-total-discounts">
                £{((analytics?.totalDiscountGiven || 0) / 100).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total savings for users</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-transparent rounded-bl-full" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="w-4 h-4" />
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-conversion-rate">
                {(analytics?.conversionRate || 0).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Visits to signups</p>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="codes" data-testid="tab-codes">
              <Tag className="w-4 h-4 mr-2" />
              Promo Codes
            </TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Traffic Overview
                  </CardTitle>
                  <CardDescription>Visits and conversions for your promo codes</CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="text-sm text-muted-foreground">Total Visits</div>
                          <div className="text-2xl font-bold">{analytics?.totalVisits || 0}</div>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="text-sm text-muted-foreground">Conversions</div>
                          <div className="text-2xl font-bold">{analytics?.conversions || 0}</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Conversion Progress</span>
                          <span>{(analytics?.conversionRate || 0).toFixed(1)}%</span>
                        </div>
                        <Progress value={analytics?.conversionRate || 0} className="h-2" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    Users by Promo Code
                  </CardTitle>
                  <CardDescription>Distribution of users across your codes</CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : analytics?.usersByPromoCode && analytics.usersByPromoCode.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={analytics.usersByPromoCode.map((pc, i) => ({
                            name: pc.promoCode.code,
                            value: pc.users.length
                          }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {analytics.usersByPromoCode.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                      <Users className="w-12 h-12 mb-4 opacity-50" />
                      <p>No users yet</p>
                      <p className="text-sm">Share your promo codes to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="codes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Your Promo Codes
                </CardTitle>
                <CardDescription>Manage and share your promo codes</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="space-y-4">
                    {[1,2,3].map(i => <Skeleton key={i} className="h-24" />)}
                  </div>
                ) : analytics?.promoCodes && analytics.promoCodes.length > 0 ? (
                  <div className="grid gap-4">
                    {analytics.promoCodes.map((code) => {
                      const codeUsers = analytics.usersByPromoCode.find(pc => pc.promoCode.id === code.id);
                      const userCount = codeUsers?.users.length || 0;
                      
                      return (
                        <motion.div
                          key={code.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 border rounded-lg hover-elevate"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <code className="text-lg font-bold bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">
                                  {code.code}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleCopyCode(code.code)}
                                  data-testid={`button-copy-code-${code.id}`}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                                <Badge variant={code.status === 'active' ? 'default' : 'secondary'}>
                                  {code.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{code.name}</p>
                              {code.description && (
                                <p className="text-xs text-muted-foreground mt-1">{code.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-6 text-sm">
                              <div className="text-center">
                                <div className="font-bold text-lg">{userCount}</div>
                                <div className="text-muted-foreground">Users</div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-lg flex items-center">
                                  {code.discountType === 'percentage' ? (
                                    <><Percent className="w-4 h-4 mr-1" />{code.discountValue}</>
                                  ) : (
                                    <>£{code.discountValue}</>
                                  )}
                                </div>
                                <div className="text-muted-foreground">Discount</div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-lg">{code.currentUses}/{code.maxTotalUses || '∞'}</div>
                                <div className="text-muted-foreground">Uses</div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Valid from {format(new Date(code.validFrom), 'MMM d, yyyy')}
                            </span>
                            {code.validUntil && (
                              <span className="flex items-center gap-1">
                                until {format(new Date(code.validUntil), 'MMM d, yyyy')}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Tag className="w-12 h-12 mb-4 opacity-50" />
                    <p>No promo codes assigned</p>
                    <p className="text-sm">Contact admin to get your partner promo code</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Your Referred Users
                    </CardTitle>
                    <CardDescription>Users who signed up with your promo codes</CardDescription>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                      data-testid="input-search-users"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-2">
                    {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12" />)}
                  </div>
                ) : paginatedUsers.length > 0 ? (
                  <>
                    <ScrollArea className="h-[400px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Promo Code</TableHead>
                            <TableHead>Tier</TableHead>
                            <TableHead>Discount</TableHead>
                            <TableHead>Signed Up</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedUsers.map((pUser, index) => (
                            <TableRow key={`${pUser.userId}-${index}`}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{pUser.firstName} {pUser.lastName}</div>
                                  <div className="text-sm text-muted-foreground">{pUser.email}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <code className="text-sm bg-muted px-2 py-1 rounded">{pUser.promoCode}</code>
                              </TableCell>
                              <TableCell>
                                <Badge className={tierColors[pUser.tier] || tierColors.free}>
                                  {pUser.tier}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <span className="text-green-600 font-medium">
                                  £{(pUser.discountApplied / 100).toFixed(2)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-muted-foreground">
                                  {formatDistance(new Date(pUser.redeemedAt), new Date(), { addSuffix: true })}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleContactUser(pUser)}
                                  data-testid={`button-contact-user-${pUser.userId}`}
                                >
                                  <Mail className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                    
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-sm text-muted-foreground">
                          Showing {((usersPage - 1) * usersPerPage) + 1} to {Math.min(usersPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            disabled={usersPage === 1}
                            onClick={() => setUsersPage(p => p - 1)}
                            data-testid="button-prev-page"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <span className="text-sm">
                            Page {usersPage} of {totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            disabled={usersPage === totalPages}
                            onClick={() => setUsersPage(p => p + 1)}
                            data-testid="button-next-page"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mb-4 opacity-50" />
                    <p>No users found</p>
                    <p className="text-sm">
                      {searchQuery ? "Try a different search term" : "Share your promo codes to get users"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contact User
              </DialogTitle>
              <DialogDescription>
                Send a message to {selectedUser?.firstName} {selectedUser?.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  placeholder="Enter message subject"
                  data-testid="input-message-subject"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  placeholder="Write your message..."
                  rows={5}
                  data-testid="input-message-body"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setContactDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!messageSubject || !messageBody || contactUserMutation.isPending}
                data-testid="button-send-message"
              >
                {contactUserMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
