import { Bot, Loader2, Send, Sparkles, User } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { aiService } from "@/lib/aiService";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface AIAssistantProps {
  className?: string;
}

// Constants for time-based greetings and delays
const MORNING_HOUR_CUTOFF = 12;
const AFTERNOON_HOUR_CUTOFF = 18;
const AUTO_SUBMIT_DELAY_MS = 100;

const AIAssistant: React.FC<AIAssistantProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    try {
      const response = await aiService.generateResponse(userMessage);
      return response.content;
    } catch (_error) {
      // Fallback response if AI service fails
      return "I'm sorry, I'm having trouble connecting to my AI services right now. Please try again in a moment, or feel free to explore the portfolio directly!";
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const aiResponseText = await generateAIResponse(userMessage.text);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (_error) {
      toast({
        title: "Error",
        description:
          "Sorry, I'm having trouble responding right now. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const getGreetingMessage = () => {
    const hour = new Date().getHours();
    if (hour < MORNING_HOUR_CUTOFF)
      return "Good morning! How can I help you today?";
    if (hour < AFTERNOON_HOUR_CUTOFF)
      return "Good afternoon! How can I help you today?";
    return "Good evening! How can I help you today?";
  };

  const quickQuestions = [
    "Tell me about your experience with React",
    "What projects are you most proud of?",
    "How do you approach performance optimization?",
    "What's your experience with AI technologies?",
  ];

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
    // Auto-submit after setting the input
    setTimeout(() => {
      const form = document.getElementById("ai-chat-form") as HTMLFormElement;
      form?.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true }),
      );
    }, AUTO_SUBMIT_DELAY_MS);
  };

  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 ${className}`}>
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-16 h-16 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
          aria-label="Open AI Assistant"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-linear-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/api/placeholder/40/40" alt="AI Assistant" />
            <AvatarFallback>
              <Sparkles className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">AI Assistant</h3>
            <p className="text-xs opacity-80">Always here to help</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white hover:bg-white/10"
          >
            {isMinimized ? "↗" : "↘"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/10"
          >
            ×
          </Button>
        </div>
      </div>

      {/* Minimized View */}
      {isMinimized && (
        <div className="p-2 text-center text-sm text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
          Click to expand the conversation
        </div>
      )}

      {/* Chat Area */}
      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="h-64 p-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>{getGreetingMessage()}</p>
                <p className="text-sm mt-2">
                  Ask me about projects, technologies, or anything else!
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 mb-4 ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.sender === "ai" && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/api/placeholder/32/32" alt="AI" />
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>

                {message.sender === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/api/placeholder/32/32" alt="You" />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 mb-4 justify-start">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/api/placeholder/32/32" alt="AI" />
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Quick Questions */}
          {messages.length === 0 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Quick questions:
              </p>
              <div className="grid grid-cols-1 gap-2">
                {quickQuestions.map((question) => (
                  <Button
                    key={question}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickQuestion(question)}
                    className="text-xs justify-start text-left"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <form
              id="ai-chat-form"
              onSubmit={handleSendMessage}
              className="flex gap-2"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button type="submit" disabled={!inputValue.trim() || isTyping}>
                {isTyping ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Powered by AI • Responses may be generated
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default AIAssistant;
