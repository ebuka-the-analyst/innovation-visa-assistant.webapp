import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Users, Search, Building2, Briefcase, Globe, Loader2, Star, MapPin, ExternalLink } from "lucide-react";

interface NetworkMatch {
  id: string;
  name: string;
  type: 'investor' | 'advisor' | 'partner' | 'mentor';
  industry: string;
  location: string;
  matchScore: number;
  expertise: string[];
  connectionReason: string;
}

export default function AINetworkBuilder() {
  const { toast } = useToast();
  const [businessDescription, setBusinessDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [networkType, setNetworkType] = useState<string>('all');
  const [matches, setMatches] = useState<NetworkMatch[]>([]);

  const findMatchesMutation = useMutation({
    mutationFn: async (data: { description: string; industry: string; type: string }) => {
      const response = await apiRequest('POST', '/api/ai/find-network-matches', data);
      return response.json();
    },
    onSuccess: (data) => {
      setMatches(data.matches || []);
      toast({ title: "Matches Found", description: `Found ${data.matches?.length || 0} potential connections` });
    }
  });

  const handleSearch = () => {
    if (!businessDescription.trim()) {
      toast({ title: "Required", description: "Please describe your business", variant: "destructive" });
      return;
    }
    findMatchesMutation.mutate({ description: businessDescription, industry, type: networkType });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'investor': return 'bg-green-500';
      case 'advisor': return 'bg-blue-500';
      case 'partner': return 'bg-purple-500';
      case 'mentor': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'investor': return Building2;
      case 'advisor': return Briefcase;
      case 'partner': return Globe;
      case 'mentor': return Users;
      default: return Users;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-500/5 to-indigo-500/5 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30 mb-4">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">AI Network Builder</span>
          </div>
          <h1 className="text-4xl font-bold mb-3" data-testid="heading-network-builder">UK Network Builder AI</h1>
          <p className="text-muted-foreground">AI-powered matching with UK investors, advisors, partners, and mentors</p>
        </div>

        <ToolUtilityBar toolId="ai-network-builder" toolName="Network Builder" />

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Find Connections
              </CardTitle>
              <CardDescription>Describe your business to find relevant UK connections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Business Description</label>
                <Textarea
                  placeholder="Describe your business, what you're building, and what kind of connections you need..."
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  className="min-h-[120px]"
                  data-testid="input-business-description"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Industry</label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger data-testid="select-industry">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fintech">Fintech</SelectItem>
                    <SelectItem value="healthtech">Healthtech</SelectItem>
                    <SelectItem value="edtech">Edtech</SelectItem>
                    <SelectItem value="saas">SaaS / Enterprise</SelectItem>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                    <SelectItem value="cleantech">Cleantech / Sustainability</SelectItem>
                    <SelectItem value="ai">AI / Machine Learning</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Connection Type</label>
                <Select value={networkType} onValueChange={setNetworkType}>
                  <SelectTrigger data-testid="select-type">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="investor">Investors</SelectItem>
                    <SelectItem value="advisor">Advisors</SelectItem>
                    <SelectItem value="partner">Partners</SelectItem>
                    <SelectItem value="mentor">Mentors</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={findMatchesMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                data-testid="button-find-matches"
              >
                {findMatchesMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Finding Matches...</>
                ) : (
                  <><Search className="w-4 h-4 mr-2" />Find UK Connections</>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Matched Connections</CardTitle>
              <CardDescription>AI-recommended UK network connections based on your profile</CardDescription>
            </CardHeader>
            <CardContent>
              {matches.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Describe your business to find matching UK connections</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {matches.map(match => {
                    const Icon = getTypeIcon(match.type);
                    return (
                      <Card key={match.id} className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getTypeColor(match.type)}`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold">{match.name}</h4>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="font-medium">{match.matchScore}%</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getTypeColor(match.type)}>{match.type}</Badge>
                              <Badge variant="outline">{match.industry}</Badge>
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />{match.location}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{match.connectionReason}</p>
                            <div className="flex flex-wrap gap-1">
                              {match.expertise.map((exp, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">{exp}</Badge>
                              ))}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" data-testid={`button-connect-${match.id}`}>
                            <ExternalLink className="w-4 h-4 mr-1" />Connect
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
