import { Vote } from "./contract";

const STORAGE_PREFIX = "ppm:84532:0x6b8f5826Ff8C03C597482483EC1f7E60a5Fda5A7";

export interface StoredCommitment {
  vote: Vote;
  salt: `0x${string}`;
  timestamp: number;
}

export function generateSalt(): `0x${string}` {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `0x${Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`;
}

export function saveCommitment(
  walletAddress: string,
  marketId: number,
  vote: Vote,
  salt: `0x${string}`
): void {
  const key = `${STORAGE_PREFIX}:${walletAddress.toLowerCase()}:${marketId}`;
  const data: StoredCommitment = {
    vote,
    salt,
    timestamp: Date.now(),
  };
  localStorage.setItem(key, JSON.stringify(data));
}

export function loadCommitment(
  walletAddress: string,
  marketId: number
): StoredCommitment | null {
  const key = `${STORAGE_PREFIX}:${walletAddress.toLowerCase()}:${marketId}`;
  const stored = localStorage.getItem(key);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function clearCommitment(walletAddress: string, marketId: number): void {
  const key = `${STORAGE_PREFIX}:${walletAddress.toLowerCase()}:${marketId}`;
  localStorage.removeItem(key);
}
