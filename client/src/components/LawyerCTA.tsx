import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search } from "lucide-react";
import { Link } from "wouter";

export default function LawyerCTA() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
      <div className="responsive-container">
        <Card className="max-w-3xl mx-auto overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Search className="w-6 h-6 text-accent-foreground" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-2xl mb-3">Need Personalised Immigration Advice?</h3>
                <p className="text-muted-foreground mb-6">
                  Innovator Founder Visa Assistant does not provide regulated immigration advice. If you need advice about your individual circumstances, you can use our expert finder to look for participating immigration lawyers and advisers and check their professional status before instructing them.
                </p>
                <Link href="/tools/lawyer-finder">
                  <Button className="group gap-2" data-testid="button-connect-lawyer">
                    Find an Expert
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
