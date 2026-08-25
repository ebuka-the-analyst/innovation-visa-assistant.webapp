import { AlertCircle } from "lucide-react";

export default function Disclaimer() {
  return (
    <div className="border-t border-border/50 bg-muted/30 py-8">
      <div className="responsive-container">
        <div className="flex gap-4 max-w-4xl mx-auto">
          <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-semibold text-foreground mb-2">Important Information</p>
            <p className="mb-3">
              Innovator Founder Visa Assistant is a software platform providing business-planning tools, automated assessments and general information for the UK Innovator Founder route. It does not provide regulated immigration advice, make endorsement or visa decisions, or guarantee any outcome. AI-generated content may contain errors and should be reviewed before use. Always verify current immigration requirements on GOV.UK. If you need advice about your individual immigration circumstances, consult an appropriately regulated immigration adviser or legal professional. Use of the platform is subject to our Terms of Service, and nothing in this notice excludes any liability that cannot lawfully be excluded.
            </p>
            <p className="text-xs">
              For questions or support, contact us at{" "}
              <a href="mailto:support@innovatorfoundervisaassistant.co.uk" className="text-primary hover:underline">
                support@innovatorfoundervisaassistant.co.uk
              </a>{" "}
              or{" "}
              <a href="mailto:hello@innovatorfoundervisaassistant.co.uk" className="text-primary hover:underline">
                hello@innovatorfoundervisaassistant.co.uk
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
