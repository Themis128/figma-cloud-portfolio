"use client";

import { Check, Copy, Linkedin, Share2 } from "lucide-react";
import { useCallback, useState } from "react";
import { trackGA4 } from "@/components/GoogleAnalytics";

interface SocialShareProps {
  title: string;
  url: string;
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function SocialShare({ title, url }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      trackGA4("share", { method: "copy_link", content_type: "blog_post", item_id: title });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
    }
  }, [url, title]);

  const shareX = () => {
    trackGA4("share", { method: "x", content_type: "blog_post", item_id: title });
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const shareLinkedIn = () => {
    trackGA4("share", { method: "linkedin", content_type: "blog_post", item_id: title });
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const buttonClass =
    "inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border/30 bg-foreground/5 text-muted-foreground hover:border-cyan-400/30 hover:text-cyan-400 transition-all duration-200";

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono text-muted-foreground/60 mr-1">
        <Share2 className="h-3.5 w-3.5 inline mr-1" />
        Share
      </span>
      <button
        onClick={shareX}
        className={buttonClass}
        aria-label="Share on X"
      >
        <XIcon className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={shareLinkedIn}
        className={buttonClass}
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={handleCopy}
        className={buttonClass}
        aria-label="Copy link"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-cyan-400" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}
