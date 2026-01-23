import { Mic, MicOff, Volume2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { commonVoiceCommands, useVoiceCommands, type VoiceCommand } from '@/hooks/useVoiceCommands'

interface VoiceCommandButtonProps {
  customCommands?: VoiceCommand[]
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  size?: 'sm' | 'md' | 'lg'
}

export default function VoiceCommandButton({
  customCommands = [],
  position = 'bottom-right',
  size = 'md',
}: VoiceCommandButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const allCommands = [...commonVoiceCommands, ...customCommands]

  const {
    isListening,
    isSupported,
    transcript,
    error,
    confidence,
    startListening,
    stopListening,
    speak,
    availableCommands,
  } = useVoiceCommands(allCommands)

  const [showTranscript, setShowTranscript] = useState(false)

  // Auto-hide transcript after 3 seconds
  useEffect(() => {
    if (transcript) {
      setShowTranscript(true)
      const timer = setTimeout(() => setShowTranscript(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [transcript])

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  }

  // Size classes
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  }

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  if (!isSupported) {
    return null // Don't render if not supported
  }

  return (
    <>
      {/* Voice Command Button */}
      <div className={`fixed ${positionClasses[position]} z-50`}>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              className={`${sizeClasses[size]} rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-cyan-500 hover:bg-cyan-600'
              }`}
              onClick={isListening ? stopListening : startListening}
              aria-label={isListening ? 'Stop voice commands' : 'Start voice commands'}
            >
              {isListening ? (
                <MicOff className={iconSizes[size]} />
              ) : (
                <Mic className={iconSizes[size]} />
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-80 p-4" side="top">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold text-lg">Voice Commands</h3>
                <p className="text-sm text-muted-foreground">
                  Click the microphone to start listening
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center justify-center gap-2">
                <Badge variant={isListening ? 'destructive' : 'secondary'}>
                  {isListening ? 'Listening...' : 'Ready'}
                </Badge>
                {confidence > 0 && (
                  <Badge variant="outline">{Math.round(confidence * 100)}% confidence</Badge>
                )}
              </div>

              {/* Transcript */}
              {showTranscript && transcript && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">You said:</p>
                  <p className="text-sm text-muted-foreground">"{transcript}"</p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Available Commands */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Available Commands:</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {availableCommands.slice(0, 8).map((command) => (
                    <div key={command.keywords[0]} className="flex items-center gap-2 text-xs">
                      <Volume2 className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">"{command.keywords[0]}"</span>
                      <span className="text-foreground">→</span>
                      <span className="text-foreground">{command.description}</span>
                    </div>
                  ))}
                  {availableCommands.length > 8 && (
                    <p className="text-xs text-muted-foreground">
                      ... and {availableCommands.length - 8} more
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    speak(
                      'Voice commands are now active. Try saying "help" for available commands.',
                    )
                  }
                  className="flex-1"
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Test Voice
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Listening Indicator Overlay */}
      {isListening && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-background border rounded-lg p-6 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                <div>
                  <p className="font-medium">Listening for voice commands...</p>
                  <p className="text-sm text-muted-foreground">
                    Speak clearly and try commands like "go home" or "help"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
