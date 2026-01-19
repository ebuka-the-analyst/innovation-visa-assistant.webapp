export interface ThemeTemplate {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  defaultPrimaryColor: string;
  defaultSecondaryColor: string;
  defaultFont: string;
  style: 'modern' | 'corporate' | 'creative' | 'minimal';
  accentPattern: 'waves' | 'hexagons' | 'curves' | 'geometric' | 'diagonal' | 'none';
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
    name: 'Corporate Geometric',
    description: 'Professional geometric triangles with accent stripes. Ideal for tech companies and structured enterprises.',
    previewImage: '/assets/themes/white-red-corporate.png',
    defaultPrimaryColor: '#ea580c',
    defaultSecondaryColor: '#1e3a5f',
    defaultFont: 'Poppins',
    style: 'corporate',
    accentPattern: 'geometric',
  },
  {
    id: 'blue-modern',
    name: 'Blue Innovation',
    description: 'Sleek blue design with modern curves and circular elements. Great for innovative startups and tech ventures.',
    previewImage: '/assets/themes/blue-modern.png',
    defaultPrimaryColor: '#1d4ed8',
    defaultSecondaryColor: '#0f172a',
    defaultFont: 'Montserrat',
    style: 'modern',
    accentPattern: 'curves',
  },
  {
    id: 'navy-diagonal',
    name: 'Navy Corporate Profile',
    description: 'Bold navy diagonal stripes with professional overlay. Perfect for established businesses and corporate ventures.',
    previewImage: '/assets/themes/navy-diagonal.png',
    defaultPrimaryColor: '#1e3a5f',
    defaultSecondaryColor: '#1a1a2e',
    defaultFont: 'Roboto',
    style: 'corporate',
    accentPattern: 'geometric',
  },
  {
    id: 'cyan-modern',
    name: 'Cyan Modern Proposal',
    description: 'Vibrant cyan with black geometric accents. Ideal for creative agencies and modern tech startups.',
    previewImage: '/assets/themes/cyan-modern.png',
    defaultPrimaryColor: '#06b6d4',
    defaultSecondaryColor: '#0f172a',
    defaultFont: 'Montserrat',
    style: 'modern',
    accentPattern: 'geometric',
  },
  {
    id: 'yellow-modern',
    name: 'Yellow Bold Proposal',
    description: 'Striking yellow diagonal accents with black contrast. Perfect for bold, attention-grabbing presentations.',
    previewImage: '/assets/themes/yellow-modern.png',
    defaultPrimaryColor: '#eab308',
    defaultSecondaryColor: '#1a1a2e',
    defaultFont: 'Poppins',
    style: 'modern',
    accentPattern: 'geometric',
  },
  {
    id: 'red-curved',
    name: 'Red Curved Elegance',
    description: 'Elegant red curved shapes with soft rounded corners. Ideal for professional corporate proposals.',
    previewImage: '/assets/themes/red-curved.png',
    defaultPrimaryColor: '#dc2626',
    defaultSecondaryColor: '#1a1a2e',
    defaultFont: 'Inter',
    style: 'corporate',
    accentPattern: 'curves',
  },
  {
    id: 'red-circular',
    name: 'Red Circular Frame',
    description: 'Dynamic red circular accents with gold wave footer. Great for creative business proposals.',
    previewImage: '/assets/themes/red-circular.png',
    defaultPrimaryColor: '#dc2626',
    defaultSecondaryColor: '#ca8a04',
    defaultFont: 'Roboto',
    style: 'creative',
    accentPattern: 'curves',
  },
  {
    id: 'blue-hexagon',
    name: 'Blue Hexagon Shapes',
    description: 'Modern blue hexagons with diagonal stripes and dot patterns. Perfect for tech and marketing plans.',
    previewImage: '/assets/themes/blue-hexagon.png',
    defaultPrimaryColor: '#0ea5e9',
    defaultSecondaryColor: '#1e3a5f',
    defaultFont: 'Montserrat',
    style: 'modern',
    accentPattern: 'hexagons',
  },
  {
    id: 'navy-company-profile',
    name: 'Navy Company Profile',
    description: 'Bold navy diagonal stripes with dark overlays. Perfect for established corporate businesses.',
    previewImage: '/assets/themes/navy-company-profile.png',
    defaultPrimaryColor: '#1e3a5f',
    defaultSecondaryColor: '#0f172a',
    defaultFont: 'Roboto',
    style: 'corporate',
    accentPattern: 'diagonal',
  },
  {
    id: 'blue-orange-geometric',
    name: 'Blue Orange Geometric',
    description: 'Striking navy and coral geometric shapes. Ideal for creative project proposals.',
    previewImage: '/assets/themes/blue-orange-geometric.png',
    defaultPrimaryColor: '#1e3a5f',
    defaultSecondaryColor: '#f97316',
    defaultFont: 'Poppins',
    style: 'modern',
    accentPattern: 'geometric',
  },
  {
    id: 'white-red-hexagon',
    name: 'White Red Hexagon',
    description: 'Elegant 3D red hexagons on white background. Great for strategic business plans.',
    previewImage: '/assets/themes/white-red-hexagon.png',
    defaultPrimaryColor: '#dc2626',
    defaultSecondaryColor: '#f5f5f5',
    defaultFont: 'Inter',
    style: 'corporate',
    accentPattern: 'hexagons',
  },
  {
    id: 'white-red-waves',
    name: 'White Red Waves',
    description: 'Flowing red curved waves with subtle gray accents. Modern marketing strategy style.',
    previewImage: '/assets/themes/white-red-waves.png',
    defaultPrimaryColor: '#dc2626',
    defaultSecondaryColor: '#e5e5e5',
    defaultFont: 'Poppins',
    style: 'modern',
    accentPattern: 'waves',
  },
  {
    id: 'blue-curves-circles',
    name: 'Blue Curves & Circles',
    description: 'Elegant blue curves with circular photo frames. Innovative business strategy style.',
    previewImage: '/assets/themes/blue-curves-circles.png',
    defaultPrimaryColor: '#1e40af',
    defaultSecondaryColor: '#3b82f6',
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
