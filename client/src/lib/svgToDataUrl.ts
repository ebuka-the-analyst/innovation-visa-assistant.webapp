import { getThemeById } from './themeTemplates';

interface ThemeDecorations {
  topFull?: string;
  topLeft?: string;
  topRight?: string;
  leftSide?: string;
  rightEdge?: string;
  middleLeft?: string;
  middleRight?: string;
  middleWave?: string;
  bottomWave?: string;
  bottomLeft?: string;
  bottomRight?: string;
  background: string;
}

function getThemeDecorations(themeId: string, primaryColor: string, secondaryColor: string): ThemeDecorations {
  const primary = primaryColor;
  const accent = secondaryColor;

  switch (themeId) {
    case 'white-red-modern':
      return {
        topRight: `<g>
          <path d="M380,0 L520,0 Q520,140 380,140 Z" fill="${primary}" opacity="0.95" />
          <path d="M440,0 L520,0 Q520,80 440,80 Z" fill="${primary}" opacity="0.6" />
        </g>`,
        bottomLeft: `<g>
          <path d="M0,600 Q140,600 140,740 L0,740 Z" fill="${primary}" opacity="0.95" />
          <path d="M0,660 Q80,660 80,740 L0,740 Z" fill="${primary}" opacity="0.6" />
        </g>`,
        background: '#f8fafc'
      };

    case 'white-red-corporate':
      return {
        topLeft: `<g>
          <polygon points="0,0 120,0 60,100 0,100" fill="${primary}" opacity="0.9" />
          <polygon points="60,0 180,0 120,100 60,100" fill="${accent}" opacity="0.8" />
          <polygon points="120,0 200,0 140,80" fill="${primary}" opacity="0.4" />
        </g>`,
        bottomRight: `<g transform="translate(320, 640)">
          <rect x="0" y="0" width="200" height="8" fill="${primary}" opacity="0.9" />
          <rect x="20" y="15" width="180" height="6" fill="${accent}" opacity="0.5" />
          <rect x="40" y="28" width="160" height="8" fill="${primary}" opacity="0.9" />
          <polygon points="150,50 180,80 200,80 200,50" fill="${primary}" opacity="0.6" />
        </g>`,
        background: '#ffffff'
      };

    case 'blue-modern':
      return {
        topRight: `<g>
          <path d="M400,0 L520,0 L520,180 Q450,200 380,140 Z" fill="${primary}" opacity="0.25" />
          <path d="M460,0 L520,0 L520,120 Q490,130 450,80 Z" fill="${primary}" opacity="0.5" />
          <circle cx="480" cy="160" r="50" fill="${accent}" opacity="0.15" />
          <circle cx="480" cy="160" r="30" fill="${accent}" opacity="0.25" />
        </g>`,
        bottomLeft: `<g>
          <polygon points="0,650 180,740 0,740" fill="${primary}" opacity="0.95" />
          <polygon points="0,690 100,740 0,740" fill="${primary}" opacity="0.7" />
        </g>`,
        background: '#f0f9ff'
      };

    case 'navy-diagonal':
      return {
        topRight: `<g>
          <polygon points="200,0 520,0 520,180 280,140" fill="${primary}" opacity="0.95" />
          <polygon points="320,0 520,0 520,120 380,90" fill="${primary}" opacity="0.7" />
        </g>`,
        bottomRight: `<g>
          <polygon points="250,600 520,740 520,600" fill="${primary}" opacity="0.95" />
          <polygon points="350,650 520,740 520,650" fill="${primary}" opacity="0.7" />
        </g>`,
        bottomLeft: `<g>
          <polygon points="0,550 120,740 0,740" fill="${accent}" opacity="0.9" />
          <polygon points="0,620 80,740 0,740" fill="${primary}" opacity="0.6" />
        </g>`,
        background: '#ffffff'
      };

    case 'cyan-modern':
      return {
        topRight: `<g>
          <circle cx="520" cy="0" r="180" fill="${primary}" opacity="0.2" />
          <circle cx="520" cy="0" r="120" fill="${primary}" opacity="0.4" />
          <circle cx="520" cy="0" r="60" fill="${primary}" opacity="0.6" />
        </g>`,
        middleRight: `<g>
          <rect x="450" y="300" width="70" height="120" rx="10" fill="${accent}" opacity="0.9" />
          <rect x="460" y="310" width="50" height="100" rx="5" fill="${primary}" opacity="0.3" />
        </g>`,
        bottomLeft: `<g>
          <polygon points="0,600 150,740 0,740" fill="${primary}" opacity="0.9" />
          <polygon points="0,660 90,740 0,740" fill="${accent}" opacity="0.8" />
        </g>`,
        background: '#f8fafc'
      };

    case 'yellow-modern':
      return {
        topRight: `<g>
          <polygon points="380,0 520,0 520,160 440,200" fill="${primary}" opacity="0.95" />
          <polygon points="440,0 520,0 520,100 480,120" fill="${primary}" opacity="0.7" />
        </g>`,
        middleLeft: `<g>
          <polygon points="0,280 320,280 360,380 0,380" fill="${primary}" opacity="0.95" />
        </g>`,
        bottomLeft: `<g>
          <polygon points="0,580 120,740 0,740" fill="${accent}" opacity="0.95" />
          <polygon points="0,650 70,740 0,740" fill="${accent}" opacity="0.7" />
        </g>`,
        bottomRight: `<g>
          <polygon points="100,640 520,740 520,640" fill="${primary}" opacity="0.95" />
          <polygon points="180,670 520,740 520,670" fill="${primary}" opacity="0.7" />
        </g>`,
        background: '#ffffff'
      };

    case 'red-curved':
      return {
        topRight: `<g>
          <path d="M300,0 Q520,50 520,200 L520,0 Z" fill="${primary}" opacity="0.9" />
          <path d="M400,0 Q520,30 520,120 L520,0 Z" fill="${primary}" opacity="0.6" />
        </g>`,
        bottomLeft: `<g>
          <path d="M0,540 Q100,600 150,740 L0,740 Z" fill="${primary}" opacity="0.9" />
          <path d="M0,620 Q60,660 100,740 L0,740 Z" fill="${primary}" opacity="0.6" />
        </g>`,
        background: '#fef2f2'
      };

    case 'green-nature':
      return {
        topRight: `<g>
          <ellipse cx="520" cy="0" rx="200" ry="150" fill="${primary}" opacity="0.2" />
          <ellipse cx="520" cy="0" rx="140" ry="100" fill="${primary}" opacity="0.4" />
          <ellipse cx="520" cy="0" rx="80" ry="50" fill="${primary}" opacity="0.6" />
        </g>`,
        bottomLeft: `<g>
          <ellipse cx="0" cy="740" rx="180" ry="140" fill="${primary}" opacity="0.3" />
          <ellipse cx="0" cy="740" rx="120" ry="90" fill="${accent}" opacity="0.5" />
        </g>`,
        background: '#f0fdf4'
      };

    case 'purple-gradient':
      return {
        topFull: `<defs>
          <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${primary};stop-opacity:0.2" />
            <stop offset="100%" style="stop-color:${accent};stop-opacity:0.1" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="520" height="200" fill="url(#purpleGrad)" />`,
        topRight: `<g>
          <polygon points="400,0 520,0 520,150 450,180" fill="${primary}" opacity="0.8" />
          <polygon points="460,0 520,0 520,80" fill="${primary}" opacity="0.5" />
        </g>`,
        bottomLeft: `<g>
          <polygon points="0,580 100,740 0,740" fill="${accent}" opacity="0.9" />
          <polygon points="0,640 60,740 0,740" fill="${primary}" opacity="0.7" />
        </g>`,
        bottomRight: `<g>
          <polygon points="420,700 520,740 520,700" fill="${primary}" opacity="0.6" />
        </g>`,
        background: '#faf5ff'
      };

    case 'orange-energy':
      return {
        topRight: `<g>
          <polygon points="350,0 520,0 520,200" fill="${primary}" opacity="0.9" />
          <polygon points="420,0 520,0 520,130" fill="${primary}" opacity="0.6" />
          <polygon points="480,0 520,0 520,60" fill="${accent}" opacity="0.8" />
        </g>`,
        leftSide: `<g>
          <rect x="0" y="250" width="8" height="200" fill="${primary}" opacity="0.9" />
          <rect x="0" y="280" width="4" height="140" fill="${accent}" opacity="0.7" />
        </g>`,
        bottomLeft: `<g>
          <polygon points="0,600 160,740 0,740" fill="${primary}" opacity="0.9" />
          <polygon points="0,660 100,740 0,740" fill="${accent}" opacity="0.8" />
        </g>`,
        background: '#fff7ed'
      };

    case 'teal-minimal':
      return {
        topRight: `<g>
          <rect x="450" y="30" width="40" height="40" fill="${primary}" opacity="0.9" />
          <rect x="420" y="80" width="30" height="30" fill="${accent}" opacity="0.7" />
          <rect x="470" y="100" width="20" height="20" fill="${primary}" opacity="0.5" />
        </g>`,
        bottomLeft: `<g>
          <rect x="30" y="660" width="50" height="50" fill="${primary}" opacity="0.9" />
          <rect x="90" y="680" width="35" height="35" fill="${accent}" opacity="0.7" />
          <rect x="50" y="700" width="25" height="25" fill="${primary}" opacity="0.5" />
        </g>`,
        background: '#f0fdfa'
      };

    case 'pink-creative':
      return {
        topRight: `<g>
          <circle cx="480" cy="60" r="80" fill="${primary}" opacity="0.3" />
          <circle cx="500" cy="40" r="50" fill="${primary}" opacity="0.5" />
          <circle cx="460" cy="100" r="30" fill="${accent}" opacity="0.4" />
        </g>`,
        bottomLeft: `<g>
          <circle cx="60" cy="680" r="90" fill="${primary}" opacity="0.3" />
          <circle cx="40" cy="700" r="60" fill="${primary}" opacity="0.5" />
          <circle cx="100" cy="660" r="40" fill="${accent}" opacity="0.4" />
        </g>`,
        background: '#fdf2f8'
      };

    case 'slate-professional':
      return {
        topFull: `<rect x="0" y="0" width="520" height="80" fill="${primary}" opacity="0.95" />`,
        bottomLeft: `<g>
          <rect x="0" y="700" width="200" height="40" fill="${primary}" opacity="0.95" />
          <rect x="0" y="680" width="120" height="20" fill="${accent}" opacity="0.7" />
        </g>`,
        background: '#f8fafc'
      };

    case 'indigo-wave':
      return {
        topRight: `<g>
          <path d="M200,0 Q300,80 400,40 Q450,20 520,60 L520,0 Z" fill="${primary}" opacity="0.3" />
          <path d="M300,0 Q380,60 440,30 Q480,10 520,40 L520,0 Z" fill="${primary}" opacity="0.5" />
        </g>`,
        bottomWave: `<g>
          <path d="M0,680 Q100,720 200,700 Q300,680 400,710 Q450,730 520,700 L520,740 L0,740 Z" fill="${primary}" opacity="0.2" />
          <path d="M0,700 Q80,730 160,715 Q240,700 320,720 Q400,740 520,720 L520,740 L0,740 Z" fill="${primary}" opacity="0.4" />
        </g>`,
        background: '#eef2ff'
      };

    case 'amber-bold':
      return {
        topRight: `<g>
          <polygon points="300,0 520,0 520,180 380,100" fill="${primary}" opacity="0.95" />
          <polygon points="400,0 520,0 520,100 450,50" fill="${primary}" opacity="0.7" />
        </g>`,
        middleLeft: `<g>
          <rect x="0" y="350" width="180" height="12" fill="${primary}" opacity="0.9" />
          <rect x="0" y="370" width="120" height="8" fill="${accent}" opacity="0.7" />
        </g>`,
        bottomLeft: `<g>
          <polygon points="0,550 200,740 0,740" fill="${primary}" opacity="0.95" />
          <polygon points="0,620 130,740 0,740" fill="${primary}" opacity="0.7" />
        </g>`,
        background: '#fffbeb'
      };

    case 'hexagon-modern':
      return {
        topRight: `<g>
          <polygon points="480,30 510,50 510,90 480,110 450,90 450,50" fill="${primary}" opacity="0.9" />
          <polygon points="430,60 460,80 460,120 430,140 400,120 400,80" fill="${accent}" opacity="0.7" />
          <polygon points="460,0 490,20 490,60 460,80 430,60 430,20" fill="${primary}" opacity="0.5" />
        </g>`,
        bottomLeft: `<g>
          <polygon points="60,650 90,670 90,710 60,730 30,710 30,670" fill="${primary}" opacity="0.9" />
          <polygon points="100,680 130,700 130,740 100,760 70,740 70,700" fill="${accent}" opacity="0.7" transform="translate(0, -20)" />
          <polygon points="40,700 70,720 70,760 40,780 10,760 10,720" fill="${primary}" opacity="0.5" transform="translate(0, -40)" />
        </g>`,
        background: '#ffffff'
      };

    default:
      return {
        topRight: `<g>
          <polygon points="380,0 520,0 520,120" fill="${primary}" opacity="0.8" />
        </g>`,
        bottomLeft: `<g>
          <polygon points="0,620 140,740 0,740" fill="${primary}" opacity="0.8" />
        </g>`,
        background: '#f8fafc'
      };
  }
}

export function generateThemeSvgDataUrl(
  themeId: string,
  primaryColor: string,
  secondaryColor: string,
  font: string
): string {
  const decorations = getThemeDecorations(themeId, primaryColor, secondaryColor);
  
  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 740" width="520" height="740">
      <rect x="0" y="0" width="520" height="740" fill="${decorations.background}" />
      ${decorations.topFull || ''}
      ${decorations.topLeft || ''}
      ${decorations.topRight || ''}
      ${decorations.leftSide || ''}
      ${decorations.rightEdge || ''}
      ${decorations.middleLeft || ''}
      ${decorations.middleRight || ''}
      ${decorations.middleWave || ''}
      ${decorations.bottomWave || ''}
      ${decorations.bottomLeft || ''}
      ${decorations.bottomRight || ''}
    </svg>
  `;
  
  const encoded = encodeURIComponent(svgContent.trim());
  return `data:image/svg+xml,${encoded}`;
}

export function getDefaultTextElements(
  businessName: string = 'BUSINESS PLAN',
  founderName: string = 'Your Name',
  primaryColor: string = '#dc2626',
  secondaryColor: string = '#1e293b'
): Array<{
  id: string;
  content: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right';
}> {
  const currentYear = new Date().getFullYear();
  const businessParts = businessName.split(' ');
  const firstWord = businessParts[0] || 'BUSINESS';
  const restWords = businessParts.slice(1).join(' ') || 'PLAN';
  
  return [
    {
      id: `text-business-${Date.now()}-1`,
      content: firstWord.toUpperCase(),
      x: 40,
      y: 280,
      fontSize: 48,
      fontFamily: 'Inter',
      color: secondaryColor,
      fontWeight: 'bold',
      fontStyle: 'normal',
      textAlign: 'left',
    },
    {
      id: `text-plan-${Date.now()}-2`,
      content: restWords.toUpperCase(),
      x: 40,
      y: 335,
      fontSize: 48,
      fontFamily: 'Inter',
      color: primaryColor,
      fontWeight: 'bold',
      fontStyle: 'normal',
      textAlign: 'left',
    },
    {
      id: `text-presented-${Date.now()}-3`,
      content: 'PRESENTED BY :',
      x: 40,
      y: 400,
      fontSize: 14,
      fontFamily: 'Inter',
      color: '#64748b',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
    },
    {
      id: `text-founder-${Date.now()}-4`,
      content: founderName.toUpperCase(),
      x: 40,
      y: 430,
      fontSize: 24,
      fontFamily: 'Inter',
      color: secondaryColor,
      fontWeight: 'bold',
      fontStyle: 'normal',
      textAlign: 'left',
    },
    {
      id: `text-date-label-${Date.now()}-5`,
      content: 'DATE',
      x: 40,
      y: 480,
      fontSize: 12,
      fontFamily: 'Inter',
      color: '#64748b',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
    },
    {
      id: `text-date-${Date.now()}-6`,
      content: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
      x: 40,
      y: 505,
      fontSize: 18,
      fontFamily: 'Inter',
      color: secondaryColor,
      fontWeight: 'bold',
      fontStyle: 'normal',
      textAlign: 'left',
    },
  ];
}
