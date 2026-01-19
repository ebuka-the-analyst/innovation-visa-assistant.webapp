import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, CreditCard, Shield, Zap, ArrowLeft, Tag } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import ThemeToggle from "@/components/ThemeToggle";
import logoLight from "@assets/official_logo.png";
import logoDark from "@assets/logo_dark.png";

interface PromoCodeValidation {
  valid: boolean;
  message?: string;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  originalPrice?: number;
  finalPrice?: number;
}

const PRICING: Record<string, { name: string; amount: number; description: string; features: string[] }> = {
  basic: {
    name: "Basic Plan",
    amount: 900,
    description: "Perfect for straightforward businesses",
    features: ["1 business plan coin", "20 tools access", "48-hour delivery", "PDF download"]
  },
  premium: {
    name: "Premium Plan",
    amount: 1900,
    description: "Most popular - comprehensive coverage",
    features: ["3 business plan coins", "83 tools access", "24-hour priority delivery", "Market research integration"]
  },
  enterprise: {
    name: "Enterprise Plan",
    amount: 2900,
    description: "Maximum detail for complex ventures",
    features: ["6 business plan coins", "109 tools access", "12-hour priority delivery", "IP & patent strategy"]
  },
  ultimate: {
    name: "Ultimate Plan",
    amount: 3900,
    description: "Everything for guaranteed approval",
    features: ["10 business plan coins", "109 tools access", "1-hour rush delivery", "Success guarantee coaching"]
  }
};

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const searchParams = new URLSearchParams(window.location.search);
  const tier = searchParams.get('tier') || 'premium';
  
  const [promoCode, setPromoCode] = useState('');
  const [promoValidation, setPromoValidation] = useState<PromoCodeValidation | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery<{ 
    id: string; 
    email: string; 
    subscriptionTier?: string;
  }>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  const pricing = PRICING[tier] || PRICING.premium;
  const originalPrice = pricing.amount / 100;
  const finalPrice = promoValidation?.valid && promoValidation.finalPrice 
    ? promoValidation.finalPrice / 100 
    : originalPrice;
  const discount = originalPrice - finalPrice;

  useEffect(() => {
    if (!userLoading && !user) {
      setLocation(`/signup?tier=${tier}&redirect=checkout`);
    }
  }, [user, userLoading, tier, setLocation]);

  const validatePromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoValidation(null);
      return;
    }
    
    setIsValidatingPromo(true);
    try {
      const response = await fetch(`/api/promos/validate/${encodeURIComponent(promoCode.trim().toUpperCase())}?tier=${tier}`);
      const data = await response.json();
      
      if (data.valid) {
        let finalPrice = pricing.amount;
        if (data.discountType === 'percentage') {
          finalPrice = Math.round(pricing.amount * (1 - data.discountValue / 100));
        } else if (data.discountType === 'fixed') {
          finalPrice = Math.max(0, pricing.amount - data.discountValue);
        }
        
        setPromoValidation({
          valid: true,
          message: data.discountType === 'percentage' 
            ? `${data.discountValue}% discount applied!` 
            : `£${(data.discountValue / 100).toFixed(2)} discount applied!`,
          discountType: data.discountType,
          discountValue: data.discountValue,
          originalPrice: pricing.amount,
          finalPrice
        });
      } else {
        setPromoValidation({ 
          valid: false, 
          message: data.error || 'Invalid promo code' 
        });
      }
    } catch (error) {
      setPromoValidation({ valid: false, message: 'Failed to validate promo code' });
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const payload: { tier: string; promoCode?: string } = { tier };
      if (promoValidation?.valid && promoCode.trim()) {
        payload.promoCode = promoCode.trim().toUpperCase();
      }
      const response = await apiRequest('POST', '/api/payment/direct-subscribe', payload);
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.skipCheckout) {
        toast({
          title: "Success!",
          description: "Your subscription has been activated with 100% discount!",
        });
        // Redirect to the URL provided by the server (questionnaire or generation)
        if (data.redirectUrl) {
          setLocation(data.redirectUrl);
        } else {
          setLocation('/questionnaire');
        }
      } else if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      if (error.promoError) {
        setPromoValidation({ valid: false, message: error.message || 'Invalid promo code' });
        setPromoCode('');
      }
      toast({
        title: "Error",
        description: error.message || "Failed to proceed to payment",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  const handleCheckout = () => {
    setIsProcessing(true);
    checkoutMutation.mutate();
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <SEOHead
        title={`Checkout - ${pricing.name} | UK Innovator Founder Visa Assistant`}
        description={`Complete your purchase of the ${pricing.name} for your UK Innovator Founder Visa application.`}
        canonical={`https://innovatorfoundervisaassistant.co.uk/checkout?tier=${tier}`}
      />
      
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="logo-container h-8">
              <img src={logoLight} alt="Logo" className="h-8 w-auto logo-light" loading="lazy" />
              <img src={logoDark} alt="Logo" className="h-8 w-auto logo-dark" loading="lazy" />
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/pricing">
              <Button variant="ghost" size="sm" data-testid="button-back-to-pricing">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Pricing
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Complete Your Purchase</h1>
            <p className="text-muted-foreground">Secure checkout powered by Stripe</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Order Summary */}
            <Card className="order-2 md:order-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold text-lg">{pricing.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{pricing.description}</p>
                  <ul className="space-y-1.5">
                    {pricing.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>£{originalPrice.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-£{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span className="text-primary">£{finalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Promo Code & Payment */}
            <Card className="order-1 md:order-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-emerald-500" />
                  Have a Promo Code?
                </CardTitle>
                <CardDescription>
                  Enter your discount code below to save on your purchase
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Promo Code Input */}
                <div className="space-y-3">
                  <Label htmlFor="promo-code" className="text-sm font-medium">
                    Promo Code
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="promo-code"
                      placeholder="Enter code (e.g., SAVE20)"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value.toUpperCase());
                        setPromoValidation(null);
                      }}
                      className="flex-1"
                      disabled={isValidatingPromo || isProcessing}
                      data-testid="input-checkout-promo-code"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={validatePromoCode}
                      disabled={isValidatingPromo || !promoCode.trim() || isProcessing}
                      className="px-4"
                      data-testid="button-validate-checkout-promo"
                    >
                      {isValidatingPromo ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </div>
                  
                  {/* Promo Validation Message */}
                  {promoValidation && (
                    <div className="mt-2">
                      {promoValidation.valid ? (
                        <Badge className="bg-emerald-500 text-white gap-1" data-testid="badge-promo-success">
                          <Check className="w-3 h-3" />
                          {promoValidation.message}
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1" data-testid="badge-promo-error">
                          <X className="w-3 h-3" />
                          {promoValidation.message}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Security Note */}
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">Secure Payment</p>
                    <p className="text-muted-foreground">
                      Your payment is processed securely by Stripe. We never store your card details.
                    </p>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  disabled={isProcessing || checkoutMutation.isPending}
                  className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-700"
                  data-testid="button-proceed-to-payment"
                >
                  {isProcessing || checkoutMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Pay £{finalPrice.toFixed(2)} Now
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By proceeding, you agree to our{" "}
                  <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>256-bit SSL Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-500" />
              <span>Powered by Stripe</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Instant Access After Payment</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
