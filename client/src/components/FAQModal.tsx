import { X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What if I'm not approved for the visa?",
    answer: "While we can't guarantee visa approval (as that's decided by endorsing bodies and UK government), our business plans are specifically designed to meet all Innovation Visa criteria. We offer a 7-day money-back guarantee if you're not satisfied with the quality of the generated plan.",
  },
  {
    question: "How long does generation take?",
    answer: "Most business plans are generated in 3-5 minutes. Premium and Enterprise tiers may take slightly longer due to additional features like detailed financial projections and expert review.",
  },
  {
    question: "Can I make changes after generation?",
    answer: "Yes! Basic tier includes 1 revision, Premium includes 3 revisions, and Enterprise includes unlimited revisions. You can also download and edit the PDF directly.",
  },
  {
    question: "Which endorsing bodies do you support?",
    answer: "Our plans are formatted for major UK endorsing bodies including Tech Nation, Innovate UK, The Global Entrepreneurs Programme, and others. Premium tier allows you to select your specific endorsing body for tailored formatting.",
  },
  {
    question: "Do you guarantee visa approval?",
    answer: "No service can guarantee visa approval as the decision lies with endorsing bodies and UK Visas & Immigration. However, our plans are designed to comprehensively address all three visa criteria: Innovation, Viability, and Scalability.",
  },
  {
    question: "What's included in the business plan?",
    answer: "All plans include: Executive Summary, Business Description, Market Analysis, Innovation Statement, Viability Assessment, Scalability Plan, and Conclusion. Premium and Enterprise tiers add detailed Financial Projections, Risk Analysis, and more.",
  },
  {
    question: "Can I see a sample before purchasing?",
    answer: "Yes! Click 'See Sample Plan' on the homepage to view an example business plan. Please note that your generated plan will be customized to your specific business.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, and digital wallets through our secure Stripe payment gateway. All transactions are SSL encrypted.",
  },
];

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FAQModal({ isOpen, onClose }: FAQModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-background shadow-2xl overflow-y-auto animate-in slide-in-from-right-full duration-300">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border/40 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Everything you need to know about VisaPrep
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            data-testid="button-close-faq-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border rounded-lg px-6 data-[state=open]:bg-accent/5"
                data-testid={`faq-item-${index}`}
              >
                <AccordionTrigger className="text-left hover:no-underline py-4">
                  <span className="font-semibold text-base">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4 leading-relaxed text-sm">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="text-center mt-8 pt-6 border-t border-border">
            <p className="text-muted-foreground text-sm mb-2">Still have questions?</p>
            <a
              href="mailto:support@visaprep.ai"
              className="text-primary hover:underline font-medium text-sm"
            >
              Contact our support team →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
