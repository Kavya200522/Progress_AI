import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span className="bg-progress-gradient flex h-8 w-8 items-center justify-center rounded-lg">
        <span className="block h-3 w-3 rounded-sm bg-background" />
      </span>
      {!compact && (
        <span className="font-display text-lg font-semibold tracking-tight">ProgressAI</span>
      )}
    </span>
  );
}
