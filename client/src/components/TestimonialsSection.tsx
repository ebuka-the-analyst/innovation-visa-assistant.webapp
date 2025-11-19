import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Fintech Founder",
    company: "PayFlow",
    content: "Approved in 4 weeks! The business plan was comprehensive and exactly what Tech Nation wanted. Saved me months of work.",
    rating: 5,
  },
  {
    name: "James Martinez",
    role: "Healthcare Tech",
    company: "MedAI Solutions",
    content: "The AI-generated financial projections were incredibly detailed and realistic. My endorsing body was impressed.",
    rating: 5,
  },
  {
    name: "Priya Patel",
    role: "Green Energy",
    company: "SolarGrid UK",
    content: "Best investment for my visa application. The scalability section clearly demonstrated job creation potential.",
    rating: 5,
  },
  {
    name: "David Kim",
    role: "SaaS Founder",
    company: "CloudOps Pro",
    content: "From questionnaire to approved visa in 6 weeks. The plan covered all three criteria perfectly.",
    rating: 5,
  },
  {
    name: "Emma Thompson",
    role: "E-commerce",
    company: "Sustainable Goods",
    content: "The innovation section helped me articulate what makes my business unique. Highly recommend!",
    rating: 5,
  },
  {
    name: "Ahmed Hassan",
    role: "AI/ML Startup",
    company: "VisionTech",
    content: "Premium tier was worth every penny. The expert review caught details I would have missed.",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-background to-accent/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            Trusted by Successful Applicants
          </h2>
          <p className="text-lg text-muted-foreground">
            Join hundreds of entrepreneurs who received their UK Innovation Visa approval
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="p-8 relative hover-elevate transition-all duration-300"
              data-testid={`card-testimonial-${index}`}
            >
              <Quote className="w-10 h-10 text-primary/20 mb-4" />
              
              <div className="mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-chart-2 text-lg">★</span>
                ))}
              </div>

              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-chart-3 flex items-center justify-center text-white font-bold">
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
