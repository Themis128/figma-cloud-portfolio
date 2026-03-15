'use client';

import { useState, useEffect, useRef } from 'react';

interface TypeWriterProps {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
}

type Phase = 'typing' | 'paused' | 'deleting';

export default function TypeWriter({
  words,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseTime = 2000,
}: TypeWriterProps) {
  const [displayText, setDisplayText] = useState('');
  const [phase, setPhase] = useState<Phase>('typing');
  const wordIndexRef = useRef(0);
  const charIndexRef = useRef(0);

  useEffect(() => {
    if (words.length === 0) return;

    let delay: number;
    const currentWord = words[wordIndexRef.current % words.length] ?? '';

    switch (phase) {
      case 'typing': {
        if (charIndexRef.current < currentWord.length) {
          delay = typingSpeed;
        } else {
          setPhase('paused');
          return;
        }
        break;
      }
      case 'paused': {
        delay = pauseTime;
        break;
      }
      case 'deleting': {
        if (charIndexRef.current > 0) {
          delay = deletingSpeed;
        } else {
          wordIndexRef.current = (wordIndexRef.current + 1) % words.length;
          setPhase('typing');
          return;
        }
        break;
      }
    }

    const timeout = setTimeout(() => {
      switch (phase) {
        case 'typing': {
          charIndexRef.current += 1;
          setDisplayText(currentWord.substring(0, charIndexRef.current));
          if (charIndexRef.current >= currentWord.length) {
            setPhase('paused');
          }
          break;
        }
        case 'paused': {
          setPhase('deleting');
          break;
        }
        case 'deleting': {
          charIndexRef.current -= 1;
          setDisplayText(currentWord.substring(0, charIndexRef.current));
          if (charIndexRef.current <= 0) {
            wordIndexRef.current = (wordIndexRef.current + 1) % words.length;
            setPhase('typing');
          }
          break;
        }
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [displayText, phase, words, typingSpeed, deletingSpeed, pauseTime]);

  return (
    <span className="font-mono text-cyan-400">
      {displayText}
      <span
        className="inline-block w-0.5 h-[1.1em] bg-cyan-400 align-middle ml-0.5"
        style={
          phase === 'paused'
            ? { animation: 'typewriter-blink 530ms step-end infinite' }
            : undefined
        }
      />
    </span>
  );
}
