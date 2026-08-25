import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What if I'm not approved for the visa?",
    answer: "Innovator Founder Visa Assistant cannot guarantee endorsement or visa approval. Decisions are made by the relevant endorsing body and UK Visas and Immigration. The platform is designed to help you organise and review preparation materials, and purchases remain subject to the refund and cancellation terms shown in our Terms of Service.",
  },
  {
    question: "How long does generation take?",
    answer: "Generation time varies with the amount of information supplied, plan depth, provider availability and system load. The platform is designed to speed up first-draft preparation, but we do not promise a fixed delivery time for every plan.",
  },
  {
    question: "Can I make changes after generation?",
    answer: "Yes. Generated material is intended to be reviewed and refined. Current revision allowances, credits and editing options depend on your purchased plan and are shown on the pricing and account pages.",
  },
  {
    question: "Which endorsing bodies do you support?",
    answer: "The platform uses publicly available information about the authorised Innovator Founder endorsing bodies and GOV.UK guidance. The authorised list can change, so always check the current GOV.UK endorsing-body list and the relevant body's own published requirements before relying on any comparison.",
  },
  {
    question: "Do you guarantee visa approval?",
    answer: "No. The platform does not guarantee endorsement, visa approval or settlement. It helps you prepare material around published Innovator Founder criteria, including Innovation, Viability and Scalability, but it is not a decision-maker and does not provide regulated immigration advice.",
  },
  {
    question: "What's included in the business plan?",
    answer: "Plans can include structured sections covering the business proposition, market, innovation, viability, scalability, operations, risks and financial assumptions. The exact depth and available features depend on the plan purchased and the information you provide.",
  },
  {
    question: "Can I see a sample before purchasing?",
    answer: "Yes. You can open a sample plan from the homepage. Samples are illustrative examples only and are not evidence of endorsement, visa approval or a guaranteed format for every business.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "Payments are processed through Stripe. The payment methods available to you are the options shown at checkout and may vary by device, location and Stripe configuration.",
  },
];

export default function FAQSection() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-accent/5 to-background">
      <div className="responsive-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif text-xl font-bold mb-6">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground">Important information about how Innovator Founder Visa Assistant works and what it does not promise.</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-lg px-6 data-[state=open]:bg-accent/5">
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="font-semibold text-lg">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Still have questions?</p>
          <a href="mailto:support@innovatorfoundervisaassistant.co.uk" className="text-primary hover:underline font-medium">
            Contact our support team →
          </a>
        </div>
      </div>
    </section>
  );
}
