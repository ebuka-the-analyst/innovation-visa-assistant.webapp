import { Card } from "@/components/ui/card";   import { CheckCircle2, Circle } from "lucide-react";
const MS = [{id:"1",title:"Research",target:"W1-2",status:"completed"},{id:"2",title:"Setup",target:"W3-4",status:"completed"},{id:"3",title:"Evidence",target:"W5-8",status:"in-progress"},{id:"4",title:"Endorsement",target:"W9-10",status:"pending"},{id:"5",title:"Submit",target:"W11-12",status:"pending"}];
export default function KPIDASHBOARD() {
  const comp = MS.filter(m=>m.status==="completed").length;
}
