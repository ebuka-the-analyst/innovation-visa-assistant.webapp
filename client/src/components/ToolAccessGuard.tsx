import { useEffect } from "react";
import { useLocation } from "wouter";
import { useTierAccess, type ToolTier } from "@/hooks/useTierAccess";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Loader2, RefreshCw } from "lucide-react";
import { useToolAccess } from "@/hooks/useCommercialCatalog";
import { memberUpgradeDescription } from "@shared/memberToolPlan";

interface ToolAccessGuardProps {
  children: React.ReactNode;
  requiredTier: ToolTier;
  toolName: string;
  toolId?: string;
}
const TOOL_PATH_ALIASES: Record<string,string>={
  "document-organizer":"doc-organizer",
  "rfe-defence-lab":"rfe-defense",
};
const MEMBER_NAME: Record<string,string>={
  founder:"Founder",
  founder_pro:"Founder Pro",
  founder_pass_90d:"90-Day Pass",
};

export function ToolAccessGuard({children,requiredTier,toolName,toolId}:ToolAccessGuardProps){
  const [,setLocation]=useLocation();
  const {user,canAccessTool,isLoading,isAuthenticated}=useTierAccess();
  const {data:verifiedAccess,getToolAccess,isLoading:isToolAccessLoading,
    isError:isToolAccessError,isFetching:isToolAccessFetching,
    refetch:refetchToolAccess}=useToolAccess(isAuthenticated);
  const pathToolId=typeof window==="undefined"?undefined:
    window.location.pathname.replace(/^\\/tools\\//,"").replace(/^\\//,"").split("/")[0];
  const resolvedToolId=toolId??TOOL_PATH_ALIASES[pathToolId||""]??pathToolId;
  const managedEntitlement=resolvedToolId?getToolAccess(resolvedToolId):undefined;
  const effectiveRequiredTier=managedEntitlement?.minimumPlanId??requiredTier;
  const hasAccess=resolvedToolId
    ? !isToolAccessError && managedEntitlement?.allowed===true
    : canAccessTool(effectiveRequiredTier);

  // The server has already authenticated and checked the expiry, payment
  // status and exact tool permission. Do not use the browser's tier label
  // to grant access.
  const verificationFailed=isToolAccessError || (Boolean(resolvedToolId)&&!managedEntitlement);
  const hasVerifiedPaidPlan=verifiedAccess?.userPlanId!==undefined &&
    verifiedAccess.userPlanId!=="free" && !verificationFailed;
  const verifiedMemberName=hasVerifiedPaidPlan
    ? MEMBER_NAME[user?.subscriptionTier||""] : undefined;
  const currentPlanName=verifiedMemberName||"your current plan";

  useEffect(()=>{
    if(!isLoading&&!isAuthenticated){
      setLocation("/login");
    }
  },[isLoading,isAuthenticated,setLocation]);

  if(isLoading||(isAuthenticated&&isToolAccessLoading)){
    return <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>;
  }
  if(!isAuthenticated)return null;

  if(!hasAccess){
    return <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8 sm:py-12">
      <div className="container mx-auto px-3 sm:px-4">
        <Card className="mx-auto w-full max-w-2xl border-2 border-primary/20">
          <CardContent className="px-4 py-8 text-center sm:px-8 sm:py-12">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-10 w-10 text-primary" />
            </div>
            <h2 className="mb-3 text-xl font-bold">{toolName}</h2>
            {verificationFailed ? <>
              <p className="mb-2 text-lg text-muted-foreground" role="alert">
                We could not verify access to this tool right now.
              </p>
              <p className="mb-6 text-sm text-muted-foreground">
                Please retry your access check. You do not need to make another payment to retry.
              </p>
            </> : hasVerifiedPaidPlan ? <>
              <p className="mb-2 text-lg text-muted-foreground">
                {currentPlanName==="your current plan" ? "Your current plan" : `Your ${currentPlanName} membership`} does not include this tool.
              </p>
              <p className="mb-6 text-sm text-muted-foreground">
                {toolName} requires {memberUpgradeDescription(effectiveRequiredTier)}.
                To change an active membership, contact support first. Do not start a second checkout.
              </p>
            </> : <>
              <p className="mb-2 text-lg text-muted-foreground">
                An active paid membership is required to use this tool.
              </p>
              <p className="mb-6 text-sm text-muted-foreground">
                No current paid entitlement for this tool could be verified.
                {toolName} requires {memberUpgradeDescription(effectiveRequiredTier)}.
                Review your account's membership status before making another purchase.
              </p>
            </>}
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
              {verificationFailed ?
                <Button size="lg" className="h-auto min-h-11 w-full min-w-0 whitespace-normal px-4 py-3 text-center leading-snug sm:w-auto"
                  onClick={()=>void refetchToolAccess()}
                  disabled={isToolAccessFetching}
                  data-testid="button-retry-tool-access">
                  <RefreshCw className="mr-2 h-4 w-4 shrink-0" aria-hidden="true"/>
                  {isToolAccessFetching ? "Checking access..." : "Retry access check"}
                </Button>
              :
                <Button size="lg" className="h-auto min-h-11 w-full min-w-0 whitespace-normal px-4 py-3 text-center leading-snug sm:w-auto"
                  onClick={()=>setLocation("/pricing")}
                  data-testid="button-unlock-tool">
                  <Lock className="mr-2 h-4 w-4 shrink-0" aria-hidden="true"/>
                  <span className="min-w-0 whitespace-normal break-words">
                    Review membership options
                  </span>
                </Button>
              }
              <Button size="sm" variant="outline"
                className="h-auto min-h-11 w-full whitespace-normal px-4 py-2 sm:w-auto"
                onClick={()=>setLocation("/tools-hub")}
                data-testid="button-back-hub">Back to Tools Hub</Button>
            </div>
            {hasVerifiedPaidPlan && !verificationFailed &&
              <p className="mt-4 text-sm text-muted-foreground">
                Already subscribed? <a href="/support" className="font-medium underline underline-offset-2">
                  Contact support about changing your membership
                </a>.
              </p>}
          </CardContent>
        </Card>
      </div>
    </div>;
  }
  return <>{children}</>;
}
