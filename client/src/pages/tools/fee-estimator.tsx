import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function FeeEstimator() {
  const [location, setLocation] = useState("outside");
  const [meetings, setMeetings] = useState(2);

  const applicationFee = location === "outside" ? 1274 : 1590;
  const endorsementFee = 1000;
  const meetingFees = meetings * 500;
  const totalCost = applicationFee + endorsementFee + meetingFees;

  const breakdown = [
    { item: "Application Fee", cost: applicationFee, color: "#ffa536" },
    { item: "Endorsement Assessment", cost: endorsementFee, color: "#11b6e9" },
    { item: `Contact Point Meetings (${meetings})`, cost: meetingFees, color: "#06b6d4" },
  ];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Fee Estimator</h1>
            <p className="text-lg text-muted-foreground">Calculate your total UK Innovation Visa fees</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Application Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Application Location</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-accent/50">
                      <input type="radio" name="location" value="outside" checked={location === "outside"} onChange={(e) => setLocation(e.target.value)} />
                      <span className="text-sm">Outside UK (£{1274})</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-accent/50">
                      <input type="radio" name="location" value="inside" checked={location === "inside"} onChange={(e) => setLocation(e.target.value)} />
                      <span className="text-sm">Inside UK (£{1590})</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Contact Point Meetings</label>
                  <select className="w-full border rounded p-2" value={meetings} onChange={(e) => setMeetings(Number(e.target.value))}>
                    {[2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{n} meetings (£{n * 500})</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10">
              <div>
                <p className="text-sm text-muted-foreground mb-2">TOTAL COST</p>
                <p className="text-5xl font-bold">£{totalCost.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-4">This covers application, endorsement assessment, and contact point meetings</p>
              </div>
            </Card>
          </div>

          <Card className="p-6 mb-8">
            <h3 className="font-semibold mb-6">Cost Breakdown</h3>
            <div className="space-y-3 mb-6">
              {breakdown.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 border rounded">
                  <span className="text-sm font-medium">{item.item}</span>
                  <span className="font-bold">£{item.cost.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 flex justify-between items-center font-bold text-lg">
              <span>Total</span>
              <span>£{totalCost.toLocaleString()}</span>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Key Information</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span>Application fee: £{applicationFee} ({location === "outside" ? "outside UK" : "inside UK"})</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span>Endorsement assessment: £1,000</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span>Contact point meetings: £500 each (minimum 2 required)</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
