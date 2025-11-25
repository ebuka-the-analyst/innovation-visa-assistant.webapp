import { Card } from "@/components/ui/card"; import { Button } from "@/components/ui/button"; import { Textarea } from "@/components/ui/textarea";   import { useState } from "react";
export default function SETTLEMENTPLANNING() {
  const [data, setData] = useState({s1:"",s2:"",s3:"",s4:""});
  const filled = Object.values(data).filter((v:any)=>v.length>20).length;
}
