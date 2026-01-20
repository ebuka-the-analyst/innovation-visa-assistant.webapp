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
    previewImage: '/assets/themes/white-red-modern.webp',
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
    previewImage: '/assets/themes/white-red-corporate.webp',
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
    previewImage: '/assets/themes/blue-modern.webp',
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
    previewImage: '/assets/themes/navy-diagonal.webp',
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
    previewImage: '/assets/themes/cyan-modern.webp',
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
    previewImage: '/assets/themes/yellow-modern.webp',
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
    previewImage: '/assets/themes/red-curved.webp',
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
    previewImage: '/assets/themes/red-circular.webp',
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
    previewImage: '/assets/themes/blue-hexagon.webp',
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
    previewImage: '/assets/themes/navy-company-profile.webp',
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
    previewImage: '/assets/themes/blue-orange-geometric.webp',
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
    previewImage: '/assets/themes/white-red-hexagon.webp',
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
    previewImage: '/assets/themes/white-red-waves.webp',
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
    previewImage: '/assets/themes/blue-curves-circles.webp',
    defaultPrimaryColor: '#1e40af',
    defaultSecondaryColor: '#3b82f6',
    defaultFont: 'Montserrat',
    style: 'modern',
    accentPattern: 'curves',
  },
  {
    id: 'orange-modern-proposal',
    name: 'Orange Modern Proposal',
    description: 'Bold orange geometric shapes with diagonal accents and city skyline image. Perfect for business proposals.',
    previewImage: '/assets/themes/orange-modern-proposal.webp',
    defaultPrimaryColor: '#f97316',
    defaultSecondaryColor: '#1a1a2e',
    defaultFont: 'Poppins',
    style: 'modern',
    accentPattern: 'geometric',
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

export interface ExcelColorTheme {
  id: string;
  name: string;
  colors: string[];
  primaryIndex: number;
  secondaryIndex: number;
}

export const EXCEL_COLOR_THEMES: ExcelColorTheme[] = [
  {
    id: 'office',
    name: 'Office',
    colors: ['#4472C4', '#ED7D31', '#A5A5A5', '#FFC000', '#5B9BD5', '#70AD47', '#264478', '#9E480E'],
    primaryIndex: 0,
    secondaryIndex: 1,
  },
  {
    id: 'office-2007-2010',
    name: 'Office 2007-2010',
    colors: ['#4F81BD', '#C0504D', '#9BBB59', '#8064A2', '#4BACC6', '#F79646', '#1F497D', '#EEECE1'],
    primaryIndex: 0,
    secondaryIndex: 1,
  },
  {
    id: 'facet',
    name: 'Facet',
    colors: ['#90C226', '#54A021', '#E6B91E', '#E76618', '#C42F1A', '#918655', '#855D5D', '#666666'],
    primaryIndex: 0,
    secondaryIndex: 3,
  },
  {
    id: 'gallery',
    name: 'Gallery',
    colors: ['#B71C1C', '#1565C0', '#2E7D32', '#F9A825', '#6A1B9A', '#00838F', '#BF360C', '#455A64'],
    primaryIndex: 0,
    secondaryIndex: 1,
  },
  {
    id: 'integral',
    name: 'Integral',
    colors: ['#1A5276', '#2874A6', '#5DADE2', '#A9CCE3', '#641E16', '#922B21', '#CD6155', '#F1948A'],
    primaryIndex: 0,
    secondaryIndex: 4,
  },
  {
    id: 'ion',
    name: 'Ion',
    colors: ['#B8860B', '#CD853F', '#DEB887', '#F5DEB3', '#8B4513', '#A0522D', '#D2691E', '#F4A460'],
    primaryIndex: 0,
    secondaryIndex: 4,
  },
  {
    id: 'ion-boardroom',
    name: 'Ion Boardroom',
    colors: ['#0D47A1', '#1565C0', '#1976D2', '#42A5F5', '#B71C1C', '#C62828', '#E53935', '#EF5350'],
    primaryIndex: 0,
    secondaryIndex: 4,
  },
  {
    id: 'organic',
    name: 'Organic',
    colors: ['#8D6E63', '#A1887F', '#BCAAA4', '#D7CCC8', '#4E342E', '#5D4037', '#6D4C41', '#795548'],
    primaryIndex: 0,
    secondaryIndex: 4,
  },
  {
    id: 'retrospect',
    name: 'Retrospect',
    colors: ['#E65100', '#F57C00', '#FF9800', '#FFB74D', '#1B5E20', '#2E7D32', '#43A047', '#66BB6A'],
    primaryIndex: 0,
    secondaryIndex: 4,
  },
  {
    id: 'slice',
    name: 'Slice',
    colors: ['#0097A7', '#00ACC1', '#00BCD4', '#4DD0E1', '#E91E63', '#F06292', '#F48FB1', '#F8BBD9'],
    primaryIndex: 0,
    secondaryIndex: 4,
  },
  {
    id: 'wisp',
    name: 'Wisp',
    colors: ['#558B2F', '#7CB342', '#9CCC65', '#C5E1A5', '#5D4037', '#795548', '#8D6E63', '#BCAAA4'],
    primaryIndex: 0,
    secondaryIndex: 4,
  },
  {
    id: 'banded',
    name: 'Banded',
    colors: ['#303F9F', '#3F51B5', '#5C6BC0', '#9FA8DA', '#FF6F00', '#FF8F00', '#FFB300', '#FFCA28'],
    primaryIndex: 0,
    secondaryIndex: 4,
  },
  {
    id: 'basis',
    name: 'Basis',
    colors: ['#00695C', '#00897B', '#26A69A', '#80CBC4', '#AD1457', '#C2185B', '#D81B60', '#EC407A'],
    primaryIndex: 0,
    secondaryIndex: 4,
  },
  {
    id: 'berlin',
    name: 'Berlin',
    colors: ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4'],
    primaryIndex: 0,
    secondaryIndex: 4,
  },
  {
    id: 'circuit',
    name: 'Circuit',
    colors: ['#FF5722', '#FF7043', '#FF8A65', '#FFAB91', '#4CAF50', '#66BB6A', '#81C784', '#A5D6A7'],
    primaryIndex: 0,
    secondaryIndex: 4,
  },
  {
    id: 'damask',
    name: 'Damask',
    colors: ['#7B1FA2', '#8E24AA', '#9C27B0', '#BA68C8', '#0288D1', '#039BE5', '#03A9F4', '#4FC3F7'],
    primaryIndex: 0,
    secondaryIndex: 4,
  },
  {
    id: 'celestial',
    name: 'Celestial',
    colors: ['#1A237E', '#283593', '#3949AB', '#5C6BC0', '#880E4F', '#AD1457', '#C2185B', '#D81B60'],
    primaryIndex: 0,
    secondaryIndex: 4,
  },
  {
    id: 'blue-warm',
    name: 'Blue Warm',
    colors: ['#0277BD', '#0288D1', '#039BE5', '#29B6F6', '#4FC3F7', '#81D4FA', '#B3E5FC', '#E1F5FE'],
    primaryIndex: 0,
    secondaryIndex: 3,
  },
  {
    id: 'green-yellow',
    name: 'Green Yellow',
    colors: ['#33691E', '#558B2F', '#689F38', '#7CB342', '#9CCC65', '#C0CA33', '#D4E157', '#E6EE9C'],
    primaryIndex: 0,
    secondaryIndex: 5,
  },
  {
    id: 'violet',
    name: 'Violet',
    colors: ['#4A148C', '#6A1B9A', '#7B1FA2', '#8E24AA', '#9C27B0', '#AB47BC', '#BA68C8', '#CE93D8'],
    primaryIndex: 0,
    secondaryIndex: 4,
  },
  {
    id: 'marquee',
    name: 'Marquee',
    colors: ['#D32F2F', '#F44336', '#E57373', '#EF9A9A', '#1976D2', '#2196F3', '#64B5F6', '#90CAF9'],
    primaryIndex: 0,
    secondaryIndex: 4,
  },
  {
    id: 'paper',
    name: 'Paper',
    colors: ['#37474F', '#455A64', '#546E7A', '#78909C', '#90A4AE', '#B0BEC5', '#CFD8DC', '#ECEFF1'],
    primaryIndex: 0,
    secondaryIndex: 3,
  },
  {
    id: 'grayscale',
    name: 'Grayscale',
    colors: ['#212121', '#424242', '#616161', '#757575', '#9E9E9E', '#BDBDBD', '#E0E0E0', '#F5F5F5'],
    primaryIndex: 0,
    secondaryIndex: 4,
  },
  {
    id: 'aspect',
    name: 'Aspect',
    colors: ['#F57C00', '#FF9800', '#FFB74D', '#FFE0B2', '#512DA8', '#673AB7', '#9575CD', '#D1C4E9'],
    primaryIndex: 0,
    secondaryIndex: 4,
  },
];

export function getPaletteById(id: string): ExcelColorTheme | undefined {
  return EXCEL_COLOR_THEMES.find(p => p.id === id);
}

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
