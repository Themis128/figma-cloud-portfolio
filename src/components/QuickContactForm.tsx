"use client";

import { AlertCircle, CheckCircle, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { trackLead } from "@/components/GoogleAnalytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRecaptcha } from "@/hooks/useRecaptcha";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
const CONTACT_URL =
  process.env.NEXT_PUBLIC_LAMBDA_CONTACT_URL || `${API_BASE_URL}/contact`;

export default function QuickContactForm() {
  const { getToken, preload } = useRecaptcha();
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    try {
      const recaptchaToken = await getToken("quick_contact");

      const res = await fetch(CONTACT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          subject: "Quick Contact from Homepage",
          ...(recaptchaToken !== undefined && { recaptchaToken }),
        }),
      });

      const result = (await res.json()) as { success: boolean; message: string };

      if (result.success) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
        trackLead("quick_contact", "homepage");
      } else {
        setStatus("error");
        setErrorMsg(result.message || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Failed to send message. Please try again later.");
    }
  };

  if (status === "success") {
    return (
      <AnimatedSection>
        <div
          data-testid="form-success"
          role="alert"
          className="p-6 rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-center"
        >
          <CheckCircle className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
          <p className="text-cyan-400 font-semibold text-lg">Message sent!</p>
          <p className="text-foreground/60 text-sm mt-1">
            I&apos;ll get back to you as soon as possible.
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="mt-3 text-cyan-400/70 hover:text-cyan-400 text-xs underline underline-offset-2"
          >
            Send another message
          </button>
        </div>
      </AnimatedSection>
    );
  }

  const inputClass =
    "bg-card/40 backdrop-blur-sm border-border/20 focus:border-cyan-400/60";

  return (
    <AnimatedSection>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            id="quick-name"
            name="name"
            aria-label="Your name"
            placeholder="Your name"
            required
            value={formData.name}
            onFocus={preload}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            className={inputClass}
            disabled={status === "submitting"}
          />
          <Input
            id="quick-email"
            name="email"
            type="email"
            aria-label="Your email"
            placeholder="your@email.com"
            required
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            className={inputClass}
            disabled={status === "submitting"}
          />
        </div>
        <Textarea
          id="quick-message"
          name="message"
          aria-label="Quick message"
          value={formData.message}
          onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
          placeholder="Send me a quick message..."
          required
          rows={4}
          className={`${inputClass} resize-none`}
          disabled={status === "submitting"}
        />

        {status === "error" && (
          <div role="alert" className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={status === "submitting"}
          className="w-full bg-cyan-400 hover:bg-cyan-500 text-background font-medium uppercase tracking-wider text-xs"
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending…
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </>
          )}
        </Button>

        <p className="text-xs text-foreground/40 mt-2 leading-relaxed">
          This site is protected by reCAPTCHA and the Google{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground/60"
          >
            Privacy Policy
          </a>{" "}
          and{" "}
          <a
            href="https://policies.google.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground/60"
          >
            Terms of Service
          </a>{" "}
          apply. By submitting, you agree to our{" "}
          <Link
            href="/privacy/"
            className="underline underline-offset-2 hover:text-foreground/60"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </AnimatedSection>
  );
}
