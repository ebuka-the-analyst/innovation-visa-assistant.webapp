import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, CircleOff, RefreshCw } from "lucide-react";

type ProviderStatus = {
  id: "openai" | "anthropic";
  name: string;
  family: string;
  enabled: boolean;
  primary: boolean;
  model: string | null;
};

type ProviderStatusResponse = {
  managedRouting: true;
  providers: ProviderStatus[];
  fallbackEnabled: boolean;
  checkedAt: string;
};

export default function AIProviderStatusCard() {
  const query = useQuery<ProviderStatusResponse>({
    queryKey: ["/api/ai-transparency/providers"],
    queryFn: async () => {
      const response = await fetch("/api/ai-transparency/providers", { cache: "no-store", credentials: "include" });
      if (!response.ok) throw new Error(`Provider status unavailable (${response.status})`);
      return response.json();
    },
    staleTime: 30_000,
    retry: 1,
  });

  return (
    <Card data-testid="card-live-ai-provider-status">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><RefreshCw className="h-5 w-5 text-primary" />Live AI provider configuration</CardTitle>
        <CardDescription>This panel is populated from the production provider gateway rather than hardcoded marketing copy.</CardDescription>
      </CardHeader>
      <CardContent>
        {query.isLoading && <p className="text-sm text-muted-foreground">Loading current provider configuration…</p>}
        {query.isError && (
          <p className="text-sm text-amber-700 dark:text-amber-300">Live provider configuration is temporarily unavailable. No provider or model is assumed while this check is unavailable.</p>
        )}
        {query.data && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              {query.data.providers.map((provider) => (
                <div key={provider.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="font-semibold">{provider.name} {provider.family}</p>
                    <Badge variant={provider.enabled ? "default" : "secondary"}>{provider.enabled ? (provider.primary ? "Active primary" : "Active fallback") : "Not active"}</Badge>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    {provider.enabled ? <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" /> : <CircleOff className="h-4 w-4 mt-0.5" />}
                    <span>{provider.enabled && provider.model ? `Current configured model: ${provider.model}` : "This provider is not currently enabled and configured for production routing."}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Fallback routing currently {query.data.fallbackEnabled ? "has more than one active configured provider" : "has one active configured provider"}. Provider availability can change as the production configuration is updated.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
