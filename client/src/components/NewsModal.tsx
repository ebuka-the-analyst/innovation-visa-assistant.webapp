import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NewsItem {
  id: string;
  title: string;
  date: string;
  content: string;
  source: string;
  category: string;
}

interface NewsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article: NewsItem | null;
}

export default function NewsModal({ open, onOpenChange, article }: NewsModalProps) {
  if (!article) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex gap-2 items-start mb-2">
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-primary/10 text-primary">
              {article.category}
            </span>
          </div>
          <DialogTitle className="text-2xl">{article.title}</DialogTitle>
          <DialogDescription className="flex items-center gap-2 text-xs pt-2">
            <Calendar className="w-3 h-3" />
            {article.date}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg border border-border">
            <p className="text-sm leading-relaxed text-foreground">{article.content}</p>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-3">
              <strong>Source:</strong> {article.source}
            </p>
            <Button variant="outline" className="w-full gap-2" data-testid="button-read-more">
              <ExternalLink className="w-4 h-4" />
              Read Full Article
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
