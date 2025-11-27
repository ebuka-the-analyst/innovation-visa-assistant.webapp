import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Shield, FileCheck, Download, Scale } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OISCChecklistItem {
  id: string;
  label: string;
  description: string;
  required: boolean;
}

const OISC_CHECKLIST: OISCChecklistItem[] = [
  {
    id: 'understand-guidance',
    label: 'I understand this is guidance only',
    description: 'This report provides general information and does NOT constitute regulated immigration advice under the Immigration and Asylum Act 1999.',
    required: true,
  },
  {
    id: 'not-legal-advice',
    label: 'I acknowledge this is not legal advice',
    description: 'The UK Innovator Founder Visa Assistant is an AI-powered tool and is NOT an OISC-registered immigration adviser, solicitor, or barrister.',
    required: true,
  },
  {
    id: 'seek-professional',
    label: 'I will seek professional advice before submitting',
    description: 'Before making any visa application, I will consult with an OISC-registered adviser (Level 1+), SRA-regulated solicitor, or BSB-regulated barrister.',
    required: true,
  },
  {
    id: 'verify-information',
    label: 'I will verify all information independently',
    description: 'I understand that immigration rules change frequently and I must verify all information with official Home Office sources before relying on it.',
    required: true,
  },
  {
    id: 'no-liability',
    label: 'I accept the limitation of liability',
    description: 'I accept that the UK Innovator Founder Visa Assistant and its operators bear no liability for decisions made based on this report.',
    required: true,
  },
];

interface OISCComplianceGateProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  documentType: 'pdf' | 'word' | 'report';
  documentTitle: string;
  userTier?: 'free' | 'basic' | 'premium' | 'enterprise' | 'ultimate';
}

export function OISCComplianceGate({
  isOpen,
  onClose,
  onConfirm,
  documentType,
  documentTitle,
  userTier = 'free',
}: OISCComplianceGateProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const allRequiredChecked = OISC_CHECKLIST.filter(item => item.required).every(
    item => checkedItems[item.id]
  );

  const handleCheckChange = (itemId: string, checked: boolean) => {
    setCheckedItems(prev => ({ ...prev, [itemId]: checked }));
  };

  const handleConfirm = () => {
    if (!allRequiredChecked) {
      toast({
        title: 'Compliance Required',
        description: 'Please acknowledge all required items before exporting.',
        variant: 'destructive',
      });
      return;
    }

    const complianceRecord = {
      timestamp: new Date().toISOString(),
      documentType,
      documentTitle,
      userTier,
      acknowledgedItems: Object.keys(checkedItems).filter(k => checkedItems[k]),
    };
    
    const history = JSON.parse(localStorage.getItem('oisc-compliance-history') || '[]');
    history.push(complianceRecord);
    localStorage.setItem('oisc-compliance-history', JSON.stringify(history.slice(-100)));
    
    setCheckedItems({});
    onConfirm();
  };

  const handleClose = () => {
    setCheckedItems({});
    onClose();
  };

  const getDocIcon = () => {
    switch (documentType) {
      case 'pdf': return <FileCheck className="w-5 h-5 text-red-500" />;
      case 'word': return <FileCheck className="w-5 h-5 text-blue-500" />;
      default: return <Download className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-oisc-compliance">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Shield className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">OISC Compliance Acknowledgment</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                {getDocIcon()}
                <span>Required before exporting: {documentTitle}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 my-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-semibold mb-1">Important Legal Requirement</p>
              <p>
                Under UK law, only OISC-registered advisers, SRA-regulated solicitors, and BSB-regulated barristers 
                can provide immigration advice. This platform provides guidance tools only. Please read and acknowledge 
                each item below before proceeding.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {OISC_CHECKLIST.map((item) => (
            <div 
              key={item.id}
              className={`p-4 rounded-lg border transition-colors ${
                checkedItems[item.id] 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                  : 'bg-card border-border'
              }`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  id={item.id}
                  checked={checkedItems[item.id] || false}
                  onCheckedChange={(checked) => handleCheckChange(item.id, checked as boolean)}
                  data-testid={`checkbox-oisc-${item.id}`}
                />
                <div className="flex-1">
                  <Label 
                    htmlFor={item.id} 
                    className="font-medium cursor-pointer flex items-center gap-2"
                  >
                    {item.label}
                    {item.required && (
                      <span className="text-xs text-red-500 font-normal">*Required</span>
                    )}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-4 p-3 bg-muted/50 rounded-lg">
          <Scale className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Your acknowledgment is recorded for compliance purposes. Tier: {userTier.toUpperCase()}
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button variant="outline" onClick={handleClose} data-testid="button-oisc-cancel">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!allRequiredChecked}
            className="gap-2"
            data-testid="button-oisc-confirm"
          >
            <Shield className="w-4 h-4" />
            I Acknowledge & Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function useOISCComplianceGate() {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingExport, setPendingExport] = useState<{
    callback: () => void;
    documentType: 'pdf' | 'word' | 'report';
    documentTitle: string;
    userTier: 'free' | 'basic' | 'premium' | 'enterprise' | 'ultimate';
  } | null>(null);

  const requestExport = useCallback((
    callback: () => void,
    documentType: 'pdf' | 'word' | 'report',
    documentTitle: string,
    userTier: 'free' | 'basic' | 'premium' | 'enterprise' | 'ultimate' = 'free'
  ) => {
    setPendingExport({ callback, documentType, documentTitle, userTier });
    setIsOpen(true);
  }, []);

  const handleConfirm = useCallback(() => {
    if (pendingExport) {
      pendingExport.callback();
      setPendingExport(null);
      setIsOpen(false);
    }
  }, [pendingExport]);

  const handleClose = useCallback(() => {
    setPendingExport(null);
    setIsOpen(false);
  }, []);

  const GateComponent = pendingExport ? (
    <OISCComplianceGate
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      documentType={pendingExport.documentType}
      documentTitle={pendingExport.documentTitle}
      userTier={pendingExport.userTier}
    />
  ) : null;

  return {
    requestExport,
    GateComponent,
    isOpen,
  };
}
