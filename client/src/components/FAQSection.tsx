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

export default function FAQSection() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-accent/5 to-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about VisaPrep
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border rounded-lg px-6 data-[state=open]:bg-accent/5"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="font-semibold text-lg">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Still have questions?</p>
          <a
            href="mailto:support@visaprep.ai"
            className="text-primary hover:underline font-medium"
          >
            Contact our support team →
          </a>
        </div>
      </div>
    </section>
  );
}
