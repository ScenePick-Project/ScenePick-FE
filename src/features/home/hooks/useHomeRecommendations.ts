import { useQuery } from "@tanstack/react-query";
import { getHomeRecommendations } from "@features/home/api/homeApi.ts";

export const useHomeRecommendations = (enabled: boolean) =>
  useQuery({
    queryKey: ["home", "recommendations", "random"],
    queryFn: getHomeRecommendations,
    enabled,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
