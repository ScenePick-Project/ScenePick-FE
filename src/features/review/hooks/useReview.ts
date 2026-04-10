import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createReview,
  deleteReview,
  getReview,
  getReviewList,
} from "@features/review/api/reviewApi.ts";
import { getReviewTrack } from "@features/review/api/reviewTrackApi.ts";
import type {
  ReviewCreateDto,
  ReviewCreatedDto,
  ReviewDto,
  ReviewListCursorDto,
  ReviewTrackDto,
} from "@features/review/types/reviewTypes.ts";

const REVIEW_PAGE_SIZE = 10;

export const useCreateReview = (contentId: number) => {
  const queryClient = useQueryClient();

  return useMutation<ReviewCreatedDto, Error, ReviewCreateDto>({
    mutationFn: (body) => createReview(contentId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", contentId],
      });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation<null, Error, number>({
    mutationFn: (reviewId) => deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["reviews"],
      });
    },
  });
};

export const useReviewList = (contentId: number) => {
  return useInfiniteQuery({
    queryKey: ["reviews", contentId, "list"],
    queryFn: ({ pageParam }) =>
      getReviewList(contentId, {
        size: REVIEW_PAGE_SIZE,
        ...(pageParam ?? {}),
      }),
    initialPageParam: undefined as ReviewListCursorDto | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNext || !lastPage.nextCursor) return undefined;
      return lastPage.nextCursor;
    },
    enabled: !!contentId,
  });
};

export const useReviewDetail = (reviewId: number | null, enabled = true) => {
  return useQuery<ReviewDto, Error>({
    queryKey: ["reviews", "detail", reviewId],
    queryFn: () => getReview(reviewId as number),
    enabled: enabled && reviewId != null,
  });
};

export const useReviewTrack = (trackId?: string | null) => {
  return useQuery<ReviewTrackDto | null, Error>({
    queryKey: ["reviews", "track", trackId],
    queryFn: () => getReviewTrack(trackId as string),
    enabled: !!trackId,
    staleTime: 1000 * 60 * 10,
  });
};
