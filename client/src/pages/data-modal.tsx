import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Plus, Trash2, Download } from "lucide-react";

interface DataItem {
  id: string;
  title: string;
  description: string;
  data: string;
  createdAt: Date;
}

export default function DataModal() {
  const [items, setItems] = useState<DataItem[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [data, setData] = useState("");

  const addItem = () => {
    if (title && data) {
      const newItem: DataItem = {
        id: Date.now().toString(),
        title,
        description,
        data,
        createdAt: new Date(),
      };
      setItems([newItem, ...items]);
      setTitle("");
      setDescription("");
      setData("");
    }
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const exportData = () => {
    const json = JSON.stringify(items, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `data-modal-${new Date().toISOString()}.json`;
    a.click();
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="heading-data-modal">Data Manager</h1>
        <p className="text-muted-foreground">Store and manage your data entries</p>
      </div>

      {/* Input Section */}
      <Card className="p-6 mb-8">
        <h2 className="text-lg font-semibold mb-6">Add New Data Entry</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              placeholder="Enter title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2"
              data-testid="input-data-title"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Input
              placeholder="Optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2"
              data-testid="input-data-description"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Data / Content</label>
            <Textarea
              placeholder="Paste or enter your data here"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="mt-2 min-h-32"
              data-testid="textarea-data-content"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={addItem} className="gap-2" data-testid="button-add-data">
              <Plus className="w-4 h-4" />
              Add Entry
            </Button>
            {items.length > 0 && (
              <Button variant="outline" onClick={exportData} className="gap-2" data-testid="button-export-data">
                <Download className="w-4 h-4" />
                Export All
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Data Items Display */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Stored Entries ({items.length})</h2>
        
        {items.length === 0 ? (
          <Card className="p-8 text-center">
            <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No data entries yet. Add one to get started!</p>
          </Card>
        ) : (
          items.map((item) => (
            <Card key={item.id} className="p-6" data-testid={`card-data-${item.id}`}>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg" data-testid={`title-${item.id}`}>{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1" data-testid={`desc-${item.id}`}>{item.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {item.createdAt.toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteItem(item.id)}
                    data-testid={`button-delete-${item.id}`}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
                
                <div className="bg-muted p-4 rounded-lg max-h-48 overflow-y-auto">
                  <pre className="text-xs font-mono whitespace-pre-wrap break-words" data-testid={`data-content-${item.id}`}>
                    {item.data}
                  </pre>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
