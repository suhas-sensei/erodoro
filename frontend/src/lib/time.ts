export function getTimeRemaining(endTimestamp: bigint): {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
} {
  const now = Math.floor(Date.now() / 1000);
  const end = Number(endTimestamp);
  const total = end - now;

  if (total <= 0) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const days = Math.floor(total / (60 * 60 * 24));
  const hours = Math.floor((total % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((total % (60 * 60)) / 60);
  const seconds = Math.floor(total % 60);

  return { total, days, hours, minutes, seconds, isExpired: false };
}

export function formatTimeRemaining(endTimestamp: bigint): string {
  const { days, hours, minutes, isExpired } = getTimeRemaining(endTimestamp);

  if (isExpired) return "Ended";

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function formatTimestamp(timestamp: bigint): string {
  return new Date(Number(timestamp) * 1000).toLocaleString();
}
