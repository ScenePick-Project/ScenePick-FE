import { useQuery } from "@tanstack/react-query";
import { getHomeRecommendations } from "@features/home/api/homeApi.ts";

export const useHomeRecommendations = () =>
  useQuery({
    queryKey: ["home", "recommendations", "random"],
    queryFn: getHomeRecommendations,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
