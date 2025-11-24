export function Logo({ className = "h-16" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 550 100" 
      className={className}
      style={{ width: 'auto' }}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMinYMid meet"
    >
      {/* UK Flag */}
      <g transform="translate(5, 15)">
        {/* Blue background */}
        <rect width="80" height="60" fill="#012169"/>
        
        {/* White diagonal cross */}
        <path d="M 0 0 L 80 60 M 80 0 L 0 60" stroke="white" strokeWidth="12"/>
        
        {/* Red diagonal cross */}
        <path d="M 0 0 L 80 60 M 80 0 L 0 60" stroke="#C8102E" strokeWidth="7"/>
        
        {/* White cross */}
        <path d="M 40 0 L 40 60 M 0 30 L 80 30" stroke="white" strokeWidth="20"/>
        
        {/* Red cross */}
        <path d="M 40 0 L 40 60 M 0 30 L 80 30" stroke="#C8102E" strokeWidth="12"/>
      </g>
      
      {/* Orange Arrow */}
      <path 
        d="M 50 45 Q 85 25 105 50 L 95 45 L 100 35 L 90 40 L 95 30 L 85 35 L 90 25 L 80 30 Z" 
        fill="#ffa536"
      />
      
      {/* Text: INNOVATOR */}
      <text 
        x="120" 
        y="42" 
        className="fill-foreground"
        style={{ 
          fontSize: '28px', 
          fontWeight: '800',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '0.5px'
        }}
      >
        INNOVATOR
      </text>
      
      {/* Text: FOUNDER */}
      <text 
        x="120" 
        y="72" 
        className="fill-foreground"
        style={{ 
          fontSize: '28px', 
          fontWeight: '800',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '0.5px'
        }}
      >
        FOUNDER
      </text>
      
      {/* Text: VISA ASSISTANT */}
      <text 
        x="300" 
        y="72" 
        fill="#ffa536"
        style={{ 
          fontSize: '24px', 
          fontWeight: '700',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '0.5px'
        }}
      >
        VISA ASSISTANT
      </text>
    </svg>
  );
}
