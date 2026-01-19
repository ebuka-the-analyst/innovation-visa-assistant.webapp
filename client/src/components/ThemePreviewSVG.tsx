import { useMemo } from "react";
import { Check } from "lucide-react";

interface ThemePreviewSVGProps {
  themeId: string;
  primaryColor: string;
  secondaryColor: string;
  font: string;
  businessName?: string;
  founderName?: string;
  isSelected?: boolean;
  size?: 'small' | 'large';
}

export function ThemePreviewSVG({
  themeId,
  primaryColor,
  secondaryColor,
  font,
  businessName = "Business Plan",
  founderName = "Your Name",
  isSelected = false,
  size = 'small'
}: ThemePreviewSVGProps) {
  const currentYear = new Date().getFullYear();
  const isLarge = size === 'large';
  const scale = isLarge ? 1 : 0.4;

  const getThemeDecorations = useMemo(() => {
    const primary = primaryColor;
    const accent = secondaryColor;

    switch (themeId) {
      case 'white-red-modern':
        return {
          topRight: (
            <g>
              <path d={`M380,0 L520,0 Q520,140 380,140 Z`} fill={primary} opacity="0.95" />
              <path d={`M440,0 L520,0 Q520,80 440,80 Z`} fill={primary} opacity="0.6" />
            </g>
          ),
          bottomLeft: (
            <g>
              <path d={`M0,600 Q140,600 140,740 L0,740 Z`} fill={primary} opacity="0.95" />
              <path d={`M0,660 Q80,660 80,740 L0,740 Z`} fill={primary} opacity="0.6" />
            </g>
          ),
          background: '#f8fafc'
        };

      case 'white-red-corporate':
        return {
          topLeft: (
            <g>
              <polygon points="0,0 120,0 60,100 0,100" fill={primary} opacity="0.9" />
              <polygon points="60,0 180,0 120,100 60,100" fill={accent} opacity="0.8" />
              <polygon points="120,0 200,0 140,80" fill={primary} opacity="0.4" />
            </g>
          ),
          bottomRight: (
            <g transform="translate(320, 640)">
              <rect x="0" y="0" width="200" height="8" fill={primary} opacity="0.9" />
              <rect x="20" y="15" width="180" height="6" fill={accent} opacity="0.5" />
              <rect x="40" y="28" width="160" height="8" fill={primary} opacity="0.9" />
              <polygon points="150,50 180,80 200,80 200,50" fill={primary} opacity="0.6" />
            </g>
          ),
          background: '#ffffff'
        };

      case 'blue-modern':
        return {
          topRight: (
            <g>
              <path d={`M400,0 L520,0 L520,180 Q450,200 380,140 Z`} fill={primary} opacity="0.25" />
              <path d={`M460,0 L520,0 L520,120 Q490,130 450,80 Z`} fill={primary} opacity="0.5" />
              <circle cx="480" cy="160" r="50" fill={accent} opacity="0.15" />
              <circle cx="480" cy="160" r="30" fill={accent} opacity="0.25" />
            </g>
          ),
          bottomLeft: (
            <g>
              <polygon points="0,650 180,740 0,740" fill={primary} opacity="0.95" />
              <polygon points="0,690 100,740 0,740" fill={primary} opacity="0.7" />
            </g>
          ),
          background: '#f0f9ff'
        };

      case 'navy-diagonal':
        return {
          topRight: (
            <g>
              <polygon points="200,0 520,0 520,180 280,140" fill={primary} opacity="0.95" />
              <polygon points="320,0 520,0 520,120 380,90" fill={primary} opacity="0.7" />
            </g>
          ),
          bottomRight: (
            <g>
              <polygon points="250,600 520,740 520,600" fill={primary} opacity="0.95" />
              <polygon points="350,650 520,740 520,650" fill={primary} opacity="0.7" />
            </g>
          ),
          bottomLeft: (
            <g>
              <polygon points="0,550 120,740 0,740" fill={accent} opacity="0.9" />
              <polygon points="0,620 80,740 0,740" fill={primary} opacity="0.6" />
            </g>
          ),
          background: '#ffffff'
        };

      case 'cyan-modern':
        return {
          topRight: (
            <g>
              <circle cx="520" cy="0" r="180" fill={primary} opacity="0.2" />
              <circle cx="520" cy="0" r="120" fill={primary} opacity="0.4" />
              <circle cx="520" cy="0" r="60" fill={primary} opacity="0.6" />
            </g>
          ),
          middleRight: (
            <g>
              <rect x="450" y="300" width="70" height="120" rx="10" fill={accent} opacity="0.9" />
              <rect x="460" y="310" width="50" height="100" rx="5" fill={primary} opacity="0.3" />
            </g>
          ),
          bottomLeft: (
            <g>
              <polygon points="0,600 150,740 0,740" fill={primary} opacity="0.9" />
              <polygon points="0,660 90,740 0,740" fill={accent} opacity="0.8" />
            </g>
          ),
          background: '#f8fafc'
        };

      case 'yellow-modern':
        return {
          topRight: (
            <g>
              <polygon points="380,0 520,0 520,160 440,200" fill={primary} opacity="0.95" />
              <polygon points="440,0 520,0 520,100 480,120" fill={primary} opacity="0.7" />
              <g transform="translate(470, 50)">
                <line x1="0" y1="-20" x2="0" y2="20" stroke={primary} strokeWidth="4" />
                <line x1="-20" y1="0" x2="20" y2="0" stroke={primary} strokeWidth="4" />
                <line x1="-14" y1="-14" x2="14" y2="14" stroke={primary} strokeWidth="4" />
                <line x1="14" y1="-14" x2="-14" y2="14" stroke={primary} strokeWidth="4" />
              </g>
            </g>
          ),
          middleLeft: (
            <g>
              <polygon points="0,280 320,280 360,380 0,380" fill={primary} opacity="0.95" />
            </g>
          ),
          bottomLeft: (
            <g>
              <polygon points="0,580 120,740 0,740" fill={accent} opacity="0.95" />
              <polygon points="0,650 70,740 0,740" fill={accent} opacity="0.7" />
            </g>
          ),
          bottomRight: (
            <g>
              <polygon points="100,640 520,740 520,640" fill={primary} opacity="0.95" />
              <polygon points="180,670 520,740 520,670" fill={primary} opacity="0.7" />
            </g>
          ),
          background: '#ffffff'
        };

      case 'red-curved':
        return {
          topLeft: (
            <g>
              <path d={`M0,0 L140,0 Q140,140 0,140 Z`} fill={primary} opacity="0.95" />
              <path d={`M0,0 L80,0 Q80,80 0,80 Z`} fill={primary} opacity="0.6" />
              <g transform="translate(200, 50)">
                {Array.from({length: 4}, (_, row) => 
                  Array.from({length: 5}, (_, col) => (
                    <circle key={`${row}-${col}`} cx={col * 12} cy={row * 12} r="2.5" fill="#9ca3af" opacity="0.5" />
                  ))
                )}
              </g>
            </g>
          ),
          rightEdge: (
            <g>
              <path d={`M520,200 Q480,370 520,540`} stroke={primary} strokeWidth="40" fill="none" opacity="0.9" />
              <path d={`M520,250 Q490,370 520,490`} stroke={primary} strokeWidth="20" fill="none" opacity="0.5" />
            </g>
          ),
          bottomLeft: (
            <g transform="translate(30, 680)">
              {Array.from({length: 3}, (_, row) => 
                Array.from({length: 6}, (_, col) => (
                  <circle key={`${row}-${col}`} cx={col * 14} cy={row * 14} r="3" fill={primary} opacity="0.4" />
                ))
              )}
            </g>
          ),
          background: '#ffffff'
        };

      case 'red-circular':
        return {
          leftSide: (
            <g>
              <circle cx="-20" cy="300" r="180" fill="none" stroke={primary} strokeWidth="25" opacity="0.3" />
              <circle cx="-20" cy="300" r="130" fill="none" stroke={primary} strokeWidth="20" opacity="0.5" />
              <circle cx="-20" cy="300" r="80" fill="none" stroke={primary} strokeWidth="15" opacity="0.7" />
            </g>
          ),
          bottomWave: (
            <g>
              <path d={`M0,680 Q130,650 260,680 Q390,710 520,680 L520,740 L0,740 Z`} fill={primary} opacity="0.95" />
              <path d={`M0,700 Q130,670 260,700 Q390,730 520,700 L520,740 L0,740 Z`} fill={accent} opacity="0.4" />
            </g>
          ),
          background: '#ffffff'
        };

      case 'blue-hexagon':
        return {
          topRight: (
            <g>
              <g transform="translate(380, 20)">
                {Array.from({length: 4}, (_, row) => 
                  Array.from({length: 5 - row}, (_, col) => (
                    <polygon key={`${row}-${col}`} points={`${col * 12 + row * 6},${row * 10} ${col * 12 + 6 + row * 6},${row * 10 + 8} ${col * 12 + 12 + row * 6},${row * 10}`} fill="#9ca3af" opacity="0.4" />
                  ))
                )}
              </g>
              <polygon points="350,40 420,20 470,70 450,140 380,160 330,110" fill={primary} opacity="0.9" />
              <polygon points="420,110 470,90 520,140 520,220 450,240 400,190" fill={accent} opacity="0.95" />
              <polygon points="300,90 360,70 400,120 380,180 320,200 280,150" fill="none" stroke={accent} strokeWidth="2" opacity="0.4" />
            </g>
          ),
          middleRight: (
            <g transform="translate(380, 320)">
              {Array.from({length: 4}, (_, row) => 
                Array.from({length: 6}, (_, col) => (
                  <circle key={`${row}-${col}`} cx={col * 14} cy={row * 12} r="2.5" fill="#9ca3af" opacity="0.4" />
                ))
              )}
            </g>
          ),
          bottomRight: (
            <g transform="translate(300, 550)">
              <rect x="80" y="40" width="140" height="20" fill={primary} opacity="0.95" transform="rotate(45 150 50)" />
              <rect x="100" y="70" width="140" height="15" fill={accent} opacity="0.95" transform="rotate(45 170 77)" />
              <rect x="120" y="100" width="140" height="20" fill={primary} opacity="0.95" transform="rotate(45 190 110)" />
              <circle cx="180" cy="160" r="20" fill={primary} opacity="0.9" />
              <circle cx="155" cy="140" r="12" fill={accent} opacity="0.7" />
            </g>
          ),
          bottomLeft: (
            <g transform="translate(30, 650)">
              {Array.from({length: 3}, (_, row) => 
                Array.from({length: 5}, (_, col) => (
                  <circle key={`${row}-${col}`} cx={col * 14} cy={row * 12} r="2.5" fill={primary} opacity="0.5" />
                ))
              )}
            </g>
          ),
          background: '#f8fafc'
        };

      case 'navy-company-profile':
        return {
          topFull: (
            <g>
              <polygon points="0,0 520,0 520,140 0,100" fill={primary} opacity="0.95" />
              <polygon points="80,0 520,0 520,100 120,70" fill={primary} opacity="0.7" />
            </g>
          ),
          bottomLeft: (
            <g>
              <polygon points="0,580 140,740 0,740" fill={accent} opacity="0.95" />
              <polygon points="0,650 80,740 0,740" fill={primary} opacity="0.8" />
            </g>
          ),
          bottomRight: (
            <g>
              <polygon points="200,580 520,740 520,580" fill={primary} opacity="0.95" />
              <polygon points="300,620 520,740 520,620" fill={primary} opacity="0.7" />
            </g>
          ),
          background: '#ffffff'
        };

      case 'blue-orange-geometric':
        return {
          topRight: (
            <g>
              <polygon points="400,0 520,0 520,100" fill={accent} opacity="0.95" />
              <polygon points="280,0 520,0 520,300 400,360 240,240" fill={primary} opacity="0.95" />
              <polygon points="450,70 520,50 520,120" fill={accent} opacity="0.8" />
            </g>
          ),
          bottomLeft: (
            <g>
              <polygon points="0,600 180,740 0,740" fill={primary} opacity="0.95" />
              <polygon points="0,660 100,740 0,740" fill={primary} opacity="0.7" />
            </g>
          ),
          bottomRight: (
            <g transform="translate(350, 600)">
              <rect x="0" y="50" width="120" height="18" fill={accent} opacity="0.9" transform="rotate(-45 60 59)" />
              <rect x="20" y="70" width="120" height="14" fill={accent} opacity="0.7" transform="rotate(-45 80 77)" />
              <rect x="40" y="90" width="120" height="18" fill={accent} opacity="0.9" transform="rotate(-45 100 99)" />
              <polygon points="80,140 170,140 170,70" fill={primary} opacity="0.95" />
            </g>
          ),
          background: '#ffffff'
        };

      case 'white-red-hexagon':
        return {
          topLeft: (
            <g>
              <polygon points="-10,70 40,40 90,70 90,120 40,150 -10,120" fill="#e5e5e5" opacity="0.8" />
              <polygon points="50,30 100,0 150,30 150,80 100,110 50,80" fill="#e5e5e5" opacity="0.6" />
              <polygon points="-20,60 30,30 80,60 80,110 30,140 -20,110" fill={primary} opacity="0.95" />
              <polygon points="60,20 110,0 160,30 160,80 110,110 60,80" fill={primary} opacity="0.9" />
              <polygon points="40,110 90,80 140,110 140,160 90,190 40,160" fill="#f5f5f5" stroke="#e5e5e5" strokeWidth="2" opacity="0.9" />
            </g>
          ),
          bottomRight: (
            <g transform="translate(300, 520)">
              <polygon points="80,100 130,70 180,100 180,150 130,180 80,150" fill="#e5e5e5" opacity="0.8" />
              <polygon points="120,160 170,130 220,160 220,210 170,240 120,210" fill="#e5e5e5" opacity="0.6" />
              <polygon points="100,80 150,50 200,80 200,130 150,160 100,130" fill={primary} opacity="0.95" />
              <polygon points="140,140 190,110 240,140 240,190 190,220 140,190" fill={primary} opacity="0.9" />
              <polygon points="60,140 110,110 160,140 160,190 110,220 60,190" fill="#f5f5f5" stroke="#e5e5e5" strokeWidth="2" opacity="0.9" />
            </g>
          ),
          background: '#ffffff'
        };

      case 'white-red-waves':
        return {
          topLeft: (
            <g>
              <polygon points="30,30 50,20 60,35 50,50 30,50 20,35" fill={primary} opacity="0.9" />
              <polygon points="35,32 48,25 55,35 48,45 35,45 28,35" fill={accent} opacity="0.4" />
            </g>
          ),
          rightEdge: (
            <g>
              <path d={`M520,0 L520,450 Q470,400 480,280 Q490,160 520,100 Z`} fill={primary} opacity="0.95" />
              <path d={`M520,0 L520,380 Q480,340 490,220 Q500,120 520,60 Z`} fill={primary} opacity="0.6" />
            </g>
          ),
          middleWave: (
            <g>
              <path d={`M0,400 Q130,380 260,395 Q390,410 520,390 L520,420 L0,420 Z`} fill={accent} opacity="0.2" />
              <path d={`M0,410 Q150,395 300,405 Q450,415 520,400 L520,430 L0,430 Z`} fill={accent} opacity="0.15" />
            </g>
          ),
          bottomLeft: (
            <g>
              <path d={`M0,500 Q60,560 50,640 Q40,700 0,740 L0,500 Z`} fill={primary} opacity="0.95" />
              <path d={`M0,580 Q40,620 35,680 Q30,720 0,740 L0,580 Z`} fill={primary} opacity="0.6" />
            </g>
          ),
          background: '#ffffff'
        };

      case 'blue-curves-circles':
        return {
          topRight: (
            <g>
              <path d={`M400,0 L520,0 L520,250 Q460,220 430,140 Q400,60 400,0 Z`} fill={primary} opacity="0.2" />
              <path d={`M460,0 L520,0 L520,180 Q490,160 470,100 Q450,50 460,0 Z`} fill={primary} opacity="0.4" />
            </g>
          ),
          middleRight: (
            <g>
              <circle cx="440" cy="380" r="120" fill="none" stroke={accent} strokeWidth="3" opacity="0.3" />
              <circle cx="440" cy="380" r="90" fill={accent} opacity="0.1" />
              <circle cx="490" cy="300" r="30" fill={accent} opacity="0.9" />
              <circle cx="460" cy="280" r="15" fill={primary} opacity="0.7" />
            </g>
          ),
          bottomLeft: (
            <g>
              <polygon points="0,620 220,740 0,740" fill={primary} opacity="0.95" />
              <polygon points="0,670 150,740 0,740" fill={primary} opacity="0.7" />
            </g>
          ),
          background: '#f8fafc'
        };

      default:
        return {
          topRight: (
            <g>
              <polygon points="380,0 520,0 520,120" fill={primary} opacity="0.8" />
            </g>
          ),
          bottomLeft: (
            <g>
              <polygon points="0,620 140,740 0,740" fill={primary} opacity="0.8" />
            </g>
          ),
          background: '#f8fafc'
        };
    }
  }, [themeId, primaryColor, secondaryColor]);

  const decorations = getThemeDecorations;
  const textColor = secondaryColor;

  return (
    <div 
      className="relative overflow-hidden rounded-lg"
      style={{ 
        width: isLarge ? '520px' : '208px',
        height: isLarge ? '740px' : '296px',
        transform: isLarge ? 'none' : undefined
      }}
    >
      <svg 
        viewBox="0 0 520 740" 
        className="w-full h-full"
        style={{ backgroundColor: decorations.background || '#ffffff' }}
      >
        {decorations.topFull}
        {decorations.topLeft}
        {decorations.topRight}
        {decorations.leftSide}
        {decorations.rightEdge}
        {decorations.middleLeft}
        {decorations.middleRight}
        {decorations.middleWave}
        {decorations.bottomWave}
        {decorations.bottomLeft}
        {decorations.bottomRight}

        <g transform="translate(40, 280)">
          <text 
            x="0" 
            y="0" 
            fill={textColor} 
            fontSize={isLarge ? "48" : "19"}
            fontFamily={font}
            fontWeight="bold"
          >
            BUSINESS
          </text>
          <text 
            x="0" 
            y={isLarge ? "55" : "22"}
            fill={primaryColor} 
            fontSize={isLarge ? "48" : "19"}
            fontFamily={font}
            fontWeight="bold"
          >
            PLAN
          </text>
          <rect 
            x="0" 
            y={isLarge ? "75" : "30"}
            width={isLarge ? "100" : "40"}
            height={isLarge ? "4" : "2"}
            fill={textColor}
          />
          <text 
            x="0" 
            y={isLarge ? "110" : "44"}
            fill="#64748b" 
            fontSize={isLarge ? "16" : "7"}
            fontFamily={font}
          >
            {founderName}
          </text>
          <text 
            x="0" 
            y={isLarge ? "135" : "54"}
            fill="#94a3b8" 
            fontSize={isLarge ? "14" : "6"}
            fontFamily={font}
          >
            {currentYear}
          </text>
        </g>
      </svg>

      {isSelected && (
        <div 
          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: primaryColor }}
        >
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
}
