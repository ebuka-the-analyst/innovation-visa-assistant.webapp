import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, Star } from "lucide-react";
import { useState } from "react";
import { AuthHeader } from "@/components/AuthHeader";

const experts = [
  {
    id: 1,
    name: "Sarah Chen",
    title: "Immigration Lawyer & Tech Nation Advisor",
    bio: "15+ years immigration law, 200+ visa approvals",
    specialties: ["Tech Nation", "Innovation Criteria", "IP Strategy"],
    rating: 4.9,
    reviews: 127,
    hourlyRate: 150,
    availability: ["Mon", "Wed", "Fri"],
    image: "SC"
  },
  {
    id: 2,
    name: "James Kumar",
    title: "Financial Advisor & Visa Consultant",
    bio: "Expert in financial modeling for visa applications",
    specialties: ["Financial Projections", "Viability", "Unit Economics"],
    rating: 4.8,
    reviews: 89,
    hourlyRate: 120,
    availability: ["Tue", "Thu", "Fri"],
    image: "JK"
  },
  {
    id: 3,
    name: "Maria Rodriguez",
    title: "Business Strategy Consultant",
    bio: "Helps founders scale and meet job creation targets",
    specialties: ["Scalability", "Market Expansion", "Team Building"],
    rating: 4.9,
    reviews: 156,
    hourlyRate: 135,
    availability: ["Mon", "Tue", "Wed", "Thu"],
    image: "MR"
  },
  {
    id: 4,
    name: "David Wong",
    title: "Tech Founder & Visa Expert",
    bio: "Successfully exited 2 startups on Innovator Founder Visa",
    specialties: ["Tech Innovation", "Founder Strategy", "Market Validation"],
    rating: 5.0,
    reviews: 203,
    hourlyRate: 180,
    availability: ["Wed", "Thu", "Sat"],
    image: "DW"
  }
];

const consultationTypes = [
  { name: "30-min Quick Call", price: "£50", description: "Quick questions and guidance" },
  { name: "1-hour Strategy Session", price: "£120-180", description: "Deep dive on specific area" },
  { name: "3-hour Workshop", price: "£300-450", description: "Comprehensive review and planning" },
  { name: "Ongoing Support (Monthly)", price: "£400-600", description: "Monthly check-ins and guidance" }
];

export default function ExpertBooking() {
  const [selectedExpert, setSelectedExpert] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  const availableTimes = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

  return (
    <div className="min-h-screen">
      <AuthHeader />
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">LAUNCHPAD EXPERT NETWORK</span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 mt-3">Book Expert Consultants</h1>
            <p className="text-lg text-muted-foreground">
              Connect with immigration lawyers, business strategists, and successful visa holders. Get personalized feedback on your structured business brief and navigate the endorsement interview with confidence.
            </p>
          </div>

          <div className="mb-12">
            <h2 className="font-semibold text-2xl mb-6">Consultation Types</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {consultationTypes.map(type => (
                <Card key={type.name} className="p-6 hover-elevate">
                  <h3 className="font-semibold mb-2">{type.name}</h3>
                  <p className="text-primary font-bold text-lg mb-2">{type.price}</p>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </Card>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="font-semibold text-2xl mb-6">Our Experts</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {experts.map(expert => (
                <Card
                  key={expert.id}
                  className={`p-6 cursor-pointer transition-all ${
                    selectedExpert === expert.id ? "border-primary bg-primary/5" : "hover-elevate"
                  }`}
                  onClick={() => setSelectedExpert(expert.id)}
                  data-testid={`card-expert-${expert.id}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="font-semibold text-primary text-lg">{expert.image}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{expert.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{expert.title}</p>
                      <p className="text-sm mb-3">{expert.bio}</p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {expert.specialties.map(spec => (
                          <span key={spec} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {spec}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {expert.rating}
                        </span>
                        <span className="text-muted-foreground">({expert.reviews} reviews)</span>
                        <span className="font-semibold">£{expert.hourlyRate}/hr</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {selectedExpert && (
            <Card className="p-8">
              <h2 className="font-semibold text-2xl mb-6">Schedule Consultation</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border rounded-lg"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    data-testid="input-booking-date"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Select Time</label>
                  <div className="grid grid-cols-3 gap-3">
                    {availableTimes.map(time => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        onClick={() => setSelectedTime(time)}
                        className="gap-2"
                        data-testid={`button-time-${time}`}
                      >
                        <Clock className="w-4 h-4" />
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button className="w-full gap-2 py-6 text-base" disabled={!selectedDate || !selectedTime} data-testid="button-confirm-booking">
                  <Calendar className="w-5 h-5" />
                  Confirm Booking
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
