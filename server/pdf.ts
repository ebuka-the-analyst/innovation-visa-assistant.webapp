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
      margin: 2.5cm;
    }
    @page cover {
      margin: 0;
    }
    body {
      font-family: ${fontFamily};
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 210mm;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      font-size: 28pt;
      color: ${primaryColor};
      border-bottom: 3px solid ${primaryColor};
      padding-bottom: 10px;
      margin-bottom: 30px;
    }
    h2 {
      font-size: 20pt;
      color: ${primaryColor};
      margin-top: 40px;
      margin-bottom: 15px;
    }
    h3 {
      font-size: 16pt;
      color: ${secondaryColor};
      margin-top: 25px;
      margin-bottom: 10px;
    }
    h4 {
      font-size: 13pt;
      color: #333;
      margin-top: 20px;
      margin-bottom: 8px;
      font-weight: 600;
    }
    p {
      font-size: 11pt;
      text-align: justify;
      margin-bottom: 12px;
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
      margin: -20px;
      margin-bottom: 40px;
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
      margin: 20px 0;
      font-size: 10pt;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }
    th {
      background-color: ${primaryColor};
      font-weight: bold;
      color: white;
    }
    .financial-table th {
      background-color: ${primaryColor};
      color: white;
    }
    .financial-table td {
      padding: 12px;
    }
    .financial-table tr:nth-child(even) {
      background-color: #f8fafc;
    }
    .toc {
      background: #f8fafc;
      padding: 20px 30px;
      border-radius: 8px;
      margin: 20px 0;
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
      margin: 15px 0;
      padding-left: 30px;
    }
    li {
      margin-bottom: 8px;
      font-size: 11pt;
    }
    .section-break {
      margin-top: 50px;
      border-top: 2px solid ${primaryColor};
      padding-top: 30px;
    }
    strong {
      color: ${secondaryColor};
      font-weight: 600;
    }
    .chart-container {
      background: #fafafa;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
      text-align: center;
      border-top: 3px solid ${primaryColor};
    }
    .chart-container svg {
      max-width: 100%;
      height: auto;
    }
    .inline-chart {
      margin: 20px auto;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  ${generateCoverPageHTML(plan, primaryColor, secondaryColor)}
  
  <div class="content">
    ${formatContentWithCharts(content, chartData, primaryColor, plan.useFullCoverImage || false)}
  </div>
</body>
</html>
  `;
  
  return html;
}

function generateCoverPageHTML(plan: BusinessPlan & { backgroundImage?: string | null; useFullCoverImage?: boolean; textElements?: any[] | null; paletteId?: string | null }, primaryColor: string, secondaryColor: string): string {
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
    
    return `
    <div class="cover-page" style="position: relative; background: url('${plan.backgroundImage}') center/cover no-repeat; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
      ${textElementsHtml}
    </div>
    `;
  }
  
  // Standard themed cover page with SVG decorations
  const decorations = generateCoverPageSVG(themeId, primaryColor, secondaryColor);
  
  return `
  <div class="cover-page">
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

function formatContentWithCharts(markdown: string, chartData: ChartDataPayload | null, primaryColor: string, skipTitle: boolean = false): string {
  const lines = markdown.split('\n');
  let html = '';
  let currentSection = '';
  let lastH2Title = '';
  const usedCharts = new Set<ChartType>();
  
  let inToc = false;
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
        html += `<div class="toc"><h2>${sectionTitle}</h2><ol>\n`;
        continue;
      } else if (inToc) {
        // Close TOC section when we hit the next section
        html += `</ol></div>\n`;
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
        // If we're in the Table of Contents, format as TOC item with link
        if (inToc) {
          // Extract link text from markdown link format [text](#anchor)
          const linkMatch = match[1].match(/\[([^\]]+)\]\(#([^)]+)\)/);
          if (linkMatch) {
            html += `<li><a href="#${linkMatch[2]}">${linkMatch[1]}</a></li>\n`;
          } else {
            html += `<li>${formatInline(match[1])}</li>\n`;
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
        html += `</ol></div>\n`;
        inToc = false;
      }
      html += '<hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">\n';
    } else if (line.length > 0) {
      html += `<p>${formatInline(line)}</p>\n`;
    }
  }
  
  // Close TOC if we're still in it at the end of content
  if (inToc) {
    html += `</ol></div>\n`;
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
      html += `<div style="page-break-before: always;"><h2 style="color: ${primaryColor};">Additional Visual Analytics</h2>\n`;
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
