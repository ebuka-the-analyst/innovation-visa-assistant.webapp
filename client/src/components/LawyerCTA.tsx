import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search } from "lucide-react";

export default function LawyerCTA() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
      <div className="container mx-auto px-4 md:px-6">
        <Card className="max-w-3xl mx-auto overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Search className="w-6 h-6 text-accent-foreground" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-2xl mb-3">Do You Need an Immigration Lawyer?</h3>
                <p className="text-muted-foreground mb-6">
                  Having the right legal guidance is crucial for the outcome of your application. If you don't yet have an immigration lawyer, we will connect you with a vetted and trusted professional from our invite-only network.
                </p>
                <Button className="group gap-2">
                  Learn more
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
