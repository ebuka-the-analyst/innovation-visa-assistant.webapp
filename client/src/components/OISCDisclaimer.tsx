import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, Info, ExternalLink } from "lucide-react";

interface OISCDisclaimerProps {
  variant?: 'full' | 'compact' | 'inline';
  className?: string;
}

export function OISCDisclaimer({ variant = 'compact', className = '' }: OISCDisclaimerProps) {
  if (variant === 'inline') {
    return (
      <p className={`text-xs text-muted-foreground ${className}`} data-testid="text-oisc-disclaimer-inline">
        This tool provides general guidance only, not regulated immigration advice. 
        For legal advice, consult an OISC-registered adviser or solicitor.
      </p>
    );
  }

  if (variant === 'compact') {
    return (
      <Alert className={`bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/50 ${className}`} data-testid="alert-oisc-disclaimer-compact">
        <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-xs text-amber-800 dark:text-amber-200">
          This tool provides general guidance only and does not constitute regulated immigration advice. 
          For legal advice, consult an OISC-registered adviser or solicitor.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className={`bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/50 ${className}`} data-testid="alert-oisc-disclaimer-full">
      <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
      <AlertTitle className="text-amber-800 dark:text-amber-200 font-semibold">Important Legal Notice</AlertTitle>
      <AlertDescription className="text-sm text-amber-700 dark:text-amber-300 space-y-2 mt-2">
        <p>
          This AI-powered platform provides <strong>general information and guidance</strong> about the UK Innovator Founder Visa process. 
          It does <strong>not</strong> constitute regulated immigration advice under the Immigration and Asylum Act 1999.
        </p>
        <p>
          The Office of the Immigration Services Commissioner (OISC) regulates immigration advice in the UK. 
          For legal advice specific to your situation, you must consult:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>An OISC-registered immigration adviser (Level 1 or higher)</li>
          <li>A solicitor regulated by the Solicitors Regulation Authority (SRA)</li>
          <li>A barrister regulated by the Bar Standards Board (BSB)</li>
        </ul>
        <div className="flex items-center gap-2 mt-3">
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <span className="text-xs">
            We partner with OISC-regulated advisers who can review your application for compliance.{' '}
            <a 
              href="/tools/lawyer-finder" 
              className="underline hover:text-amber-900 dark:hover:text-amber-100 inline-flex items-center gap-1"
            >
              Find an adviser <ExternalLink className="h-3 w-3" />
            </a>
          </span>
        </div>
      </AlertDescription>
    </Alert>
  );
}

export function ExportOISCFooter() {
  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPORTANT LEGAL NOTICE

This document was generated using general guidance tools and provides 
information only. It does NOT constitute regulated immigration advice 
under the Immigration and Asylum Act 1999.

For legal advice specific to your situation, consult:
• An OISC-registered immigration adviser (Level 1 or higher)
• A solicitor regulated by the Solicitors Regulation Authority (SRA)
• A barrister regulated by the Bar Standards Board (BSB)

Learn more about OISC: https://www.gov.uk/government/organisations/oisc

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
}

export function ExportDocumentHeader(applicantName: string) {
  const today = new Date().toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });

  return `CONFIDENTIAL - FOR ENDORSEMENT APPLICATION ONLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Applicant: ${applicantName}
Prepared: ${today}
Purpose: UK Innovator Founder Visa Endorsement Application

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPORTANT DISCLAIMER

This document has been prepared for endorsement application purposes 
and provides general information only. It does NOT constitute regulated 
immigration advice under the Immigration and Asylum Act 1999.

Before submitting any visa application, the applicant MUST:
1. Verify all information with official Home Office sources (gov.uk)
2. Consult with an OISC-registered immigration adviser (Level 1+), 
   SRA-regulated solicitor, or BSB-regulated barrister
3. Independently validate all financial projections, market data, and claims

Immigration rules are subject to change. This document reflects 
understanding as of ${today}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;
}
