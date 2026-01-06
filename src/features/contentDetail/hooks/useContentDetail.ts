import { useQuery } from "@tanstack/react-query";
import {
  getContentBasic,
  getContentCast,
  getContentEpisodes,
} from "@features/contentDetail/api/contentApi.ts";

export const useContentBasic = (contentId: number) => {
  return useQuery({
    queryKey: ["content", "basic", contentId],
    queryFn: () => getContentBasic(contentId),
    enabled: !!contentId,
  });
};

export const useContentCast = (contentId: number) => {
  return useQuery({
    queryKey: ["content", "cast", contentId],
    queryFn: () => getContentCast(contentId),
    enabled: !!contentId,
  });
};

export const useContentEpisodes = (contentId: number) => {
  return useQuery({
    queryKey: ["content", "episodes", contentId],
    queryFn: () => getContentEpisodes(contentId),
    enabled: !!contentId,
  });
};
