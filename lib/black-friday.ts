export const blackFridayCampaign = {
  // Encerramento oficial em ISO 8601, com o fuso de Brasília: AAAA-MM-DDTHH:mm:ss-03:00.
  // O início é derivado 240 horas antes: 25/11/2026 às 17h, também em Brasília.
  endsAt: "2026-12-05T17:00:00-03:00",
  durationHours: 240,
};

export function getBlackFridayRemainingSeconds(
  now: number,
  endsAt = blackFridayCampaign.endsAt,
): number {
  const deadline = Date.parse(endsAt);
  if (!Number.isFinite(deadline)) return 0;

  return Math.max(
    0,
    Math.min(blackFridayCampaign.durationHours * 3600, Math.ceil((deadline - now) / 1000)),
  );
}

export function formatBlackFridayCountdown(remainingSeconds: number) {
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  return {
    time: `${String(hours).padStart(3, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
    label: `${hours} horas, ${minutes} minutos e ${seconds} segundos`,
  };
}

// As duas apresentações compartilham um único relógio; somente os contadores renderizam por segundo.
const listeners = new Set<() => void>();
let remainingSeconds: number | null = null;
let interval: number | undefined;

function stopClock() {
  window.clearInterval(interval);
  interval = undefined;
  document.removeEventListener("visibilitychange", updateRemainingSeconds);
}

function updateRemainingSeconds() {
  const next = getBlackFridayRemainingSeconds(Date.now());
  if (next !== remainingSeconds) {
    remainingSeconds = next;
    listeners.forEach(listener => listener());
  }
  if (next === 0) stopClock();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    updateRemainingSeconds();
    if (remainingSeconds !== null && remainingSeconds > 0) {
      interval = window.setInterval(updateRemainingSeconds, 1000);
      document.addEventListener("visibilitychange", updateRemainingSeconds);
    }
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) stopClock();
  };
}

const getSnapshot = () => remainingSeconds;
// Mesmo conteúdo no HTML e na primeira renderização do cliente, sem depender do horário do build.
const getServerSnapshot = () => null;

export const blackFridayClock = { subscribe, getSnapshot, getServerSnapshot };
