import { Card } from "@/components/ui/card"; import { Input } from "@/components/ui/input"; import { Button } from "@/components/ui/button";   import { useState } from "react"; import { Star } from "lucide-react";
const ITEMS = [{id:1,name:"Option A",rating:4.5,price:1500},{id:2,name:"Option B",rating:4.2,price:1000},{id:3,name:"Option C",rating:4.8,price:2000}];
export default function LAWYERFINDER() {
  const [search, setSearch] = useState(""), [fav, setFav] = useState<any>({});
  const filtered = ITEMS.filter(i=>i.name.toLowerCase().includes(search));
}
