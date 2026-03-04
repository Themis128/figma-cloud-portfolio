"use client";

import { Send } from "lucide-react";
import { useState } from "react";

import { AnimatedSection } from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function QuickContactForm() {
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <AnimatedSection>
        <div
          data-testid="form-success"
          className="p-6 rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-center"
        >
          <Send className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
          <p className="text-cyan-400 font-semibold text-lg">Message received!</p>
          <p className="text-foreground/60 text-sm mt-1">
            I'll get back to you as soon as possible.
          </p>
        </div>
      </AnimatedSection>
    );
  }

  return (
    <AnimatedSection>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          name="message"
          aria-label="Quick message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Send me a quick message..."
          rows={4}
          className="bg-card/40 backdrop-blur-sm border-border/20 focus:border-cyan-400/60 resize-none"
        />
        <Button
          type="submit"
          className="w-full bg-cyan-400 hover:bg-cyan-500 text-background font-medium uppercase tracking-wider text-xs"
        >
          <Send className="w-4 h-4 mr-2" />
          Send Message
        </Button>
      </form>
    </AnimatedSection>
  );
}
