import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { useState } from "react";

export default function EVIDENCECOLLECTION() {
  const [search, setSearch] = useState("");
  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          <ToolNavigation />
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Evidence Collection</h1>
            <p className="text-lg text-muted-foreground">Finder & Comparison</p>
          </div>
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="mb-6" />
          <Card className="p-6"><p className="text-muted-foreground">Results for "{search}"</p></Card>
        </div>
      </div>
    </>
  );
}
