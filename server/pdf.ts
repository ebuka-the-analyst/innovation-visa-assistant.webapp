import type { BusinessPlan } from "@shared/schema";
import { generateSVGChart, SECTION_CHART_MAP, type ChartDataPayload, type ChartType } from "./chartGenerator";

// Font family mappings for Google Fonts
const FONT_FAMILIES: Record<string, string> = {
  'Inter': "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  'Poppins': "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  'Montserrat': "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  'Playfair Display': "'Playfair Display', Georgia, 'Times New Roman', serif",
  'Roboto': "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  'Open Sans': "'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  'Lato': "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  'Source Sans Pro': "'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

// Generate professional cover page SVG decorations based on theme
function generateCoverPageSVG(themeId: string | null, primaryColor: string, secondaryColor?: string): { topRight: string; bottomLeft: string; bottomRight: string; topLeft: string; middleSection: string; style: string } {
  const isBlueTheme = themeId === 'blue-modern' || primaryColor.includes('1d4ed8') || primaryColor.includes('2563eb') || primaryColor.includes('3b82f6');
  const isCorporateTheme = themeId === 'white-red-corporate';
  const isNavyDiagonal = themeId === 'navy-diagonal';
  const isCyanModern = themeId === 'cyan-modern';
  const accentColor = secondaryColor || '#1e293b';
  
  if (isNavyDiagonal) {
    // Navy Corporate Profile - diagonal stripes with dark overlay
    return {
      topLeft: `
        <svg class="cover-decoration-top-left" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="200" height="100" fill="${primaryColor}" opacity="0.95"/>
        </svg>
      `,
      topRight: `
        <svg class="cover-decoration-top" viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,0 400,0 400,120 50,120" fill="${primaryColor}" opacity="0.95"/>
          <polygon points="0,30 400,30 400,90 30,90" fill="${primaryColor}" opacity="0.7"/>
        </svg>
      `,
      middleSection: `
        <svg class="cover-decoration-middle" viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,0 600,100 600,200 0,100" fill="${accentColor}" opacity="0.85"/>
        </svg>
      `,
      bottomLeft: `
        <svg class="cover-decoration-bottom" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,50 200,200 0,200" fill="${accentColor}" opacity="0.95"/>
          <polygon points="0,100 150,200 0,200" fill="${primaryColor}" opacity="0.8"/>
        </svg>
      `,
      bottomRight: `
        <svg class="cover-decoration-corner" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
          <polygon points="100,0 400,200 400,0" fill="${primaryColor}" opacity="0.95"/>
          <polygon points="200,0 400,150 400,0" fill="${primaryColor}" opacity="0.7"/>
        </svg>
      `,
      style: 'navy-diagonal'
    };
  } else if (isCyanModern) {
    // Cyan Modern Proposal - cyan with black geometric accents
    return {
      topLeft: `
        <svg class="cover-decoration-top-left" viewBox="0 0 150 80" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="150" height="80" fill="${primaryColor}" opacity="0.95"/>
        </svg>
      `,
      topRight: `
        <svg class="cover-decoration-top" viewBox="0 0 400 350" xmlns="http://www.w3.org/2000/svg">
          <polygon points="80,0 400,0 400,300 200,350" fill="${primaryColor}" opacity="0.95"/>
          <polygon points="150,30 380,30 380,280 220,320" fill="white" stroke="${primaryColor}" stroke-width="3" opacity="0.3"/>
          <polygon points="200,60 360,60 360,250 240,280" fill="white" stroke="${primaryColor}" stroke-width="2" opacity="0.2"/>
        </svg>
      `,
      middleSection: `
        <svg class="cover-decoration-middle" viewBox="0 0 600 150" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,50 350,150 600,150 600,50 400,0 0,0" fill="${accentColor}" opacity="0.95"/>
        </svg>
      `,
      bottomLeft: '',
      bottomRight: `
        <svg class="cover-decoration-corner" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,150 200,150 200,50" fill="${primaryColor}" opacity="0.95"/>
          <polygon points="50,150 200,150 200,80" fill="${primaryColor}" opacity="0.7"/>
        </svg>
      `,
      style: 'cyan-modern'
    };
  } else if (themeId === 'yellow-modern') {
    // Yellow Bold Proposal - diagonal yellow accents with black contrast and starburst icon
    return {
      topLeft: '',
      topRight: `
        <svg class="cover-decoration-top" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <!-- Yellow diagonal shape -->
          <polygon points="100,0 200,0 200,120 150,150" fill="${primaryColor}" opacity="0.95"/>
          <polygon points="130,0 200,0 200,90 160,110" fill="${primaryColor}" opacity="0.7"/>
          <!-- Starburst icon -->
          <g transform="translate(160, 40)">
            <line x1="0" y1="-18" x2="0" y2="18" stroke="${primaryColor}" stroke-width="3"/>
            <line x1="-18" y1="0" x2="18" y2="0" stroke="${primaryColor}" stroke-width="3"/>
            <line x1="-13" y1="-13" x2="13" y2="13" stroke="${primaryColor}" stroke-width="3"/>
            <line x1="13" y1="-13" x2="-13" y2="13" stroke="${primaryColor}" stroke-width="3"/>
            <line x1="-15" y1="-8" x2="15" y2="8" stroke="${primaryColor}" stroke-width="2"/>
            <line x1="-15" y1="8" x2="15" y2="-8" stroke="${primaryColor}" stroke-width="2"/>
            <line x1="-8" y1="-15" x2="8" y2="15" stroke="${primaryColor}" stroke-width="2"/>
            <line x1="8" y1="-15" x2="-8" y2="15" stroke="${primaryColor}" stroke-width="2"/>
          </g>
        </svg>
      `,
      middleSection: `
        <svg class="cover-decoration-middle" viewBox="0 0 600 90" xmlns="http://www.w3.org/2000/svg">
          <!-- Yellow diagonal band with year -->
          <polygon points="0,0 280,0 320,90 0,90" fill="${primaryColor}" opacity="0.95"/>
          <polygon points="0,8 250,8 285,82 0,82" fill="${primaryColor}" opacity="0.7"/>
        </svg>
      `,
      bottomLeft: `
        <svg class="cover-decoration-bottom" viewBox="0 0 150 200" xmlns="http://www.w3.org/2000/svg">
          <!-- Black diagonal triangle -->
          <polygon points="0,80 100,200 0,200" fill="${accentColor}" opacity="0.95"/>
          <polygon points="0,120 60,200 0,200" fill="${accentColor}" opacity="0.8"/>
        </svg>
      `,
      bottomRight: `
        <svg class="cover-decoration-corner" viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
          <!-- Yellow diagonal bar bottom -->
          <polygon points="80,120 400,120 400,0 130,0" fill="${primaryColor}" opacity="0.95"/>
          <polygon points="130,120 400,120 400,25 160,25" fill="${primaryColor}" opacity="0.7"/>
        </svg>
      `,
      style: 'yellow-modern'
    };
  } else if (themeId === 'red-curved') {
    // Red Curved Elegance - rounded red shapes with soft curves
    return {
      topLeft: `
        <svg class="cover-decoration-top-left" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,0 L180,0 L180,140 Q180,180 140,180 L0,180 Z" fill="${primaryColor}" opacity="0.95"/>
          <path d="M20,20 L160,20 L160,120 Q160,160 120,160 L20,160 Z" fill="${primaryColor}" opacity="0.6"/>
          <rect x="70" y="70" width="40" height="40" rx="8" fill="white" opacity="0.9" transform="rotate(45 90 90)"/>
        </svg>
      `,
      topRight: `
        <svg class="cover-decoration-top" viewBox="0 0 100 400" xmlns="http://www.w3.org/2000/svg">
          <path d="M100,0 L100,400 Q60,350 60,250 L60,150 Q60,50 100,0" fill="${primaryColor}" opacity="0.4"/>
          <path d="M100,50 L100,350 Q70,300 70,250 L70,150 Q70,100 100,50" fill="${primaryColor}" opacity="0.6"/>
        </svg>
      `,
      middleSection: `
        <svg class="cover-decoration-middle" viewBox="0 0 600 100" xmlns="http://www.w3.org/2000/svg">
          <g>
            ${Array(6).fill(0).map((_, i) => `<circle cx="${30 + i * 15}" cy="20" r="3" fill="${primaryColor}" opacity="0.4"/>`).join('')}
            ${Array(6).fill(0).map((_, i) => `<circle cx="${30 + i * 15}" cy="35" r="3" fill="${primaryColor}" opacity="0.4"/>`).join('')}
            ${Array(6).fill(0).map((_, i) => `<circle cx="${30 + i * 15}" cy="50" r="3" fill="${primaryColor}" opacity="0.4"/>`).join('')}
          </g>
        </svg>
      `,
      bottomLeft: `
        <svg class="cover-decoration-bottom" viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,150 L0,50 Q50,0 150,30 Q250,60 300,150 Z" fill="${primaryColor}" opacity="0.15"/>
          <path d="M0,150 L0,80 Q40,40 120,60 Q200,80 280,150 Z" fill="${primaryColor}" opacity="0.3"/>
        </svg>
      `,
      bottomRight: `
        <svg class="cover-decoration-corner" viewBox="0 0 250 200" xmlns="http://www.w3.org/2000/svg">
          <path d="M50,200 Q100,100 200,80 Q250,70 250,0 L250,200 Z" fill="${primaryColor}" opacity="0.2"/>
          <path d="M100,200 Q140,120 210,100 Q250,90 250,50 L250,200 Z" fill="${primaryColor}" opacity="0.4"/>
        </svg>
      `,
      style: 'red-curved'
    };
  } else if (themeId === 'red-circular') {
    // Red Circular Frame - circular red accents with gold wave footer
    return {
      topLeft: `
        <svg class="cover-decoration-top-left" viewBox="0 0 200 350" xmlns="http://www.w3.org/2000/svg">
          <circle cx="-20" cy="120" r="140" fill="none" stroke="${primaryColor}" stroke-width="30" opacity="0.9"/>
          <circle cx="-20" cy="300" r="100" fill="none" stroke="${primaryColor}" stroke-width="25" opacity="0.8"/>
        </svg>
      `,
      topRight: `
        <svg class="cover-decoration-top" viewBox="0 0 150 100" xmlns="http://www.w3.org/2000/svg">
          <polygon points="100,0 150,0 150,50 130,80" fill="${primaryColor}" opacity="0.9"/>
          <polygon points="110,0 150,0 150,40" fill="${accentColor}" opacity="0.6"/>
        </svg>
      `,
      middleSection: '',
      bottomLeft: `
        <svg class="cover-decoration-bottom" viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,120 L0,40 Q50,0 150,40 L200,60 L200,120 Z" fill="${primaryColor}" opacity="0.95"/>
        </svg>
      `,
      bottomRight: `
        <svg class="cover-decoration-corner" viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,120 Q100,80 200,90 Q300,100 400,60 L400,120 Z" fill="${accentColor}" opacity="0.8"/>
          <path d="M0,120 Q150,100 250,105 Q350,110 400,90 L400,120 Z" fill="${primaryColor}" opacity="0.5"/>
        </svg>
      `,
      style: 'red-circular'
    };
  } else if (themeId === 'blue-hexagon') {
    // Blue Hexagon Shapes - hexagons with diagonal stripes and dot patterns (matching reference exactly)
    return {
      topLeft: '',
      topRight: `
        <svg class="cover-decoration-top" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <!-- Top triangles pattern -->
          <g transform="translate(280, 10)">
            ${Array(5).fill(0).map((_, row) => 
              Array(6 - row).fill(0).map((__, col) => 
                `<polygon points="${col * 12 + row * 6},${row * 10} ${col * 12 + 6 + row * 6},${row * 10 + 8} ${col * 12 + 12 + row * 6},${row * 10}" fill="#9ca3af" opacity="0.4"/>`
              ).join('')
            ).join('')}
          </g>
          <!-- Large cyan shape top-right corner -->
          <path d="M350,0 L400,0 L400,120 Q350,140 300,100 L350,0" fill="${primaryColor}" opacity="0.95"/>
          <!-- Large hexagon -->
          <polygon points="250,30 320,10 370,60 350,130 280,150 230,100" fill="${primaryColor}" opacity="0.9"/>
          <!-- Navy hexagon -->
          <polygon points="320,100 370,80 400,130 400,200 350,220 300,180" fill="${accentColor}" opacity="0.95"/>
          <!-- Hollow hexagon outline -->
          <polygon points="200,80 260,60 300,110 280,170 220,190 180,140" fill="none" stroke="${accentColor}" stroke-width="2" opacity="0.4"/>
          <!-- Small hexagon bottom -->
          <polygon points="330,240 360,225 385,250 375,285 345,300 320,275" fill="${accentColor}" opacity="0.5"/>
        </svg>
      `,
      middleSection: `
        <svg class="cover-decoration-middle" viewBox="0 0 600 100" xmlns="http://www.w3.org/2000/svg">
          <!-- Dot grid pattern middle-right -->
          <g>
            ${Array(5).fill(0).map((_, row) => 
              Array(8).fill(0).map((__, col) => 
                `<circle cx="${380 + col * 14}" cy="${25 + row * 12}" r="2.5" fill="#9ca3af" opacity="0.4"/>`
              ).join('')
            ).join('')}
          </g>
          <!-- Small hexagon -->
          <polygon points="520,40 545,25 570,40 570,70 545,85 520,70" fill="${accentColor}" opacity="0.3"/>
        </svg>
      `,
      bottomLeft: `
        <svg class="cover-decoration-bottom" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
          <!-- Dot grid pattern bottom-left -->
          <g>
            ${Array(4).fill(0).map((_, row) => 
              Array(6).fill(0).map((__, col) => 
                `<circle cx="${15 + col * 14}" cy="${100 + row * 12}" r="2.5" fill="${primaryColor}" opacity="0.5"/>`
              ).join('')
            ).join('')}
          </g>
        </svg>
      `,
      bottomRight: `
        <svg class="cover-decoration-corner" viewBox="0 0 250 200" xmlns="http://www.w3.org/2000/svg">
          <!-- Diagonal stripes -->
          <rect x="80" y="40" width="120" height="18" fill="${primaryColor}" opacity="0.95" transform="rotate(45 140 49)"/>
          <rect x="100" y="70" width="120" height="14" fill="${accentColor}" opacity="0.95" transform="rotate(45 160 77)"/>
          <rect x="120" y="100" width="120" height="18" fill="${primaryColor}" opacity="0.95" transform="rotate(45 180 109)"/>
          <!-- Circles -->
          <circle cx="200" cy="170" r="18" fill="${primaryColor}" opacity="0.9"/>
          <circle cx="175" cy="150" r="10" fill="${accentColor}" opacity="0.7"/>
        </svg>
      `,
      style: 'blue-hexagon'
    };
  } else if (themeId === 'navy-company-profile') {
    // Navy Company Profile - bold diagonal stripes
    return {
      topLeft: '',
      topRight: `
        <svg class="cover-decoration-top" viewBox="0 0 400 150" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,0 400,0 400,100 50,100" fill="${primaryColor}" opacity="0.95"/>
          <polygon points="80,0 400,0 400,70 120,70" fill="${primaryColor}" opacity="0.7"/>
        </svg>
      `,
      middleSection: '',
      bottomLeft: `
        <svg class="cover-decoration-bottom" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,80 120,200 0,200" fill="${accentColor}" opacity="0.95"/>
          <polygon points="0,130 80,200 0,200" fill="${primaryColor}" opacity="0.8"/>
        </svg>
      `,
      bottomRight: `
        <svg class="cover-decoration-corner" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
          <polygon points="100,0 400,200 400,0" fill="${primaryColor}" opacity="0.95"/>
          <polygon points="180,0 400,150 400,0" fill="${primaryColor}" opacity="0.7"/>
        </svg>
      `,
      style: 'navy-company-profile'
    };
  } else if (themeId === 'blue-orange-geometric') {
    // Blue Orange Geometric - navy and coral shapes
    return {
      topLeft: '',
      topRight: `
        <svg class="cover-decoration-top" viewBox="0 0 400 350" xmlns="http://www.w3.org/2000/svg">
          <!-- Orange triangle top -->
          <polygon points="300,0 400,0 400,80" fill="${accentColor}" opacity="0.95"/>
          <!-- Navy large shape -->
          <polygon points="200,0 400,0 400,250 300,300 150,200" fill="${primaryColor}" opacity="0.95"/>
          <!-- Small orange accent -->
          <polygon points="350,60 400,40 400,100" fill="${accentColor}" opacity="0.8"/>
        </svg>
      `,
      middleSection: '',
      bottomLeft: `
        <svg class="cover-decoration-bottom" viewBox="0 0 250 200" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,100 150,200 0,200" fill="${primaryColor}" opacity="0.95"/>
          <polygon points="0,150 80,200 0,200" fill="${primaryColor}" opacity="0.7"/>
        </svg>
      `,
      bottomRight: `
        <svg class="cover-decoration-corner" viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg">
          <!-- Coral diagonal stripes -->
          <rect x="150" y="80" width="100" height="15" fill="${accentColor}" opacity="0.9" transform="rotate(-45 200 87)"/>
          <rect x="170" y="100" width="100" height="12" fill="${accentColor}" opacity="0.7" transform="rotate(-45 220 106)"/>
          <rect x="190" y="120" width="100" height="15" fill="${accentColor}" opacity="0.9" transform="rotate(-45 240 127)"/>
          <!-- Navy triangle -->
          <polygon points="200,180 300,180 300,100" fill="${primaryColor}" opacity="0.95"/>
        </svg>
      `,
      style: 'blue-orange-geometric'
    };
  } else if (themeId === 'white-red-hexagon') {
    // White Red Hexagon - 3D red hexagons with shadows
    return {
      topLeft: `
        <svg class="cover-decoration-top-left" viewBox="0 0 250 250" xmlns="http://www.w3.org/2000/svg">
          <!-- 3D Hexagon cluster top-left -->
          <g>
            <!-- Shadow hexagons -->
            <polygon points="-20,80 30,50 80,80 80,130 30,160 -20,130" fill="#e5e5e5" opacity="0.8"/>
            <polygon points="40,40 90,10 140,40 140,90 90,120 40,90" fill="#e5e5e5" opacity="0.6"/>
            <!-- Red hexagons -->
            <polygon points="-30,70 20,40 70,70 70,120 20,150 -30,120" fill="${primaryColor}" opacity="0.95"/>
            <polygon points="50,30 100,0 150,30 150,80 100,110 50,80" fill="${primaryColor}" opacity="0.9"/>
            <polygon points="30,120 80,90 130,120 130,170 80,200 30,170" fill="#f5f5f5" stroke="#e5e5e5" stroke-width="2" opacity="0.9"/>
          </g>
        </svg>
      `,
      topRight: '',
      middleSection: '',
      bottomLeft: '',
      bottomRight: `
        <svg class="cover-decoration-corner" viewBox="0 0 300 280" xmlns="http://www.w3.org/2000/svg">
          <!-- 3D Hexagon cluster bottom-right -->
          <g>
            <!-- Shadow hexagons -->
            <polygon points="180,120 230,90 280,120 280,170 230,200 180,170" fill="#e5e5e5" opacity="0.8"/>
            <polygon points="220,180 270,150 320,180 320,230 270,260 220,230" fill="#e5e5e5" opacity="0.6"/>
            <!-- Red hexagons -->
            <polygon points="200,100 250,70 300,100 300,150 250,180 200,150" fill="${primaryColor}" opacity="0.95"/>
            <polygon points="240,160 290,130 340,160 340,210 290,240 240,210" fill="${primaryColor}" opacity="0.9"/>
            <polygon points="160,160 210,130 260,160 260,210 210,240 160,210" fill="#f5f5f5" stroke="#e5e5e5" stroke-width="2" opacity="0.9"/>
          </g>
        </svg>
      `,
      style: 'white-red-hexagon'
    };
  } else if (themeId === 'white-red-waves') {
    // White Red Waves - flowing curved waves with gray accents
    return {
      topLeft: `
        <svg class="cover-decoration-top-left" viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
          <!-- Logo placeholder -->
          <polygon points="30,20 50,10 60,25 50,40 30,40 20,25" fill="${primaryColor}" opacity="0.9"/>
          <polygon points="35,22 48,15 55,25 48,35 35,35 28,25" fill="${accentColor}" opacity="0.6"/>
        </svg>
      `,
      topRight: `
        <svg class="cover-decoration-top" viewBox="0 0 200 350" xmlns="http://www.w3.org/2000/svg">
          <!-- Red curved wave top-right -->
          <path d="M200,0 L200,350 Q150,300 160,200 Q170,100 200,50 Z" fill="${primaryColor}" opacity="0.95"/>
          <path d="M200,0 L200,300 Q160,250 170,150 Q180,80 200,30 Z" fill="${primaryColor}" opacity="0.6"/>
        </svg>
      `,
      middleSection: `
        <svg class="cover-decoration-middle" viewBox="0 0 600 60" xmlns="http://www.w3.org/2000/svg">
          <!-- Subtle gray wave in middle -->
          <path d="M0,40 Q100,20 200,35 Q300,50 400,30 Q500,10 600,40 L600,60 L0,60 Z" fill="${accentColor}" opacity="0.3"/>
          <path d="M0,50 Q150,30 300,45 Q450,60 600,35 L600,60 L0,60 Z" fill="${accentColor}" opacity="0.2"/>
        </svg>
      `,
      bottomLeft: `
        <svg class="cover-decoration-bottom" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
          <!-- Red curved wave bottom-left -->
          <path d="M0,0 Q50,50 40,100 Q30,140 0,150 L0,0 Z" fill="${primaryColor}" opacity="0.95"/>
          <path d="M0,50 Q30,80 25,120 Q20,145 0,150 L0,50 Z" fill="${primaryColor}" opacity="0.6"/>
        </svg>
      `,
      bottomRight: '',
      style: 'white-red-waves'
    };
  } else if (themeId === 'blue-curves-circles') {
    // Blue Curves & Circles - elegant curves with circular elements
    return {
      topLeft: '',
      topRight: `
        <svg class="cover-decoration-top" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <!-- Blue curved shape -->
          <path d="M100,0 L200,0 L200,200 Q150,180 120,120 Q90,60 100,0 Z" fill="${primaryColor}" opacity="0.2"/>
          <path d="M150,0 L200,0 L200,150 Q170,130 150,80 Q130,40 150,0 Z" fill="${primaryColor}" opacity="0.4"/>
        </svg>
      `,
      middleSection: `
        <svg class="cover-decoration-middle" viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
          <!-- Large circular frame -->
          <circle cx="450" cy="100" r="100" fill="none" stroke="${accentColor}" stroke-width="2" opacity="0.3"/>
          <circle cx="450" cy="100" r="80" fill="${accentColor}" opacity="0.1"/>
          <!-- Decorative circles -->
          <circle cx="560" cy="50" r="25" fill="${accentColor}" opacity="0.9"/>
          <circle cx="520" cy="30" r="12" fill="${primaryColor}" opacity="0.7"/>
        </svg>
      `,
      bottomLeft: `
        <svg class="cover-decoration-bottom" viewBox="0 0 250 150" xmlns="http://www.w3.org/2000/svg">
          <!-- Navy diagonal bar -->
          <polygon points="0,100 200,150 0,150" fill="${primaryColor}" opacity="0.95"/>
          <polygon points="0,120 150,150 0,150" fill="${primaryColor}" opacity="0.7"/>
        </svg>
      `,
      bottomRight: '',
      style: 'blue-curves-circles'
    };
  } else if (themeId === 'orange-modern-proposal') {
    // Orange Modern Proposal - bold diagonal shapes with city image
    return {
      topLeft: `
        <svg class="cover-decoration-top-left" viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
          <!-- Large diagonal orange shape on left -->
          <polygon points="0,100 200,0 260,180 200,380 0,320" fill="${primaryColor}" opacity="0.9"/>
          <polygon points="0,140 160,60 200,180 160,280 0,240" fill="${primaryColor}" opacity="0.6"/>
          <!-- Image placeholder area - rotated rectangle with city skyline styling -->
          <rect x="40" y="80" width="180" height="220" rx="8" fill="#e2e8f0" opacity="0.9" transform="rotate(-15 130 190)"/>
          <rect x="50" y="90" width="160" height="200" rx="6" fill="#94a3b8" opacity="0.6" transform="rotate(-15 130 190)"/>
          <!-- Small decorative rectangles -->
          <rect x="180" y="280" width="60" height="12" fill="${primaryColor}" opacity="0.95" transform="rotate(-45 210 286)"/>
          <rect x="200" y="300" width="50" height="10" fill="${primaryColor}" opacity="0.7" transform="rotate(-45 225 305)"/>
        </svg>
      `,
      topRight: `
        <svg class="cover-decoration-top" viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg">
          <!-- Orange diagonal stripe top-right -->
          <polygon points="80,0 200,0 200,180 160,130" fill="${primaryColor}" opacity="0.95"/>
          <polygon points="130,0 200,0 200,110 170,80" fill="${primaryColor}" opacity="0.7"/>
          <!-- Orange triangle accent -->
          <polygon points="160,150 200,120 200,220" fill="${primaryColor}" opacity="0.85"/>
          <!-- Company name -->
          <text x="140" y="35" fill="${primaryColor}" font-size="14" font-weight="bold">FAUGET</text>
        </svg>
      `,
      middleSection: `
        <svg class="cover-decoration-middle" viewBox="0 0 600 80" xmlns="http://www.w3.org/2000/svg">
          <!-- Year text -->
          <text x="50" y="40" fill="${accentColor}" font-size="20" font-weight="bold">2024-2025</text>
        </svg>
      `,
      bottomLeft: `
        <svg class="cover-decoration-bottom" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <!-- Orange triangle bottom-left -->
          <polygon points="0,100 140,200 0,200" fill="${primaryColor}" opacity="0.95"/>
          <polygon points="0,150 80,200 0,200" fill="${primaryColor}" opacity="0.7"/>
        </svg>
      `,
      bottomRight: `
        <svg class="cover-decoration-corner" viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg">
          <!-- Orange diagonal bar bottom -->
          <polygon points="100,50 400,100 400,50 180,20" fill="${primaryColor}" opacity="0.95"/>
          <polygon points="180,70 400,100 400,70 240,50" fill="${primaryColor}" opacity="0.7"/>
        </svg>
      `,
      style: 'orange-modern-proposal'
    };
  } else if (isCorporateTheme) {
    // Corporate Geometric Theme - triangles and diagonal stripes
    return {
      topLeft: '',
      topRight: `
        <svg class="cover-decoration-top" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <polygon points="150,0 400,0 400,250" fill="${accentColor}" opacity="0.95"/>
          <polygon points="280,0 400,0 400,120" fill="${primaryColor}" opacity="0.9"/>
          <polygon points="200,0 280,0 400,80 400,0" fill="${primaryColor}" opacity="0.6"/>
        </svg>
      `,
      middleSection: '',
      bottomLeft: `
        <svg class="cover-decoration-bottom" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,250 0,400 150,400" fill="${accentColor}" opacity="0.95"/>
          <polygon points="0,320 0,400 80,400" fill="${accentColor}" opacity="0.8"/>
        </svg>
      `,
      bottomRight: `
        <svg class="cover-decoration-corner" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
          <polygon points="100,200 300,200 300,0" fill="${accentColor}" opacity="0.95"/>
          <g transform="translate(150, 80)">
            <rect x="0" y="0" width="8" height="40" fill="${primaryColor}" transform="rotate(-45)" opacity="0.8"/>
            <rect x="20" y="0" width="8" height="50" fill="${primaryColor}" transform="rotate(-45)" opacity="0.8"/>
            <rect x="40" y="0" width="8" height="60" fill="${primaryColor}" transform="rotate(-45)" opacity="0.8"/>
            <rect x="60" y="0" width="8" height="70" fill="${primaryColor}" transform="rotate(-45)" opacity="0.8"/>
          </g>
        </svg>
      `,
      style: 'corporate-geometric'
    };
  } else if (isBlueTheme) {
    // Blue Modern Theme - curved shapes with circles
    return {
      topLeft: '',
      topRight: `
        <svg class="cover-decoration-top" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="blueGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:0.9" />
              <stop offset="100%" style="stop-color:${primaryColor};stop-opacity:0.6" />
            </linearGradient>
          </defs>
          <path d="M400,0 L400,400 C300,380 200,300 150,200 C100,100 50,50 0,0 Z" fill="url(#blueGrad1)" opacity="0.3"/>
          <path d="M400,0 L400,350 C320,330 240,270 180,180 C120,90 60,40 0,0 Z" fill="${primaryColor}" opacity="0.5"/>
          <path d="M400,0 L400,280 C340,260 280,220 220,150 C160,80 80,30 0,0 Z" fill="${primaryColor}" opacity="0.8"/>
          <circle cx="350" cy="120" r="40" fill="${primaryColor}" opacity="0.9"/>
          <circle cx="280" cy="60" r="20" fill="${primaryColor}" opacity="0.7"/>
          <circle cx="380" cy="200" r="15" fill="${primaryColor}" opacity="0.5"/>
        </svg>
      `,
      middleSection: '',
      bottomLeft: `
        <svg class="cover-decoration-bottom" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="blueGrad2" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:0.9" />
              <stop offset="100%" style="stop-color:${primaryColor};stop-opacity:0.4" />
            </linearGradient>
          </defs>
          <path d="M0,400 L0,0 C100,20 200,100 250,200 C300,300 350,350 400,400 Z" fill="url(#blueGrad2)" opacity="0.3"/>
          <path d="M0,400 L0,50 C80,70 160,130 220,220 C280,310 340,360 400,400 Z" fill="${primaryColor}" opacity="0.5"/>
          <path d="M0,400 L0,120 C60,140 120,180 180,250 C240,320 320,370 400,400 Z" fill="${primaryColor}" opacity="0.8"/>
          <path d="M0,400 L150,400 L0,250 Z" fill="${primaryColor}" opacity="0.95"/>
        </svg>
      `,
      bottomRight: '',
      style: 'blue-modern'
    };
  } else {
    // Red/Default Modern Theme - wave patterns
    return {
      topLeft: '',
      topRight: `
        <svg class="cover-decoration-top" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="redGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
              <stop offset="100%" style="stop-color:${primaryColor};stop-opacity:0.7" />
            </linearGradient>
          </defs>
          <path d="M400,0 C350,50 300,80 250,100 C180,130 120,180 100,250 C80,320 100,360 150,400 L400,400 Z" fill="url(#redGrad1)" opacity="0.15"/>
          <path d="M400,0 C360,30 320,50 280,70 C220,100 170,150 150,220 C130,290 160,350 220,400 L400,400 Z" fill="${primaryColor}" opacity="0.4"/>
          <path d="M400,0 C380,20 350,35 320,50 C270,80 230,130 220,200 C210,270 250,340 320,400 L400,400 Z" fill="${primaryColor}" opacity="0.7"/>
          <path d="M400,0 L400,400 C360,350 340,280 340,200 C340,120 360,60 400,0 Z" fill="${primaryColor}" opacity="0.95"/>
        </svg>
      `,
      middleSection: '',
      bottomLeft: `
        <svg class="cover-decoration-bottom" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="redGrad2" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
              <stop offset="100%" style="stop-color:${primaryColor};stop-opacity:0.7" />
            </linearGradient>
          </defs>
          <path d="M0,400 C50,350 80,300 100,250 C130,180 180,120 250,100 C320,80 360,100 400,150 L400,400 Z" fill="url(#redGrad2)" opacity="0.15"/>
          <path d="M0,400 C30,360 50,320 70,280 C100,220 150,170 220,150 C290,130 350,160 400,220 L400,400 Z" fill="${primaryColor}" opacity="0.4"/>
          <path d="M0,400 C20,380 35,350 50,320 C80,270 130,230 200,220 C270,210 340,250 400,320 L400,400 Z" fill="${primaryColor}" opacity="0.7"/>
          <path d="M0,400 L0,0 C60,40 80,120 80,200 C80,280 60,340 0,400 Z" fill="${primaryColor}" opacity="0.95"/>
        </svg>
      `,
      bottomRight: '',
      style: 'red-modern'
    };
  }
}

export function generatePDFContent(plan: BusinessPlan): string {
  const content = plan.generatedContent || "Business plan content not yet generated.";
  
  // Theme settings - use plan's theme or defaults
  const primaryColor = plan.themePrimaryColor || '#005EB8';
  const secondaryColor = plan.themeSecondaryColor || '#1e3a5f';
  const themeFont = plan.themeFont || 'Inter';
  const fontFamily = FONT_FAMILIES[themeFont] || FONT_FAMILIES['Inter'];

  // Effective visual style (0-9) — pinned override or stable hash
  const effectiveStyle = (plan.tocStyle !== null && plan.tocStyle !== undefined)
    ? Math.max(0, Math.min(9, plan.tocStyle))
    : pickTOCStyle(plan.id || '');
  
  let chartData: ChartDataPayload | null = null;
  if (plan.chartData) {
    try {
      chartData = JSON.parse(plan.chartData) as ChartDataPayload;
    } catch (e) {
      console.error('Failed to parse chart data:', e);
    }
  }
  
  // Generate Google Fonts import URL for the selected font
  const fontImport = `https://fonts.googleapis.com/css2?family=${themeFont.replace(' ', '+')}:wght@400;500;600;700&display=swap`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${plan.businessName} - Business Plan</title>
  <link rel="stylesheet" href="${fontImport}">
  <style>
    @page {
      margin: 1.25cm 1.35cm;
    }
    @page cover {
      margin: 0;
    }
    body {
      font-family: ${fontFamily};
      font-size: 9.5pt;
      line-height: 1.42;
      color: #1a1a1a;
      max-width: 210mm;
      margin: 0 auto;
      padding: 0;
    }
    h1 {
      font-size: 22pt;
      color: ${primaryColor};
      border-bottom: 2px solid ${primaryColor};
      padding-bottom: 6px;
      margin: 0 0 14px;
      break-after: avoid;
    }
    h2 {
      font-size: 15pt;
      color: ${primaryColor};
      margin-top: 18px;
      margin-bottom: 8px;
      break-after: avoid;
    }
    h3 {
      font-size: 12pt;
      color: ${secondaryColor};
      margin-top: 12px;
      margin-bottom: 6px;
      break-after: avoid;
    }
    h4 {
      font-size: 10.5pt;
      color: #333;
      margin-top: 10px;
      margin-bottom: 5px;
      font-weight: 600;
      break-after: avoid;
    }
    p {
      font-size: 9.5pt;
      text-align: left;
      margin: 0 0 6px;
      line-height: 1.42;
    }
    .cover-page {
      position: relative;
      width: 210mm;
      height: 297mm;
      max-height: 297mm;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #f8f9fa 100%);
      page: cover;
      page-break-before: avoid;
      page-break-after: always;
      page-break-inside: avoid;
      break-inside: avoid;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 0;
      margin: 0;
      margin-bottom: 0;
      box-sizing: border-box;
    }
    .cover-decoration-top {
      position: absolute;
      top: 0;
      right: 0;
      width: 280px;
      height: 280px;
      z-index: 1;
    }
    .cover-decoration-bottom {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 250px;
      height: 250px;
      z-index: 1;
    }
    .cover-decoration-corner {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 200px;
      height: 140px;
      z-index: 1;
    }
    .cover-decoration-top-left {
      position: absolute;
      top: 0;
      left: 0;
      width: 150px;
      height: 70px;
      z-index: 1;
    }
    .cover-decoration-middle {
      position: absolute;
      top: 45%;
      left: 0;
      width: 100%;
      height: 120px;
      z-index: 1;
    }
    .cover-content {
      position: relative;
      z-index: 10;
      padding: 50px 60px;
      text-align: left;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .cover-header {
      margin-bottom: 40px;
    }
    .cover-main-title {
      font-size: 60pt;
      font-weight: 800;
      line-height: 1;
      margin: 0;
      letter-spacing: -2px;
    }
    .cover-main-title .word-business {
      color: #1a1a2e;
      display: block;
    }
    .cover-main-title .word-plan {
      color: ${primaryColor};
      display: block;
    }
    .cover-subtitle-line {
      width: 80px;
      height: 3px;
      background: #1a1a2e;
      margin: 20px 0;
    }
    .cover-business-name {
      font-size: 18pt;
      font-weight: 600;
      color: #1a1a2e;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .cover-tagline {
      font-size: 12pt;
      color: #555;
      margin-bottom: 30px;
    }
    .cover-year {
      font-size: 52pt;
      font-weight: 800;
      color: #1a1a2e;
      margin: 20px 0;
      letter-spacing: -2px;
    }
    .cover-metadata {
      position: absolute;
      bottom: 60px;
      left: 60px;
      z-index: 10;
    }
    .cover-prepared-by {
      font-size: 10pt;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 5px;
    }
    .cover-industry {
      font-size: 14pt;
      font-weight: 600;
      color: #1a1a2e;
      margin-bottom: 20px;
    }
    .cover-contact {
      font-size: 10pt;
      color: #666;
      line-height: 1.8;
    }
    .cover-contact span {
      display: block;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 8.5pt;
      table-layout: fixed;
      word-break: break-word;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 5px 7px;
      text-align: left;
      word-break: break-word;
      overflow-wrap: break-word;
      vertical-align: top;
    }
    th {
      background-color: ${primaryColor};
      font-weight: 600;
      color: white;
    }
    .financial-table th {
      background-color: ${primaryColor};
      color: white;
    }
    .financial-table td {
      padding: 5px 7px;
    }
    .financial-table tr:nth-child(even) {
      background-color: #f8fafc;
    }
    .table-wrapper {
      overflow-x: auto;
      max-width: 100%;
      margin: 10px 0;
    }
    .table-wrapper table {
      min-width: 0;
      width: 100%;
      margin: 0;
    }
    .stacked-table {
      margin: 10px 0;
      display: grid;
      gap: 8px;
    }
    .stacked-table-card {
      border: 1px solid #dbe3ef;
      border-left: 3px solid ${primaryColor};
      border-radius: 6px;
      background: #ffffff;
      padding: 8px 10px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .stacked-table-title {
      color: ${primaryColor};
      font-size: 9.5pt;
      font-weight: 700;
      margin-bottom: 5px;
    }
    .stacked-table-field {
      display: grid;
      grid-template-columns: 120px 1fr;
      gap: 8px;
      padding: 4px 0;
      border-top: 1px solid #edf2f7;
    }
    .stacked-table-label {
      color: ${secondaryColor};
      font-size: 8pt;
      font-weight: 700;
    }
    .stacked-table-value {
      font-size: 8.75pt;
      line-height: 1.34;
      overflow-wrap: anywhere;
    }
    .content {
      max-width: 100%;
      overflow-x: hidden;
    }
    .toc {
      background: #f8fafc;
      padding: 14px 18px;
      border-radius: 8px;
      margin: 12px 0;
      page-break-after: always;
      page-break-inside: avoid;
      border-left: 4px solid ${primaryColor};
    }
    .toc h2 {
      color: ${primaryColor};
      border-bottom: 2px solid ${primaryColor};
      padding-bottom: 8px;
      margin-bottom: 12px;
      font-size: 16pt;
    }
    .toc ol {
      list-style: none;
      padding: 0;
      margin: 0;
      counter-reset: toc-counter;
      columns: 1;
    }
    .toc li {
      counter-increment: toc-counter;
      padding: 4px 0;
      border-bottom: 1px dotted #ddd;
      font-size: 10pt;
      line-height: 1.4;
    }
    .toc li:last-child {
      border-bottom: none;
    }
    .toc li::before {
      content: counter(toc-counter) ". ";
      color: ${primaryColor};
      font-weight: bold;
    }
    .toc a {
      color: #1a1a1a;
      text-decoration: none;
    }
    .toc a:hover {
      color: ${primaryColor};
    }
    ul, ol {
      margin: 8px 0;
      padding-left: 22px;
    }
    li {
      margin-bottom: 4px;
      font-size: 9.5pt;
      line-height: 1.38;
    }
    .section-break {
      margin-top: 18px;
      border-top: 2px solid ${primaryColor};
      padding-top: 12px;
    }
    strong {
      color: ${secondaryColor};
      font-weight: 600;
    }
    .chart-container {
      background: #fafafa;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 8px;
      margin: 10px 0;
      text-align: center;
      border-top: 3px solid ${primaryColor};
      break-inside: avoid;
    }
    .chart-container svg {
      max-width: 100%;
      max-height: 225px;
      height: auto;
    }
    .inline-chart {
      margin: 8px auto;
      page-break-inside: avoid;
    }
    h2[id*="endorser-readiness-benchmark"] {
      page-break-before: auto;
    }
    h3 {
      color: ${secondaryColor};
      font-size: 12pt;
      margin-top: 12px;
      margin-bottom: 6px;
    }
    .table-wrapper table td:last-child,
    .table-wrapper table th:last-child {
      text-align: right;
    }
    /* ── Per-plan visual style override (style ${effectiveStyle}) ── */
    ${getBodyStyleCSS(effectiveStyle, primaryColor, secondaryColor)}
    /* Final print-density override: keep branded themes, but prevent bloated PDFs. */
    @media print {
      body {
        font-size: 9.5pt !important;
        line-height: 1.42 !important;
        padding: 0 !important;
      }
      .content {
        max-width: 100% !important;
      }
      h1 {
        font-size: 22pt !important;
        margin: 0 0 14px !important;
        padding-bottom: 6px !important;
        break-after: avoid !important;
      }
      h2 {
        font-size: 15pt !important;
        margin-top: 18px !important;
        margin-bottom: 8px !important;
        padding-top: 0 !important;
        padding-bottom: 5px !important;
        break-after: avoid !important;
        page-break-before: auto !important;
      }
      h3 {
        font-size: 12pt !important;
        margin-top: 12px !important;
        margin-bottom: 6px !important;
        padding-top: 0 !important;
        padding-bottom: 3px !important;
        break-after: avoid !important;
      }
      h4 {
        font-size: 10.5pt !important;
        margin-top: 10px !important;
        margin-bottom: 5px !important;
        break-after: avoid !important;
      }
      p {
        font-size: 9.5pt !important;
        line-height: 1.42 !important;
        margin: 0 0 6px !important;
      }
      ul, ol {
        margin: 6px 0 8px !important;
        padding-left: 20px !important;
      }
      li {
        font-size: 9.25pt !important;
        line-height: 1.36 !important;
        margin-bottom: 3px !important;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
      }
      blockquote {
        margin: 8px 0 !important;
        padding: 8px 12px !important;
      }
      table,
      .table-wrapper table {
        font-size: 8.25pt !important;
        margin: 0 !important;
        page-break-inside: auto !important;
        break-inside: auto !important;
      }
      .table-wrapper {
        margin: 8px 0 !important;
        page-break-inside: auto !important;
        break-inside: auto !important;
      }
      .stacked-table {
        margin: 8px 0 !important;
        gap: 6px !important;
      }
      .stacked-table-card {
        padding: 6px 8px !important;
        box-shadow: none !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      .stacked-table-title {
        font-size: 9pt !important;
        margin-bottom: 3px !important;
      }
      .stacked-table-field {
        grid-template-columns: 105px 1fr !important;
        gap: 6px !important;
        padding: 3px 0 !important;
      }
      .stacked-table-label {
        font-size: 7.5pt !important;
      }
      .stacked-table-value {
        font-size: 8.25pt !important;
        line-height: 1.28 !important;
      }
      thead {
        display: table-header-group;
      }
      tr {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      th, td {
        padding: 4px 6px !important;
        line-height: 1.28 !important;
      }
      .chart-container {
        padding: 6px !important;
        margin: 8px 0 !important;
        box-shadow: none !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      .chart-container::before {
        margin-bottom: 6px !important;
      }
      .chart-container svg {
        width: 100% !important;
        max-width: 100% !important;
        max-height: 210px !important;
        height: auto !important;
      }
      .inline-chart {
        margin: 6px auto !important;
      }
      .section-break {
        margin-top: 14px !important;
        padding-top: 10px !important;
      }
      hr {
        margin: 12px 0 !important;
      }
      .toc {
        padding: 12px 16px !important;
        margin: 8px 0 !important;
      }
      .toc li {
        font-size: 9pt !important;
        line-height: 1.25 !important;
        padding: 2px 0 !important;
      }
      .additional-visuals {
        page-break-before: auto !important;
        break-before: auto !important;
      }
    }
  </style>
</head>
<body>
  ${generateCoverPageHTML(plan, primaryColor, secondaryColor)}
  
  <div class="content">
    ${formatContentWithCharts(content, chartData, primaryColor, plan.useFullCoverImage || false, plan.id || '', secondaryColor, plan.tocStyle)}
  </div>
</body>
</html>
  `;
  
  return html;
}

function generateCoverPageHTML(plan: BusinessPlan & { backgroundImage?: string | null; useFullCoverImage?: boolean; textElements?: any[] | null; logoElement?: { id: string; src: string; x: number; y: number; width: number; height: number } | null; paletteId?: string | null }, primaryColor: string, secondaryColor: string): string {
  const themeId = plan.themeId || null;
  const currentYear = new Date().getFullYear();
  const generatedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const tierDisplay = plan.tier.charAt(0).toUpperCase() + plan.tier.slice(1);
  
  // Check if using a full custom cover image
  if (plan.useFullCoverImage && plan.backgroundImage) {
    console.log('[CoverPage] Using full custom cover image mode');
    console.log('[CoverPage] textElements data:', {
      exists: !!plan.textElements,
      isArray: Array.isArray(plan.textElements),
      count: Array.isArray(plan.textElements) ? plan.textElements.length : 0,
      sample: Array.isArray(plan.textElements) && plan.textElements.length > 0 ? plan.textElements[0] : null,
    });
    
    // Render custom text elements if they exist
    let textElementsHtml = '';
    try {
      if (plan.textElements && Array.isArray(plan.textElements)) {
        // Editor canvas dimensions for converting pixels to percentages
        const editorWidth = 520;
        const editorHeight = 740;
        
        for (const el of plan.textElements) {
          // Validate required properties exist
          if (!el || typeof el.x !== 'number' || typeof el.y !== 'number') {
            continue; // Skip invalid elements
          }
          
          // Convert pixel coordinates to percentages
          // The CoverPageEditor uses 520x740 canvas, so we need to convert
          const xPercent = (el.x / editorWidth) * 100;
          const yPercent = (el.y / editorHeight) * 100;
          
          const style = `
            position: absolute;
            left: ${xPercent.toFixed(2)}%;
            top: ${yPercent.toFixed(2)}%;
            font-size: ${el.fontSize || 24}px;
            font-weight: ${el.fontWeight || 'normal'};
            font-style: ${el.fontStyle || 'normal'};
            font-family: ${el.fontFamily || 'Inter'}, sans-serif;
            color: ${el.color || '#000000'};
            text-align: ${el.textAlign || 'left'};
            white-space: pre-wrap;
            max-width: 90%;
          `;
          // Replace template variables with actual values - safely handle undefined content
          const rawContent = String(el.content ?? '');
          let content = rawContent
            .replace(/\{\{year\}\}/gi, currentYear.toString())
            .replace(/\{\{businessName\}\}/gi, plan.businessName || '')
            .replace(/\{\{industry\}\}/gi, plan.industry || '')
            .replace(/\{\{tier\}\}/gi, tierDisplay)
            .replace(/\{\{date\}\}/gi, generatedDate);
          textElementsHtml += `<div style="${style}">${content}</div>`;
        }
      }
    } catch (textError) {
      console.error('Error rendering text elements:', textError);
      // Continue with empty textElementsHtml rather than failing
    }
    
    // Render logo element if it exists
    let logoHtml = '';
    try {
      if (plan.logoElement && plan.logoElement.src) {
        const editorWidth = 520;
        const editorHeight = 740;
        const logoXPercent = (plan.logoElement.x / editorWidth) * 100;
        const logoYPercent = (plan.logoElement.y / editorHeight) * 100;
        const logoWidthPercent = (plan.logoElement.width / editorWidth) * 100;
        
        logoHtml = `<img src="${plan.logoElement.src}" alt="Company Logo" style="
          position: absolute;
          left: ${logoXPercent.toFixed(2)}%;
          top: ${logoYPercent.toFixed(2)}%;
          width: ${logoWidthPercent.toFixed(2)}%;
          height: auto;
          object-fit: contain;
        " />`;
        console.log('[CoverPage] Logo rendered at:', { x: logoXPercent, y: logoYPercent, width: logoWidthPercent });
      }
    } catch (logoError) {
      console.error('Error rendering logo element:', logoError);
    }
    
    return `
    <div class="cover-page" style="position: relative; background: url('${plan.backgroundImage}') center/cover no-repeat; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
      ${textElementsHtml}
      ${logoHtml}
    </div>
    `;
  }
  
  // Standard themed cover page with SVG decorations
  const decorations = generateCoverPageSVG(themeId, primaryColor, secondaryColor);
  
  // Render logo for standard themed cover page too
  let standardLogoHtml = '';
  try {
    if (plan.logoElement && plan.logoElement.src) {
      const editorWidth = 520;
      const editorHeight = 740;
      const logoXPercent = (plan.logoElement.x / editorWidth) * 100;
      const logoYPercent = (plan.logoElement.y / editorHeight) * 100;
      const logoWidthPercent = (plan.logoElement.width / editorWidth) * 100;
      
      standardLogoHtml = `<img src="${plan.logoElement.src}" alt="Company Logo" style="
        position: absolute;
        left: ${logoXPercent.toFixed(2)}%;
        top: ${logoYPercent.toFixed(2)}%;
        width: ${logoWidthPercent.toFixed(2)}%;
        height: auto;
        object-fit: contain;
        z-index: 10;
      " />`;
    }
  } catch (logoError) {
    console.error('Error rendering logo for standard theme:', logoError);
  }
  
  return `
  <div class="cover-page" style="position: relative;">
    ${standardLogoHtml}
    ${decorations.topLeft || ''}
    ${decorations.topRight}
    ${decorations.middleSection || ''}
    ${decorations.bottomLeft}
    ${decorations.bottomRight || ''}
    
    <div class="cover-content">
      <div class="cover-header">
        <h1 class="cover-main-title">
          <span class="word-business">BUSINESS</span>
          <span class="word-plan">PLAN</span>
        </h1>
        <div class="cover-subtitle-line"></div>
        <div class="cover-business-name">${plan.businessName}</div>
        <div class="cover-tagline">UK Innovator Founder Visa Application</div>
      </div>
      
      <div class="cover-year">${currentYear}</div>
    </div>
    
    <div class="cover-metadata">
      <div class="cover-prepared-by">Prepared By:</div>
      <div class="cover-industry">${plan.industry}</div>
      <div class="cover-contact">
        <span>Tier: ${tierDisplay}</span>
        <span>Generated: ${generatedDate}</span>
      </div>
    </div>
  </div>
  `;
}

// ─── Per-Style Body CSS ─────────────────────────────────────────────────────
// Each of the 10 styles overrides h2, tables, charts, typography so no two
// plans ever look the same end-to-end.

function getBodyStyleCSS(style: number, pc: string, sc: string): string {

  switch (style) {

    // ── 0: Classic left-border (dark navy, square bullets, stepped callouts) ──
    case 0: return `
      h2 {
        font-size: 18pt; font-weight: 700; color: #1a1a2e;
        border-left: 5px solid ${pc}; padding-left: 14px;
        margin-top: 44px; margin-bottom: 14px; text-transform: uppercase;
        letter-spacing: 1.5px;
      }
      h3 { color: ${pc}; font-size: 14pt; border-left: 2px solid ${sc}; padding-left: 10px; }
      th { background: #1a1a2e !important; color: #fff !important; font-size: 9.5pt; }
      tr:nth-child(even) td { background: #f4f6fb; }
      .chart-container { border-top: none !important; border-left: 5px solid ${pc}; border-radius: 4px; background: #f8f9fc; }
      strong { color: #1a1a2e; }
      .section-break { border-top-color: #1a1a2e; }
      ul { list-style: none; padding-left: 20px; }
      ul li { position: relative; padding-left: 18px; margin-bottom: 7px; }
      ul li::before { content: '■'; position: absolute; left: 0; color: ${pc}; font-size: 8pt; top: 2px; }
      ol { list-style: none; counter-reset: step0; padding-left: 20px; }
      ol li { counter-increment: step0; position: relative; padding-left: 32px; margin-bottom: 10px; }
      ol li::before {
        content: counter(step0);
        position: absolute; left: 0; top: 0;
        width: 22px; height: 22px;
        background: ${pc}; color: #fff;
        font-size: 9pt; font-weight: 700;
        display: flex; align-items: center; justify-content: center;
        border-radius: 3px;
      }
      blockquote {
        border-left: 5px solid ${pc}; margin: 18px 0;
        background: #f0f4ff; padding: 14px 18px;
        border-radius: 0 6px 6px 0; color: #1a1a2e;
        font-style: normal;
      }
    `;

    // ── 1: 2-col corporate (Roboto Condensed, dash bullets, card callouts) ────
    case 1: return `
      @import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;700&display=swap');
      h2 {
        font-family: 'Roboto Condensed', sans-serif;
        font-size: 22pt; font-weight: 700; color: ${pc};
        text-transform: uppercase; letter-spacing: 3px;
        border-top: 3px solid ${pc}; border-bottom: 1px solid #dde3ed;
        padding: 10px 0 6px; margin-top: 48px; margin-bottom: 18px;
      }
      h3 { font-family: 'Roboto Condensed', sans-serif; font-size: 13pt; text-transform: uppercase; letter-spacing: 1px; color: ${sc}; }
      th { background: ${sc} !important; color: #fff !important; font-weight: 700; font-size: 9.5pt; text-transform: uppercase; letter-spacing: 0.5px; }
      tr:nth-child(odd) td { background: #eef1f8; }
      tr:nth-child(even) td { background: #ffffff; }
      .chart-container { border-top: 4px solid ${sc} !important; background: #f7f8fc; border-radius: 2px; }
      strong { color: ${sc}; }
      ul { list-style: none; padding-left: 16px; }
      ul li { padding-left: 22px; position: relative; margin-bottom: 6px; font-family: 'Roboto Condensed', sans-serif; }
      ul li::before { content: '—'; position: absolute; left: 0; color: ${sc}; font-weight: 700; }
      ol { list-style: none; counter-reset: corp1; padding-left: 16px; }
      ol li { counter-increment: corp1; padding-left: 36px; position: relative; margin-bottom: 9px; }
      ol li::before {
        content: counter(corp1, decimal-leading-zero);
        position: absolute; left: 0; top: 0;
        color: ${pc}; font-family: 'Roboto Condensed', sans-serif;
        font-size: 11pt; font-weight: 700; line-height: 1.4;
      }
      blockquote {
        border: 1px solid #dde3ed; border-top: 4px solid ${sc};
        margin: 18px 0; padding: 14px 18px;
        background: #f7f8fc; border-radius: 0 0 4px 4px;
        font-family: 'Roboto Condensed', sans-serif; font-style: normal;
      }
    `;

    // ── 2: Dark navy executive (navy bg headers, gold accents, diamond bullets) ─
    case 2: return `
      h2 {
        font-size: 17pt; font-weight: 800; letter-spacing: 2px;
        background: #0d1b3e; color: #ffffff !important;
        padding: 12px 20px; margin-top: 48px; margin-bottom: 16px;
        text-transform: uppercase; border-radius: 2px;
      }
      h3 { color: #c9a84c; font-size: 13pt; font-weight: 700; border-bottom: 1px solid #e0c97a; padding-bottom: 4px; }
      th { background: #0d1b3e !important; color: #c9a84c !important; font-size: 9.5pt; text-transform: uppercase; letter-spacing: 0.5px; }
      tr:nth-child(even) td { background: #f0f4ff; }
      td { border-color: #c8d0e7 !important; }
      .chart-container { background: #0d1b3e0d; border: 1px solid #0d1b3e33; border-top: 4px solid #c9a84c !important; border-radius: 2px; }
      strong { color: #c9a84c; }
      .section-break { border-top-color: #0d1b3e; }
      ul { list-style: none; padding-left: 18px; }
      ul li { padding-left: 20px; position: relative; margin-bottom: 7px; }
      ul li::before { content: '◆'; position: absolute; left: 0; color: #c9a84c; font-size: 8pt; top: 2px; }
      ol { list-style: none; counter-reset: exec2; padding-left: 16px; }
      ol li { counter-increment: exec2; padding-left: 40px; position: relative; margin-bottom: 12px; }
      ol li::before {
        content: counter(exec2);
        position: absolute; left: 0; top: -1px;
        width: 28px; height: 28px; border-radius: 50%;
        background: #0d1b3e; color: #c9a84c;
        font-size: 10pt; font-weight: 800;
        display: flex; align-items: center; justify-content: center;
        border: 2px solid #c9a84c;
      }
      blockquote {
        background: #0d1b3e; color: #c9a84c;
        border: none; margin: 18px 0; padding: 16px 20px;
        border-radius: 2px; font-style: normal; font-weight: 600;
      }
    `;

    // ── 3: Vertical timeline (filled circles, connecting dots, arc callouts) ───
    case 3: return `
      body { counter-reset: section-counter; }
      h2 {
        font-size: 19pt; font-weight: 700; color: ${pc};
        display: flex; align-items: center; gap: 16px;
        margin-top: 50px; margin-bottom: 16px;
        padding-bottom: 10px; border-bottom: 2px dashed ${pc}44;
      }
      h2::before {
        content: counter(section-counter, decimal-leading-zero);
        counter-increment: section-counter;
        background: ${pc}; color: #fff;
        font-size: 12pt; font-weight: 800; min-width: 40px; height: 40px;
        display: inline-flex; align-items: center; justify-content: center;
        border-radius: 50%; flex-shrink: 0;
      }
      h3 { color: ${sc}; font-size: 13pt; padding-left: 56px; }
      th { background: ${pc} !important; color: #fff !important; }
      td { border-color: #e0e7f0 !important; }
      tr:nth-child(even) td { background: #f5f8ff; }
      .chart-container { border-left: 4px solid ${pc} !important; border-top: none !important; border-radius: 0 8px 8px 0; background: #fafcff; }
      strong { color: ${pc}; }
      ul { list-style: none; padding-left: 16px; }
      ul li { padding-left: 22px; position: relative; margin-bottom: 8px; }
      ul li::before {
        content: '';
        position: absolute; left: 2px; top: 6px;
        width: 10px; height: 10px; border-radius: 50%;
        background: ${pc};
      }
      ol { list-style: none; counter-reset: tl3; padding-left: 16px; }
      ol li { counter-increment: tl3; padding-left: 44px; position: relative; margin-bottom: 14px; }
      ol li::before {
        content: counter(tl3);
        position: absolute; left: 0; top: 0;
        width: 30px; height: 30px; border-radius: 50%;
        background: ${pc}; color: #fff;
        font-size: 11pt; font-weight: 800;
        display: flex; align-items: center; justify-content: center;
      }
      ol li::after {
        content: '';
        position: absolute; left: 14px; top: 30px;
        width: 2px; height: calc(100% + 4px);
        background: ${pc}33;
      }
      ol li:last-child::after { display: none; }
      blockquote {
        border: 2px dashed ${pc}55; margin: 18px 0; padding: 14px 18px;
        background: ${pc}08; border-radius: 8px; font-style: normal;
        position: relative;
      }
      blockquote::before { content: '💡'; position: absolute; top: -10px; left: 14px; background: white; padding: 0 4px; font-size: 12pt; }
    `;

    // ── 4: Minimal circles (outline badges, outline bullets, light callouts) ───
    case 4: return `
      body { counter-reset: h2-counter; }
      h2 {
        font-size: 18pt; font-weight: 600; color: #2d3748;
        display: flex; align-items: center; gap: 14px;
        margin-top: 52px; margin-bottom: 14px;
      }
      h2::before {
        content: counter(h2-counter);
        counter-increment: h2-counter;
        width: 36px; height: 36px; border-radius: 50%;
        border: 2.5px solid ${pc}; color: ${pc};
        display: inline-flex; align-items: center; justify-content: center;
        font-size: 11pt; font-weight: 700; flex-shrink: 0;
      }
      h3 { color: ${pc}; font-size: 13pt; }
      th { background: ${pc}11 !important; color: #1a1a2e !important; border-bottom: 2px solid ${pc} !important; }
      td { border-color: #e8ecf4 !important; }
      tr:nth-child(even) td { background: #f9fbff; }
      table { border-radius: 8px; overflow: hidden; box-shadow: 0 1px 6px rgba(0,0,0,0.07); }
      .chart-container { border-top: none !important; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); background: #fff; border: 1px solid #e4eaf5; }
      strong { color: ${sc}; }
      ul { list-style: none; padding-left: 18px; }
      ul li { padding-left: 22px; position: relative; margin-bottom: 7px; }
      ul li::before {
        content: '';
        position: absolute; left: 2px; top: 5px;
        width: 11px; height: 11px; border-radius: 50%;
        border: 2px solid ${pc};
      }
      ol { list-style: none; counter-reset: min4; padding-left: 16px; }
      ol li { counter-increment: min4; padding-left: 40px; position: relative; margin-bottom: 10px; }
      ol li::before {
        content: counter(min4);
        position: absolute; left: 0; top: 0;
        width: 28px; height: 28px; border-radius: 50%;
        border: 2px solid ${pc}; color: ${pc};
        font-size: 10pt; font-weight: 700;
        display: flex; align-items: center; justify-content: center;
      }
      blockquote {
        border: 1px solid ${pc}44; border-radius: 8px;
        margin: 18px 0; padding: 14px 18px;
        background: #fafcff; font-style: normal;
        box-shadow: 0 1px 4px rgba(0,0,0,0.05);
      }
    `;

    // ── 5: Ghost chapter numbers (watermark nums, arrow bullets, ghost callout) ─
    case 5: return `
      body { counter-reset: ghost-counter; }
      h2 {
        position: relative; overflow: visible;
        font-size: 19pt; font-weight: 800; color: #1a1a2e;
        margin-top: 56px; margin-bottom: 10px;
        padding-top: 4px; border-bottom: 3px solid ${pc};
        padding-bottom: 6px;
      }
      h2::before {
        content: counter(ghost-counter, decimal-leading-zero);
        counter-increment: ghost-counter;
        position: absolute; top: -18px; left: -6px;
        font-size: 72pt; font-weight: 900; color: ${pc}14;
        line-height: 1; z-index: 0; pointer-events: none;
        font-style: italic;
      }
      h3 { color: ${sc}; font-size: 13pt; letter-spacing: 0.5px; }
      table { border-collapse: separate; border-spacing: 0; }
      th { background: transparent !important; color: ${pc} !important; border-bottom: 2px solid ${pc} !important; border-top: none !important; border-left: none !important; border-right: none !important; font-size: 9.5pt; text-transform: uppercase; letter-spacing: 0.5px; }
      td { border-top: none !important; border-left: none !important; border-right: none !important; border-bottom: 1px solid #e8ecf0 !important; }
      tr:nth-child(even) td { background: #f8fafc; }
      .chart-container { border: none !important; background: transparent; padding: 10px 0; border-bottom: 2px solid ${pc}22 !important; border-radius: 0 !important; }
      strong { color: ${pc}; font-style: italic; }
      ul { list-style: none; padding-left: 20px; }
      ul li { padding-left: 22px; position: relative; margin-bottom: 7px; }
      ul li::before { content: '→'; position: absolute; left: 0; color: ${pc}; font-weight: 700; }
      ol { list-style: none; counter-reset: ghost5; padding-left: 16px; }
      ol li { counter-increment: ghost5; padding-left: 36px; position: relative; margin-bottom: 9px; }
      ol li::before {
        content: counter(ghost5);
        position: absolute; left: 0; top: -4px;
        font-size: 28pt; font-weight: 900; color: ${pc}22;
        line-height: 1; font-style: italic;
      }
      blockquote {
        border: 1px dashed ${pc}44; margin: 20px 0; padding: 14px 18px;
        background: transparent; border-radius: 4px; font-style: italic;
        color: #555;
      }
    `;

    // ── 6: Newspaper editorial (Playfair, em-dash, editorial callouts) ─────────
    case 6: return `
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&display=swap');
      h2 {
        font-family: 'Playfair Display', Georgia, serif !important;
        font-size: 24pt; font-weight: 800; color: #111;
        border-top: 4px double #111; border-bottom: 1px solid #111;
        padding: 8px 0 6px; margin-top: 52px; margin-bottom: 16px;
        text-transform: none; letter-spacing: 0;
      }
      h3 { font-family: 'Playfair Display', Georgia, serif; color: ${sc}; font-size: 14pt; font-style: italic; }
      th { background: #111 !important; color: #fff !important; font-size: 9.5pt; }
      td { border-color: #aaa !important; }
      tr:nth-child(even) td { background: #f5f5f0; }
      .chart-container { border: 2px solid #111 !important; border-top: none !important; border-radius: 0 !important; background: #fffef8; }
      .chart-container::before { content: ''; display: block; height: 6px; background: repeating-linear-gradient(90deg, #111 0, #111 6px, transparent 6px, transparent 12px); margin-bottom: 16px; }
      strong { color: #111; font-weight: 700; font-style: italic; }
      body { color: #222; }
      ul { list-style: none; padding-left: 18px; }
      ul li { padding-left: 24px; position: relative; margin-bottom: 7px; font-style: normal; }
      ul li::before { content: '—'; position: absolute; left: 0; color: ${sc}; font-family: 'Playfair Display', Georgia, serif; font-weight: 700; }
      ol { list-style: none; counter-reset: news6; padding-left: 16px; }
      ol li { counter-increment: news6; padding-left: 30px; position: relative; margin-bottom: 9px; }
      ol li::before {
        content: counter(news6) '.';
        position: absolute; left: 0;
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 11pt; font-weight: 700; color: #111;
      }
      blockquote {
        border-top: 4px double #111; border-bottom: 4px double #111;
        margin: 20px 0; padding: 14px 24px;
        background: #fffef8; font-family: 'Playfair Display', Georgia, serif;
        font-style: italic; font-size: 12pt; color: #333;
        text-align: center;
      }
    `;

    // ── 7: Mini section cards (gradient pills, gradient dots, gradient callouts) ─
    case 7: return `
      body { counter-reset: card-counter; background: #f4f6fb; }
      .content { background: #f4f6fb; }
      h2 {
        counter-increment: card-counter;
        font-size: 13pt; font-weight: 700; color: #fff;
        background: linear-gradient(90deg, ${pc}, ${sc});
        display: inline-flex; align-items: center; gap: 10px;
        padding: 8px 20px 8px 14px; border-radius: 100px;
        margin-top: 44px; margin-bottom: 14px; text-transform: uppercase;
        letter-spacing: 1px;
      }
      h2::before {
        content: counter(card-counter);
        background: rgba(255,255,255,0.3); width: 26px; height: 26px;
        border-radius: 50%; display: inline-flex; align-items: center;
        justify-content: center; font-size: 10pt; font-weight: 800; flex-shrink: 0;
      }
      h3 { color: ${pc}; font-size: 13pt; font-weight: 700; }
      table { border-radius: 10px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.1); background: #fff; }
      th { background: linear-gradient(90deg, ${pc}, ${sc}) !important; color: #fff !important; font-size: 9.5pt; border: none !important; }
      td { border-color: #e4eaf5 !important; background: #fff; }
      tr:nth-child(even) td { background: #f0f4ff; }
      .chart-container { background: #fff !important; border-radius: 12px !important; border: none !important; box-shadow: 0 4px 16px rgba(0,0,0,0.1); border-top: none !important; }
      strong { color: ${sc}; }
      ul { list-style: none; padding-left: 18px; }
      ul li { padding-left: 20px; position: relative; margin-bottom: 7px; }
      ul li::before {
        content: '';
        position: absolute; left: 0; top: 6px;
        width: 10px; height: 10px; border-radius: 50%;
        background: linear-gradient(135deg, ${pc}, ${sc});
      }
      ol { list-style: none; counter-reset: card7; padding-left: 16px; }
      ol li { counter-increment: card7; padding-left: 44px; position: relative; margin-bottom: 10px; }
      ol li::before {
        content: counter(card7);
        position: absolute; left: 0; top: 0;
        background: linear-gradient(135deg, ${pc}, ${sc}); color: #fff;
        font-size: 9pt; font-weight: 800;
        padding: 3px 10px; border-radius: 100px; min-width: 24px; text-align: center;
      }
      blockquote {
        background: linear-gradient(135deg, ${pc}11, ${sc}11);
        border: none; border-radius: 10px;
        margin: 18px 0; padding: 16px 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.07);
        font-style: normal;
      }
    `;

    // ── 8: Elegant serif (EB Garamond, ornamental bullets, centred callouts) ───
    case 8: return `
      @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,500;0,700;1,400&display=swap');
      h2 {
        font-family: 'EB Garamond', Georgia, serif !important;
        font-size: 22pt; font-weight: 500; color: ${sc};
        text-align: center; letter-spacing: 3px; text-transform: uppercase;
        margin-top: 54px; margin-bottom: 8px; padding-bottom: 0;
      }
      h2::after {
        content: '';
        display: block; width: 60px; height: 2px;
        background: linear-gradient(90deg, transparent, ${pc}, transparent);
        margin: 10px auto 14px;
      }
      h3 { font-family: 'EB Garamond', Georgia, serif; color: ${pc}; font-size: 15pt; font-style: italic; font-weight: 500; }
      p { font-size: 11.5pt; line-height: 1.9; }
      th { background: ${sc} !important; color: #f5efe0 !important; font-family: 'EB Garamond', serif; font-size: 11pt; font-style: italic; letter-spacing: 0.5px; border: none !important; }
      td { border-color: #d4c9a8 !important; font-family: 'EB Garamond', serif; font-size: 11pt; }
      tr:nth-child(even) td { background: #fdf9f2; }
      .chart-container { border: 1px solid #d4c9a8 !important; border-top: 2px solid ${pc} !important; background: #fefcf8 !important; border-radius: 4px; }
      strong { color: ${pc}; font-style: italic; font-weight: 700; }
      body { color: #2d2416; }
      ul { list-style: none; padding-left: 18px; }
      ul li { padding-left: 22px; position: relative; margin-bottom: 8px; font-family: 'EB Garamond', serif; font-size: 11.5pt; }
      ul li::before { content: '✦'; position: absolute; left: 0; color: ${pc}; font-size: 9pt; top: 2px; }
      ol { list-style: none; counter-reset: ser8; padding-left: 16px; }
      ol li { counter-increment: ser8; padding-left: 32px; position: relative; margin-bottom: 9px; font-family: 'EB Garamond', serif; font-size: 11.5pt; }
      ol li::before {
        content: counter(ser8, lower-roman) '.';
        position: absolute; left: 0;
        font-family: 'EB Garamond', Georgia, serif;
        font-size: 11pt; font-style: italic; color: ${sc};
      }
      blockquote {
        border-top: 1px solid ${pc}; border-bottom: 1px solid ${pc};
        margin: 22px auto; padding: 18px 28px;
        background: #fefcf8; max-width: 90%; text-align: center;
        font-family: 'EB Garamond', Georgia, serif;
        font-size: 13pt; font-style: italic; color: ${sc};
      }
    `;

    // ── 9: Pill badge sidebar (pill bullets, pill numbers, sidebar callout) ────
    case 9: return `
      body { counter-reset: pill-counter; }
      h2 {
        counter-increment: pill-counter;
        font-size: 18pt; font-weight: 700; color: #1a1a2e;
        display: flex; align-items: center; gap: 14px;
        margin-top: 52px; margin-bottom: 16px;
        padding-bottom: 12px; border-bottom: 1px solid #e4eaf5;
      }
      h2::before {
        content: counter(pill-counter);
        background: ${pc}; color: #fff;
        font-size: 10pt; font-weight: 800;
        padding: 4px 14px; border-radius: 100px; flex-shrink: 0;
        min-width: 32px; text-align: center;
      }
      h3 { color: ${pc}; font-size: 13pt; font-weight: 600;
        background: ${pc}11; border-radius: 4px; padding: 4px 10px; display: inline-block;
      }
      th {
        background: ${pc} !important; color: #fff !important;
        font-size: 9.5pt; border-radius: 0;
      }
      td { border-color: #dde5f0 !important; }
      tr:nth-child(odd) td { background: #f8faff; }
      tr:nth-child(even) td { background: #ffffff; }
      td:first-child { font-weight: 600; color: ${sc}; }
      .chart-container {
        border-top: none !important;
        border-left: 6px solid ${pc} !important;
        border-radius: 0 10px 10px 0 !important;
        background: #f8faff !important;
      }
      strong { color: ${pc}; font-weight: 700; }
      ul { list-style: none; padding-left: 18px; }
      ul li { padding-left: 22px; position: relative; margin-bottom: 7px; }
      ul li::before {
        content: '●';
        position: absolute; left: 0; color: ${pc};
        background: ${pc}22; border-radius: 100px;
        width: 14px; height: 14px; text-align: center;
        font-size: 7pt; line-height: 14px;
        top: 2px;
      }
      ol { list-style: none; counter-reset: pill9; padding-left: 16px; }
      ol li { counter-increment: pill9; padding-left: 44px; position: relative; margin-bottom: 10px; }
      ol li::before {
        content: counter(pill9);
        position: absolute; left: 0; top: 0;
        background: ${pc}; color: #fff;
        font-size: 9pt; font-weight: 800;
        padding: 3px 11px; border-radius: 100px;
        min-width: 24px; text-align: center;
      }
      blockquote {
        border-left: 6px solid ${pc}; margin: 18px 0;
        background: #f8faff; padding: 14px 18px;
        border-radius: 0 8px 8px 0; font-style: normal;
        border-right: 1px solid #dde5f0; border-top: 1px solid #dde5f0; border-bottom: 1px solid #dde5f0;
      }
    `;

    default: return '';
  }
}

// ─── TOC Template System ────────────────────────────────────────────────────

interface TOCItem { text: string; href: string; num: number; }

function pickTOCStyle(planId: string): number {
  // Stable hash so the same plan always gets the same style
  let h = 0;
  for (let i = 0; i < planId.length; i++) {
    h = ((h << 5) - h + planId.charCodeAt(i)) >>> 0;
  }
  return h % 10;
}

function generateTOCHTML(items: TOCItem[], planId: string, pc: string, sc: string, styleOverride?: number | null): string {
  if (!items.length) return '';
  const style = (styleOverride !== null && styleOverride !== undefined)
    ? Math.max(0, Math.min(9, styleOverride))
    : pickTOCStyle(planId);
  const yr = new Date().getFullYear();

  switch (style) {

    case 0: { // Classic: left-border, dotted separators
      const rows = items.map(it =>
        `<div style="display:flex;align-items:center;padding:8px 0;border-bottom:1px dotted #ddd;">
          <span style="color:${pc};font-weight:700;min-width:30px;font-size:10pt;">${it.num}.</span>
          <a href="#${it.href}" style="color:#1a1a1a;text-decoration:none;font-size:10.5pt;">${it.text}</a>
        </div>`).join('');
      return `<div style="background:#f8fafc;border-left:5px solid ${pc};padding:28px 34px;border-radius:6px;margin:20px 0;page-break-after:always;">
        <h2 style="color:${pc};font-size:15pt;font-weight:700;border-bottom:2px solid ${pc};padding-bottom:10px;margin-bottom:18px;letter-spacing:1px;">TABLE OF CONTENTS</h2>
        ${rows}</div>`;
    }

    case 1: { // Corporate 2-column with dark header
      const half = Math.ceil(items.length / 2);
      const renderHalf = (slice: TOCItem[]) => slice.map(it =>
        `<div style="padding:7px 0;border-bottom:1px solid #e2e8f0;">
          <span style="color:${pc};font-weight:700;font-size:9pt;">${it.num}.</span>&nbsp;
          <a href="#${it.href}" style="color:#1a1a1a;text-decoration:none;font-size:10pt;">${it.text}</a>
        </div>`).join('');
      return `<div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin:20px 0;page-break-after:always;box-shadow:0 2px 8px rgba(0,0,0,.06);">
        <div style="background:${pc};padding:18px 26px;">
          <h2 style="color:#fff;font-size:15pt;font-weight:700;margin:0;letter-spacing:1.5px;">TABLE OF CONTENTS</h2>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0;padding:20px 26px;">
          <div style="padding-right:18px;border-right:1px solid #e2e8f0;">${renderHalf(items.slice(0, half))}</div>
          <div style="padding-left:18px;">${renderHalf(items.slice(half))}</div>
        </div></div>`;
    }

    case 2: { // Dark executive card — navy bg, numbered circle badges
      const rows = items.map(it =>
        `<div style="display:flex;align-items:center;gap:14px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.1);">
          <span style="background:${pc};color:#fff;font-weight:700;font-size:9pt;min-width:26px;height:26px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">${it.num}</span>
          <a href="#${it.href}" style="color:#e2e8f0;text-decoration:none;font-size:10.5pt;">${it.text}</a>
        </div>`).join('');
      return `<div style="background:#1e293b;padding:32px;border-radius:10px;margin:20px 0;page-break-after:always;">
        <h2 style="color:#fff;font-size:16pt;font-weight:700;letter-spacing:2px;border-bottom:2px solid ${pc};padding-bottom:12px;margin-bottom:20px;">TABLE OF CONTENTS</h2>
        ${rows}</div>`;
    }

    case 3: { // Vertical timeline with connecting line
      const rows = items.map((it, idx) =>
        `<div style="display:flex;gap:0;align-items:flex-start;min-height:44px;">
          <div style="display:flex;flex-direction:column;align-items:center;min-width:36px;">
            <div style="background:${pc};color:#fff;font-weight:700;font-size:9pt;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;z-index:1;flex-shrink:0;">${it.num}</div>
            ${idx < items.length - 1 ? `<div style="width:2px;flex:1;min-height:16px;background:#e2e8f0;"></div>` : ''}
          </div>
          <div style="padding:4px 0 12px 14px;">
            <a href="#${it.href}" style="color:#1a1a1a;text-decoration:none;font-size:10.5pt;">${it.text}</a>
          </div>
        </div>`).join('');
      return `<div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:28px 32px;margin:20px 0;page-break-after:always;">
        <h2 style="color:${pc};font-size:15pt;font-weight:700;margin-bottom:24px;letter-spacing:1px;">TABLE OF CONTENTS</h2>
        ${rows}</div>`;
    }

    case 4: { // Minimal: circle-outline numbers, hairline separators
      const rows = items.map(it =>
        `<div style="display:flex;align-items:center;padding:10px 0;border-bottom:1px solid #f1f5f9;">
          <div style="width:30px;height:30px;border-radius:50%;border:2px solid ${pc};display:inline-flex;align-items:center;justify-content:center;margin-right:14px;flex-shrink:0;">
            <span style="color:${pc};font-weight:700;font-size:9pt;">${it.num}</span>
          </div>
          <a href="#${it.href}" style="color:#374151;text-decoration:none;font-size:10.5pt;">${it.text}</a>
        </div>`).join('');
      return `<div style="padding:28px 0;margin:20px 0;page-break-after:always;border-top:3px solid ${pc};">
        <h2 style="color:#1a1a1a;font-size:13pt;font-weight:600;letter-spacing:3px;margin-bottom:24px;text-transform:uppercase;">Table of Contents</h2>
        ${rows}</div>`;
    }

    case 5: { // Ghost oversized numbers behind text
      const rows = items.map(it =>
        `<div style="position:relative;padding:6px 0 6px 60px;min-height:36px;border-bottom:1px dotted #e2e8f0;">
          <span style="position:absolute;left:0;top:50%;transform:translateY(-50%);font-size:28pt;font-weight:900;color:${pc};opacity:.12;line-height:1;pointer-events:none;">${String(it.num).padStart(2,'0')}</span>
          <span style="position:absolute;left:0;top:50%;transform:translateY(-50%);font-size:9.5pt;font-weight:700;color:${pc};width:50px;text-align:center;">${it.num}.</span>
          <a href="#${it.href}" style="color:#1a1a1a;text-decoration:none;font-size:10.5pt;font-weight:500;">${it.text}</a>
        </div>`).join('');
      return `<div style="background:#fafbff;border-radius:8px;padding:28px 32px;margin:20px 0;page-break-after:always;border-bottom:3px solid ${pc};">
        <h2 style="color:${pc};font-size:15pt;font-weight:800;letter-spacing:2px;margin-bottom:22px;text-transform:uppercase;">Table of Contents</h2>
        ${rows}</div>`;
    }

    case 6: { // Newspaper 3-column
      const t = Math.ceil(items.length / 3);
      const renderCol = (slice: TOCItem[]) => slice.map(it =>
        `<div style="padding:5px 0;font-size:9.5pt;">
          <span style="color:${pc};font-weight:700;">${it.num}.</span>
          <a href="#${it.href}" style="color:#374151;text-decoration:none;"> ${it.text}</a>
        </div>`).join('');
      return `<div style="background:#fff;border:1px solid #e5e7eb;padding:24px 28px;margin:20px 0;page-break-after:always;">
        <h2 style="color:${pc};font-size:13pt;font-weight:700;letter-spacing:2px;border-bottom:2px solid ${pc};padding-bottom:8px;margin-bottom:18px;text-transform:uppercase;">Contents</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0 20px;">
          <div style="border-right:1px solid #e5e7eb;padding-right:14px;">${renderCol(items.slice(0, t))}</div>
          <div style="border-right:1px solid #e5e7eb;padding:0 14px;">${renderCol(items.slice(t, t*2))}</div>
          <div style="padding-left:14px;">${renderCol(items.slice(t*2))}</div>
        </div></div>`;
    }

    case 7: { // Mini section cards in a 3-col grid
      const cards = items.map(it =>
        `<a href="#${it.href}" style="display:block;background:#f8fafc;border:1px solid #e2e8f0;border-top:3px solid ${pc};border-radius:6px;padding:12px 14px;text-decoration:none;break-inside:avoid;">
          <div style="color:${pc};font-weight:700;font-size:7.5pt;margin-bottom:4px;letter-spacing:.5px;">SECTION ${it.num}</div>
          <div style="color:#1a1a1a;font-size:9.5pt;font-weight:500;line-height:1.3;">${it.text}</div>
        </a>`).join('');
      return `<div style="background:#fff;padding:24px;border-radius:10px;border:1px solid #e2e8f0;margin:20px 0;page-break-after:always;">
        <h2 style="color:${pc};font-size:15pt;font-weight:700;margin-bottom:20px;letter-spacing:1px;">TABLE OF CONTENTS</h2>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">${cards}</div>
      </div>`;
    }

    case 8: { // Elegant serif centred header with em-dashes
      const rows = items.map(it =>
        `<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid #e8e8e8;">
          <div style="display:flex;align-items:center;gap:12px;">
            <span style="color:${pc};font-family:Georgia,serif;font-style:italic;font-size:11pt;min-width:22px;">${it.num}.</span>
            <a href="#${it.href}" style="color:#2d2d2d;text-decoration:none;font-family:Georgia,serif;font-size:10.5pt;">${it.text}</a>
          </div>
          <span style="color:#cbd5e1;font-size:8pt;font-family:Georgia,serif;white-space:nowrap;padding-left:10px;">— — —</span>
        </div>`).join('');
      return `<div style="background:#fefefe;border:1px solid #ddd;border-radius:4px;padding:36px 44px;margin:20px 0;page-break-after:always;">
        <div style="text-align:center;margin-bottom:28px;">
          <div style="color:${pc};font-size:8pt;letter-spacing:4px;text-transform:uppercase;margin-bottom:8px;font-family:Georgia,serif;">— ${yr} —</div>
          <h2 style="color:#1a1a1a;font-family:Georgia,serif;font-size:18pt;font-weight:normal;letter-spacing:2px;margin:0;">Table of Contents</h2>
          <div style="width:60px;height:2px;background:${pc};margin:12px auto 0;"></div>
        </div>
        ${rows}</div>`;
    }

    case 9: { // Left accent bar with pill-badge numbers
      const rows = items.map(it =>
        `<div style="display:flex;align-items:center;gap:12px;padding:8px 16px;border-bottom:1px solid #f1f5f9;">
          <span style="background:${pc};color:#fff;font-weight:700;font-size:8.5pt;padding:3px 10px;border-radius:12px;white-space:nowrap;flex-shrink:0;">${it.num}</span>
          <a href="#${it.href}" style="color:#1a1a1a;text-decoration:none;font-size:10.5pt;">${it.text}</a>
        </div>`).join('');
      return `<div style="background:#fff;border-radius:8px;overflow:hidden;margin:20px 0;page-break-after:always;border:1px solid #e2e8f0;">
        <div style="display:flex;">
          <div style="background:${pc};width:8px;flex-shrink:0;"></div>
          <div style="flex:1;">
            <div style="padding:18px 20px;border-bottom:2px solid #f1f5f9;">
              <h2 style="color:${pc};font-size:15pt;font-weight:700;margin:0;letter-spacing:1px;">TABLE OF CONTENTS</h2>
            </div>
            ${rows}
          </div>
        </div></div>`;
    }

    default:
      return '';
  }
}

// ─── Main content renderer ───────────────────────────────────────────────────

function formatContentWithCharts(markdown: string, chartData: ChartDataPayload | null, primaryColor: string, skipTitle: boolean = false, planId: string = '', secondaryColor: string = '#1e3a5f', tocStyleOverride?: number | null): string {
  const lines = markdown.split('\n');
  let html = '';
  let currentSection = '';
  let lastH2Title = '';
  const usedCharts = new Set<ChartType>();
  
  let inToc = false;
  let tocItems: TOCItem[] = [];
  let skippedTitle = false; // Track if we've already skipped the first title block
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('## ')) {
      const sectionTitle = line.slice(3).trim();
      const normalizedTitle = sectionTitle.replace(/^\d+\.\s*/, '').toLowerCase().trim();
      const normalizedLast = lastH2Title.replace(/^\d+\.\s*/, '').toLowerCase().trim();
      
      if (normalizedTitle === normalizedLast) {
        continue;
      }
      
      // Handle TABLE OF CONTENTS section specially
      if (sectionTitle.toUpperCase() === 'TABLE OF CONTENTS') {
        inToc = true;
        tocItems = [];
        continue;
      } else if (inToc) {
        // Close TOC section — render with the chosen template
        html += generateTOCHTML(tocItems, planId, primaryColor, secondaryColor, tocStyleOverride) + '\n';
        tocItems = [];
        inToc = false;
      }
      
      currentSection = sectionTitle;
      lastH2Title = sectionTitle;
      const sectionId = sectionTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      html += `<h2 id="${sectionId}">${sectionTitle}</h2>\n`;
      
      if (chartData) {
        const chartsForSection = findChartsForSection(sectionTitle);
        for (const chartType of chartsForSection) {
          if (!usedCharts.has(chartType)) {
            usedCharts.add(chartType);
            try {
              const svg = generateSVGChart(chartType, chartData);
              if (svg) {
                html += `<div class="chart-container inline-chart">${svg}</div>\n`;
              }
            } catch (e) {
              console.error(`Failed to generate ${chartType} chart:`, e);
            }
          }
        }
      }
    } else if (line.startsWith('# ')) {
      // Skip the first H1 heading entirely when using custom cover (the cover already has the title)
      if (skipTitle && !skippedTitle) {
        skippedTitle = true;
        // Also skip the next few lines (industry, tier, date info) as they're on the custom cover
        while (i + 1 < lines.length) {
          const nextLine = lines[i + 1]?.trim() || '';
          if (nextLine.startsWith('**') || nextLine === '') {
            i++;
          } else {
            break;
          }
        }
        continue;
      }
      html += `<h1>${line.slice(2)}</h1>\n`;
    } else if (line.startsWith('#### ')) {
      html += `<h4>${line.slice(5)}</h4>\n`;
    } else if (line.startsWith('### ')) {
      html += `<h3>${line.slice(4)}</h3>\n`;
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!html.endsWith('</ul>\n') && !html.includes('<ul>') || html.lastIndexOf('</ul>') > html.lastIndexOf('<ul>')) {
        html += '<ul>\n';
      }
      html += `<li>${formatInline(line.slice(2))}</li>\n`;
      const nextLine = lines[i + 1]?.trim() || '';
      if (!nextLine.startsWith('- ') && !nextLine.startsWith('* ')) {
        html += '</ul>\n';
      }
    } else if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^\d+\.\s(.+)$/);
      if (match) {
        // If we're in the Table of Contents, collect as a TOC item
        if (inToc) {
          const linkMatch = match[1].match(/\[([^\]]+)\]\(#([^)]+)\)/);
          if (linkMatch) {
            tocItems.push({ text: linkMatch[1], href: linkMatch[2], num: tocItems.length + 1 });
          } else {
            const text = match[1].replace(/\*\*/g, '').trim();
            const href = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            tocItems.push({ text, href, num: tocItems.length + 1 });
          }
        } else {
          if (!html.endsWith('</ol>\n') && (!html.includes('<ol>') || html.lastIndexOf('</ol>') > html.lastIndexOf('<ol>'))) {
            html += '<ol>\n';
          }
          html += `<li>${formatInline(match[1])}</li>\n`;
          const nextLine = lines[i + 1]?.trim() || '';
          if (!/^\d+\.\s/.test(nextLine)) {
            html += '</ol>\n';
          }
        }
      }
    } else if (line === '---') {
      // Close TOC if we hit a separator while still in TOC
      if (inToc) {
        html += generateTOCHTML(tocItems, planId, primaryColor, secondaryColor, tocStyleOverride) + '\n';
        tocItems = [];
        inToc = false;
      }
      html += '<hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">\n';
    } else if (line.startsWith('|') && line.includes('|', 1)) {
      // ── Markdown table parser ──────────────────────────────────────────────
      // Collect all consecutive pipe-delimited rows (including separator)
      const tableLines: string[] = [line];
      while (i + 1 < lines.length) {
        const next = lines[i + 1].trim();
        if (next.startsWith('|') && next.includes('|', 1)) {
          tableLines.push(next);
          i++;
        } else {
          break;
        }
      }

      // Locate separator row: only dashes, colons, pipes and spaces
      let sepIdx = -1;
      for (let j = 0; j < tableLines.length; j++) {
        if (/^\|[\s:|-]+\|$/.test(tableLines[j]) &&
            tableLines[j].replace(/[|:\s-]/g, '').length === 0) {
          sepIdx = j;
          break;
        }
      }

      // Split a row into cell strings
      const parseCells = (row: string): string[] =>
        row.split('|')
           .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
           .map(c => c.trim());

      let headerCells: string[] = [];
      let bodyRows: string[][] = [];

      if (sepIdx === 1) {
        headerCells = parseCells(tableLines[0]);
        bodyRows = tableLines.slice(2).map(parseCells);
      } else if (sepIdx > 1) {
        headerCells = parseCells(tableLines[0]);
        bodyRows = tableLines.slice(sepIdx + 1).map(parseCells);
      } else {
        bodyRows = tableLines.filter((_, j) => j !== sepIdx).map(parseCells);
      }

      const colCount = headerCells.length || bodyRows[0]?.length || 0;
      const nonEmptyRows = bodyRows.filter(row => row.some(cell => cell.trim().length > 0));
      const tableTextLengths: number[] = [];
      nonEmptyRows.forEach(row => {
        for (let ci = 0; ci < colCount; ci++) {
          tableTextLengths.push(row[ci]?.trim().length || 0);
        }
      });
      const maxCellLength = Math.max(0, ...tableTextLengths);
      const averageRowTextLength = nonEmptyRows.length
        ? nonEmptyRows.reduce((sum, row) => sum + row.join(' ').trim().length, 0) / nonEmptyRows.length
        : 0;
      const hasSparseLongRows = nonEmptyRows.some(row => {
        const filledCells = Array.from({ length: colCount }, (_, ci) => row[ci]?.trim() || '').filter(Boolean);
        return filledCells.length <= 2 && row.join(' ').length > 180;
      });
      const shouldRenderAsCards =
        colCount >= 4 &&
        (maxCellLength > 220 || averageRowTextLength > 360 || hasSparseLongRows);

      if (colCount === 0) {
        // Cannot parse — render as plain paragraphs
        for (const tl of tableLines) {
          html += `<p>${formatInline(tl)}</p>\n`;
        }
      } else if (shouldRenderAsCards) {
        html += '<div class="stacked-table">\n';
        nonEmptyRows.forEach((row, ri) => {
          const firstCell = row[0]?.trim() || `Item ${ri + 1}`;
          html += '<div class="stacked-table-card">\n';
          html += `<div class="stacked-table-title">${formatInline(firstCell)}</div>\n`;

          for (let ci = 1; ci < colCount; ci++) {
            const value = row[ci]?.trim();
            if (!value) continue;
            const label = headerCells[ci]?.trim() || `Column ${ci + 1}`;
            html += `<div class="stacked-table-field"><div class="stacked-table-label">${formatInline(label)}</div><div class="stacked-table-value">${formatInline(value)}</div></div>\n`;
          }

          html += '</div>\n';
        });
        html += '</div>\n';
      } else {
        // Render as a proper HTML table
        let t = `<div class="table-wrapper"><table style="width:100%;border-collapse:collapse;font-size:8.5pt;">`;

        if (headerCells.length > 0) {
          t += `<thead><tr>`;
          for (const cell of headerCells) {
            t += `<th style="background:${primaryColor};color:#fff;padding:5px 7px;border:1px solid ${primaryColor};font-weight:600;word-break:break-word;white-space:normal;">${formatInline(cell)}</th>`;
          }
          t += `</tr></thead>`;
        }

        if (bodyRows.length > 0) {
          t += `<tbody>`;
          bodyRows.forEach((row, ri) => {
            if (row.length === 0) return;
            const bg = ri % 2 === 0 ? '#ffffff' : '#f8fafc';
            t += `<tr style="background:${bg};">`;
            for (let ci = 0; ci < colCount; ci++) {
              t += `<td style="padding:5px 7px;border:1px solid #e2e8f0;word-break:break-word;white-space:normal;">${formatInline(row[ci] || '')}</td>`;
            }
            t += `</tr>`;
          });
          t += `</tbody>`;
        }

        t += `</table></div>\n`;
        html += t;
      }
    } else if (line.length > 0) {
      html += `<p>${formatInline(line)}</p>\n`;
    }
  }
  
  // Close TOC if we're still in it at the end of content
  if (inToc) {
    html += generateTOCHTML(tocItems, planId, primaryColor, secondaryColor, tocStyleOverride) + '\n';
    tocItems = [];
  }
  
  if (chartData) {
    const remainingCharts: ChartType[] = [];
    const allChartTypes: ChartType[] = ['kpi', 'funding', 'financial', 'market', 'revenue_streams', 'unit_economics', 
      'customer_journey', 'competitor', 'gtm_channels', 'growth', 'hiring', 'tech_stack', 
      'risk', 'compliance', 'milestones', 'timeline', 'pricing'];
    
    for (const chartType of allChartTypes) {
      if (!usedCharts.has(chartType)) {
        remainingCharts.push(chartType);
      }
    }
    
    if (remainingCharts.length > 0) {
      html += `<div class="additional-visuals"><h2 style="color: ${primaryColor};">Additional Visual Analytics</h2>\n`;
      for (const chartType of remainingCharts) {
        try {
          const svg = generateSVGChart(chartType, chartData);
          if (svg) {
            html += `<div class="chart-container inline-chart">${svg}</div>\n`;
          }
        } catch (e) {
          console.error(`Failed to generate ${chartType} chart:`, e);
        }
      }
      html += '</div>';
    }
  }
  
  // Post-process: wrap any bare HTML <table> elements that the AI may have
  // embedded directly in the content. Markdown tables are already wrapped.
  // We detect bare tables by finding <table that is NOT immediately preceded by
  // the table-wrapper marker we set on markdown tables.
  html = html
    .replace(/(?<!table-wrapper">)(<table(?:\s[^>]*)?>)/g,
      '<div class="table-wrapper">$1')
    .replace(/<\/table>(?!\s*<\/div>)/g,
      '</table></div>');

  return html;
}

function findChartsForSection(sectionTitle: string): ChartType[] {
  for (const [key, charts] of Object.entries(SECTION_CHART_MAP)) {
    if (sectionTitle.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(sectionTitle.toLowerCase().split(' ')[0])) {
      return charts;
    }
  }
  
  const keywords: Record<string, ChartType[]> = {
    'executive': ['kpi'],
    'summary': ['kpi'],
    'overview': ['funding', 'kpi'],
    'financial': ['financial', 'unit_economics'],
    'finance': ['financial', 'unit_economics'],
    'revenue': ['revenue_streams', 'pricing'],
    'money': ['financial', 'funding'],
    'market': ['market', 'customer_journey'],
    'customer': ['customer_journey'],
    'target': ['customer_journey', 'market'],
    'competitor': ['competitor'],
    'competition': ['competitor'],
    'pricing': ['pricing'],
    'business model': ['pricing', 'revenue_streams'],
    'team': ['hiring'],
    'hiring': ['hiring'],
    'people': ['hiring'],
    'technology': ['tech_stack'],
    'tech': ['tech_stack'],
    'innovation': ['tech_stack'],
    'risk': ['risk'],
    'compliance': ['compliance'],
    'regulatory': ['compliance'],
    'legal': ['compliance'],
    'growth': ['growth'],
    'scale': ['growth', 'timeline'],
    'marketing': ['gtm_channels'],
    'go-to-market': ['gtm_channels'],
    'gtm': ['gtm_channels'],
    'milestone': ['milestones'],
    'roadmap': ['timeline', 'milestones'],
    'timeline': ['timeline'],
    'plan': ['milestones'],
    'funding': ['funding'],
    'investment': ['funding'],
  };
  
  const lowerTitle = sectionTitle.toLowerCase();
  for (const [keyword, charts] of Object.entries(keywords)) {
    if (lowerTitle.includes(keyword)) {
      return charts;
    }
  }
  
  return [];
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-family: monospace;">$1</code>');
}

export function generatePDFUrl(planId: string): string {
  return `/api/download/pdf/${planId}`;
}
