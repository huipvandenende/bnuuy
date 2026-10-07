import { DAY_MS, HOUR_MS, MINUTE_MS } from '../game/constants';

export function formatDuration(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / MINUTE_MS));
  const days = Math.floor(totalMinutes / (DAY_MS / MINUTE_MS));
  const hours = Math.floor((totalMinutes % (DAY_MS / MINUTE_MS)) / (HOUR_MS / MINUTE_MS));
  const minutes = totalMinutes % (HOUR_MS / MINUTE_MS);
  if (days > 0) return hours > 0 ? `${days} d ${hours} h` : `${days} d`;
  if (hours > 0) return minutes > 0 ? `${hours} h ${minutes} min` : `${hours} h`;
  return `${minutes} min`;
}

export function formatCountdown(ms: number): string {
  const minutes = Math.max(1, Math.ceil(ms / MINUTE_MS));
  return formatDuration(minutes * MINUTE_MS);
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
