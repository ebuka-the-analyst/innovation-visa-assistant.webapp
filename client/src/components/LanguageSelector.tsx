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
  countryCode: string;
}

const languages: Language[] = [
  { code: "en", name: "English", countryCode: "gb" },
  { code: "es", name: "Español", countryCode: "es" },
  { code: "fr", name: "Français", countryCode: "fr" },
  { code: "de", name: "Deutsch", countryCode: "de" },
  { code: "zh", name: "中文", countryCode: "cn" },
  { code: "ar", name: "العربية", countryCode: "sa" },
  { code: "pt", name: "Português", countryCode: "br" },
  { code: "ja", name: "日本語", countryCode: "jp" },
];

function FlagImage({ countryCode, className = "" }: { countryCode: string; className?: string }) {
  return (
    <img 
      src={`https://flagcdn.com/w40/${countryCode}.png`}
      srcSet={`https://flagcdn.com/w80/${countryCode}.png 2x`}
      alt={countryCode.toUpperCase()}
      className={`w-5 h-auto rounded-sm ${className}`}
    />
  );
}

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
          <FlagImage countryCode={selectedLanguage.countryCode} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-44 bg-[#0a0a1a] border-[#1a1a3a]"
      >
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => setSelectedLanguage(language)}
            className="flex items-center gap-2.5 cursor-pointer hover:bg-[#1a1a3a]"
            data-testid={`menu-item-language-${language.code}`}
          >
            <FlagImage countryCode={language.countryCode} />
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
