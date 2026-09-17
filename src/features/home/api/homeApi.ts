import { request } from "@shared/request.ts";
import type { HomeRecommendationsResponse } from "@features/home/types/homeTypes.ts";

export const getHomeRecommendations = () =>
  request<HomeRecommendationsResponse>({
    method: "GET",
    url: "/home/recommendations",
  });
