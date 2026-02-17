"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getOrCreateSessionId, hasOptedOutOfTracking } from "@/lib/analytics/session";

export interface ReadingSessionData {
  postSlug: string;
  postId: string;
  startTime: number;
  scrollDepth: number;
  timeSpent: number;
}

export function useReadingSession(postSlug: string, postId: string) {
  const { data: session } = useSession();
  const [sessionData, setSessionData] = useState<ReadingSessionData>({
    postSlug,
    postId,
    startTime: Date.now(),
    scrollDepth: 0,
    timeSpent: 0,
  });
  
  const sessionIdRef = useRef<string | null>(null);
  const scrollDepthRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(Date.now());
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const timeSpentRef = useRef<number>(0);
  const hasSentDataRef = useRef<boolean>(false);

  // Initialize session ID
  useEffect(() => {
    if (!hasOptedOutOfTracking()) {
      sessionIdRef.current = getOrCreateSessionId();
    }
  }, []);

  // Track scroll depth
  const updateScrollDepth = useCallback(() => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const scrollPercent = Math.round(
      ((scrollTop + windowHeight) / documentHeight) * 100
    );
    
    const newDepth = Math.min(100, Math.max(scrollDepthRef.current, scrollPercent));
    
    if (newDepth !== scrollDepthRef.current) {
      scrollDepthRef.current = newDepth;
      setSessionData((prev) => ({
        ...prev,
        scrollDepth: newDepth,
      }));
    }
  }, []);

  // Update time spent
  const updateTimeSpent = useCallback(() => {
    const now = Date.now();
    const elapsed = now - lastUpdateRef.current;
    
    timeSpentRef.current += elapsed;
    
    setSessionData((prev) => ({
      ...prev,
      timeSpent: timeSpentRef.current,
    }));
    
    lastUpdateRef.current = now;
  }, []);

  // Debounced update function
  const scheduleUpdate = useCallback(() => {
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current);
    }
    
    updateTimerRef.current = setTimeout(() => {
      updateScrollDepth();
      updateTimeSpent();
    }, 2000); // Update every 2 seconds
  }, [updateScrollDepth, updateTimeSpent]);

  // Track scroll events
  useEffect(() => {
    const handleScroll = () => {
      scheduleUpdate();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Initial scroll depth check
    updateScrollDepth();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
    };
  }, [scheduleUpdate, updateScrollDepth]);

  // Track visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, update time spent
        updateTimeSpent();
      } else {
        // Page is visible again, reset last update time
        lastUpdateRef.current = Date.now();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [updateTimeSpent]);

  // Send tracking data to API
  const sendTrackingData = useCallback(async () => {
    if (hasOptedOutOfTracking() || !sessionIdRef.current || hasSentDataRef.current) {
      return;
    }

    // Mark as sent to prevent duplicate sends
    hasSentDataRef.current = true;

    // Final update before sending
    const now = Date.now();
    const finalTimeSpent = timeSpentRef.current + (now - lastUpdateRef.current);

    const data = {
      postId,
      postSlug,
      sessionId: sessionIdRef.current,
      userId: session?.user?.id || null,
      startedAt: new Date(startTimeRef.current),
      timeSpent: Math.round(finalTimeSpent / 1000), // Convert to seconds
      scrollDepth: scrollDepthRef.current,
      hasJavaScript: true,
    };

    try {
      // Use sendBeacon for reliable delivery on page unload
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(data)], {
          type: "application/json",
        });
        navigator.sendBeacon("/api/analytics/track", blob);
      } else {
        // Fallback to fetch
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          keepalive: true,
        });
      }
    } catch (error) {
      console.error("Failed to send tracking data:", error);
    }
    
    // Reset flag after a delay to allow periodic updates
    setTimeout(() => {
      hasSentDataRef.current = false;
    }, 5000);
  }, [session?.user?.id, postId, postSlug]);

  // Send data on unmount or page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      hasSentDataRef.current = false; // Allow final send
      sendTrackingData();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      hasSentDataRef.current = false; // Allow final send
      sendTrackingData();
    };
  }, [sendTrackingData]);

  return {
    sessionData,
    sessionId: sessionIdRef.current,
    isTracking: !hasOptedOutOfTracking(),
  };
}
