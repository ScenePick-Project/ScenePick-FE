import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createReview } from "@features/review/api/reviewApi.ts";
import type {
  ReviewCreateDto,
  ReviewCreatedDto,
} from "@features/review/types/reviewTypes.ts";

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
