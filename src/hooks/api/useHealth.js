import { useQuery } from "@tanstack/react-query";
import { getHealth } from "@/services/api/health";

/**
 * Custom hook to fetch current application health status.
 */
export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
  });
}
