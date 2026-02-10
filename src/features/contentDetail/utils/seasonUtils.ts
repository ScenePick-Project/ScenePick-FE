import type { SeasonDto } from "@features/contentDetail/types/contentDetailTypes.ts";

export const getSeasonLabel = (seasonNo: number) => `시즌 ${seasonNo}`;

export const getSeasonDisplayName = (
  season: SeasonDto,
  title?: string,
) => {
  const name = season.name?.trim();
  if (!name) return null;
  const normalized = name.replace(/\s+/g, " ");
  const label = getSeasonLabel(season.seasonNo);
  const lower = normalized.toLowerCase();
  if (
    normalized === label ||
    normalized === `시즌${season.seasonNo}` ||
    lower === `season ${season.seasonNo}` ||
    lower === `season${season.seasonNo}`
  ) {
    return null;
  }

  if (title) {
    const normalizedTitle = title.replace(/\s+/g, " ").trim();
    if (
      normalized === normalizedTitle ||
      normalized === `${normalizedTitle} 시즌${season.seasonNo}` ||
      normalized === `${normalizedTitle} 시즌 ${season.seasonNo}` ||
      lower === `${normalizedTitle.toLowerCase()} season ${season.seasonNo}`
    ) {
      return null;
    }
  }
  return normalized;
};

export const sortSeasons = (seasonList?: SeasonDto[]) =>
  seasonList?.slice().sort((a, b) => a.seasonNo - b.seasonNo) ?? [];
