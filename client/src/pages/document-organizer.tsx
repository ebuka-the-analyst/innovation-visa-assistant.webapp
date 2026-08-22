import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircle, Download, FileText, Loader2, Package, RefreshCw, Trash2, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import FeatureNavigation from "@/components/FeatureNavigation";

interface UserDocument {
  id: string;
  userId: string;
  name: string;
  category: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  status: string;
  notes: string | null;
  expiryDate: string | null;
  createdAt: string;
  updatedAt: string;
}

const evidenceCategories = [
  { value: "personal_legal", label: "Personal / identity" },
  { value: "business", label: "Business" },
  { value: "financial", label: "Financial" },
  { value: "innovation", label: "Innovation / IP" },
  { value: "team", label: "Team / credentials" },
  { value: "market", label: "Market / traction" },
  { value: "other", label: "Other" },
];

function formatSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "Size unavailable";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentOrganizer() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("other");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: documents = [], isLoading, isError, refetch } = useQuery<UserDocument[]>({ queryKey: ["/api/documents"] });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile || !name.trim()) throw new Error("Choose a file and give it a clear evidence name.");
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("name", name.trim());
      formData.append("category", category);
      formData.append("description", `Evidence document: ${name.trim()}`);
      const response = await fetch("/api/documents/upload", { method: "POST", body: formData, credentials: "include" });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error || `Upload failed (${response.status}).`);
      }
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setName("");
      setCategory("other");
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = "";
      toast({ title: "Evidence uploaded", description: "The document is now stored in your evidence library." });
    },
    onError: (error: Error) => toast({ title: "Upload failed", description: error.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/documents/${encodeURIComponent(id)}`, { method: "DELETE", credentials: "include" });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error || `Delete failed (${response.status}).`);
      }
      return id;
    },
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["/api/documents"] }); toast({ title: "Document removed" }); },
    onError: (error: Error) => toast({ title: "Delete failed", description: error.message, variant: "destructive" }),
  });

  const grouped = useMemo(() => {
    const map = new Map<string, UserDocument[]>();
    for (const doc of documents) {
      const key = doc.category || "other";
      map.set(key, [...(map.get(key) || []), doc]);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [documents]);

  const exportManifest = () => {
    if (!documents.length) {
      toast({ title: "No documents to export", description: "Upload evidence first.", variant: "destructive" });
      return;
    }
    const lines = documents.map((doc, index) => [
      `${index + 1}. ${doc.name}`,
      `Category: ${doc.category || "other"}`,
      `Uploaded: ${new Date(doc.createdAt).toLocaleDateString("en-GB")}`,
      `File: ${new URL(doc.fileUrl, window.location.origin).toString()}`,
    ].join("\n"));
    const content = `APPLICATION EVIDENCE MANIFEST\nGenerated: ${new Date().toLocaleString("en-GB")}\n\n${lines.join("\n\n")}\n\nImportant: This manifest lists what you have uploaded. It does not state that any document is legally required, sufficient or accepted by an endorsing body or the Home Office.`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "application_evidence_manifest.txt";
    anchor.click();
    URL.revokeObjectURL(url);
    toast({ title: "Manifest exported", description: `${documents.length} document reference${documents.length === 1 ? "" : "s"} included.` });
  };

  if (isLoading) return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen">
      <div className="responsive-container py-12">
        <div className="mx-auto max-w-5xl">
          <FeatureNavigation currentPage="document-organizer" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-300">DOCUMENT ORGANIZER</span><h1 className="mt-3 text-xl font-bold">Application Evidence Library</h1><p className="mt-2 max-w-3xl text-muted-foreground">Upload, categorise and retrieve the documents that actually belong to your case. The platform does not label a generic checklist as universally required.</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => refetch()} disabled={isLoading}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button><Button variant="outline" onClick={exportManifest} disabled={!documents.length}><Package className="mr-2 h-4 w-4" />Export Manifest</Button></div></div>

          <Alert className="mt-6 border-amber-500/30 bg-amber-500/5"><AlertCircle className="h-4 w-4 text-amber-600" /><AlertDescription><strong>Evidence, not a legal checklist:</strong> the documents you need depend on your route, application, endorsing body and circumstances. Verify the actual document requirements from your current official guidance, application form, endorsement process and any requests you receive.</AlertDescription></Alert>

          <Card className="mt-6"><CardContent className="p-6"><h2 className="font-semibold">Upload evidence</h2><div className="mt-4 grid gap-4 md:grid-cols-[1fr_220px]"><div className="space-y-2"><Label htmlFor="evidence-name">Evidence name</Label><Input id="evidence-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Customer LOI - Acme Ltd" /></div><div className="space-y-2"><Label>Category</Label><Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{evidenceCategories.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select></div></div><div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center"><Input ref={fileRef} type="file" onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} /><Button onClick={() => uploadMutation.mutate()} disabled={uploadMutation.isPending || !selectedFile || !name.trim()} data-testid="button-upload-evidence"><Upload className="mr-2 h-4 w-4" />{uploadMutation.isPending ? "Uploading..." : "Upload"}</Button></div>{selectedFile && <p className="mt-2 text-xs text-muted-foreground">Selected: {selectedFile.name} · {formatSize(selectedFile.size)}</p>}</CardContent></Card>

          <div className="mt-6 grid gap-3 sm:grid-cols-3"><Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold">{documents.length}</div><p className="text-xs text-muted-foreground">Documents stored</p></CardContent></Card><Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold">{grouped.length}</div><p className="text-xs text-muted-foreground">Categories represented</p></CardContent></Card><Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold">{documents.filter((doc) => doc.status === "verified" || doc.status === "complete").length}</div><p className="text-xs text-muted-foreground">Marked verified/complete</p></CardContent></Card></div>

          {isError ? <Card className="mt-6 border-red-500/30 p-8 text-center"><p className="font-semibold">Documents could not be loaded</p><Button className="mt-4" variant="outline" onClick={() => refetch()}>Retry</Button></Card> : !documents.length ? <Card className="mt-6 p-10 text-center"><FileText className="mx-auto h-10 w-10 text-muted-foreground" /><h2 className="mt-3 font-semibold">No evidence uploaded yet</h2><p className="mt-1 text-sm text-muted-foreground">Add documents when you have real evidence to organise. No missing-document percentage is invented.</p></Card> : <div className="mt-6 space-y-6">{grouped.map(([group, docs]) => <section key={group}><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold capitalize">{group.replaceAll("_", " ")}</h2><Badge variant="outline">{docs.length}</Badge></div><div className="grid gap-3">{docs.map((doc) => <Card key={doc.id}><CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate font-semibold">{doc.name}</p><p className="mt-1 text-xs text-muted-foreground">{doc.fileType || "File"} · {formatSize(doc.fileSize)} · uploaded {new Date(doc.createdAt).toLocaleDateString("en-GB")}</p>{doc.notes && <p className="mt-2 text-sm text-muted-foreground">{doc.notes}</p>}</div><div className="flex gap-2"><Button asChild size="sm" variant="outline"><a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"><Download className="mr-2 h-4 w-4" />Open</a></Button><Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(doc.id)} disabled={deleteMutation.isPending}><Trash2 className="mr-2 h-4 w-4" />Delete</Button></div></CardContent></Card>)}</div></section>)}</div>}
        </div>
      </div>
    </div>
  );
}
