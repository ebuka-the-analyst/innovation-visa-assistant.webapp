export function Logo({ className = "h-16" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 800 200" 
      className={className}
      style={{ width: 'auto' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* UK Flag */}
      <g transform="translate(10, 50)">
        {/* Blue background */}
        <rect width="120" height="90" fill="#012169"/>
        
        {/* White diagonal cross */}
        <path d="M 0 0 L 120 90 M 120 0 L 0 90" stroke="white" strokeWidth="18"/>
        
        {/* Red diagonal cross */}
        <path d="M 0 0 L 120 90 M 120 0 L 0 90" stroke="#C8102E" strokeWidth="10"/>
        
        {/* White cross */}
        <path d="M 60 0 L 60 90 M 0 45 L 120 45" stroke="white" strokeWidth="30"/>
        
        {/* Red cross */}
        <path d="M 60 0 L 60 90 M 0 45 L 120 45" stroke="#C8102E" strokeWidth="18"/>
      </g>
      
      {/* Orange Arrow */}
      <path 
        d="M 70 100 Q 150 60 220 100 L 200 90 L 210 70 L 190 80 L 200 60 L 180 70 L 190 50 L 170 60 Z" 
        fill="#ffa536"
        opacity="0.95"
      />
      
      {/* Text: INNOVATOR FOUNDER */}
      <text 
        x="250" 
        y="95" 
        className="fill-foreground"
        style={{ 
          fontSize: '58px', 
          fontWeight: '800',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '1px'
        }}
      >
        INNOVATOR FOUNDER
      </text>
      
      {/* Text: VISA ASSISTANT */}
      <text 
        x="250" 
        y="140" 
        fill="#ffa536"
        style={{ 
          fontSize: '48px', 
          fontWeight: '700',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '1px'
        }}
      >
        VISA ASSISTANT
      </text>
    </svg>
  );
}
