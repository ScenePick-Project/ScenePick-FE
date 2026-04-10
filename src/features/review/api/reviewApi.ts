import { request } from "@shared/request.ts";
import type {
  ReviewCreateDto,
  ReviewCreatedDto,
  ReviewDto,
  ReviewListQueryParams,
  ReviewSliceDto,
} from "@features/review/types/reviewTypes.ts";

/**
 * 리뷰 작성 API를 호출합니다.
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

/**
 * 작품 리뷰 목록을 조회합니다.
 * @param contentId 작품 ID
 * @param query 커서 기반 조회 파라미터
 * @returns 리뷰 목록 응답
 */
export const getReviewList = (
  contentId: number,
  query?: ReviewListQueryParams,
) => {
  return request<ReviewSliceDto>({
    method: "GET",
    url: `/contents/${contentId}/reviews`,
    query,
  });
};

/**
 * 리뷰 단건 상세를 조회합니다.
 * @param reviewId 리뷰 ID
 * @returns 리뷰 상세 정보
 */
export const getReview = (reviewId: number) => {
  return request<ReviewDto>({
    method: "GET",
    url: `/reviews/${reviewId}`,
  });
};

/**
 * 리뷰를 삭제합니다.
 * @param reviewId 리뷰 ID
 */
export const deleteReview = (reviewId: number) => {
  return request<null>({
    method: "DELETE",
    url: `/reviews/${reviewId}`,
  });
};
