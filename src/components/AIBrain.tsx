export default function AIBrain() {
  return (
    <div className="relative">
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full drop-shadow-[0_0_8px_rgba(0,212,255,0.4)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
      >
        <title>AI Brain neural network visualization</title>
        <defs>
          <linearGradient
            id="brainGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0099cc" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Large hexagon */}
        <polygon
          points="200,50 325,125 325,275 200,350 75,275 75,125"
          fill="none"
          stroke="url(#brainGradient)"
          strokeWidth="2"
        />

        {/* Inner hexagon */}
        <polygon
          points="200,90 285,145 285,255 200,310 115,255 115,145"
          fill="rgba(0, 212, 255, 0.05)"
          stroke="#00d4ff"
          strokeWidth="1.5"
        />

        {/* Brain shape */}
        <g transform="translate(200, 200)">
          {/* Left hemisphere */}
          <path
            d="M-40,-30 Q-60,-30 -60,-10 Q-60,10 -50,25 Q-40,35 -20,35 Q-10,35 -5,30 L-5,15 Q-10,20 -20,20 Q-30,20 -35,10 Q-40,0 -40,-10 Q-40,-20 -35,-25 Q-30,-30 -20,-30 Z"
            fill="none"
            stroke="#00d4ff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Right hemisphere */}
          <path
            d="M40,-30 Q60,-30 60,-10 Q60,10 50,25 Q40,35 20,35 Q10,35 5,30 L5,15 Q10,20 20,20 Q30,20 35,10 Q40,0 40,-10 Q40,-20 35,-25 Q30,-30 20,-30 Z"
            fill="none"
            stroke="#00d4ff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Neural connections */}
          <line x1="-30" y1="-15" x2="-15" y2="-5" stroke="#00d4ff" strokeWidth="1.5" opacity="0.7" />
          <line x1="-25" y1="0" x2="-10" y2="10" stroke="#00d4ff" strokeWidth="1.5" opacity="0.7" />
          <line x1="-20" y1="15" x2="-5" y2="20" stroke="#00d4ff" strokeWidth="1.5" opacity="0.7" />
          <line x1="30" y1="-15" x2="15" y2="-5" stroke="#00d4ff" strokeWidth="1.5" opacity="0.7" />
          <line x1="25" y1="0" x2="10" y2="10" stroke="#00d4ff" strokeWidth="1.5" opacity="0.7" />
          <line x1="20" y1="15" x2="5" y2="20" stroke="#00d4ff" strokeWidth="1.5" opacity="0.7" />

          {/* Central processor */}
          <rect x="-8" y="-8" width="16" height="16" fill="#00d4ff" />
          <rect x="-6" y="-6" width="12" height="12" fill="#1a2849" />

          {/* Circuit lines from processor */}
          <line x1="0" y1="8" x2="0" y2="40" stroke="#00d4ff" strokeWidth="2" opacity="0.8" />
          <line x1="0" y1="-8" x2="0" y2="-40" stroke="#00d4ff" strokeWidth="2" opacity="0.8" />
          <line x1="8" y1="0" x2="40" y2="0" stroke="#00d4ff" strokeWidth="2" opacity="0.8" />
          <line x1="-8" y1="0" x2="-40" y2="0" stroke="#00d4ff" strokeWidth="2" opacity="0.8" />

          {/* Circuit nodes */}
          <circle cx="0" cy="40" r="3" fill="#00d4ff" />
          <circle cx="0" cy="-40" r="3" fill="#00d4ff" />
          <circle cx="40" cy="0" r="3" fill="#00d4ff" />
          <circle cx="-40" cy="0" r="3" fill="#00d4ff" />
        </g>

        {/* Corner decorative circles */}
        <circle cx="75" cy="125" r="4" fill="#00d4ff" opacity="0.6" />
        <circle cx="325" cy="125" r="4" fill="#00d4ff" opacity="0.6" />
        <circle cx="75" cy="275" r="4" fill="#00d4ff" opacity="0.6" />
        <circle cx="325" cy="275" r="4" fill="#00d4ff" opacity="0.6" />

        {/* Small decorative hexagons */}
        <polygon
          points="350,80 365,90 365,110 350,120 335,110 335,90"
          fill="none"
          stroke="#00d4ff"
          strokeWidth="1"
          opacity="0.4"
        />
        <polygon
          points="50,300 65,310 65,330 50,340 35,330 35,310"
          fill="none"
          stroke="#00d4ff"
          strokeWidth="1"
          opacity="0.4"
        />
      </svg>
    </div>
  );
}
