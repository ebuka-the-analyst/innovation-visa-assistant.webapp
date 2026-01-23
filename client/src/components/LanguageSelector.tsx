import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
];

export default function LanguageSelector() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(languages[0]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 gap-1.5"
          data-testid="button-language-selector"
        >
          <span className="text-base">{selectedLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-40 bg-[#0a0a1a] border-[#1a1a3a]"
      >
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => setSelectedLanguage(language)}
            className="flex items-center gap-2 cursor-pointer hover:bg-[#1a1a3a]"
            data-testid={`menu-item-language-${language.code}`}
          >
            <span className="text-base">{language.flag}</span>
            <span className="flex-1 text-white">{language.name}</span>
            {selectedLanguage.code === language.code && (
              <Check className="h-4 w-4 text-[#41B6E6]" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
