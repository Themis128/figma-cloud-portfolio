'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface OutputLine {
  text: string;
  type: 'command' | 'response' | 'ascii' | 'matrix';
}

const BOOT_LINES: OutputLine[] = [
  { text: '> Initializing CYBER_TERMINAL v1.0 ...', type: 'response' },
  { text: '> Secure connection established.', type: 'response' },
  { text: '> Type "help" for available commands.', type: 'response' },
  { text: '', type: 'response' },
];

function skillBar(label: string, pct: number): string {
  const filled = Math.round(pct / 10);
  const empty = 10 - filled;
  return `  ${label.padEnd(22)} [${'█'.repeat(filled)}${'░'.repeat(empty)}] ${pct}%`;
}

function processCommand(cmd: string): OutputLine[] {
  const trimmed = cmd.trim().toLowerCase();

  switch (trimmed) {
    case 'help':
      return [
        { text: 'Available commands:', type: 'response' },
        { text: '', type: 'response' },
        { text: '  help          Show this help message', type: 'response' },
        { text: '  whoami        Display identity info', type: 'response' },
        { text: '  skills        List technical skills', type: 'response' },
        { text: '  certs         List certifications', type: 'response' },
        { text: '  projects      List projects with links', type: 'response' },
        { text: '  contact       Show contact information', type: 'response' },
        { text: '  experience    Show work history', type: 'response' },
        { text: '  matrix        Trigger matrix rain', type: 'response' },
        { text: '  clear         Clear the terminal', type: 'response' },
        { text: '  exit          Close the terminal', type: 'response' },
        { text: '', type: 'response' },
        { text: '  sudo hire me  ???', type: 'response' },
      ];

    case 'whoami':
      return [
        { text: '', type: 'response' },
        { text: '  ╔══════════════════════════════════════╗', type: 'ascii' },
        { text: '  ║  THEMISTOKLIS BALTZAKIS              ║', type: 'ascii' },
        { text: '  ║  IT Network Engineer &                ║', type: 'ascii' },
        { text: '  ║  Cloud Architect                      ║', type: 'ascii' },
        { text: '  ║                                       ║', type: 'ascii' },
        { text: '  ║  Location : Athens, Greece            ║', type: 'ascii' },
        { text: '  ║  Focus    : Cisco · Fortinet · Cloud  ║', type: 'ascii' },
        { text: '  ╚══════════════════════════════════════╝', type: 'ascii' },
        { text: '', type: 'response' },
      ];

    case 'skills':
      return [
        { text: '', type: 'response' },
        { text: '  ── Technical Skills ──', type: 'response' },
        { text: '', type: 'response' },
        { text: skillBar('AWS Cloud', 90), type: 'ascii' },
        { text: skillBar('Cybersecurity', 85), type: 'ascii' },
        { text: skillBar('Networking', 90), type: 'ascii' },
        { text: skillBar('Linux Administration', 85), type: 'ascii' },
        { text: skillBar('Docker / Containers', 80), type: 'ascii' },
        { text: skillBar('CI/CD Pipelines', 80), type: 'ascii' },
        { text: skillBar('Infrastructure as Code', 75), type: 'ascii' },
        { text: skillBar('Python / Scripting', 75), type: 'ascii' },
        { text: skillBar('TypeScript / React', 70), type: 'ascii' },
        { text: skillBar('Monitoring & Logging', 80), type: 'ascii' },
        { text: '', type: 'response' },
      ];

    case 'certs':
      return [
        { text: '', type: 'response' },
        { text: '  ── Certifications ──', type: 'response' },
        { text: '', type: 'response' },
        { text: '  [✓] AWS Solutions Architect, Associate', type: 'response' },
        { text: '  [✓] AWS Cloud Practitioner', type: 'response' },
        { text: '  [✓] CompTIA Security+', type: 'response' },
        { text: '  [✓] CompTIA Network+', type: 'response' },
        { text: '  [✓] Cisco CCNA', type: 'response' },
        { text: '', type: 'response' },
      ];

    case 'projects':
      return [
        { text: '', type: 'response' },
        { text: '  ── Projects ──', type: 'response' },
        { text: '', type: 'response' },
        { text: '  [1] Portfolio Site', type: 'response' },
        { text: '      Next.js 16 · Tailwind · AWS S3 + CloudFront', type: 'response' },
        { text: '      https://baltzakisthemis.com', type: 'response' },
        { text: '', type: 'response' },
        { text: '  [2] GitHub Repositories', type: 'response' },
        { text: '      https://github.com/tbaltzakis', type: 'response' },
        { text: '', type: 'response' },
      ];

    case 'contact':
      return [
        { text: '', type: 'response' },
        { text: '  ── Contact ──', type: 'response' },
        { text: '', type: 'response' },
        { text: '  Web      : https://baltzakisthemis.com', type: 'response' },
        { text: '  GitHub   : https://github.com/tbaltzakis', type: 'response' },
        { text: '  LinkedIn : https://linkedin.com/in/tbaltzakis', type: 'response' },
        { text: '', type: 'response' },
      ];

    case 'experience':
      return [
        { text: '', type: 'response' },
        { text: '  ── Work Experience ──', type: 'response' },
        { text: '', type: 'response' },
        { text: '  IT Network Engineer & Cloud Architect', type: 'response' },
        { text: '  ├─ AWS infrastructure design & deployment', type: 'response' },
        { text: '  ├─ Network security implementation', type: 'response' },
        { text: '  ├─ CI/CD pipeline automation', type: 'response' },
        { text: '  ├─ Security audits & compliance', type: 'response' },
        { text: '  └─ Cloud migration & optimization', type: 'response' },
        { text: '', type: 'response' },
        { text: '  IT Network Engineer', type: 'response' },
        { text: '  ├─ Enterprise network architecture', type: 'response' },
        { text: '  ├─ Firewall & VPN management', type: 'response' },
        { text: '  ├─ System monitoring & incident response', type: 'response' },
        { text: '  └─ Technical documentation', type: 'response' },
        { text: '', type: 'response' },
      ];

    case 'sudo hire me':
      return [
        { text: '', type: 'response' },
        { text: '  ╔══════════════════════════════════════════╗', type: 'ascii' },
        { text: '  ║                                          ║', type: 'ascii' },
        { text: '  ║   ACCESS GRANTED                         ║', type: 'ascii' },
        { text: '  ║                                          ║', type: 'ascii' },
        { text: '  ║   Excellent decision, Commander.          ║', type: 'ascii' },
        { text: '  ║   Deploying top-tier talent to your       ║', type: 'ascii' },
        { text: '  ║   organization...                         ║', type: 'ascii' },
        { text: '  ║                                          ║', type: 'ascii' },
        { text: '  ║   > Skills verified     ✓                ║', type: 'ascii' },
        { text: '  ║   > Motivation level    MAXIMUM          ║', type: 'ascii' },
        { text: '  ║   > Coffee reserves     FULL             ║', type: 'ascii' },
        { text: '  ║   > Ready to deploy     IMMEDIATELY      ║', type: 'ascii' },
        { text: '  ║                                          ║', type: 'ascii' },
        { text: '  ║   Let\'s build something amazing. 🚀       ║', type: 'ascii' },
        { text: '  ║                                          ║', type: 'ascii' },
        { text: '  ╚══════════════════════════════════════════╝', type: 'ascii' },
        { text: '', type: 'response' },
      ];

    case 'clear':
      return [];

    case 'exit':
      return [{ text: '__EXIT__', type: 'response' }];

    case 'matrix':
      return [{ text: '__MATRIX__', type: 'response' }];

    case '':
      return [];

    default:
      return [
        {
          text: `  Command not found: "${cmd.trim()}". Type 'help' for available commands.`,
          type: 'response',
        },
      ];
  }
}

const MATRIX_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';

function generateMatrixFrame(): string {
  const cols = 60;
  let line = '';
  for (let i = 0; i < cols; i++) {
    if (Math.random() > 0.7) {
      line += MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)] ?? '0';
    } else {
      line += ' ';
    }
  }
  return line;
}

export default function CyberTerminal() {
  const [isOpen, setIsOpen] = useState(false);
  const [output, setOutput] = useState<OutputLine[]>([...BOOT_LINES]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingLines, setTypingLines] = useState<OutputLine[]>([]);
  const [typingIndex, setTypingIndex] = useState(0);
  const [matrixActive, setMatrixActive] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const matrixTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Scroll to bottom when output changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output, typingLines, typingIndex]);

  // Focus input when terminal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Global keyboard listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === '`' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        // Don't trigger if typing in an input/textarea (other than our terminal input)
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          if (target !== inputRef.current) return;
        }
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Typing animation effect
  useEffect(() => {
    if (!isTyping || typingIndex >= typingLines.length) {
      if (isTyping) setIsTyping(false);
      return;
    }

    const currentLine = typingLines[typingIndex];
    if (!currentLine) return;

    const timer = setTimeout(() => {
      setOutput((prev) => [...prev, currentLine]);
      setTypingIndex((i) => i + 1);
    }, 30);

    return () => clearTimeout(timer);
  }, [isTyping, typingIndex, typingLines]);

  // Matrix rain effect
  const startMatrix = useCallback(() => {
    setMatrixActive(true);
    let frameCount = 0;
    const maxFrames = 20;

    matrixTimerRef.current = setInterval(() => {
      frameCount++;
      if (frameCount > maxFrames) {
        if (matrixTimerRef.current) clearInterval(matrixTimerRef.current);
        setMatrixActive(false);
        setOutput((prev) => [
          ...prev,
          { text: '', type: 'response' },
          { text: '  [Matrix simulation complete]', type: 'response' },
          { text: '', type: 'response' },
        ]);
        return;
      }
      setOutput((prev) => [
        ...prev,
        { text: `  ${generateMatrixFrame()}`, type: 'matrix' },
      ]);
    }, 80);
  }, []);

  // Cleanup matrix timer
  useEffect(() => {
    return () => {
      if (matrixTimerRef.current) clearInterval(matrixTimerRef.current);
    };
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (isTyping || matrixActive) return;

      const cmd = inputValue;
      setInputValue('');

      // Add command to output
      setOutput((prev) => [...prev, { text: `> ${cmd}`, type: 'command' }]);

      const result = processCommand(cmd);

      // Handle special commands
      const firstResult = result[0];
      if (result.length === 1 && firstResult?.text === '__EXIT__') {
        setIsOpen(false);
        return;
      }

      if (result.length === 1 && firstResult?.text === '__MATRIX__') {
        startMatrix();
        return;
      }

      // Handle clear
      if (cmd.trim().toLowerCase() === 'clear') {
        setOutput([]);
        return;
      }

      // Animate response lines
      if (result.length > 0) {
        setTypingLines(result);
        setTypingIndex(0);
        setIsTyping(true);
      }
    },
    [inputValue, isTyping, matrixActive, startMatrix]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-lg animate-in fade-in duration-300"
      role="dialog"
      aria-label="Cyber Terminal"
    >
      <div className="flex h-[90vh] w-[90vw] max-w-4xl flex-col rounded-lg border border-cyan-400/30 bg-black font-mono text-sm shadow-[0_0_40px_rgba(0,255,255,0.15)]">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-cyan-400/20 px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <span className="h-3 w-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-xs uppercase tracking-[0.15em] text-cyan-400">
              CYBER_TERMINAL v1.0
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-cyan-400/60 transition-colors hover:text-cyan-400"
            aria-label="Close terminal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable output area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-cyan-400/20"
        >
          {output.map((line, i) => (
            <div
              key={`${i}-${line.text.slice(0, 20)}`}
              className={`whitespace-pre-wrap leading-relaxed ${
                line.type === 'command'
                  ? 'text-cyan-400/60'
                  : line.type === 'matrix'
                    ? 'text-green-400/80'
                    : line.type === 'ascii'
                      ? 'text-cyan-300'
                      : 'text-cyan-400/80'
              }`}
            >
              {line.text || '\u00A0'}
            </div>
          ))}
          {/* Typing indicator */}
          {isTyping && (
            <div className="text-cyan-400/40 animate-pulse">...</div>
          )}
        </div>

        {/* Input line */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center border-t border-cyan-400/20 px-4 py-3"
        >
          <span className="mr-2 text-cyan-400">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 bg-transparent font-mono text-cyan-400 caret-cyan-400 outline-none placeholder:text-cyan-400/30"
            placeholder="Enter command..."
            autoComplete="off"
            spellCheck={false}
            disabled={isTyping || matrixActive}
          />
          <span className="animate-pulse text-cyan-400">_</span>
        </form>
      </div>
    </div>
  );
}
