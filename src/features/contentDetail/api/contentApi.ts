import { request } from "@shared/request.ts";

import type {
  ContentBasicDTO,
  PersonDTO,
  EpisodeDTO,
} from "@features/contentDetail/types/contentDetailTypes.ts";

/**
 * 해당 작품의 기본 상세 정보를 조회합니다.
 * @param contentId 조회할 콘텐츠의 고유 ID
 * @returns 작품 기본 정보
 */
export const getContentBasic = (contentId: number) => {
  return request<ContentBasicDTO>({
    method: "GET",
    url: `/contents/${contentId}`,
  });
};

/**
 * 해당 작품의 출연진 리스트를 조회합니다.
 * @param contentId 조회할 콘텐츠의 고유 ID
 * @returns 인물 정보 배열
 */
export const getContentCast = async (contentId: number) => {
  const data = await request<{ persons: PersonDTO[] }>({
    method: "GET",
    url: `/contents/${contentId}/persons`,
  });

  return data.persons;
};

/**
 * 해당 작품의 에피소드 리스트를 조회합니다.
 * @param contentId 조회할 콘텐츠의 고유 ID
 * @returns 에피소드 정보 배열
 */
export const getContentEpisodes = async (contentId: number) => {
  const data = await request<{ episodes: EpisodeDTO[] }>({
    method: "GET",
    url: `/contents/${contentId}/episodes`,
  });

  return data.episodes;
};
