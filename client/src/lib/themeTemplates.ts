export interface ThemeTemplate {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  defaultPrimaryColor: string;
  defaultSecondaryColor: string;
  defaultFont: string;
  style: 'modern' | 'corporate' | 'creative' | 'minimal';
  accentPattern: 'waves' | 'hexagons' | 'curves' | 'geometric' | 'none';
}

export const THEME_TEMPLATES: ThemeTemplate[] = [
  {
    id: 'white-red-modern',
    name: 'Modern Red Waves',
    description: 'Clean white background with bold red wave accents. Perfect for dynamic, forward-thinking businesses.',
    previewImage: '/assets/themes/white-red-modern.png',
    defaultPrimaryColor: '#dc2626',
    defaultSecondaryColor: '#1e293b',
    defaultFont: 'Inter',
    style: 'modern',
    accentPattern: 'waves',
  },
  {
    id: 'white-red-corporate',
    name: 'Corporate Hexagon',
    description: 'Professional hexagon pattern with red accents. Ideal for tech companies and structured enterprises.',
    previewImage: '/assets/themes/white-red-corporate.png',
    defaultPrimaryColor: '#dc2626',
    defaultSecondaryColor: '#374151',
    defaultFont: 'Poppins',
    style: 'corporate',
    accentPattern: 'hexagons',
  },
  {
    id: 'blue-modern',
    name: 'Blue Innovation',
    description: 'Sleek blue design with modern curves and cityscape imagery. Great for innovative startups and tech ventures.',
    previewImage: '/assets/themes/blue-modern.png',
    defaultPrimaryColor: '#1d4ed8',
    defaultSecondaryColor: '#0f172a',
    defaultFont: 'Montserrat',
    style: 'modern',
    accentPattern: 'curves',
  },
];

export const AVAILABLE_FONTS = [
  { id: 'Inter', name: 'Inter', style: 'Modern & Clean' },
  { id: 'Poppins', name: 'Poppins', style: 'Friendly & Professional' },
  { id: 'Montserrat', name: 'Montserrat', style: 'Bold & Confident' },
  { id: 'Roboto', name: 'Roboto', style: 'Tech & Neutral' },
  { id: 'Playfair Display', name: 'Playfair Display', style: 'Elegant & Classic' },
  { id: 'Open Sans', name: 'Open Sans', style: 'Clean & Readable' },
  { id: 'Lato', name: 'Lato', style: 'Warm & Approachable' },
  { id: 'Source Sans Pro', name: 'Source Sans Pro', style: 'Professional & Clear' },
];

export const PRESET_COLORS = [
  { id: 'red', hex: '#dc2626', name: 'Crimson Red' },
  { id: 'blue', hex: '#1d4ed8', name: 'Royal Blue' },
  { id: 'green', hex: '#059669', name: 'Emerald Green' },
  { id: 'purple', hex: '#7c3aed', name: 'Violet Purple' },
  { id: 'orange', hex: '#ea580c', name: 'Sunset Orange' },
  { id: 'teal', hex: '#0d9488', name: 'Ocean Teal' },
  { id: 'navy', hex: '#1e3a5f', name: 'Navy Blue' },
  { id: 'gold', hex: '#ca8a04', name: 'Royal Gold' },
  { id: 'slate', hex: '#475569', name: 'Professional Slate' },
  { id: 'rose', hex: '#e11d48', name: 'Rose Pink' },
];

export function getThemeById(id: string): ThemeTemplate | undefined {
  return THEME_TEMPLATES.find(t => t.id === id);
}

export function generateThemeCSS(
  themeId: string,
  primaryColor: string,
  secondaryColor: string,
  font: string
): string {
  return `
    :root {
      --theme-primary: ${primaryColor};
      --theme-secondary: ${secondaryColor};
      --theme-font: '${font}', sans-serif;
    }
    
    .theme-heading {
      font-family: var(--theme-font);
      color: var(--theme-primary);
    }
    
    .theme-accent {
      background-color: var(--theme-primary);
      color: white;
    }
    
    .theme-border {
      border-color: var(--theme-primary);
    }
    
    .theme-text-secondary {
      color: var(--theme-secondary);
    }
  `;
}
