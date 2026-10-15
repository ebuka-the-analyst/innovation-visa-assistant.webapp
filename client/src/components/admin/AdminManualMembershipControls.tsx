import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type MembershipSku = "founder" | "founder_pro" | "founder_pass_90d";
type Choice = MembershipSku | "revoke";
interface Props {
  userId: string;
  userEmail: string;
  onSuccess: () => void;
}
const NAMES: Record<MembershipSku,string> = {
  founder: "Founder",
  founder_pro: "Founder Pro",
  founder_pass_90d: "90-Day Pass",
};

export function AdminManualMembershipControls({userId,userEmail,onSuccess}:Props) {
  const [choice,setChoice]=useState<Choice>("founder");
  const [reason,setReason]=useState("");
  const [confirmed,setConfirmed]=useState(false);
  const queryClient=useQueryClient();
  const {toast}=useToast();
  useEffect(()=>{setChoice("founder");setReason("");setConfirmed(false);},[userId]);
  const mutation=useMutation({
    mutationFn:async()=>{
      const response=await fetch(`/api/admin/users/${encodeURIComponent(userId)}/manual-membership`,{
        method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          action:choice==="revoke"?"revoke":"grant",
          ...(choice!=="revoke"?{sku:choice}:{}),
          reason:reason.trim(),
          confirmation:"MANUAL_ACCESS_NO_CHARGE",
        }),
      });
      const result=await response.json();
      if(!response.ok)throw new Error(result.error || "Could not change membership.");
      return result as {action:"grant"|"revoke";packageId:string;expiresAt:string|null};
    },
    onSuccess:async(result)=>{
      await Promise.all([
        queryClient.invalidateQueries({queryKey:["/api/admin/users"]}),
        queryClient.invalidateQueries({queryKey:["/api/admin/users/member-entitlement",userId]}),
        queryClient.invalidateQueries({queryKey:["/api/admin"]}),
      ]);
      toast({title:result.action==="grant"?"Manual membership assigned":"Manual membership revoked",
        description:result.action==="grant"
          ? `${result.packageId.replaceAll("_"," ")} active until ${new Date(result.expiresAt!).toLocaleDateString("en-GB")}. No payment or renewal created.`
          :"Manual access revoked. No Stripe subscription was changed."});
      onSuccess();
    },
    onError:(error:Error)=>toast({title:"Membership change blocked",description:error.message,variant:"destructive"}),
  });
  const actionText=choice==="revoke"?"Revoke administrator-granted access":
    `Grant ${NAMES[choice]} manually`;
  return <div className="space-y-4 rounded-md border p-4" data-testid="admin-manual-membership-controls">
    <div>
      <h3 className="font-semibold">Change membership manually</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        This is a time-limited administrator access grant, not a Stripe payment.
        It will not start a subscription, charge the customer, or renew automatically.
      </p>
    </div>
    <div className="space-y-1">
      <Label htmlFor="admin-manual-member-sku">New membership</Label>
      <Select value={choice} onValueChange={v=>{setChoice(v as Choice);setConfirmed(false);}}>
        <SelectTrigger id="admin-manual-member-sku" data-testid="admin-select-membership"><SelectValue/></SelectTrigger>
        <SelectContent>
          <SelectItem value="founder">Founder · 30-day manual access</SelectItem>
          <SelectItem value="founder_pro">Founder Pro · 30-day manual access</SelectItem>
          <SelectItem value="founder_pass_90d">90-Day Pass · 90-day manual access</SelectItem>
          <SelectItem value="revoke">No membership · revoke manual access</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        {choice==="revoke"?"Only active admin grants can be revoked here.":
          "A new allowance starts today. Monthly grants expire in 30 days; the pass expires in 90 days. No automatic renewal."}
      </p>
    </div>
    <div className="space-y-1">
      <Label htmlFor="admin-manual-member-reason">Reason (required)</Label>
      <Textarea id="admin-manual-member-reason" value={reason}
        onChange={e=>setReason(e.target.value)}
        placeholder="e.g. Courtesy access approved for customer support"
        rows={2} data-testid="admin-member-reason"/>
    </div>
    <label className="flex items-start gap-2 text-sm">
      <Checkbox checked={confirmed} onCheckedChange={v=>setConfirmed(v===true)}
        data-testid="admin-member-confirm"/>
      <span>I confirm this change for <strong>{userEmail}</strong> is authorised,
        is not a customer payment, and will be recorded in the admin audit log.
        Existing active Stripe memberships cannot be overridden here.</span>
    </label>
    <Button className="h-auto min-h-10 w-full whitespace-normal" onClick={()=>mutation.mutate()}
      disabled={mutation.isPending||reason.trim().length<10||!confirmed}
      data-testid="button-save-manual-membership">
      {mutation.isPending?"Applying membership…":actionText}
    </Button>
  </div>;
}
