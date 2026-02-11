import { request } from "@shared/request.ts";
import type {
  ReviewCreateDto,
  ReviewCreatedDto,
} from "@features/review/types/reviewTypes.ts";

/**
 * 리뷰 작성 API를 호출한다.
 * @param contentId 작품 ID
 * @param body 리뷰 작성 요청 바디
 * @returns 생성된 리뷰 정보
 */
export const createReview = (contentId: number, body: ReviewCreateDto) => {
  return request<ReviewCreatedDto>({
    method: "POST",
    url: `/contents/${contentId}/reviews`,
    body,
  });
};
