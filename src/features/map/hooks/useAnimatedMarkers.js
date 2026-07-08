/**
 * src/features/map/hooks/useAnimatedMarkers.js
 *
 * Hook to manage active, entering, and exiting bus markers.
 * Maintains memory of markers even when they are removed from the live feed,
 * allowing exit animations to play fully before removal.
 */

import { useState, useEffect } from "react";

/**
 * Custom hook to track bus markers with entrance and exit states.
 *
 * @param {Array} buses - The current list of live buses from the query.
 * @returns {object} Object containing list of animated markers and clean-up functions.
 */
export function useAnimatedMarkers(buses = []) {
  const [markersMap, setMarkersMap] = useState({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMarkersMap((prevMap) => {
      const nextMap = {};
      const currentIds = new Set(buses.map((b) => b.id));

      // 1. Process current/updated buses
      buses.forEach((bus) => {
        const existing = prevMap[bus.id];
        if (!existing) {
          // Brand new bus: set status to entering
          nextMap[bus.id] = {
            id: bus.id,
            bus,
            status: "entering",
          };
        } else {
          // Existing active bus: keep active, update data
          nextMap[bus.id] = {
            id: bus.id,
            bus,
            status: existing.status === "exiting" ? "active" : existing.status,
            prevBus: existing.bus, // Cache the previous data for interpolation reference
          };
        }
      });

      // 2. Process removed buses (transition to exiting)
      Object.keys(prevMap).forEach((id) => {
        if (!currentIds.has(id)) {
          const existing = prevMap[id];
          // If it was already exiting, keep it exiting
          nextMap[id] = {
            ...existing,
            status: "exiting",
          };
        }
      });

      return nextMap;
    });
  }, [buses]);

  // Remove a marker completely from state (called after fade-out transition finishes)
  const handleRemoveMarker = (id) => {
    setMarkersMap((prevMap) => {
      if (!prevMap[id]) return prevMap;
      const nextMap = { ...prevMap };
      delete nextMap[id];
      return nextMap;
    });
  };

  return {
    markers: Object.values(markersMap),
    removeMarker: handleRemoveMarker,
  };
}
