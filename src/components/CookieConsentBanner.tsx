"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { useConsent } from "@/hooks/useConsent";

// ---------------------------------------------------------------------------
// CookieConsentBanner — fixed bottom banner with simple / customise views
// ---------------------------------------------------------------------------

export function CookieConsentBanner() {
  const { consent, hasConsented, updateConsent, acceptAll, rejectAll } =
    useConsent();

  const [showCustomise, setShowCustomise] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // ---- focus trap ----
  useEffect(() => {
    if (hasConsented) return;

    const banner = bannerRef.current;
    if (!banner) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab" || !banner) return;

      const focusable = banner.querySelectorAll<HTMLElement>(
        'button, a[href], input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    // Auto-focus the first button when banner appears
    firstFocusableRef.current?.focus();

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [hasConsented, showCustomise]);

  // Don't render anything if the user already consented
  if (hasConsented) return null;

  const handleSavePreferences = () => {
    // Saving preferences via individual toggles already persists via
    // updateConsent. We just need to trigger acceptAll with current values
    // to stamp the timestamp and close the banner.
    // The consent state is already up-to-date from toggle changes.
    acceptAll();
    // Override with actual current toggle values
    updateConsent("analytics", consent.analytics);
    updateConsent("marketing", consent.marketing);
  };

  return (
    <div
      ref={bannerRef}
      role="dialog"
      aria-label="Cookie consent"
      aria-modal="true"
      className="fixed inset-x-0 bottom-0 z-50 bg-black/90 backdrop-blur-xl border-t border-cyan-500/20 shadow-[0_-4px_30px_rgba(0,255,255,0.06)]"
    >
      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
        {/* ---- Simple view ---- */}
        {!showCustomise && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 space-y-1">
              <p className="text-sm text-gray-300">
                This site uses cookies to measure performance and improve your
                experience.{" "}
                <Link
                  href="/privacy/"
                  className="font-mono text-cyan-400 underline underline-offset-2 hover:text-cyan-300"
                >
                  Privacy Policy
                </Link>{" "}
                &middot;{" "}
                <Link
                  href="/cookies/"
                  className="font-mono text-cyan-400 underline underline-offset-2 hover:text-cyan-300"
                >
                  Cookie Policy
                </Link>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                ref={firstFocusableRef}
                onClick={rejectAll}
                className="rounded-md border border-cyan-500/30 bg-transparent px-4 py-2 text-sm font-mono text-cyan-400 transition-colors hover:border-cyan-400 hover:bg-cyan-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                aria-label="Reject non-essential cookies"
              >
                Reject Non-Essential
              </button>
              <button
                onClick={() => setShowCustomise(true)}
                className="rounded-md border border-cyan-500/30 bg-transparent px-4 py-2 text-sm font-mono text-cyan-400 transition-colors hover:border-cyan-400 hover:bg-cyan-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                aria-label="Customise cookie preferences"
              >
                Customise
              </button>
              <button
                onClick={acceptAll}
                className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-mono font-semibold text-black transition-colors hover:bg-cyan-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                aria-label="Accept all cookies"
              >
                Accept All
              </button>
            </div>
          </div>
        )}

        {/* ---- Customise view ---- */}
        {showCustomise && (
          <div className="space-y-5">
            <h2 className="font-mono text-sm uppercase tracking-[0.15em] text-cyan-400">
              Cookie Preferences
            </h2>

            {/* Essential — always on */}
            <ConsentRow
              label="Essential"
              description="Required for the site to function. Cannot be disabled."
              checked={true}
              disabled
            />

            {/* Analytics */}
            <ConsentRow
              label="Analytics"
              description="GA4, Sentry error tracking, and Web Vitals performance metrics."
              checked={consent.analytics}
              onCheckedChange={(v) => updateConsent("analytics", v)}
            />

            {/* Marketing */}
            <ConsentRow
              label="Marketing"
              description="Push notifications and promotional content delivery."
              checked={consent.marketing}
              onCheckedChange={(v) => updateConsent("marketing", v)}
            />

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => setShowCustomise(false)}
                className="rounded-md border border-cyan-500/30 bg-transparent px-4 py-2 text-sm font-mono text-cyan-400 transition-colors hover:border-cyan-400 hover:bg-cyan-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                aria-label="Go back to simple cookie banner"
              >
                Back
              </button>
              <button
                onClick={handleSavePreferences}
                className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-mono font-semibold text-black transition-colors hover:bg-cyan-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                aria-label="Save cookie preferences"
              >
                Save Preferences
              </button>
            </div>

            <p className="text-xs text-gray-500">
              See our{" "}
              <Link
                href="/privacy/"
                className="font-mono text-cyan-400/70 underline underline-offset-2 hover:text-cyan-300"
              >
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link
                href="/cookies/"
                className="font-mono text-cyan-400/70 underline underline-offset-2 hover:text-cyan-300"
              >
                Cookie Policy
              </Link>{" "}
              for full details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ConsentRow — single toggle row used in the customise view
// ---------------------------------------------------------------------------

interface ConsentRowProps {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange?: (value: boolean) => void;
}

function ConsentRow({
  label,
  description,
  checked,
  disabled = false,
  onCheckedChange,
}: ConsentRowProps) {
  const id = `consent-${label.toLowerCase()}`;

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-cyan-500/10 bg-white/3 px-4 py-3">
      <div className="space-y-0.5">
        <label
          htmlFor={id}
          className="block font-mono text-sm font-medium text-gray-200"
        >
          {label}
          {disabled && (
            <span className="ml-2 text-xs text-cyan-500/60">(always on)</span>
          )}
        </label>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <Switch
        id={id}
        checked={checked}
        disabled={disabled}
        {...(onCheckedChange !== undefined && { onCheckedChange })}
        aria-label={`${disabled ? "Essential cookies are always enabled" : `Toggle ${label.toLowerCase()} cookies`}`}
        className="data-[state=checked]:bg-cyan-500"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// ManageCookiesButton — small link-style button for use in the site footer
// ---------------------------------------------------------------------------

export function ManageCookiesButton() {
  const { resetConsent } = useConsent();

  return (
    <button
      onClick={resetConsent}
      className="font-mono text-xs text-gray-500 underline underline-offset-2 transition-colors hover:text-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      aria-label="Manage cookie preferences"
    >
      Manage Cookies
    </button>
  );
}
