"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import BookingCard from "@/components/BookingCard";

type MessageAction = "start_booking";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  action?: MessageAction;
};

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm Themis's AI assistant. Ask me anything about his skills, experience, or background — or book a teleconference call.",
};

const SUGGESTED_QUESTIONS = [
  "What are your top skills?",
  "Tell me about your cloud experience.",
  "What certifications do you hold?",
  "Book a call with Themis.",
];

function TypingCursor() {
  return (
    <span className="inline-block w-2 h-4 bg-cyan-400 ml-0.5 animate-pulse align-middle" />
  );
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  function handleBookingComplete(assistantId: string) {
    // Replace the booking card message with a completion note.
    // Use destructuring to drop the `action` key (exactOptionalPropertyTypes requirement).
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== assistantId) return m;
        const { action: _removed, ...rest } = m;
        return {
          ...rest,
          content:
            "Your call is booked! I've sent a confirmation to your email. Is there anything else you'd like to know?",
        };
      }),
    );
  }

  async function sendMessage(text?: string) {
    const messageText = (text ?? input).trim();
    if (!messageText || isStreaming) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText,
    };
    const assistantId = crypto.randomUUID();
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      streaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setIsStreaming(true);

    // Build history (exclude welcome message)
    const history = messages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText, history }),
      });

      if (!res.ok || !res.body) {
        const errData = (await res
          .json()
          .catch(() => ({ error: "Unknown error" }))) as { error?: string };
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: `Error: ${errData.error ?? "Failed to connect"}`,
                  streaming: false,
                }
              : m,
          ),
        );
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const raw = line.slice(5).trim();
          if (raw === "[DONE]") break;
          try {
            const parsed = JSON.parse(raw) as {
              token?: string;
              error?: string;
              action?: MessageAction;
            };

            if (parsed.error) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        content: `Error: ${parsed.error}`,
                        streaming: false,
                      }
                    : m,
                ),
              );
              return;
            }

            if (parsed.action === "start_booking") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        content: "",
                        action: "start_booking",
                        streaming: false,
                      }
                    : m,
                ),
              );
              return;
            }

            if (parsed.token) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + parsed.token }
                    : m,
                ),
              );
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Connection failed";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: `Error: ${msg}`, streaming: false }
            : m,
        ),
      );
    } finally {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, streaming: false } : m,
        ),
      );
      setIsStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  }

  const showSuggestions = messages.length === 1 && !isStreaming;

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-label="Open chat"
        aria-hidden={isOpen || undefined}
        tabIndex={isOpen ? -1 : undefined}
        suppressHydrationWarning
        className={[
          "fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3",
          "rounded-full border border-cyan-500/60 bg-black/80 backdrop-blur-md",
          "text-cyan-400 font-mono text-sm font-medium",
          "shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]",
          "transition-all duration-300",
          isOpen
            ? "opacity-0 pointer-events-none scale-90"
            : "opacity-100 scale-100",
        ].join(" ")}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
        </span>
        Chat with AI
      </button>

      {/* Chat panel */}
      <div
        className={[
          "fixed bottom-6 right-6 z-50 flex flex-col",
          "w-88 sm:w-96 h-150",
          "rounded-xl border border-cyan-500/30 bg-black/85 backdrop-blur-xl",
          "shadow-[0_0_40px_rgba(34,211,238,0.15)]",
          "transition-all duration-300 origin-bottom-right",
          isOpen
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-90 pointer-events-none",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-cyan-500/20">
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold">
              TB
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-black" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-cyan-300 font-mono text-sm font-semibold leading-none">
              AI Assistant
            </p>
            <p className="text-cyan-500/60 font-mono text-xs mt-0.5">
              Themis&apos;s Portfolio Bot
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
            className="text-cyan-500/50 hover:text-cyan-400 transition-colors p-1"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-3">
          <div className="flex flex-col gap-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.action === "start_booking" ? (
                  <div className="w-full">
                    <BookingCard
                      onComplete={() => handleBookingComplete(msg.id)}
                    />
                  </div>
                ) : (
                  <div
                    className={[
                      "max-w-[80%] rounded-lg px-3 py-2 font-mono text-xs leading-relaxed",
                      msg.role === "user"
                        ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-200"
                        : "bg-white/5 border border-white/10 text-gray-300",
                    ].join(" ")}
                  >
                    {msg.content || (msg.streaming ? null : "…")}
                    {msg.streaming && <TypingCursor />}
                  </div>
                )}
              </div>
            ))}

            {/* Suggested questions */}
            {showSuggestions && (
              <div className="flex flex-col gap-1.5 mt-2">
                <p className="text-cyan-500/50 font-mono text-xs">
                  Suggested questions:
                </p>
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => void sendMessage(q)}
                    className="text-left text-xs font-mono text-cyan-400/80 border border-cyan-500/20 rounded px-2.5 py-1.5 hover:border-cyan-500/50 hover:text-cyan-300 hover:bg-cyan-500/5 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2 px-4 py-3 border-t border-cyan-500/20">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about Themis…"
            disabled={isStreaming}
            className={[
              "flex-1 bg-white/5 border-cyan-500/30 text-gray-200 placeholder:text-cyan-500/30",
              "font-mono text-xs focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/60",
            ].join(" ")}
          />
          <Button
            onClick={() => void sendMessage()}
            disabled={isStreaming || !input.trim()}
            className="bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30 hover:text-cyan-300 font-mono text-xs px-3"
            variant="outline"
          >
            {isStreaming ? (
              <span className="flex gap-0.5 items-center">
                <span className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce [animation-delay:0ms]" />
                <span className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce [animation-delay:150ms]" />
                <span className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce [animation-delay:300ms]" />
              </span>
            ) : (
              "Send"
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
