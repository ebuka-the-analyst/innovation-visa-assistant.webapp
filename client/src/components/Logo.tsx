export function Logo({ className = "h-16" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 420 80" 
      className={className}
      style={{ width: 'auto' }}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMinYMid meet"
    >
      {/* UK Flag */}
      <g transform="translate(0, 10)">
        {/* Blue background */}
        <rect width="70" height="50" fill="#012169"/>
        
        {/* White diagonal cross */}
        <path d="M 0 0 L 70 50 M 70 0 L 0 50" stroke="white" strokeWidth="10"/>
        
        {/* Red diagonal cross */}
        <path d="M 0 0 L 70 50 M 70 0 L 0 50" stroke="#C8102E" strokeWidth="6"/>
        
        {/* White cross */}
        <path d="M 35 0 L 35 50 M 0 25 L 70 25" stroke="white" strokeWidth="16"/>
        
        {/* Red cross */}
        <path d="M 35 0 L 35 50 M 0 25 L 70 25" stroke="#C8102E" strokeWidth="10"/>
      </g>
      
      {/* Orange Arrow sweeping across flag */}
      <path 
        d="M 35 35 Q 60 15 85 40 L 80 35 L 83 28 L 77 32 L 80 25 L 74 29 L 77 22 L 71 26 Z" 
        fill="#ffa536"
      />
      
      {/* Text: INNOVATOR */}
      <text 
        x="105" 
        y="35" 
        className="fill-foreground"
        style={{ 
          fontSize: '24px', 
          fontWeight: '800',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '0px'
        }}
      >
        INNOVATOR
      </text>
      
      {/* Text: FOUNDER */}
      <text 
        x="105" 
        y="58" 
        className="fill-foreground"
        style={{ 
          fontSize: '24px', 
          fontWeight: '800',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '0px'
        }}
      >
        FOUNDER
      </text>
      
      {/* Text: VISA ASSISTANT */}
      <text 
        x="105" 
        y="75" 
        fill="#ffa536"
        style={{ 
          fontSize: '20px', 
          fontWeight: '700',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '0px'
        }}
      >
        VISA ASSISTANT
      </text>
    </svg>
  );
}
