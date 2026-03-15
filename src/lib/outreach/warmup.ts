/**
 * Warmup phase schedule:
 *   phase_1: Days 1-3   → 5/day
 *   phase_2: Days 4-7   → 10/day
 *   phase_3: Days 8-11  → 20/day
 *   phase_4: Days 12-16 → 30/day
 *   phase_5: Days 17-21 → 40/day
 *   complete: Day 22+   → 50/day
 */

interface WarmupState {
  warmupDay: number;
  warmupPhase: string;
  dailyLimit: number;
  consecutiveErrors: number;
  warmupEnabled: boolean;
}

interface WarmupResult {
  phase: string;
  dailyLimit: number;
  warmupDay: number;
}

const PHASES: { name: string; maxDay: number; limit: number }[] = [
  { name: "phase_1", maxDay: 3, limit: 5 },
  { name: "phase_2", maxDay: 7, limit: 10 },
  { name: "phase_3", maxDay: 11, limit: 20 },
  { name: "phase_4", maxDay: 16, limit: 30 },
  { name: "phase_5", maxDay: 21, limit: 40 },
  { name: "complete", maxDay: Infinity, limit: 50 },
];

export function advanceWarmup(account: WarmupState): WarmupResult {
  if (!account.warmupEnabled) {
    return {
      phase: account.warmupPhase,
      dailyLimit: account.dailyLimit,
      warmupDay: account.warmupDay,
    };
  }

  // Pause advancement if too many consecutive errors
  if (account.consecutiveErrors >= 3) {
    return {
      phase: account.warmupPhase,
      dailyLimit: account.dailyLimit,
      warmupDay: account.warmupDay,
    };
  }

  const newDay = account.warmupDay + 1;

  // Find the right phase for this day
  const phase = PHASES.find((p) => newDay <= p.maxDay) || PHASES[PHASES.length - 1];

  return {
    phase: phase.name,
    dailyLimit: phase.limit,
    warmupDay: newDay,
  };
}

export function getWarmupInfo(phase: string): { label: string; limit: number; targetDay: string } {
  const info: Record<string, { label: string; limit: number; targetDay: string }> = {
    phase_1: { label: "Phase 1", limit: 5, targetDay: "Day 1-3" },
    phase_2: { label: "Phase 2", limit: 10, targetDay: "Day 4-7" },
    phase_3: { label: "Phase 3", limit: 20, targetDay: "Day 8-11" },
    phase_4: { label: "Phase 4", limit: 30, targetDay: "Day 12-16" },
    phase_5: { label: "Phase 5", limit: 40, targetDay: "Day 17-21" },
    complete: { label: "Complete", limit: 50, targetDay: "Day 22+" },
  };
  return info[phase] || info.phase_1;
}
