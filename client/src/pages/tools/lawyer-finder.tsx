import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { ToolAccessGuard } from "@/components/ToolAccessGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Star, MapPin, Phone, Mail, Globe, Search, Heart, Filter, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWordExport } from "@/hooks/useWordExport";

type Lawyer = {
  id: string;
  name: string;
  firm: string;
  location: string;
  specializations: string[];
  rating: number;
  reviewCount: number;
  experience: number;
  languages: string[];
  consultationFee: number;
  phone: string;
  email: string;
  website: string;
  description: string;
};

const LAWYERS: Lawyer[] = [
  {
    id: "1",
    name: "Sarah Mitchell",
    firm: "Mitchell & Partners Immigration",
    location: "London",
    specializations: ["Innovator Founder Visa", "Start-up Visa", "Business Immigration"],
    rating: 4.9,
    reviewCount: 127,
    experience: 15,
    languages: ["English", "French"],
    consultationFee: 150,
    phone: "+44 20 1234 5678",
    email: "sarah@mitchellimmigration.co.uk",
    website: "mitchellimmigration.co.uk",
    description: "Specialist in UK business immigration with extensive experience in Innovator Founder visas."
  },
  {
    id: "2",
    name: "James Chen",
    firm: "Chen Legal",
    location: "Manchester",
    specializations: ["Innovator Founder Visa", "Skilled Worker", "Global Talent"],
    rating: 4.8,
    reviewCount: 89,
    experience: 12,
    languages: ["English", "Mandarin", "Cantonese"],
    consultationFee: 120,
    phone: "+44 161 234 5678",
    email: "james@chenlegal.co.uk",
    website: "chenlegal.co.uk",
    description: "Experienced immigration lawyer helping entrepreneurs navigate the UK visa system."
  },
  {
    id: "3",
    name: "Priya Sharma",
    firm: "Sharma Immigration Law",
    location: "Birmingham",
    specializations: ["Innovator Founder Visa", "Investor Visa", "Family Immigration"],
    rating: 4.7,
    reviewCount: 156,
    experience: 18,
    languages: ["English", "Hindi", "Punjabi"],
    consultationFee: 100,
    phone: "+44 121 234 5678",
    email: "priya@sharmaimm.co.uk",
    website: "sharmaimm.co.uk",
    description: "Award-winning immigration lawyer with a track record of successful visa applications."
  },
  {
    id: "4",
    name: "Michael O'Brien",
    firm: "O'Brien & Associates",
    location: "London",
    specializations: ["Innovator Founder Visa", "Sole Representative", "Business Immigration"],
    rating: 4.6,
    reviewCount: 203,
    experience: 20,
    languages: ["English", "Irish"],
    consultationFee: 175,
    phone: "+44 20 8765 4321",
    email: "michael@obrienlaw.co.uk",
    website: "obrienlaw.co.uk",
    description: "Senior immigration partner with 20+ years of business visa expertise."
  },
  {
    id: "5",
    name: "Emma Williams",
    firm: "Williams Legal Services",
    location: "Edinburgh",
    specializations: ["Innovator Founder Visa", "Start-up Visa", "Scale-up Visa"],
    rating: 4.9,
    reviewCount: 78,
    experience: 10,
    languages: ["English"],
    consultationFee: 130,
    phone: "+44 131 234 5678",
    email: "emma@williamslegal.co.uk",
    website: "williamslegal.co.uk",
    description: "Tech-focused immigration lawyer helping startups establish in the UK."
  },
];

export default function LawyerFinder() {
  const { toast } = useToast();
  const { generateWord } = useWordExport();
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const [showAutoSave, setShowAutoSave] = useState(false);
  const hideIndicatorRef = useRef<NodeJS.Timeout | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("lawyer-finder-state");
    if (saved) {
      try {
        return JSON.parse(saved).favorites || [];
      } catch { }
    }
    return [];
  });

  const [activeTab, setActiveTab] = useState("browse");

  useEffect(() => {
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
    };
  }, []);

  const triggerAutoSave = useCallback((newFavorites: string[]) => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      localStorage.setItem("lawyer-finder-state", JSON.stringify({ favorites: newFavorites }));
      setShowAutoSave(true);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
      hideIndicatorRef.current = setTimeout(() => setShowAutoSave(false), 2000);
    }, 500);
  }, []);

  const toggleFavorite = (lawyerId: string) => {
    const newFavorites = favorites.includes(lawyerId)
      ? favorites.filter(id => id !== lawyerId)
      : [...favorites, lawyerId];
    setFavorites(newFavorites);
    triggerAutoSave(newFavorites);
    toast({
      title: favorites.includes(lawyerId) ? "Removed from favorites" : "Added to favorites",
      description: favorites.includes(lawyerId) ? "Lawyer removed from your list" : "Lawyer saved to your list"
    });
  };

  const filteredLawyers = LAWYERS
    .filter(lawyer => {
      const matchesSearch = lawyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lawyer.firm.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lawyer.specializations.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesLocation = locationFilter === "all" || lawyer.location === locationFilter;
      return matchesSearch && matchesLocation;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "experience") return b.experience - a.experience;
      if (sortBy === "price-low") return a.consultationFee - b.consultationFee;
      if (sortBy === "price-high") return b.consultationFee - a.consultationFee;
      return 0;
    });

  const favoriteLawyers = LAWYERS.filter(l => favorites.includes(l.id));
  const locations = [...new Set(LAWYERS.map(l => l.location))];

  const handleExportWord = () => {
    const lawyersToExport = activeTab === "favorites" ? favoriteLawyers : filteredLawyers;
    generateWord({
      title: "Immigration Lawyer Directory",
      subtitle: activeTab === "favorites" ? "Your Saved Lawyers" : "Search Results",
      filename: "lawyer-finder",
      sections: [
        { type: "heading", content: "Lawyer List", level: 1 },
        ...lawyersToExport.map(lawyer => [
          { type: "heading" as const, content: lawyer.name, level: 2 },
          { type: "paragraph" as const, content: `Firm: ${lawyer.firm}` },
          { type: "paragraph" as const, content: `Location: ${lawyer.location}` },
          { type: "paragraph" as const, content: `Rating: ${lawyer.rating}/5 (${lawyer.reviewCount} reviews)` },
          { type: "paragraph" as const, content: `Experience: ${lawyer.experience} years` },
          { type: "paragraph" as const, content: `Consultation Fee: £${lawyer.consultationFee}` },
          { type: "paragraph" as const, content: `Contact: ${lawyer.email} | ${lawyer.phone}` },
          { type: "paragraph" as const, content: `Specializations: ${lawyer.specializations.join(", ")}` },
          { type: "divider" as const },
        ]).flat(),
      ],
    });
    toast({ title: "Export Complete", description: "Lawyer list exported to Word document" });
  };

  const handleSave = () => {
    localStorage.setItem("lawyer-finder-state", JSON.stringify({ favorites }));
    toast({ title: "Saved", description: "Your favorites have been saved" });
  };

  const LawyerCard = ({ lawyer }: { lawyer: Lawyer }) => (
    <Card className="hover-elevate" data-testid={`lawyer-card-${lawyer.id}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{lawyer.name}</CardTitle>
            <CardDescription>{lawyer.firm}</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleFavorite(lawyer.id)}
            className={favorites.includes(lawyer.id) ? "text-red-500" : ""}
            data-testid={`button-favorite-${lawyer.id}`}
          >
            <Heart className={`w-5 h-5 ${favorites.includes(lawyer.id) ? "fill-current" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-medium">{lawyer.rating}</span>
            <span className="text-sm text-muted-foreground">({lawyer.reviewCount} reviews)</span>
          </div>
          <Badge variant="secondary">{lawyer.experience} years exp.</Badge>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{lawyer.location}</span>
        </div>

        <p className="text-sm text-muted-foreground">{lawyer.description}</p>

        <div className="flex flex-wrap gap-1">
          {lawyer.specializations.map((spec, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">{spec}</Badge>
          ))}
        </div>

        <div className="flex flex-wrap gap-1">
          {lawyer.languages.map((lang, idx) => (
            <Badge key={idx} className="bg-primary/10 text-primary text-xs">{lang}</Badge>
          ))}
        </div>

        <div className="pt-2 border-t space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span>{lawyer.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span>{lawyer.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <span>{lawyer.website}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          <span className="text-sm text-muted-foreground">Consultation from</span>
          <div className="text-lg font-bold">£{lawyer.consultationFee}</div>
        </div>
        <Button data-testid={`button-contact-${lawyer.id}`}>
          Contact Lawyer
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <ToolAccessGuard requiredTier="free" toolName="Lawyer Finder & Booking">
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Lawyer Finder & Booking</h1>
            <p className="text-muted-foreground">Find and connect with experienced immigration lawyers</p>
          </div>

          <ToolUtilityBar
            toolId="lawyer-finder"
            toolName="Lawyer Finder & Booking"
            onSave={handleSave}
            onExportWord={handleExportWord}
          />

          {showAutoSave && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <Save className="w-4 h-4" />
              <span>Auto-saved</span>
            </div>
          )}

          <div className="mt-6">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <Label className="sr-only">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, firm, or specialization..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        data-testid="input-search"
                      />
                    </div>
                  </div>
                  <div className="w-40">
                    <Label className="sr-only">Location</Label>
                    <Select value={locationFilter} onValueChange={setLocationFilter}>
                      <SelectTrigger data-testid="select-location">
                        <MapPin className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        {locations.map(loc => (
                          <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-40">
                    <Label className="sr-only">Sort By</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger data-testid="select-sort">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="experience">Most Experienced</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="browse" data-testid="tab-browse">
                  Browse All ({filteredLawyers.length})
                </TabsTrigger>
                <TabsTrigger value="favorites" data-testid="tab-favorites">
                  My Favorites ({favorites.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="browse">
                {filteredLawyers.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    {filteredLawyers.map(lawyer => (
                      <LawyerCard key={lawyer.id} lawyer={lawyer} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-2">No lawyers found</h3>
                      <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="favorites">
                {favoriteLawyers.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    {favoriteLawyers.map(lawyer => (
                      <LawyerCard key={lawyer.id} lawyer={lawyer} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-2">No favorites yet</h3>
                      <p className="text-sm text-muted-foreground">Click the heart icon on a lawyer card to save them</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ToolAccessGuard>
  );
}
