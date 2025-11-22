import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { useState } from "react";

export default function FeeEstimator() {
  const [location, setLocation] = useState("outside");
  const [meetings, setMeetings] = useState(2);
  const [total, setTotal] = useState(0);

  const calculate = () => {
    const appFee = location === "outside" ? 1274 : 1590;
    const endorsementFee = 1000;
    const meetingFees = meetings * 500;
    setTotal(appFee + endorsementFee + meetingFees);
  };

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-6xl mx-auto">
          <ToolNavigation />
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Fee Estimator</h1>
            <p className="text-lg text-muted-foreground">Calculate total UK Innovation Visa application fees</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 md:col-span-2">
              <h3 className="font-semibold mb-4">Application Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Application Location</label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="outside">Outside UK (£1,274)</SelectItem>
                      <SelectItem value="inside">Inside UK (£1,590)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Contact Point Meetings (minimum 2)</label>
                  <input type="range" min="2" max="10" value={meetings} onChange={e => setMeetings(parseInt(e.target.value))} className="w-full mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">{meetings} meetings × £500 = £{meetings * 500}</p>
                </div>

                <Button onClick={calculate} className="w-full mt-4">Calculate Total</Button>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10">
              <h3 className="font-semibold mb-4">Total Cost</h3>
              <div className="text-4xl font-bold mb-4">£{total.toLocaleString()}</div>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Application Fee:</span>
                  <span>£{location === "outside" ? "1,274" : "1,590"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Endorsement:</span>
                  <span>£1,000</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Meetings ({meetings}×£500):</span>
                  <span>£{meetings * 500}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
