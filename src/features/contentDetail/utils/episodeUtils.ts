import type { EpisodeDto } from "../types/contentDetailTypes";

export const getAiredEpisodes = (episodes: EpisodeDto[], now = new Date()) => {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  return episodes.filter(({ airDate }) =>
    airDate != null && /^\d{4}-\d{2}-\d{2}$/.test(airDate) && airDate <= today,
  );
};
