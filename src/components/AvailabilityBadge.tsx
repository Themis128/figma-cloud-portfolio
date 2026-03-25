interface AvailabilityBadgeProps {
  /** Status text shown next to the pulse dot */
  status?: string;
  /** @deprecated No longer used. Kept for API compatibility. */
  delay?: number;
}

export default function AvailabilityBadge({
  status = "Available for Consulting",
}: AvailabilityBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-cyan-400/20 bg-cyan-400/5 backdrop-blur-sm px-4 py-1.5">
      {/* Pulse dot */}
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
      </span>
      <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
        {status}
      </span>
    </div>
  );
}
