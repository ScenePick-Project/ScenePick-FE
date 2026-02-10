import { request } from "@shared/request.ts";

import type {
  ContentBasicDto,
  CreditDto,
  EpisodeDto,
  SeasonDto,
} from "@features/contentDetail/types/contentDetailTypes.ts";

/**
 * 해당 작품의 기본 상세 정보를 조회합니다.
 * @param contentId 조회할 콘텐츠의 고유 ID
 * @returns 작품 기본 정보
 */
export const getContentBasic = (contentId: number) => {
  return request<ContentBasicDto>({
    method: "GET",
    url: `/contents/${contentId}`,
  });
};

/**
 * 해당 작품의 출연진 리스트를 조회합니다.
 * @param contentId 조회할 콘텐츠의 고유 ID
 * @returns 출연진 정보 리스트
 */
export const getContentCredits = async (
  contentId: number,
  seasonNo?: number | null,
) => {
  const data = await request<{ creditList: CreditDto[] }>({
    method: "GET",
    url:
      seasonNo != null
        ? `/contents/${contentId}/seasons/${seasonNo}/credits`
        : `/contents/${contentId}/credits`,
  });

  return data.creditList;
};

/**
 * 해당 작품의 에피소드 리스트를 조회합니다.
 * @param contentId 조회할 콘텐츠의 고유 ID
 * @returns 에피소드 정보 배열
 */
export const getContentEpisodes = async (
  contentId: number,
  seasonNo: number,
) => {
  const data = await request<{ episodeList: EpisodeDto[] }>({
    method: "GET",
    url: `/contents/${contentId}/seasons/${seasonNo}/episodes`,
  });

  return data.episodeList;
};

/**
 * 해당 작품의 시즌 리스트를 조회합니다.
 * @param contentId 조회할 콘텐츠의 고유 ID
 * @returns 시즌 정보 배열
 */
export const getContentSeasons = async (contentId: number) => {
  const data = await request<{ seasonList: SeasonDto[] }>({
    method: "GET",
    url: `/contents/${contentId}/seasons`,
  });

  return data.seasonList;
};
