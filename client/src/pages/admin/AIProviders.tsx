import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowDown, ArrowUp, Bot, CheckCircle2, Cpu, RefreshCw, Save, ShieldCheck, TriangleAlert } from "lucide-react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

type ProviderId = "openai" | "anthropic";
type Provider = {
  provider: ProviderId;
  enabled: boolean;
  priority: number;
  model: string;
  resolvedModel: string;
  configured: boolean;
  primary: boolean;
  keyEnvironmentVariable: string;
};

type ProviderResponse = {
  policy: {
    defaultProvider: string;
    platformLatestOpenAIModel: string;
    forbiddenProviders: string[];
    apiKeysStoredServerSideOnly: boolean;
  };
  providers: Provider[];
};

function providerLabel(provider: ProviderId): string {
  return provider === "openai" ? "OpenAI / ChatGPT" : "Anthropic / Claude";
}

function providerDescription(provider: ProviderId): string {
  return provider === "openai"
    ? "Default platform provider. Use Platform latest approved to follow the app-wide OpenAI model policy."
    : "Optional secondary or primary provider. Enable only after ANTHROPIC_API_KEY is configured on the server.";
}

export default function AdminAIProviders() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { data, isLoading, error, refetch } = useQuery<ProviderResponse>({
    queryKey: ["/api/admin/ai-providers"],
    staleTime: 0,
  });
  const [providers, setProviders] = useState<Provider[]>([]);

  useEffect(() => {
    if (data?.providers) setProviders([...data.providers].sort((a, b) => a.priority - b.priority));
  }, [data]);

  const primary = useMemo(
    () => [...providers].sort((a, b) => a.priority - b.priority).find((provider) => provider.enabled),
    [providers],
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PUT", "/api/admin/ai-providers", {
        providers: providers.map(({ provider, enabled, priority, model }) => ({ provider, enabled, priority, model })),
      });
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-providers"] });
      await refetch();
      toast({ title: "AI provider order saved", description: "New AI requests will use this priority immediately." });
    },
    onError: (saveError: Error) => toast({ title: "Could not save AI providers", description: saveError.message, variant: "destructive" }),
  });

  const testMutation = useMutation({
    mutationFn: async (provider: ProviderId) => {
      const response = await apiRequest("POST", `/api/admin/ai-providers/${provider}/test`);
      return response.json();
    },
    onSuccess: (result: any) => toast({ title: "Provider test successful", description: `${providerLabel(result.provider)} responded using ${result.model}.` }),
    onError: (testError: Error) => toast({ title: "Provider test failed", description: testError.message, variant: "destructive" }),
  });

  const updateProvider = (id: ProviderId, patch: Partial<Provider>) => {
    setProviders((current) => current.map((provider) => provider.provider === id ? { ...provider, ...patch } : provider));
  };

  const moveProvider = (id: ProviderId, direction: -1 | 1) => {
    setProviders((current) => {
      const sorted = [...current].sort((a, b) => a.priority - b.priority);
      const index = sorted.findIndex((provider) => provider.provider === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= sorted.length) return current;
      [sorted[index], sorted[target]] = [sorted[target], sorted[index]];
      return sorted.map((provider, position) => ({ ...provider, priority: position + 1 }));
    });
  };

  const handleAdminSection = (section: string) => {
    if (section === "settings-ai-providers") return;
    setLocation("/admin");
  };

  return (
    <SidebarProvider defaultOpen>
      <AdminSidebar activeSection="settings-ai-providers" onSectionChange={handleAdminSection} />
      <SidebarInset>
        <div className="min-h-screen bg-background">
          <header className="sticky top-0 z-20 flex min-h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-6">
            <SidebarTrigger />
            <div className="flex-1">
              <div className="text-sm font-semibold">Admin Console</div>
              <div className="text-xs text-muted-foreground">AI provider policy</div>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </header>

          <main className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Cpu className="h-6 w-6 text-primary" />
                  <h1 className="text-2xl font-bold tracking-tight md:text-3xl">AI Provider Control</h1>
                </div>
                <p className="max-w-3xl text-muted-foreground">
                  Choose which approved AI provider handles application-wide AI requests and the order used if a provider is unavailable. API keys stay in server environment variables and are never shown here.
                </p>
              </div>
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !providers.length}>
                <Save className="h-4 w-4" /> {saveMutation.isPending ? "Saving..." : "Save configuration"}
              </Button>
            </div>

            <Alert className="border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/20">
              <ShieldCheck className="h-4 w-4" />
              <AlertTitle>Permanent provider policy</AlertTitle>
              <AlertDescription>
                Qwen is removed from the application and is not selectable. OpenAI is the default provider. The OpenAI “Platform latest approved” option currently resolves to {data?.policy.platformLatestOpenAIModel || "the platform-approved current model"}.
              </AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive">
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Could not load provider settings</AlertTitle>
                <AlertDescription>{(error as Error).message}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Current routing</CardTitle>
                  <CardDescription>Requests use the first enabled and configured provider. If it has a recoverable provider failure, the next enabled provider is tried.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-2">
                  {primary ? (
                    <>
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Primary: {providerLabel(primary.provider)}</Badge>
                      <Badge variant="outline">{primary.provider === "openai" && primary.model === "platform-latest" ? data?.policy.platformLatestOpenAIModel : primary.model}</Badge>
                    </>
                  ) : (
                    <Badge variant="destructive">No provider enabled</Badge>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Keys</CardTitle>
                  <CardDescription>Managed outside the browser</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">Configure OPENAI_API_KEY or ANTHROPIC_API_KEY in Railway/server variables. Secret values are never returned by this page.</CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              {[...providers].sort((a, b) => a.priority - b.priority).map((provider, index) => (
                <Card key={provider.provider} className={provider.enabled ? "border-emerald-200" : "border-border"}>
                  <CardHeader>
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Bot className="h-5 w-5" /></div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <CardTitle>{index + 1}. {providerLabel(provider.provider)}</CardTitle>
                            <Badge variant="outline" className={provider.configured ? "border-emerald-200 bg-emerald-100 text-emerald-800" : "border-red-200 bg-red-100 text-red-800"}>
                              {provider.configured ? "Configured" : "API key missing"}
                            </Badge>
                            {provider.enabled && index === providers.filter((item) => item.enabled).map((item) => item.priority).sort()[0] - 1 && <Badge>Primary</Badge>}
                          </div>
                          <CardDescription className="mt-1">{providerDescription(provider.provider)}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => moveProvider(provider.provider, -1)} disabled={index === 0} aria-label="Move provider up"><ArrowUp className="h-4 w-4" /></Button>
                        <Button variant="outline" size="icon" onClick={() => moveProvider(provider.provider, 1)} disabled={index === providers.length - 1} aria-label="Move provider down"><ArrowDown className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-5 md:grid-cols-[180px_1fr_auto] md:items-end">
                    <div className="space-y-2">
                      <Label>Enabled</Label>
                      <div className="flex h-10 items-center gap-3 rounded-md border px-3">
                        <Switch checked={provider.enabled} onCheckedChange={(enabled) => updateProvider(provider.provider, { enabled })} disabled={!provider.configured && !provider.enabled} />
                        <span className="text-sm font-medium">{provider.enabled ? "On" : "Off"}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`model-${provider.provider}`}>Model</Label>
                      {provider.provider === "openai" ? (
                        <select
                          id={`model-${provider.provider}`}
                          value={provider.model}
                          onChange={(event) => updateProvider(provider.provider, { model: event.target.value })}
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="platform-latest">Platform latest approved ({data?.policy.platformLatestOpenAIModel || "current"})</option>
                          <option value={data?.policy.platformLatestOpenAIModel || "gpt-5.6"}>{data?.policy.platformLatestOpenAIModel || "gpt-5.6"}</option>
                        </select>
                      ) : (
                        <Input id={`model-${provider.provider}`} value={provider.model} onChange={(event) => updateProvider(provider.provider, { model: event.target.value })} placeholder="Claude model ID" />
                      )}
                    </div>
                    <Button variant="outline" onClick={() => testMutation.mutate(provider.provider)} disabled={!provider.configured || testMutation.isPending}>
                      {testMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Test
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Alert>
              <TriangleAlert className="h-4 w-4" />
              <AlertTitle>Priority changes affect new AI requests</AlertTitle>
              <AlertDescription>Changing priority does not rewrite existing generated business plans, reviews or evidence. It only controls which provider new AI operations use.</AlertDescription>
            </Alert>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
