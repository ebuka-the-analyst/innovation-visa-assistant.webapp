import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, AlertCircle, Copy } from "lucide-react";
import { AuthHeader } from "@/components/AuthHeader";

export default function Settings() {
  const [copied, setCopied] = useState<string | null>(null);

  const { data: config } = useQuery({
    queryKey: ["/api/settings/config"],
    queryFn: async () => {
      const res = await fetch("/api/settings/config");
      if (!res.ok) throw new Error("Failed to fetch config");
      return res.json();
    },
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const ConfigField = ({ label, value, id }: { label: string; value: string; id: string }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex gap-2">
        <Input
          value={value || "Not configured"}
          readOnly
          className="text-xs"
          data-testid={`input-config-${id}`}
        />
        {value && (
          <Button
            size="icon"
            variant="outline"
            onClick={() => copyToClipboard(value, id)}
            data-testid={`button-copy-${id}`}
          >
            {copied === id ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );

  const StatusBadge = ({ status }: { status: "active" | "missing" }) => (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
      status === "active" 
        ? "bg-green-100 text-green-700" 
        : "bg-yellow-100 text-yellow-700"
    }`} data-testid={`badge-status-${status}`}>
      {status === "active" ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
      {status === "active" ? "Configured" : "Missing"}
    </div>
  );

  return (
    <>
      <AuthHeader />
      <div className="container mx-auto py-8 px-4 md:px-6 max-w-2xl">
        <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="heading-settings">Settings & Configuration</h1>
        <p className="text-muted-foreground">Manage your VisaPrep AI integrations and API configuration</p>
      </div>

      <Tabs defaultValue="google" className="space-y-6" data-testid="tabs-settings">
        <TabsList className="grid w-full grid-cols-2" data-testid="tabs-list-settings">
          <TabsTrigger value="google">Google OAuth</TabsTrigger>
          <TabsTrigger value="info">System Info</TabsTrigger>
        </TabsList>

        <TabsContent value="google" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Google OAuth Configuration</h2>
                  <p className="text-sm text-muted-foreground mt-1">Your Google OAuth settings for authentication</p>
                </div>
                <StatusBadge status={config?.google?.clientId ? "active" : "missing"} />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <h3 className="font-medium text-sm text-blue-900">Setup Instructions</h3>
                <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                  <li>Go to Google Cloud Console → Your Project → Credentials</li>
                  <li>Edit your OAuth 2.0 Client ID credential</li>
                  <li>Add this callback URI to "Authorized redirect URIs":
                    <code className="block mt-1 bg-white p-2 rounded text-xs font-mono border">
                      {config?.google?.callbackUrl || "https://workspace.ebukaumeh40.repl.co/api/auth/callback/google"}
                    </code>
                  </li>
                  <li>Save and wait 5 minutes for changes to take effect</li>
                </ol>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <ConfigField
                  label="Google Client ID"
                  value={config?.google?.clientId || ""}
                  id="google-client-id"
                />
                <ConfigField
                  label="Callback URL"
                  value={config?.google?.callbackUrl || ""}
                  id="google-callback-url"
                />
                <ConfigField
                  label="Authorized JavaScript Origin"
                  value={config?.google?.jsOrigin || ""}
                  id="google-js-origin"
                />
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ✓ Google Sign-In is {config?.google?.clientId ? "configured and ready to use" : "not yet configured"}
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="info" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">System Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">App Domain</label>
                  <Input
                    value={config?.system?.domain || "Loading..."}
                    readOnly
                    className="text-xs mt-1"
                    data-testid="input-app-domain"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Environment</label>
                  <Input
                    value={config?.system?.environment || "production"}
                    readOnly
                    className="text-xs mt-1"
                    data-testid="input-environment"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">API Status</label>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm text-green-700 font-medium">Online</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <h3 className="font-medium text-sm text-blue-900">Need Help?</h3>
                <p className="text-sm text-blue-800">
                  If you need to update your Google OAuth credentials or other API keys, contact your administrator or visit the Replit Secrets panel.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </>
  );
}
