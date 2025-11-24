export function Logo({ className = "h-16" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 950 350" 
      className={className}
      style={{ width: 'auto' }}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMinYMid meet"
    >
      {/* UK Flag */}
      <g transform="translate(20, 80)">
        {/* Blue background */}
        <rect width="300" height="200" fill="#012169" rx="8"/>
        
        {/* White diagonal cross */}
        <path d="M 0 0 L 300 200 M 300 0 L 0 200" stroke="white" strokeWidth="40"/>
        
        {/* Red diagonal cross */}
        <path d="M 0 0 L 300 200 M 300 0 L 0 200" stroke="#C8102E" strokeWidth="24"/>
        
        {/* White cross */}
        <path d="M 150 0 L 150 200 M 0 100 L 300 100" stroke="white" strokeWidth="66"/>
        
        {/* Red cross */}
        <path d="M 150 0 L 150 200 M 0 100 L 300 100" stroke="#C8102E" strokeWidth="40"/>
      </g>
      
      {/* Orange Arrow sweeping through flag */}
      <path 
        d="M 60 180 Q 220 120 380 180 L 350 160 L 365 130 L 335 150 L 350 120 L 320 140 L 335 110 L 305 130 Z" 
        fill="#ffa536"
        strokeWidth="0"
      />
      
      {/* Text: INNOVATOR */}
      <text 
        x="470" 
        y="170" 
        className="fill-foreground"
        style={{ 
          fontSize: '92px', 
          fontWeight: '900',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '2px'
        }}
      >
        INNOVATOR
      </text>
      
      {/* Text: FOUNDER */}
      <text 
        x="470" 
        y="250" 
        className="fill-foreground"
        style={{ 
          fontSize: '92px', 
          fontWeight: '900',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '2px'
        }}
      >
        FOUNDER
      </text>
      
      {/* Text: VISA ASSISTANT */}
      <text 
        x="470" 
        y="310" 
        fill="#ffa536"
        style={{ 
          fontSize: '72px', 
          fontWeight: '800',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '2px'
        }}
      >
        VISA ASSISTANT
      </text>
    </svg>
  );
}
