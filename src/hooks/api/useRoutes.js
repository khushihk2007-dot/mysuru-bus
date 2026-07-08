import { useQuery } from "@tanstack/react-query";
import { getRoutes, getRoute, getRouteStops } from "@/services/api/routes";

/**
 * Custom hook to fetch all transit routes.
 */
export function useRoutes() {
  return useQuery({
    queryKey: ["routes"],
    queryFn: getRoutes,
  });
}

/**
 * Custom hook to fetch details for a single route.
 * @param {string} routeId
 */
export function useRoute(routeId) {
  return useQuery({
    queryKey: ["route", routeId],
    queryFn: () => getRoute(routeId),
    enabled: !!routeId,
  });
}

/**
 * Custom hook to fetch stops served by a specific route.
 * @param {string} routeId
 */
export function useRouteStops(routeId) {
  return useQuery({
    queryKey: ["routeStops", routeId],
    queryFn: () => getRouteStops(routeId),
    enabled: !!routeId,
  });
}
