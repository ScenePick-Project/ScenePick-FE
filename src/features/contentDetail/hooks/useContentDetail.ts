import { useQuery } from "@tanstack/react-query";
import {
  getContentBasic,
  getContentCredits,
  getContentEpisodes,
  getContentSeasons,
} from "@features/contentDetail/api/contentApi.ts";

export const useContentBasic = (contentId: number) => {
  return useQuery({
    queryKey: ["content", "basic", contentId],
    queryFn: () => getContentBasic(contentId),
    enabled: !!contentId,
  });
};

export const useContentCredits = (
  contentId: number,
  seasonNo?: number | null,
) => {
  return useQuery({
    queryKey: ["content", "credits", contentId, seasonNo],
    queryFn: () => getContentCredits(contentId, seasonNo),
    enabled: !!contentId && seasonNo !== null,
  });
};

export const useContentEpisodes = (
  contentId: number,
  seasonNo?: number | null,
) => {
  return useQuery({
    queryKey: ["content", "episodes", contentId, seasonNo],
    queryFn: () => getContentEpisodes(contentId, seasonNo as number),
    enabled: !!contentId && seasonNo != null,
  });
};

export const useContentSeasons = (contentId: number) => {
  return useQuery({
    queryKey: ["content", "seasons", contentId],
    queryFn: () => getContentSeasons(contentId),
    enabled: !!contentId,
  });
};
