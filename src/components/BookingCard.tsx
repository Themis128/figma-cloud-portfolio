"use client";

import { useEffect, useState } from "react";
import { getBookingSlots, createBooking } from "@/lib/api";

interface BookingCardProps {
  onComplete: () => void;
}

interface SlotsByDate {
  [date: string]: string[];
}

type Step =
  | "loading"
  | "pick_slot"
  | "details"
  | "confirming"
  | "done"
  | "error";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(isoStr: string, timeZone: string): string {
  return new Date(isoStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
  });
}

export default function BookingCard({ onComplete }: BookingCardProps) {
  const [step, setStep] = useState<Step>("loading");
  const [slotsByDate, setSlotsByDate] = useState<SlotsByDate>({});
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [meetingUrl, setMeetingUrl] = useState<string | null>(null);

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    async function fetchSlots() {
      try {
        const data = await getBookingSlots();
        const hasSlots = Object.values(data.slots).some((s) => s.length > 0);
        if (!hasSlots) {
          setErrorMsg(
            "No available slots in the next 7 days. Please check back later.",
          );
          setStep("error");
          return;
        }
        setSlotsByDate(data.slots);
        setStep("pick_slot");
      } catch (err) {
        setErrorMsg(
          err instanceof Error ? err.message : "Failed to load slots",
        );
        setStep("error");
      }
    }
    void fetchSlots();
  }, []);

  async function handleConfirm() {
    if (!selectedSlot || !name.trim() || !email.trim()) return;
    setStep("confirming");
    setErrorMsg("");
    try {
      const data = await createBooking({
        start: selectedSlot,
        name: name.trim(),
        email: email.trim(),
        timeZone,
      });
      setMeetingUrl(data.meetingUrl ?? null);
      setStep("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Booking failed");
      setStep("details");
    }
  }

  const baseCard =
    "w-full rounded-lg border border-cyan-500/20 bg-white/5 p-3 font-mono text-xs text-gray-300";
  const btnBase =
    "rounded border font-mono text-xs px-2.5 py-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed";
  const btnCyan = `${btnBase} border-cyan-500/40 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/60`;
  const btnGhost = `${btnBase} border-white/10 bg-white/5 text-gray-400 hover:bg-white/10`;

  if (step === "loading") {
    return (
      <div className={baseCard}>
        <p className="text-cyan-400/70 mb-2">Loading available slots…</p>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-7 flex-1 rounded bg-white/10 animate-pulse"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className={baseCard}>
        <p className="text-red-400 mb-1">Booking unavailable</p>
        <p className="text-gray-500">{errorMsg}</p>
      </div>
    );
  }

  if (step === "pick_slot") {
    const dates = Object.keys(slotsByDate).filter(
      (d) => (slotsByDate[d]?.length ?? 0) > 0,
    );
    return (
      <div className={baseCard}>
        <p className="text-cyan-400 mb-2 uppercase tracking-wider text-[10px]">
          Pick a time slot
        </p>
        <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
          {dates.map((date) => (
            <div key={date}>
              <p className="text-cyan-500/60 text-[10px] uppercase tracking-wider mb-1">
                {formatDate(date)}
              </p>
              <div className="flex flex-wrap gap-1">
                {(slotsByDate[date] ?? []).map((slot) => (
                  <button
                    key={slot}
                    onClick={() => {
                      setSelectedSlot(slot);
                      setStep("details");
                    }}
                    className={`${btnCyan} text-[10px]`}
                  >
                    {formatTime(slot, timeZone)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (step === "details") {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const canSubmit =
      name.trim().length > 0 && emailValid && selectedSlot !== null;
    return (
      <div className={baseCard}>
        <p className="text-cyan-400 mb-1 uppercase tracking-wider text-[10px]">
          Your details
        </p>
        {selectedSlot && (
          <p className="text-cyan-500/60 text-[10px] mb-2">
            {formatTime(selectedSlot, timeZone)} ·{" "}
            {formatDate(selectedSlot.split("T")[0] ?? "")}
          </p>
        )}
        <div className="flex flex-col gap-2 mb-3">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border border-cyan-500/20 bg-white/5 px-2.5 py-1.5 text-xs text-gray-200 placeholder:text-gray-600 focus:border-cyan-500/50 focus:outline-none"
          />
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-cyan-500/20 bg-white/5 px-2.5 py-1.5 text-xs text-gray-200 placeholder:text-gray-600 focus:border-cyan-500/50 focus:outline-none"
          />
          <p className="text-[10px] text-gray-600">Timezone: {timeZone}</p>
        </div>
        {errorMsg && (
          <p className="text-red-400 text-[10px] mb-2">{errorMsg}</p>
        )}
        <div className="flex gap-2">
          <button
            className={btnCyan}
            onClick={() => void handleConfirm()}
            disabled={!canSubmit}
          >
            Confirm Booking
          </button>
          <button
            className={btnGhost}
            onClick={() => {
              setStep("pick_slot");
              setErrorMsg("");
            }}
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  if (step === "confirming") {
    return (
      <div className={baseCard}>
        <p className="text-cyan-400/70">Creating your booking…</p>
        <div className="flex gap-0.5 mt-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // step === 'done'
  return (
    <div className={baseCard}>
      <p className="text-green-400 mb-1">✓ Booked!</p>
      {selectedSlot && (
        <p className="text-gray-400 text-[10px] mb-2">
          {formatTime(selectedSlot, timeZone)} ·{" "}
          {formatDate(selectedSlot.split("T")[0] ?? "")}
        </p>
      )}
      {meetingUrl && (
        <a
          href={meetingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 underline text-[10px] block mb-2 hover:text-cyan-300"
        >
          Join meeting link →
        </a>
      )}
      <p className="text-gray-500 text-[10px] mb-3">
        A confirmation email has been sent to {email}.
      </p>
      <button className={btnCyan} onClick={onComplete}>
        Done
      </button>
    </div>
  );
}
