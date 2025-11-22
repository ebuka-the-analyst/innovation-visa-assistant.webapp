import { AlertCircle } from "lucide-react";

export default function Disclaimer() {
  return (
    <div className="border-t border-border/50 bg-muted/30 py-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex gap-4 max-w-4xl mx-auto">
          <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-semibold text-foreground mb-2">Legal Disclaimer</p>
            <p>
              VisaPrep AI provides automated business plan generation for the UK Innovator Founder Visa route. This service is NOT a substitute for professional legal advice. 
              The information provided by VisaPrep AI is for informational and educational purposes only and does not constitute legal advice. 
              Immigration law is complex and requirements vary by individual circumstances. We strongly recommend consulting with a qualified immigration lawyer 
              before submitting your Innovator Founder Visa application to the UK Home Office. VisaPrep AI and its team cannot be held responsible for visa rejections or 
              immigration-related consequences resulting from the use of this platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
