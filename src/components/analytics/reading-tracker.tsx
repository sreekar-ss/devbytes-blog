"use client";

import { useReadingSession } from "@/hooks/use-reading-session";

interface ReadingTrackerProps {
  postSlug: string;
  postId: string;
}

/**
 * Client component that tracks reading sessions
 * Monitors time spent and scroll depth, sends data to analytics API
 */
export function ReadingTracker({ postSlug, postId }: ReadingTrackerProps) {
  useReadingSession(postSlug, postId);
  
  // This component doesn't render anything visible
  return null;
}
