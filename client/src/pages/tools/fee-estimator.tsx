import { Card } from "@/components/ui/card";

export default function FeeEstimator() {
  const fees = {
    application_outside_uk: 1274,
    application_inside_uk: 1590,
    endorsement_assessment: 1000,
    per_meeting: 500,
    min_meetings: 2,
  };

  const outsideUkTotal = fees.application_outside_uk + fees.endorsement_assessment + (fees.min_meetings * fees.per_meeting);
  const insideUkTotal = fees.application_inside_uk + fees.endorsement_assessment + (fees.min_meetings * fees.per_meeting);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">UK Innovation Visa - Fee Estimator</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive breakdown of all visa and endorsement fees (November 2025)
          </p>
        </div>

        {/* Fee Breakdown */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Application Fee */}
          <Card className="p-6">
            <h3 className="font-bold mb-4">Application Fee</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Outside UK:</span>
                <span className="font-bold">£{fees.application_outside_uk.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Inside UK (extension/switch):</span>
                <span className="font-bold">£{fees.application_inside_uk.toLocaleString()}</span>
              </div>
            </div>
          </Card>

          {/* Endorsement Fee */}
          <Card className="p-6">
            <h3 className="font-bold mb-4">Endorsement Assessment</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Initial assessment:</span>
                <span className="font-bold">£{fees.endorsement_assessment.toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted-foreground">One-time fee from endorsing body</p>
            </div>
          </Card>
        </div>

        {/* Meeting Fees */}
        <Card className="p-6 bg-blue-50 dark:bg-blue-950/30">
          <h3 className="font-bold mb-4">Contact Point Meetings</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Per meeting with contact point:</span>
              <span className="font-bold">£{fees.per_meeting.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Minimum meetings required:</span>
              <span className="font-bold">{fees.min_meetings}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Minimum meeting fees:</span>
              <span>£{(fees.min_meetings * fees.per_meeting).toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground">Additional meetings may be required</p>
          </div>
        </Card>

        {/* Total Estimates */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-green-50 dark:bg-green-950/30">
            <h3 className="font-bold mb-4">Total Cost (Outside UK)</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Application:</span>
                <span>£{fees.application_outside_uk.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Endorsement assessment:</span>
                <span>£{fees.endorsement_assessment.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Meetings (minimum):</span>
                <span>£{(fees.min_meetings * fees.per_meeting).toLocaleString()}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>TOTAL:</span>
                <span className="text-lg">£{outsideUkTotal.toLocaleString()}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-orange-50 dark:bg-orange-950/30">
            <h3 className="font-bold mb-4">Total Cost (Inside UK)</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Application:</span>
                <span>£{fees.application_inside_uk.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Endorsement assessment:</span>
                <span>£{fees.endorsement_assessment.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Meetings (minimum):</span>
                <span>£{(fees.min_meetings * fees.per_meeting).toLocaleString()}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>TOTAL:</span>
                <span className="text-lg">£{insideUkTotal.toLocaleString()}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Additional Information */}
        <Card className="p-6">
          <h3 className="font-bold mb-4">Additional Information</h3>
          <ul className="space-y-2 text-sm list-disc list-inside">
            <li>Visa duration: 3 years initially, then eligible for settlement</li>
            <li>Personal savings (£1,270) required but NOT part of visa fees</li>
            <li>Biometric appointment fees may apply (usually included in application)</li>
            <li>Additional meetings beyond minimum may incur extra costs</li>
            <li>Translation and certified document costs are separate</li>
            <li>Lawyer/advisor fees are not included in these estimates</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
