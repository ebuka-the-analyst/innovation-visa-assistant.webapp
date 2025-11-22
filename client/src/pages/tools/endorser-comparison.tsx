import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { useState } from "react";
import { Star } from "lucide-react";

const ITEMS = [
  { id: 1, name: "Option A", rating: 4.5, price: 1500, type: "Premium" },
  { id: 2, name: "Option B", rating: 4.2, price: 1000, type: "Standard" },
  { id: 3, name: "Option C", rating: 4.8, price: 2000, type: "Premium" }
];

export default function ENDORSERCOMPARISON() {
  const [search, setSearch] = useState("");
  const [fav, setFav] = useState<any>({});
  const filtered = ITEMS.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          <ToolNavigation />
          <div className="mb-8">
            <h1 className="text-4xl font-bold">Endorser Comparison</h1>
            <p className="text-muted-foreground">Find and compare options</p>
          </div>
          
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="mb-6" />
          
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map(i => (
              <Card key={i.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold">{i.name}</h3>
                    <span className="text-xs bg-primary/10 px-2 py-1 rounded mt-1 inline-block">{i.type}</span>
                  </div>
                  <button onClick={() => setFav({ ...fav, [i.id]: !fav[i.id] })}>
                    <Star className={`w-5 h-5 ${fav[i.id] ? "fill-primary text-primary" : "text-gray-300"}`} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                    <p className="font-bold">{i.rating}/5</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="font-bold">£{i.price}</p>
                  </div>
                </div>
                <Button size="sm" className="w-full">Learn More</Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
