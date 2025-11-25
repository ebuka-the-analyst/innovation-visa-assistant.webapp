import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  HelpCircle, MessageSquare, Mail, Phone, Clock, 
  CheckCircle2, Send, BookOpen, FileQuestion, 
  CreditCard, Shield, Settings, Users
} from "lucide-react";
import { Link } from "wouter";

const FAQ_CATEGORIES = [
  {
    id: "general",
    name: "General",
    icon: HelpCircle,
    questions: [
      {
        q: "What is the UK Innovator Founder Visa?",
        a: "The UK Innovator Founder Visa is for experienced entrepreneurs who want to establish a business in the UK. You need endorsement from an approved body and must meet innovation, viability, and scalability criteria."
      },
      {
        q: "How does this platform help me?",
        a: "Our platform provides 109 PhD-level tools to guide you through every aspect of the visa application process, from business planning to endorser preparation. All tools are designed to meet official visa requirements."
      },
      {
        q: "Is my data secure?",
        a: "Yes, we use industry-standard encryption and never share your data. Your progress auto-saves locally and any uploaded documents are stored securely with access controls."
      },
    ]
  },
  {
    id: "visa",
    name: "Visa Process",
    icon: FileQuestion,
    questions: [
      {
        q: "What are the main requirements for the Innovator Founder Visa?",
        a: "Key requirements include: endorsement from an approved body, business idea that is innovative, viable, and scalable, minimum £50,000 investment funds, and English language proficiency at B2 level."
      },
      {
        q: "How long does the visa process take?",
        a: "Typically 3-8 weeks for a decision after submission. We recommend starting preparation 3-4 months before your intended application date to ensure thoroughness."
      },
      {
        q: "Can I apply without endorsement?",
        a: "No, endorsement from an approved body is mandatory. Our platform helps you prepare for endorser interviews and choose the right endorsing body for your business."
      },
    ]
  },
  {
    id: "billing",
    name: "Billing",
    icon: CreditCard,
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit and debit cards through our secure Stripe payment processor. We also support Apple Pay and Google Pay."
      },
      {
        q: "Can I get a refund?",
        a: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with our service, contact support for a full refund, no questions asked."
      },
      {
        q: "Do you offer discounts?",
        a: "Yes! We have a referral program where you earn credits for each friend who signs up. We also run occasional promotions - subscribe to our newsletter to stay updated."
      },
    ]
  },
  {
    id: "account",
    name: "Account",
    icon: Settings,
    questions: [
      {
        q: "How do I change my password?",
        a: "Go to Settings > Account > Change Password. Enter your current password and your new password twice to confirm."
      },
      {
        q: "Can I upgrade or downgrade my plan?",
        a: "Yes, you can change your plan at any time from the Pricing page. Upgrades are immediate, and downgrades take effect at the end of your billing period."
      },
      {
        q: "How do I export my data?",
        a: "Go to Settings > Privacy > Export Your Data. This will download all your saved progress and account information as a JSON file."
      },
    ]
  },
];

const CONTACT_TOPICS = [
  { value: "general", label: "General Inquiry" },
  { value: "technical", label: "Technical Support" },
  { value: "billing", label: "Billing Question" },
  { value: "visa", label: "Visa Process Help" },
  { value: "feedback", label: "Feedback/Suggestion" },
  { value: "partnership", label: "Partnership Inquiry" },
];

export default function SupportPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topic || !subject || !message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest("POST", "/api/support/contact", {
        topic,
        subject,
        message,
        email: user?.email,
      });

      setSubmitted(true);
      toast({
        title: "Message Sent",
        description: "We'll get back to you within 24 hours",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="container mx-auto py-8 px-4 md:px-6 max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2" data-testid="heading-support">
            Help & Support
          </h1>
          <p className="text-muted-foreground">
            Find answers to common questions or get in touch with our team
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="text-center hover-elevate cursor-pointer">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Documentation</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Comprehensive guides and tutorials
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/guide" data-testid="link-guide">View Guide</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center hover-elevate cursor-pointer">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-1">FAQ</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Quick answers to common questions
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/faq" data-testid="link-faq">Browse FAQ</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center hover-elevate cursor-pointer">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-1">Email Support</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Get help from our expert team
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href="mailto:support@innovatorfoundervisaassistant.co.uk" data-testid="link-email">
                  Contact Us
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="faq" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Frequently Asked Questions
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Contact Us
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="space-y-6">
            {FAQ_CATEGORIES.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <category.icon className="w-5 h-5" />
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((item, index) => (
                      <AccordionItem key={index} value={`${category.id}-${index}`}>
                        <AccordionTrigger className="text-left">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <Alert className="border-green-500 bg-green-50 dark:bg-green-950/30">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      <strong>Message sent successfully!</strong>
                      <p className="mt-1">
                        We've received your message and will respond within 24 hours to{" "}
                        <span className="font-medium">{user?.email || "your email"}</span>.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => {
                          setSubmitted(false);
                          setTopic("");
                          setSubject("");
                          setMessage("");
                        }}
                      >
                        Send Another Message
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="topic">Topic</Label>
                        <Select value={topic} onValueChange={setTopic}>
                          <SelectTrigger id="topic" data-testid="select-topic">
                            <SelectValue placeholder="Select a topic" />
                          </SelectTrigger>
                          <SelectContent>
                            {CONTACT_TOPICS.map((t) => (
                              <SelectItem key={t.value} value={t.value}>
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Your Email</Label>
                        <Input 
                          id="email"
                          value={user?.email || ""} 
                          disabled 
                          className="bg-muted"
                          data-testid="input-email"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input 
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Brief description of your inquiry"
                        data-testid="input-subject"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea 
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Please provide as much detail as possible..."
                        rows={6}
                        data-testid="input-message"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full"
                      data-testid="button-submit"
                    >
                      {isSubmitting ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Other Ways to Reach Us</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Email</h4>
                    <a 
                      href="mailto:support@innovatorfoundervisaassistant.co.uk"
                      className="text-sm text-primary hover:underline"
                    >
                      support@innovatorfoundervisaassistant.co.uk
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">
                      Response within 24 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Business Hours</h4>
                    <p className="text-sm text-muted-foreground">
                      Monday - Friday: 9am - 6pm GMT
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Weekend support for urgent issues
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
