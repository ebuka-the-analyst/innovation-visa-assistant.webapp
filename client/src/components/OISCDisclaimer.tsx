import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, Info, ExternalLink } from "lucide-react";

interface OISCDisclaimerProps {
  variant?: 'full' | 'compact' | 'inline';
  className?: string;
}

/**
 * Kept under the historical OISCDisclaimer export name to avoid breaking
 * existing imports. The UK immigration advice regulator has been known as
 * the Immigration Advice Authority (IAA) since January 2025.
 */
export function OISCDisclaimer({ variant = 'compact', className = '' }: OISCDisclaimerProps) {
  if (variant === 'inline') {
    return (
      <p className={`text-xs text-muted-foreground ${className}`} data-testid="text-oisc-disclaimer-inline">
        This tool provides general information and guidance only, not regulated immigration advice.{' '}
        For advice specific to your circumstances, use an appropriately regulated immigration adviser or legal professional.
      </p>
    );
  }

  if (variant === 'compact') {
    return (
      <Alert className={`bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/50 ${className}`} data-testid="alert-oisc-disclaimer-compact">
        <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-xs text-amber-800 dark:text-amber-200">
          This tool provides general information and guidance only and does not constitute regulated immigration advice.{' '}
          For advice specific to your circumstances, consult an IAA-regulated adviser or an appropriately regulated legal professional.
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
          This AI-powered platform provides <strong>general information, planning support and document-preparation assistance</strong> for the UK Innovator Founder route.{' '}
          It does <strong>not</strong> provide regulated immigration advice or make a decision on your eligibility or application.
        </p>
        <p>
          The <strong>Immigration Advice Authority (IAA)</strong>, formerly the Office of the Immigration Services Commissioner (OISC), regulates immigration advisers in the UK.{' '}
          For advice specific to your circumstances, consult an appropriately regulated professional, such as:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>An adviser or organisation registered with the Immigration Advice Authority (IAA)</li>
          <li>A solicitor regulated by the Solicitors Regulation Authority (SRA)</li>
          <li>A barrister regulated by the Bar Standards Board (BSB), where appropriate</li>
        </ul>
        <div className="flex items-center gap-2 mt-3">
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <span className="text-xs">
            Where participating professionals are available, you can use our adviser finder to view their profiles and booking options.{' '}
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

This document was generated using general guidance and preparation tools.
It does NOT constitute regulated immigration advice.

For advice specific to your circumstances, consult an appropriately regulated professional, such as:
• An adviser or organisation registered with the Immigration Advice Authority (IAA)
• A solicitor regulated by the Solicitors Regulation Authority (SRA)
• A barrister regulated by the Bar Standards Board (BSB), where appropriate

Immigration Advice Authority: https://www.gov.uk/government/organisations/immigration-advice-authority

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

This document has been prepared for endorsement application purposes and
provides general information and preparation support only. It does NOT
constitute regulated immigration advice.

Before relying on this document, the applicant should:
1. Verify current requirements using official GOV.UK and Home Office sources
2. Seek advice from an appropriately regulated professional where advice specific to their circumstances is required
3. Independently validate financial projections, market data and factual claims

Immigration rules and endorsement requirements can change. This document
reflects the information available when it was prepared on ${today}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;
}
