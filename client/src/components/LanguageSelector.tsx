import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageCode } from "@/lib/translations";

interface Language {
  code: LanguageCode;
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
  const { language, setLanguage } = useLanguage();
  const selectedLanguage = languages.find(l => l.code === language) || languages[0];

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang.code);
  };

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
        className="w-44"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang)}
            className="flex items-center gap-2.5 cursor-pointer"
            data-testid={`menu-item-language-${lang.code}`}
          >
            <FlagImage countryCode={lang.countryCode} />
            <span className="flex-1">{lang.name}</span>
            {language === lang.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
