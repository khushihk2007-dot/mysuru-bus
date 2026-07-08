import { useQuery } from "@tanstack/react-query";
import { getRouteBuses } from "@/services/api/routes";
import { getAllBuses } from "@/services/api/buses";

/**
 * Custom hook to fetch live buses operating on a specific route.
 * Automatically polls every 5 seconds.
 * @param {string} routeId
 */
export function useLiveBuses(routeId) {
  return useQuery({
    queryKey: ["liveBuses", routeId],
    queryFn: () => getRouteBuses(routeId),
    enabled: !!routeId,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });
}

/**
 * Custom hook to fetch all active fleet live buses.
 * Automatically polls every 5 seconds.
 */
export function useAllBuses() {
  return useQuery({
    queryKey: ["allBuses"],
    queryFn: getAllBuses,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });
}
