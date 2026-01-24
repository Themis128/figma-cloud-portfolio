export default function CircuitBackground() {
  return (
    <div className='absolute inset-0 overflow-hidden pointer-events-none'>
      <svg
        className='absolute w-full h-full'
        viewBox='0 0 1000 700'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        preserveAspectRatio='xMidYMid slice'
        role='img'
      >
        <title>Circuit board background pattern</title>
        <defs>
          <filter id='circuitGlow'>
            <feGaussianBlur stdDeviation='2' result='coloredBlur' />
            <feMerge>
              <feMergeNode in='coloredBlur' />
              <feMergeNode in='SourceGraphic' />
            </feMerge>
          </filter>
        </defs>

        {/* Diagonal circuit lines from top right */}
        <g opacity='0.4'>
          <line
            x1='1000'
            y1='-50'
            x2='600'
            y2='350'
            stroke='#00d4ff'
            strokeWidth='2'
            filter='url(#circuitGlow)'
          />
          <line
            x1='950'
            y1='-50'
            x2='550'
            y2='350'
            stroke='#00d4ff'
            strokeWidth='1.5'
            filter='url(#circuitGlow)'
          />
          <line
            x1='1050'
            y1='50'
            x2='650'
            y2='450'
            stroke='#00d4ff'
            strokeWidth='1.5'
            filter='url(#circuitGlow)'
          />
        </g>

        {/* Circuit nodes and connectors on the right */}
        <g opacity='0.5'>
          <circle cx='750' cy='150' r='4' fill='#00d4ff' filter='url(#circuitGlow)' />
          <circle cx='800' cy='200' r='3' fill='#00d4ff' filter='url(#circuitGlow)' />
          <circle cx='850' cy='250' r='4' fill='#00d4ff' filter='url(#circuitGlow)' />
          <circle cx='780' cy='300' r='3' fill='#00d4ff' filter='url(#circuitGlow)' />

          <line x1='750' y1='150' x2='800' y2='200' stroke='#00d4ff' strokeWidth='1.5' />
          <line x1='800' y1='200' x2='850' y2='250' stroke='#00d4ff' strokeWidth='1.5' />
          <line x1='850' y1='250' x2='780' y2='300' stroke='#00d4ff' strokeWidth='1.5' />
        </g>

        {/* Diagonal lines from bottom left */}
        <g opacity='0.3'>
          <line
            x1='-50'
            y1='700'
            x2='250'
            y2='450'
            stroke='#00d4ff'
            strokeWidth='2'
            filter='url(#circuitGlow)'
          />
          <line
            x1='0'
            y1='750'
            x2='300'
            y2='450'
            stroke='#00d4ff'
            strokeWidth='1.5'
            filter='url(#circuitGlow)'
          />
        </g>

        {/* Angled corner lines - top left */}
        <g opacity='0.5'>
          <line
            x1='0'
            y1='100'
            x2='150'
            y2='50'
            stroke='#00d4ff'
            strokeWidth='2'
            filter='url(#circuitGlow)'
          />
          <line
            x1='150'
            y1='50'
            x2='200'
            y2='30'
            stroke='#00d4ff'
            strokeWidth='2'
            filter='url(#circuitGlow)'
          />
          <circle cx='150' cy='50' r='3' fill='#00d4ff' filter='url(#circuitGlow)' />
        </g>

        {/* Geometric accent shapes */}
        <g opacity='0.2'>
          {/* Small squares scattered */}
          <rect
            x='100'
            y='150'
            width='30'
            height='30'
            fill='none'
            stroke='#00d4ff'
            strokeWidth='1'
          />
          <rect
            x='200'
            y='250'
            width='40'
            height='40'
            fill='none'
            stroke='#00d4ff'
            strokeWidth='1'
          />
          <rect
            x='120'
            y='400'
            width='25'
            height='25'
            fill='none'
            stroke='#00d4ff'
            strokeWidth='1'
          />
          <rect
            x='850'
            y='100'
            width='35'
            height='35'
            fill='none'
            stroke='#00d4ff'
            strokeWidth='1'
          />
          <rect
            x='900'
            cy='400'
            width='30'
            height='30'
            fill='none'
            stroke='#00d4ff'
            strokeWidth='1'
          />
        </g>

        {/* Animated pulse circles */}
        <g>
          <circle
            cx='700'
            cy='180'
            r='6'
            fill='none'
            stroke='#00d4ff'
            strokeWidth='2'
            opacity='0.6'
            filter='url(#circuitGlow)'
            className='animate-ping'
            style={{ animationDuration: "3s" }}
          />
          <circle
            cx='850'
            cy='320'
            r='6'
            fill='none'
            stroke='#00d4ff'
            strokeWidth='2'
            opacity='0.6'
            filter='url(#circuitGlow)'
            className='animate-ping'
            style={{ animationDuration: "4s", animationDelay: "1s" }}
          />
        </g>

        {/* Additional tech elements - gears/cogs */}
        <g opacity='0.3'>
          <circle cx='350' cy='200' r='15' fill='none' stroke='#00d4ff' strokeWidth='1.5' />
          <circle cx='350' cy='200' r='10' fill='none' stroke='#00d4ff' strokeWidth='1' />
          <line x1='350' y1='185' x2='350' y2='175' stroke='#00d4ff' strokeWidth='2' />
          <line x1='350' y1='215' x2='350' y2='225' stroke='#00d4ff' strokeWidth='2' />
          <line x1='365' y1='200' x2='375' y2='200' stroke='#00d4ff' strokeWidth='2' />
          <line x1='335' y1='200' x2='325' y2='200' stroke='#00d4ff' strokeWidth='2' />

          <circle cx='850' cy='450' r='12' fill='none' stroke='#00d4ff' strokeWidth='1.5' />
          <circle cx='850' cy='450' r='8' fill='none' stroke='#00d4ff' strokeWidth='1' />
          <line x1='850' y1='438' x2='850' y2='430' stroke='#00d4ff' strokeWidth='1.5' />
          <line x1='850' y1='462' x2='850' y2='470' stroke='#00d4ff' strokeWidth='1.5' />
          <line x1='862' y1='450' x2='870' y2='450' stroke='#00d4ff' strokeWidth='1.5' />
          <line x1='838' y1='450' x2='830' y2='450' stroke='#00d4ff' strokeWidth='1.5' />
        </g>
      </svg>

      {/* Animated gradient overlays */}
      <div
        className='absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-cyan-500/10 to-transparent blur-3xl animate-pulse'
        style={{ animationDuration: "4s" }}
      />
      <div
        className='absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-blue-500/10 to-transparent blur-3xl animate-pulse'
        style={{ animationDuration: "5s", animationDelay: "1s" }}
      />
    </div>
  );
}
