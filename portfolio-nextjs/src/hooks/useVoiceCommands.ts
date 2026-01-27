import { useCallback, useEffect, useRef, useState } from "react";

import { reportError, trackInteraction } from "@/lib/sentry";

// Web Speech API type declarations
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare const SpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};

interface VoiceCommand {
  keywords: string[];
  action: (transcript: string) => void;
  description: string;
}

interface VoiceCommandsState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  error: string | null;
  confidence: number;
}

export function useVoiceCommands(commands: VoiceCommand[] = []) {
  const [state, setState] = useState<VoiceCommandsState>({
    isListening: false,
    isSupported: false,
    transcript: "",
    error: null,
    confidence: 0,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check for Speech Recognition support
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        if (recognitionRef.current) {
          recognitionRef.current.continuous = false;
          recognitionRef.current.interimResults = true;
          recognitionRef.current.lang = "en-US";
        }
        setState((prev) => ({ ...prev, isSupported: true }));
      }

      // Check for Speech Synthesis support
      if ("speechSynthesis" in window) {
        synthRef.current = window.speechSynthesis;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Voice feedback function
  const speak = useCallback(
    (
      text: string,
      options: {
        lang?: string;
        rate?: number;
        pitch?: number;
        volume?: number;
      } = {},
    ) => {
      if (!synthRef.current) {
        return;
      }

      // Cancel any ongoing speech
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Apply options
      utterance.lang = options.lang || "en-US";
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;

      synthRef.current.speak(utterance);
    },
    [],
  );

  // Process voice commands
  const processCommand = useCallback(
    (transcript: string) => {
      const lowerTranscript = transcript.toLowerCase().trim();

      for (const command of commands) {
        const matched = command.keywords.some((keyword) =>
          lowerTranscript.includes(keyword.toLowerCase()),
        );

        if (matched) {
          try {
            command.action(transcript);
            trackInteraction("voice_command_executed", {
              command: command.description,
              transcript,
            });
            return true;
          } catch (error) {
            reportError(error as Error, {
              command: command.description,
              transcript,
            });
            speak(`Sorry, I couldn't execute that command.`);
            return false;
          }
        }
      }

      // No command matched
      speak(`I didn't understand that command. Try saying "help" for available commands.`);
      return false;
    },
    [commands, speak],
  );

  // Set up recognition event handlers
  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    recognition.onstart = () => {
      setState((prev) => ({ ...prev, isListening: true, error: null }));
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";
      let confidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
          confidence = Math.max(confidence, result[0].confidence);
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setState((prev) => ({
        ...prev,
        transcript: finalTranscript || interimTranscript,
        confidence,
      }));

      if (finalTranscript) {
        processCommand(finalTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = "Voice recognition error";

      switch (event.error) {
        case "no-speech":
          errorMessage = "No speech detected";
          break;
        case "audio-capture":
          errorMessage = "Audio capture failed";
          break;
        case "not-allowed":
          errorMessage = "Microphone permission denied";
          break;
        case "network":
          errorMessage = "Network error";
          break;
        case "service-not-allowed":
          errorMessage = "Speech recognition service not allowed";
          break;
      }

      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isListening: false,
      }));

      reportError(new Error(`Voice recognition error: ${event.error}`), {
        errorType: event.error,
      });
    };

    recognition.onend = () => {
      setState((prev) => ({ ...prev, isListening: false }));
    };
  }, [processCommand]);

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current || !state.isSupported) {
      setState((prev) => ({
        ...prev,
        error: "Voice recognition not supported in this browser",
      }));
      return;
    }

    if (state.isListening) {
      recognitionRef.current.stop();
      return;
    }

    try {
      recognitionRef.current.start();
      speak("Listening...", { volume: 0.7 });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Failed to start voice recognition",
      }));
      reportError(error as Error);
    }
  }, [state.isListening, state.isSupported, speak]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop();
    }
  }, [state.isListening]);

  // Get available voices
  const getVoices = useCallback(() => {
    if (!synthRef.current) return [];
    return synthRef.current.getVoices();
  }, []);

  // Default voice commands
  const defaultCommands: VoiceCommand[] = [
    {
      keywords: ["help", "commands", "what can you do"],
      action: () => {
        const commandList = commands.map((cmd) => cmd.description).join(", ");
        speak(`Available commands: ${commandList}`);
      },
      description: "Show available voice commands",
    },
    {
      keywords: ["stop", "cancel", "quit"],
      action: () => {
        stopListening();
        speak("Voice commands stopped");
      },
      description: "Stop voice recognition",
    },
  ];

  const allCommands = [...defaultCommands, ...commands];

  return {
    ...state,
    startListening,
    stopListening,
    speak,
    getVoices,
    availableCommands: allCommands,
  };
}

// Predefined voice commands for common actions
export const commonVoiceCommands: VoiceCommand[] = [
  {
    keywords: ["go home", "home page", "main page"],
    action: () => {
      window.location.href = "/";
    },
    description: "Navigate to home page",
  },
  {
    keywords: ["go to about", "about page", "tell me about"],
    action: () => {
      window.location.href = "/about";
    },
    description: "Navigate to about page",
  },
  {
    keywords: ["contact", "get in touch", "contact page"],
    action: () => {
      window.location.href = "/contact";
    },
    description: "Navigate to contact page",
  },
  {
    keywords: ["agents", "ai agents", "agent builder"],
    action: () => {
      window.location.href = "/agents";
    },
    description: "Navigate to AI agents page",
  },
  {
    keywords: ["scroll down", "scroll", "down"],
    action: () => {
      window.scrollBy({ top: 500, behavior: "smooth" });
    },
    description: "Scroll down the page",
  },
  {
    keywords: ["scroll up", "up"],
    action: () => {
      window.scrollBy({ top: -500, behavior: "smooth" });
    },
    description: "Scroll up the page",
  },
  {
    keywords: ["refresh", "reload"],
    action: () => {
      window.location.reload();
    },
    description: "Refresh the page",
  },
];

export type { VoiceCommand, VoiceCommandsState };
