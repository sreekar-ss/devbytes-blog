/**
 * Session management utilities for analytics
 * Handles anonymous session IDs and IP hashing for privacy
 */

const SESSION_STORAGE_KEY = "devbytes_session_id";
const TRACKING_OPT_OUT_KEY = "devbytes_tracking_opt_out";

/**
 * Generate a new anonymous session ID
 * Uses browser crypto API when available, falls back to timestamp-based ID
 */
export function generateSessionId(): string {
  // Use browser crypto API if available
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  
  // Fallback for server-side or older browsers
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Get or create session ID from localStorage (client-side only)
 */
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") {
    return generateSessionId();
  }
  
  try {
    let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
    
    if (!sessionId) {
      sessionId = generateSessionId();
      localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    }
    
    return sessionId;
  } catch (error) {
    // localStorage might be disabled
    return generateSessionId();
  }
}

/**
 * Clear session ID from localStorage (used after sync to user account)
 */
export function clearSessionId(): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    // Ignore errors
  }
}

/**
 * Check if user has opted out of tracking
 */
export function hasOptedOutOfTracking(): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    return localStorage.getItem(TRACKING_OPT_OUT_KEY) === "true";
  } catch (error) {
    return false;
  }
}

/**
 * Set tracking opt-out preference
 */
export function setTrackingOptOut(optOut: boolean): void {
  if (typeof window === "undefined") return;
  
  try {
    if (optOut) {
      localStorage.setItem(TRACKING_OPT_OUT_KEY, "true");
    } else {
      localStorage.removeItem(TRACKING_OPT_OUT_KEY);
    }
  } catch (error) {
    // Ignore errors
  }
}

/**
 * Hash IP address for privacy-safe storage
 * Uses SHA-256 with a salt
 */
export async function hashIpAddress(ip: string, salt?: string): Promise<string> {
  const saltValue = salt || process.env.IP_HASH_SALT || "devbytes-default-salt";
  const data = `${ip}:${saltValue}`;
  
  // Use Web Crypto API (works in both Node.js and browsers)
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  
  return hashHex;
}

/**
 * Extract IP address from request headers
 * Handles various proxy headers (Vercel, Cloudflare, etc.)
 */
export function getClientIp(headers: Headers): string {
  // Try various headers in order of preference
  const ipHeaders = [
    "x-real-ip",
    "x-forwarded-for",
    "cf-connecting-ip", // Cloudflare
    "x-vercel-forwarded-for", // Vercel
    "x-client-ip",
  ];
  
  for (const header of ipHeaders) {
    const value = headers.get(header);
    if (value) {
      // x-forwarded-for can be a comma-separated list
      const ip = value.split(",")[0].trim();
      if (ip) return ip;
    }
  }
  
  return "unknown";
}

/**
 * Get or create hashed IP from request
 */
export async function getHashedClientIp(headers: Headers): Promise<string> {
  const ip = getClientIp(headers);
  
  if (ip === "unknown") {
    return "unknown";
  }
  
  return await hashIpAddress(ip);
}

/**
 * Store reading session data in localStorage for anonymous users
 */
export interface LocalReadingSession {
  postSlug: string;
  startedAt: number;
  timeSpent: number;
  scrollDepth: number;
}

export function getLocalReadingSessions(): LocalReadingSession[] {
  if (typeof window === "undefined") return [];
  
  try {
    const data = localStorage.getItem("devbytes_reading_sessions");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
}

export function addLocalReadingSession(session: LocalReadingSession): void {
  if (typeof window === "undefined") return;
  
  try {
    const sessions = getLocalReadingSessions();
    sessions.push(session);
    
    // Keep only last 50 sessions
    const trimmed = sessions.slice(-50);
    
    localStorage.setItem("devbytes_reading_sessions", JSON.stringify(trimmed));
  } catch (error) {
    // Ignore errors
  }
}

export function clearLocalReadingSessions(): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.removeItem("devbytes_reading_sessions");
  } catch (error) {
    // Ignore errors
  }
}

/**
 * Calculate total reading time from local sessions
 */
export function getTotalReadingTime(): number {
  const sessions = getLocalReadingSessions();
  return sessions.reduce((total, session) => total + session.timeSpent, 0);
}

/**
 * Get unique posts read count from local sessions
 */
export function getUniquePostsRead(): number {
  const sessions = getLocalReadingSessions();
  const uniqueSlugs = new Set(sessions.map((s) => s.postSlug));
  return uniqueSlugs.size;
}
