import { useEffect, useRef, useState } from "react";
import { UserAvatarFallback } from "@components/common/UserAvatarFallback.tsx";
import { Modal } from "@components/ui/Modal.tsx";
import { useCurrentUser } from "@features/user/hooks/useUser.ts";
import {
  useDeleteReview,
  useReviewDetail,
  useReviewTrack,
} from "@features/review/hooks/useReview.ts";
import {
  formatReviewClipRange,
  formatReviewDate,
  getYoutubeEmbedUrl,
  getYoutubeThumbnailUrl,
} from "@features/review/utils/reviewFormat.ts";

interface ReviewDetailModalProps {
  reviewId: number | null;
  open: boolean;
  onClose: () => void;
}

const REPORT_REASON_LIST = [
  "스포일러 포함",
  "부적절한 내용",
  "광고/홍보성",
] as const;

export const ReviewDetailModal = ({
  reviewId,
  open,
  onClose,
}: ReviewDetailModalProps) => {
  const [isPlayingClip, setIsPlayingClip] = useState(false);
  const [isReportMenuOpen, setIsReportMenuOpen] = useState(false);
  const [isTrackPreviewPlaying, setIsTrackPreviewPlaying] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState<
    (typeof REPORT_REASON_LIST)[number] | null
  >(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { data: currentUser } = useCurrentUser(open);
  const { data: review, isLoading, isError } = useReviewDetail(
    reviewId,
    open && reviewId != null,
  );
  const { mutateAsync: deleteReviewMutate, isPending: isDeleting } =
    useDeleteReview();

  useEffect(() => {
    if (!open) {
      setIsPlayingClip(false);
      setIsReportMenuOpen(false);
      setIsTrackPreviewPlaying(false);
      audioRef.current?.pause();
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    }
  }, [open]);

  useEffect(() => {
    setIsPlayingClip(false);
    setIsReportMenuOpen(false);
    setIsTrackPreviewPlaying(false);
    setSelectedReportReason(null);
    audioRef.current?.pause();
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, [reviewId]);

  const clipRange = formatReviewClipRange(review?.startTime, review?.endTime);
  const clipLabel = clipRange ?? (review?.youtubeId ? "장면 클립" : null);
  const youtubeEmbedUrl = getYoutubeEmbedUrl(
    review?.youtubeId,
    review?.startTime,
    review?.endTime,
    isPlayingClip,
  );
  const youtubeThumbnailUrl = getYoutubeThumbnailUrl(review?.youtubeId);
  const isOwnReview = !!currentUser?.userId && currentUser.userId === review?.userId;
  const { data: attachedTrack } = useReviewTrack(review?.trackId);

  const handleTrackPreviewToggle = async () => {
    if (!attachedTrack?.previewUrl || !audioRef.current) return;

    if (isTrackPreviewPlaying) {
      audioRef.current.pause();
      return;
    }

    try {
      await audioRef.current.play();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteReview = async () => {
    if (!review) return;

    const shouldDelete = window.confirm("이 리뷰를 삭제할까요?");
    if (!shouldDelete) return;

    try {
      await deleteReviewMutate(review.reviewId);
      alert("리뷰가 삭제되었습니다.");
      onClose();
    } catch (error) {
      console.error(error);
      alert("리뷰 삭제에 실패했습니다.");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="max-h-[calc(100vh-5.5rem)] max-w-[980px] overflow-hidden rounded-[36px] border border-white/70 bg-[linear-gradient(180deg,#f8fbff_0%,#f6f7fb_45%,#ffffff_100%)] shadow-[0_40px_120px_rgba(15,23,42,0.3)] overscroll-contain"
    >
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-16 top-24 h-56 w-56 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-12 top-20 h-64 w-64 rounded-full bg-violet-200/30 blur-3xl" />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-white/60 bg-white/70 text-2xl leading-none text-slate-700 shadow-[0_14px_30px_rgba(15,23,42,0.12)] backdrop-blur-xl transition hover:bg-white"
          aria-label="닫기"
        >
          ×
        </button>

        {isLoading && (
          <div className="px-8 py-24 text-center text-gray-400">
            리뷰를 불러오는 중...
          </div>
        )}

        {!isLoading && (isError || !review) && (
          <div className="px-8 py-24 text-center text-gray-400">
            리뷰를 불러오지 못했습니다.
          </div>
        )}

        {!isLoading && !isError && review && (
          <div className="relative">
            {review.youtubeId && (
              <div className="relative aspect-[16/6.4] overflow-hidden bg-slate-950">
                {isPlayingClip && youtubeEmbedUrl ? (
                  <iframe
                    src={youtubeEmbedUrl}
                    title={`review-clip-${review.reviewId}`}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : youtubeThumbnailUrl ? (
                  <>
                    <img
                      src={youtubeThumbnailUrl}
                      alt="리뷰 장면 썸네일"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.18)_0%,rgba(15,23,42,0.08)_24%,rgba(15,23,42,0.52)_100%)]" />
                  </>
                ) : null}

                {!isPlayingClip && (
                  <button
                    type="button"
                    onClick={() => setIsPlayingClip(true)}
                    className="absolute left-1/2 top-1/2 z-10 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/12 text-4xl text-white shadow-[0_20px_50px_rgba(15,23,42,0.3)] backdrop-blur-md transition hover:scale-[1.03] hover:bg-white/18"
                    aria-label="모달 안에서 클립 재생"
                  >
                    ▶
                  </button>
                )}

                {clipLabel && (
                  <div className="absolute bottom-6 left-6 z-10 rounded-full border border-white/50 bg-white/92 px-5 py-2.5 text-base font-black text-slate-900 shadow-[0_16px_40px_rgba(15,23,42,0.18)] backdrop-blur">
                    {clipLabel}
                  </div>
                )}
              </div>
            )}

            <div className="relative px-5 py-5 sm:px-7 sm:py-6">
              <div className="space-y-6">
                <div className="flex min-w-0 items-center gap-4">
                  <UserAvatarFallback className="h-16 w-16 shrink-0 border border-slate-200/80 bg-white shadow-sm" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="truncate text-[26px] font-black tracking-[-0.03em] text-slate-900">
                        {review.userId}
                      </h2>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
                        팔로잉
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                      <span className="px-1 py-0 font-medium text-slate-400">
                        {formatReviewDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[30px] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                  <p className="whitespace-pre-wrap break-words text-[18px] leading-[1.9rem] tracking-[-0.02em] text-slate-800">
                    {review.reviewBody}
                  </p>
                </div>

                {review.trackId && (
                  <section className="rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#eef2ff_100%)] p-6 shadow-[0_18px_38px_rgba(15,23,42,0.06)]">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">
                      Attached Track
                    </p>
                    {attachedTrack?.previewUrl && (
                      <audio
                        ref={audioRef}
                        src={attachedTrack.previewUrl}
                        preload="none"
                        onPlay={() => setIsTrackPreviewPlaying(true)}
                        onPause={() => setIsTrackPreviewPlaying(false)}
                        onEnded={() => setIsTrackPreviewPlaying(false)}
                      />
                    )}
                    <div className="mt-5 flex items-center gap-5">
                      <button
                        type="button"
                        onClick={handleTrackPreviewToggle}
                        disabled={!attachedTrack?.previewUrl}
                        aria-label={
                          isTrackPreviewPlaying
                            ? "사운드트랙 미리듣기 정지"
                            : "사운드트랙 미리듣기 재생"
                        }
                        className={`relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full transition ${
                          attachedTrack?.previewUrl
                            ? "cursor-pointer hover:scale-[1.03]"
                            : "cursor-default"
                        }`}
                      >
                        <div
                          className={`absolute inset-0 rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,rgba(99,102,241,0.15),rgba(168,85,247,0.45),rgba(59,130,246,0.2),rgba(99,102,241,0.15))] blur-[2px] transition ${
                            isTrackPreviewPlaying ? "opacity-100" : "opacity-60"
                          }`}
                        />
                        <div
                          className={`absolute inset-[10px] overflow-hidden rounded-full border border-white/70 bg-slate-200 shadow-[0_12px_30px_rgba(15,23,42,0.18)] ${
                            isTrackPreviewPlaying ? "animate-spin" : ""
                          }`}
                          style={
                            isTrackPreviewPlaying
                              ? { animationDuration: "8s" }
                              : undefined
                          }
                        >
                          {attachedTrack?.artworkUrl100 ? (
                            <img
                              src={attachedTrack.artworkUrl100}
                              alt={attachedTrack.trackName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-[radial-gradient(circle_at_30%_30%,#cbd5f5_0%,#94a3b8_48%,#475569_100%)]" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/15" />
                          <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70 bg-slate-900/75" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur-sm transition">
                            {isTrackPreviewPlaying ? (
                              <svg
                                viewBox="0 0 24 24"
                                className="h-5 w-5 fill-current"
                                aria-hidden="true"
                              >
                                <path d="M7 6.75A.75.75 0 0 1 7.75 6h2.5a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1-.75-.75V6.75Zm6 0A.75.75 0 0 1 13.75 6h2.5a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1-.75-.75V6.75Z" />
                              </svg>
                            ) : (
                              <svg
                                viewBox="0 0 24 24"
                                className="ml-0.5 h-5 w-5 fill-current"
                                aria-hidden="true"
                              >
                                <path d="M8.25 6.62c0-1.2 1.34-1.91 2.33-1.22l8.08 5.63a1.5 1.5 0 0 1 0 2.46l-8.08 5.63c-.99.69-2.33-.02-2.33-1.22V6.62Z" />
                              </svg>
                            )}
                          </span>
                        </div>
                      </button>

                      <div className="flex min-w-0 flex-1 flex-col justify-center">
                        {attachedTrack?.previewUrl && (
                          <div className="mb-2 flex h-4 items-center gap-1.5">
                            {[0, 1, 2].map((index) => (
                              <span
                                key={index}
                                className={`w-1.5 rounded-full bg-primary/70 transition-all ${
                                  isTrackPreviewPlaying
                                    ? "animate-pulse"
                                    : "h-1.5 opacity-50"
                                }`}
                                style={
                                  isTrackPreviewPlaying
                                    ? {
                                        height: `${12 + index * 4}px`,
                                        animationDelay: `${index * 0.18}s`,
                                      }
                                    : undefined
                                }
                              />
                            ))}
                          </div>
                        )}
                        <p className="line-clamp-2 text-[22px] font-black text-slate-900">
                          {attachedTrack?.trackName ?? `Track ${review.trackId}`}
                        </p>
                        <p className="mt-1 text-[15px] text-slate-500">
                          {attachedTrack?.artistName ?? "연결된 음악"}
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                  <div className="rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.9)_0%,rgba(255,255,255,0.96)_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-4">
                        <button
                          type="button"
                          className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-rose-500 shadow-sm transition ${
                            review.isLikedByCurrentUser
                              ? "border-rose-300 bg-rose-50"
                              : "border-rose-200 bg-white"
                          }`}
                        >
                          <span className="text-lg leading-none">♥</span>
                          <span className="text-[24px] font-black leading-none">
                            {review.likeCount}
                          </span>
                        </button>

                        <button
                          type="button"
                          className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-500 shadow-sm transition hover:border-slate-400 hover:text-slate-700"
                          aria-label="저장하기"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="h-5 w-5 stroke-current"
                            fill="none"
                            strokeWidth="1.8"
                            aria-hidden="true"
                          >
                            <path
                              d="M7 4.75h10A1.25 1.25 0 0 1 18.25 6v13.34a.4.4 0 0 1-.64.32L12 15.4l-5.61 4.26a.4.4 0 0 1-.64-.32V6A1.25 1.25 0 0 1 7 4.75Z"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="flex justify-end">
                        {isOwnReview ? (
                          <button
                            type="button"
                            onClick={handleDeleteReview}
                            disabled={isDeleting}
                            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold text-red-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <span>{isDeleting ? "삭제 중..." : "삭제하기"}</span>
                          </button>
                        ) : (
                          <div className="relative">
                            {isReportMenuOpen && (
                              <div className="absolute bottom-full right-0 z-10 mb-3 w-48 rounded-2xl border border-slate-200/80 bg-white/95 p-2 shadow-[0_22px_45px_rgba(15,23,42,0.16)] backdrop-blur-xl">
                                {REPORT_REASON_LIST.map((reason) => (
                                  <button
                                    key={reason}
                                    type="button"
                                    onClick={() => {
                                      setSelectedReportReason(reason);
                                      setIsReportMenuOpen(false);
                                    }}
                                    className={`flex w-full rounded-xl px-3 py-3 text-left text-sm transition ${
                                      selectedReportReason === reason
                                        ? "bg-primary/10 font-semibold text-primary"
                                        : "text-slate-600 hover:bg-slate-50"
                                    }`}
                                  >
                                    {reason}
                                  </button>
                                ))}
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => setIsReportMenuOpen((prev) => !prev)}
                              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold text-slate-400 transition hover:bg-slate-100 hover:text-primary"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                className="h-4 w-4 stroke-current"
                                fill="none"
                                strokeWidth="1.8"
                                aria-hidden="true"
                              >
                                <path
                                  d="m12 9 6.5 11.25h-13L12 9Zm0 0V4.75"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M12 14.25v1.5m0 3h.008"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <span>신고하기</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
