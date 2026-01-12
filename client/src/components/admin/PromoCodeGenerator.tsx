import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CalendarIcon, Percent, PoundSterling, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type DiscountType = "percentage" | "fixed";
type Duration = "once" | "forever" | "repeating";

interface CouponFormData {
  name: string;
  id: string;
  discountType: DiscountType;
  discountValue: string;
  duration: Duration;
  limitDateRange: boolean;
  validFrom: Date | null;
  validUntil: Date | null;
  limitTotalRedemptions: boolean;
  maxTotalUses: string;
  useCustomerCodes: boolean;
  code: string;
}

export function PromoCodeGenerator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<CouponFormData>({
    name: "",
    id: "",
    discountType: "percentage",
    discountValue: "",
    duration: "once",
    limitDateRange: false,
    validFrom: null,
    validUntil: null,
    limitTotalRedemptions: false,
    maxTotalUses: "",
    useCustomerCodes: true,
    code: "",
  });

  const [validFromOpen, setValidFromOpen] = useState(false);
  const [validUntilOpen, setValidUntilOpen] = useState(false);

  const generateRandomCode = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const createCouponMutation = useMutation({
    mutationFn: async () => {
      const code = formData.useCustomerCodes 
        ? (formData.code || generateRandomCode())
        : generateRandomCode();
      
      const discountValue = formData.discountType === "percentage"
        ? parseInt(formData.discountValue) || 0
        : (parseFloat(formData.discountValue) * 100) || 0;

      const payload = {
        code,
        name: formData.name || code,
        discountType: formData.discountType,
        discountValue,
        maxTotalUses: formData.limitTotalRedemptions 
          ? (parseInt(formData.maxTotalUses) || null)
          : null,
        maxUsesPerUser: 1,
        validFrom: formData.limitDateRange && formData.validFrom 
          ? formData.validFrom.toISOString() 
          : null,
        validUntil: formData.limitDateRange && formData.validUntil 
          ? formData.validUntil.toISOString() 
          : null,
        eligibleTiers: null,
        minPurchaseAmount: null,
      };

      const response = await apiRequest("POST", "/api/admin/promos", payload);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promos"] });
      toast({ title: "Coupon created successfully" });
      setFormData({
        name: "",
        id: "",
        discountType: "percentage",
        discountValue: "",
        duration: "once",
        limitDateRange: false,
        validFrom: null,
        validUntil: null,
        limitTotalRedemptions: false,
        maxTotalUses: "",
        useCustomerCodes: true,
        code: "",
      });
    },
    onError: (error: any) => {
      const details = error?.details || error?.message || "Unknown error";
      toast({ 
        title: "Failed to create coupon", 
        description: details, 
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.discountValue) {
      toast({ 
        title: "Discount value required", 
        variant: "destructive" 
      });
      return;
    }

    createCouponMutation.mutate();
  };

  const updateField = <K extends keyof CouponFormData>(
    field: K,
    value: CouponFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Create a coupon</h2>
        <p className="text-muted-foreground mt-1">
          Coupons can be used to create both percentage and fixed amount discounts.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  data-testid="input-coupon-name"
                  placeholder="First purchase discount"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This will appear on customers' receipts and invoices.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="id">
                  ID <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <Input
                  id="id"
                  data-testid="input-coupon-id"
                  placeholder=""
                  value={formData.id}
                  onChange={(e) => updateField("id", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This will identify this coupon in the API. We recommend leaving this blank so we can generate one for you.
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-3">
                <Label>Type</Label>
                <div className="flex gap-4">
                  <label 
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 border rounded-lg cursor-pointer transition-colors flex-1",
                      formData.discountType === "percentage" 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-muted-foreground/30"
                    )}
                    data-testid="radio-percentage"
                  >
                    <input
                      type="radio"
                      name="discountType"
                      value="percentage"
                      checked={formData.discountType === "percentage"}
                      onChange={() => updateField("discountType", "percentage")}
                      className="sr-only"
                    />
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                      formData.discountType === "percentage" 
                        ? "border-primary" 
                        : "border-muted-foreground/40"
                    )}>
                      {formData.discountType === "percentage" && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    <span>Percentage off</span>
                  </label>

                  <label 
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 border rounded-lg cursor-pointer transition-colors flex-1",
                      formData.discountType === "fixed" 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-muted-foreground/30"
                    )}
                    data-testid="radio-fixed"
                  >
                    <input
                      type="radio"
                      name="discountType"
                      value="fixed"
                      checked={formData.discountType === "fixed"}
                      onChange={() => updateField("discountType", "fixed")}
                      className="sr-only"
                    />
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                      formData.discountType === "fixed" 
                        ? "border-primary" 
                        : "border-muted-foreground/40"
                    )}>
                      {formData.discountType === "fixed" && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <PoundSterling className="h-4 w-4 text-muted-foreground" />
                    <span>Fixed amount off</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountValue">
                  {formData.discountType === "percentage" ? "Percentage discount" : "Discount amount"}
                </Label>
                <div className="relative">
                  <Input
                    id="discountValue"
                    data-testid="input-discount-value"
                    type="number"
                    min="0"
                    max={formData.discountType === "percentage" ? "100" : undefined}
                    step={formData.discountType === "fixed" ? "0.01" : "1"}
                    placeholder={formData.discountType === "percentage" ? "20" : "10.00"}
                    value={formData.discountValue}
                    onChange={(e) => updateField("discountValue", e.target.value)}
                    className="pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {formData.discountType === "percentage" ? "%" : "GBP"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Select
                  value={formData.duration}
                  onValueChange={(v) => updateField("duration", v as Duration)}
                >
                  <SelectTrigger data-testid="select-duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Once</SelectItem>
                    <SelectItem value="forever">Forever</SelectItem>
                    <SelectItem value="repeating">Multiple months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label className="text-base">Redemption limits</Label>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="limitDateRange"
                    data-testid="checkbox-limit-date"
                    checked={formData.limitDateRange}
                    onCheckedChange={(checked) => 
                      updateField("limitDateRange", checked === true)
                    }
                  />
                  <div className="space-y-1">
                    <Label htmlFor="limitDateRange" className="font-normal cursor-pointer">
                      Limit the date range when customers can redeem this coupon
                    </Label>
                    
                    {formData.limitDateRange && (
                      <div className="flex gap-3 mt-3">
                        <Popover open={validFromOpen} onOpenChange={setValidFromOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              data-testid="button-valid-from"
                              className={cn(
                                "justify-start text-left font-normal",
                                !formData.validFrom && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.validFrom 
                                ? format(formData.validFrom, "MMM d, yyyy")
                                : "Start date"
                              }
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData.validFrom || undefined}
                              onSelect={(date) => {
                                updateField("validFrom", date || null);
                                setValidFromOpen(false);
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>

                        <Popover open={validUntilOpen} onOpenChange={setValidUntilOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              data-testid="button-valid-until"
                              className={cn(
                                "justify-start text-left font-normal",
                                !formData.validUntil && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.validUntil 
                                ? format(formData.validUntil, "MMM d, yyyy")
                                : "End date"
                              }
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData.validUntil || undefined}
                              onSelect={(date) => {
                                updateField("validUntil", date || null);
                                setValidUntilOpen(false);
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="limitTotalRedemptions"
                    data-testid="checkbox-limit-redemptions"
                    checked={formData.limitTotalRedemptions}
                    onCheckedChange={(checked) => 
                      updateField("limitTotalRedemptions", checked === true)
                    }
                  />
                  <div className="space-y-1">
                    <Label htmlFor="limitTotalRedemptions" className="font-normal cursor-pointer">
                      Limit the total number of times this coupon can be redeemed
                    </Label>
                    
                    {formData.limitTotalRedemptions && (
                      <div className="mt-3">
                        <Input
                          type="number"
                          min="1"
                          data-testid="input-max-uses"
                          placeholder="100"
                          value={formData.maxTotalUses}
                          onChange={(e) => updateField("maxTotalUses", e.target.value)}
                          className="w-32"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label className="text-base">Codes</Label>
              
              <div className="flex items-start gap-3">
                <Checkbox
                  id="useCustomerCodes"
                  data-testid="checkbox-customer-codes"
                  checked={formData.useCustomerCodes}
                  onCheckedChange={(checked) => 
                    updateField("useCustomerCodes", checked === true)
                  }
                />
                <div className="space-y-1">
                  <Label htmlFor="useCustomerCodes" className="font-normal cursor-pointer">
                    Use customer-facing coupon codes
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Customers can enter this code at checkout to receive the discount.
                  </p>
                  
                  {formData.useCustomerCodes && (
                    <div className="mt-3">
                      <Input
                        data-testid="input-code"
                        placeholder="e.g., WELCOME20"
                        value={formData.code}
                        onChange={(e) => updateField("code", e.target.value.toUpperCase())}
                        className="font-mono uppercase w-48"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Leave blank to auto-generate a code.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            data-testid="button-cancel"
            onClick={() => {
              setFormData({
                name: "",
                id: "",
                discountType: "percentage",
                discountValue: "",
                duration: "once",
                limitDateRange: false,
                validFrom: null,
                validUntil: null,
                limitTotalRedemptions: false,
                maxTotalUses: "",
                useCustomerCodes: true,
                code: "",
              });
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            data-testid="button-create-coupon"
            disabled={createCouponMutation.isPending}
          >
            {createCouponMutation.isPending ? "Creating..." : "Create coupon"}
          </Button>
        </div>
      </form>
    </div>
  );
}
