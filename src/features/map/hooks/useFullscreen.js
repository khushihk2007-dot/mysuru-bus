/**
 * @file useFullscreen.js
 * @description Hook for managing fullscreen state on a given DOM element.
 *
 * Usage:
 *   const { isFullscreen, toggleFullscreen, ref } = useFullscreen();
 *   <div ref={ref}>...</div>
 */

"use client";

import { useRef, useState, useCallback, useEffect } from "react";

/**
 * useFullscreen
 *
 * @returns {{
 *   isFullscreen: boolean,
 *   toggleFullscreen: () => void,
 *   ref: React.RefObject<HTMLElement>,
 * }}
 */
export function useFullscreen() {
  const ref = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ── Track fullscreen change events ───────────────────────────────────
  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await ref.current?.requestFullscreen?.().catch(console.error);
    } else {
      await document.exitFullscreen?.().catch(console.error);
    }
  }, []);

  return { isFullscreen, toggleFullscreen, ref };
}
