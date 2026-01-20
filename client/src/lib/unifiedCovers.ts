import { THEME_TEMPLATES, ThemeTemplate } from "./themeTemplates";
import { PREMIUM_COVER_TEMPLATES, PremiumCoverTemplate, CoverColor, CoverStyle, COVER_COLORS, COVER_STYLES } from "./premiumCoverTemplates";

export type CoverType = "free" | "paid";

export interface UnifiedCover {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  type: CoverType;
  price: number;
  colors: CoverColor[];
  style: CoverStyle;
  originalTheme?: ThemeTemplate;
  originalPremium?: PremiumCoverTemplate;
}

function mapThemeStyleToUnified(style: ThemeTemplate['style']): CoverStyle {
  switch (style) {
    case 'modern': return 'modern';
    case 'corporate': return 'corporate';
    case 'creative': return 'illustrative';
    case 'minimal': return 'geometric';
    default: return 'modern';
  }
}

function extractColorsFromTheme(theme: ThemeTemplate): CoverColor[] {
  const colors: CoverColor[] = [];
  const primary = theme.defaultPrimaryColor.toLowerCase();
  const secondary = theme.defaultSecondaryColor.toLowerCase();
  
  if (primary.includes('dc2626') || primary.includes('e11d48') || primary.includes('c0504d')) colors.push('red');
  if (primary.includes('1d4ed8') || primary.includes('1e40af') || primary.includes('4472c4') || primary.includes('1e3a5f') || primary.includes('4f81bd') || primary.includes('0ea5e9') || primary.includes('06b6d4')) colors.push('blue');
  if (primary.includes('059669') || primary.includes('22c55e') || primary.includes('70ad47')) colors.push('green');
  if (primary.includes('f97316') || primary.includes('ea580c') || primary.includes('ed7d31')) colors.push('orange');
  if (primary.includes('eab308') || primary.includes('ffc000') || primary.includes('ca8a04')) colors.push('yellow');
  if (primary.includes('1a1a2e') || primary.includes('0f172a') || secondary.includes('1a1a2e') || secondary.includes('0f172a')) colors.push('black');
  if (primary.includes('f5f5f5') || primary.includes('ffffff') || secondary.includes('e5e5e5')) colors.push('white');
  
  if (colors.length === 0) colors.push('blue');
  return colors;
}

export function createUnifiedCovers(): UnifiedCover[] {
  const unified: UnifiedCover[] = [];
  
  for (const theme of THEME_TEMPLATES) {
    unified.push({
      id: `free-${theme.id}`,
      name: theme.name,
      description: theme.description,
      previewImage: theme.previewImage,
      type: 'free',
      price: 0,
      colors: extractColorsFromTheme(theme),
      style: mapThemeStyleToUnified(theme.style),
      originalTheme: theme,
    });
  }
  
  for (const premium of PREMIUM_COVER_TEMPLATES) {
    unified.push({
      id: `paid-${premium.id}`,
      name: premium.name,
      description: premium.description,
      previewImage: premium.imagePath,
      type: 'paid',
      price: premium.price,
      colors: premium.colors,
      style: premium.style,
      originalPremium: premium,
    });
  }
  
  return unified.sort((a, b) => a.name.localeCompare(b.name));
}

export const UNIFIED_COVERS = createUnifiedCovers();

export function filterUnifiedCovers(
  covers: UnifiedCover[],
  typeFilter: CoverType | null,
  colorFilter: CoverColor | null,
  styleFilter: CoverStyle | null
): UnifiedCover[] {
  return covers.filter((cover) => {
    const matchesType = !typeFilter || cover.type === typeFilter;
    const matchesColor = !colorFilter || cover.colors.includes(colorFilter);
    const matchesStyle = !styleFilter || cover.style === styleFilter;
    return matchesType && matchesColor && matchesStyle;
  });
}

export { COVER_COLORS, COVER_STYLES };
export type { CoverColor, CoverStyle };
