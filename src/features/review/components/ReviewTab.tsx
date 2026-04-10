import { useMemo, useState } from "react";
import { UserAvatarFallback } from "@components/common/UserAvatarFallback.tsx";
import { Button } from "@components/ui/Button.tsx";
import { ReviewCreateModal } from "@features/review/components/ReviewCreateModal.tsx";
import { ReviewDetailModal } from "@features/review/components/ReviewDetailModal.tsx";
import {
  useReviewList,
  useReviewTrack,
} from "@features/review/hooks/useReview.ts";
import type { ReviewDto } from "@features/review/types/reviewTypes.ts";
import {
  formatReviewDate,
  getYoutubeThumbnailUrl,
} from "@features/review/utils/reviewFormat.ts";

interface ReviewTabProps {
  contentId: number;
  contentTitle?: string;
}

interface ReviewCardProps {
  review: ReviewDto;
  onClick: (reviewId: number) => void;
}

interface ReviewTrackBadgeProps {
  trackId: string;
}

const ReviewTrackBadge = ({ trackId }: ReviewTrackBadgeProps) => {
  const { data: track } = useReviewTrack(trackId);

  return (
    <span className="inline-flex max-w-full items-center gap-2 rounded-xl bg-violet-50 px-3.5 py-2 text-sm font-semibold text-violet-600">
      <span className="text-[15px] leading-none" aria-hidden="true">
        ♪
      </span>
      <span className="truncate">
        {track?.trackName ?? "사운드트랙 첨부"}
      </span>
    </span>
  );
};

const ReviewCard = ({ review, onClick }: ReviewCardProps) => {
  const thumbnailUrl = getYoutubeThumbnailUrl(review.youtubeId);

  return (
    <button
      type="button"
      onClick={() => onClick(review.reviewId)}
      className="group relative flex h-full w-full self-start rounded-[30px] border border-slate-200/80 bg-white p-6 text-left shadow-[0_14px_32px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(15,23,42,0.08)]"
    >
      <div className="relative flex min-h-[186px] w-full flex-col">
        <div className="flex items-start gap-4 pr-24">
          <UserAvatarFallback className="mt-0.5 h-12 w-12 shrink-0" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-[17px] font-extrabold text-slate-900">
                {review.userId}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                팔로잉
              </span>
            </div>
            <p className="mt-1 text-[15px] text-slate-400">
              {formatReviewDate(review.createdAt)}
            </p>
          </div>
        </div>

        {review.isSpoiler && (
          <span className="absolute right-0 top-0 shrink-0 rounded-2xl bg-[#fff1e8] px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-[#ff6a2a]">
            Spoiler
          </span>
        )}

        <div className="relative mt-5 flex flex-1 flex-col gap-3 sm:flex-row sm:items-start">
          {thumbnailUrl && (
            <div className="w-full shrink-0 sm:w-[132px]">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
                <img
                  src={thumbnailUrl}
                  alt="리뷰 연결 유튜브 썸네일"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </div>
          )}

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="relative min-h-[62px] flex-1">
              <p
                className={`line-clamp-2 break-words text-[15px] leading-[1.65rem] text-slate-700 ${
                  review.isSpoiler ? "select-none blur-sm" : ""
                }`}
              >
                {review.reviewBody}
              </p>
            </div>

            {review.trackId && (
              <div className="mt-2.5 flex flex-wrap items-center gap-2.5 pb-1">
                <ReviewTrackBadge trackId={review.trackId} />
              </div>
            )}
          </div>

          {review.isSpoiler && (
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
              <span className="whitespace-nowrap rounded-full border border-slate-200 bg-white/95 px-6 py-2.5 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur-sm">
                스포일러가 포함된 리뷰입니다.
              </span>
            </div>
          )}
        </div>

        <div className="mt-auto border-t border-slate-100 pt-3 text-sm text-slate-400">
          <div className="flex items-center gap-4">
            <span
              className={`inline-flex items-center gap-2 font-semibold ${
                review.isLikedByCurrentUser
                  ? "text-rose-500"
                  : "text-slate-400"
              }`}
            >
              <span className="text-base leading-none">♥</span>
              <span>{review.likeCount}</span>
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

export const ReviewTab = ({ contentId, contentTitle }: ReviewTabProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useReviewList(contentId);

  const reviewList = useMemo(
    () => data?.pages.flatMap((page) => page.reviewList) ?? [],
    [data],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">리뷰</h3>
          <p className="text-sm text-gray-500 mt-1">
            {reviewList.length > 0
              ? "좋아하는 장면과 감상을 리뷰로 남겨보세요."
              : "첫 감상과 인상 깊은 장면을 리뷰로 남겨보세요."}
          </p>
        </div>
        <Button size="lg" onClick={() => setIsModalOpen(true)}>
          리뷰 작성
        </Button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-64 animate-pulse rounded-[28px] border border-slate-200 bg-slate-50"
            />
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <div className="rounded-3xl border border-red-100 bg-red-50 px-6 py-10 text-center text-sm text-red-500">
          리뷰 목록을 불러오지 못했습니다.
        </div>
      )}

      {!isLoading && !isError && reviewList.length === 0 && (
        <div className="rounded-3xl border border-gray-100 bg-gray-50 p-10 text-center text-gray-400">
          리뷰가 아직 없습니다.
        </div>
      )}

      {!isLoading && !isError && reviewList.length > 0 && (
        <>
          <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
            {reviewList.map((review) => (
              <ReviewCard
                key={review.reviewId}
                review={review}
                onClick={setSelectedReviewId}
              />
            ))}
          </div>

          {hasNextPage && (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="secondary"
                shape="full"
                size="lg"
                className="px-8"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? "불러오는 중..." : "리뷰 더 보기"}
              </Button>
            </div>
          )}
        </>
      )}

      <ReviewCreateModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contentId={contentId}
        contentTitle={contentTitle}
      />

      <ReviewDetailModal
        open={selectedReviewId != null}
        reviewId={selectedReviewId}
        onClose={() => setSelectedReviewId(null)}
      />
    </div>
  );
};
