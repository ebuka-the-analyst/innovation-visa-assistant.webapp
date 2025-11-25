import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, Upload, Sparkles, Loader2, CheckCircle, XCircle, Clock,
  TrendingUp, Lightbulb, Scale, Target, AlertTriangle, ChevronRight,
  RefreshCw, Crown
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SEOHead } from "@/components/SEOHead";

interface DocumentReview {
  id: string;
  documentName: string;
  documentType: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt: string | null;
  overallScore: number | null;
  innovationScore: number | null;
  viabilityScore: number | null;
  scalabilityScore: number | null;
  endorserAlignment: number | null;
  strengthsFound: string[] | null;
  weaknessesFound: string[] | null;
  suggestions: { priority: string; suggestion: string }[] | null;
}

interface ReviewStats {
  totalReviews: number;
  completedReviews: number;
  averageScore: number;
  averageInnovation: number;
  averageViability: number;
  averageScalability: number;
}

const documentTypes = [
  { value: 'business_plan', label: 'Business Plan' },
  { value: 'personal_statement', label: 'Personal Statement' },
  { value: 'evidence', label: 'Evidence Document' },
  { value: 'financial', label: 'Financial Document' },
  { value: 'other', label: 'Other' }
];

function ScoreCircle({ score, label, color }: { score: number; label: string; color: string }) {
  return (
    <div className="text-center">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${color} mx-auto mb-2`}>
        <span className="text-xl font-bold">{score}</span>
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function ReviewResultDialog({ review, open, onOpenChange }: { 
  review: DocumentReview | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  if (!review || review.status !== 'completed') return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'border-green-500 text-green-600';
    if (score >= 60) return 'border-amber-500 text-amber-600';
    return 'border-red-500 text-red-600';
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300';
    if (priority === 'medium') return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
    return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Review Results: {review.documentName}
          </DialogTitle>
          <DialogDescription>
            Reviewed on {new Date(review.completedAt!).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] pr-4">
          <div className="space-y-6">
            <div className="grid grid-cols-5 gap-4">
              <ScoreCircle 
                score={review.overallScore || 0} 
                label="Overall" 
                color={getScoreColor(review.overallScore || 0)} 
              />
              <ScoreCircle 
                score={review.innovationScore || 0} 
                label="Innovation" 
                color={getScoreColor(review.innovationScore || 0)} 
              />
              <ScoreCircle 
                score={review.viabilityScore || 0} 
                label="Viability" 
                color={getScoreColor(review.viabilityScore || 0)} 
              />
              <ScoreCircle 
                score={review.scalabilityScore || 0} 
                label="Scalability" 
                color={getScoreColor(review.scalabilityScore || 0)} 
              />
              <ScoreCircle 
                score={review.endorserAlignment || 0} 
                label="Endorser Fit" 
                color={getScoreColor(review.endorserAlignment || 0)} 
              />
            </div>

            {review.strengthsFound && review.strengthsFound.length > 0 && (
              <div>
                <h4 className="font-medium text-green-600 flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4" />
                  Strengths
                </h4>
                <ul className="space-y-2">
                  {review.strengthsFound.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center shrink-0 text-xs text-green-600">
                        {i + 1}
                      </span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {review.weaknessesFound && review.weaknessesFound.length > 0 && (
              <div>
                <h4 className="font-medium text-amber-600 flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  Areas for Improvement
                </h4>
                <ul className="space-y-2">
                  {review.weaknessesFound.map((weakness, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center shrink-0 text-xs text-amber-600">
                        {i + 1}
                      </span>
                      {weakness}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {review.suggestions && review.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-600 flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4" />
                  Suggestions
                </h4>
                <div className="space-y-2">
                  {review.suggestions.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Badge variant="outline" className={`shrink-0 ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </Badge>
                      <span>{item.suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button asChild>
            <Link href="/template-library">
              Browse Templates <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ReviewCard({ review, onViewResults }: { review: DocumentReview; onViewResults: () => void }) {
  const statusConfig = {
    pending: { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800', label: 'Pending' },
    processing: { icon: Loader2, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900', label: 'Processing' },
    completed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900', label: 'Completed' },
    failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900', label: 'Failed' }
  };

  const config = statusConfig[review.status];
  const StatusIcon = config.icon;

  return (
    <Card className="hover-elevate" data-testid={`review-card-${review.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`p-2 rounded-lg ${config.bg}`}>
              <StatusIcon className={`w-5 h-5 ${config.color} ${review.status === 'processing' ? 'animate-spin' : ''}`} />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium truncate">{review.documentName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs capitalize">
                  {review.documentType.replace('_', ' ')}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {review.status === 'completed' && review.overallScore !== null && (
            <div className="text-right shrink-0">
              <div className={`text-2xl font-bold ${
                review.overallScore >= 80 ? 'text-green-500' :
                review.overallScore >= 60 ? 'text-amber-500' : 'text-red-500'
              }`}>
                {review.overallScore}
              </div>
              <p className="text-xs text-muted-foreground">Score</p>
            </div>
          )}
        </div>

        {review.status === 'completed' && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-4 gap-2 mb-3">
              <div className="text-center">
                <div className="text-sm font-medium">{review.innovationScore}</div>
                <p className="text-xs text-muted-foreground">Innovation</p>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium">{review.viabilityScore}</div>
                <p className="text-xs text-muted-foreground">Viability</p>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium">{review.scalabilityScore}</div>
                <p className="text-xs text-muted-foreground">Scalability</p>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium">{review.endorserAlignment}</div>
                <p className="text-xs text-muted-foreground">Endorser</p>
              </div>
            </div>
            <Button className="w-full" onClick={onViewResults} data-testid={`button-view-results-${review.id}`}>
              View Full Results <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {review.status === 'processing' && (
          <div className="mt-4">
            <Progress value={33} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1 text-center">AI analyzing your document...</p>
          </div>
        )}

        {review.status === 'failed' && (
          <div className="mt-4">
            <Alert variant="destructive">
              <AlertDescription className="text-sm">
                Review failed. Please try again or contact support.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DocumentReview() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [documentName, setDocumentName] = useState("");
  const [documentType, setDocumentType] = useState<string>("");
  const [documentContent, setDocumentContent] = useState("");
  const [selectedReview, setSelectedReview] = useState<DocumentReview | null>(null);
  const [showResults, setShowResults] = useState(false);

  const { data: reviewData, isLoading, refetch } = useQuery<{ reviews: DocumentReview[]; stats: ReviewStats }>({
    queryKey: ['/api/document-reviews'],
    enabled: !!user,
    refetchInterval: 5000
  });

  const createReviewMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/document-reviews", {
        documentName,
        documentType,
        documentContent
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/document-reviews'] });
      toast({ title: "Review started!", description: "AI is analyzing your document..." });
      setDocumentName("");
      setDocumentType("");
      setDocumentContent("");
    },
    onError: () => {
      toast({ title: "Failed to start review", variant: "destructive" });
    }
  });

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-muted rounded" />
            ))}
          </div>
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <SEOHead
          title="AI Document Review | UK Innovator Founder Visa Assistant"
          description="Get AI-powered feedback on your UK Innovator Founder Visa application documents."
        />
        <div className="container mx-auto py-8 px-4 max-w-2xl text-center">
          <Sparkles className="w-16 h-16 mx-auto text-primary mb-4" />
          <h1 className="text-2xl font-bold mb-4">Sign In for AI Document Review</h1>
          <p className="text-muted-foreground mb-6">
            Get expert AI feedback on your visa application documents.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link href="/login" data-testid="link-login">Sign In</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/signup" data-testid="link-signup">Create Account</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  const reviews = reviewData?.reviews || [];
  const stats = reviewData?.stats || {
    totalReviews: 0,
    completedReviews: 0,
    averageScore: 0,
    averageInnovation: 0,
    averageViability: 0,
    averageScalability: 0
  };

  const canSubmit = documentName.trim() && documentType && documentContent.trim().length >= 100;

  return (
    <>
      <SEOHead
        title="AI Document Review | UK Innovator Founder Visa Assistant"
        description="Get AI-powered professional feedback on your UK Innovator Founder Visa application documents. Improve your innovation, viability, and scalability scores."
      />

      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3" data-testid="heading-document-review">
            <Sparkles className="w-8 h-8 text-primary" />
            AI Document Review
          </h1>
          <p className="text-muted-foreground">
            Get expert AI feedback to strengthen your visa application documents
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-primary" data-testid="text-total-reviews">{stats.totalReviews}</div>
              <p className="text-sm text-muted-foreground">Total Reviews</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-500" data-testid="text-avg-score">{stats.averageScore || '-'}</div>
              <p className="text-sm text-muted-foreground">Avg Score</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-500" data-testid="text-avg-innovation">{stats.averageInnovation || '-'}</div>
              <p className="text-sm text-muted-foreground">Avg Innovation</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-purple-500" data-testid="text-avg-viability">{stats.averageViability || '-'}</div>
              <p className="text-sm text-muted-foreground">Avg Viability</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="new" className="space-y-6" data-testid="tabs-document-review">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new">New Review</TabsTrigger>
            <TabsTrigger value="history">Review History ({reviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Submit Document for Review
                </CardTitle>
                <CardDescription>
                  Paste your document content below for AI-powered analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="doc-name">Document Name</Label>
                    <Input
                      id="doc-name"
                      value={documentName}
                      onChange={(e) => setDocumentName(e.target.value)}
                      placeholder="e.g., Business Plan v2"
                      data-testid="input-document-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doc-type">Document Type</Label>
                    <Select value={documentType} onValueChange={setDocumentType}>
                      <SelectTrigger id="doc-type" data-testid="select-document-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doc-content">Document Content</Label>
                  <Textarea
                    id="doc-content"
                    value={documentContent}
                    onChange={(e) => setDocumentContent(e.target.value)}
                    placeholder="Paste your document content here (minimum 100 characters)..."
                    className="min-h-[300px] font-mono text-sm"
                    data-testid="textarea-document-content"
                  />
                  <p className="text-xs text-muted-foreground">
                    {documentContent.length} characters (minimum 100 required)
                  </p>
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => createReviewMutation.mutate()}
                  disabled={!canSubmit || createReviewMutation.isPending}
                  data-testid="button-submit-review"
                >
                  {createReviewMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Starting Review...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Submit for AI Review
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Alert className="bg-gradient-to-r from-primary/5 to-primary/10">
              <Lightbulb className="w-4 h-4" />
              <AlertDescription>
                <strong>Tip:</strong> For best results, include complete sections like Executive Summary, 
                Innovation Description, Market Analysis, and Financial Projections.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Your Reviews</h3>
              <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            {reviews.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Submit your first document to get AI-powered feedback
                </p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {reviews.map(review => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onViewResults={() => {
                      setSelectedReview(review);
                      setShowResults(true);
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <ReviewResultDialog
          review={selectedReview}
          open={showResults}
          onOpenChange={setShowResults}
        />
      </div>
    </>
  );
}
