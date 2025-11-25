import { Card } from "@/components/ui/card"; import { Slider } from "@/components/ui/slider";   import { useState } from "react"; import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
const DIMS = [{n:"Innovation"},{n:"Market"},{n:"Tech"},{n:"Scalability"},{n:"IP"}];
export default function RFEDEFENSE() {
  const [scores, setScores] = useState({d0:12,d1:14,d2:13,d3:11,d4:10});
  const total = Object.values(scores).reduce((a:number,b:number)=>a+b,0);
  const data = DIMS.map((d,i)=>({name:d.n,score:scores[`d${i}`as keyof typeof scores]}));
}
