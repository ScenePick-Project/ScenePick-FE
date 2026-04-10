const REVIEW_DATE_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "short",
});

const toTwoDigits = (value: number) => value.toString().padStart(2, "0");

export const formatReviewDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return REVIEW_DATE_FORMATTER.format(date);
};

export const formatReviewSeconds = (value?: number | null) => {
  if (value == null || Number.isNaN(value)) return null;

  const safeValue = Math.max(0, Math.floor(value));
  const hours = Math.floor(safeValue / 3600);
  const minutes = Math.floor((safeValue % 3600) / 60);
  const seconds = safeValue % 60;

  if (hours > 0) {
    return `${hours}:${toTwoDigits(minutes)}:${toTwoDigits(seconds)}`;
  }

  return `${minutes}:${toTwoDigits(seconds)}`;
};

export const formatReviewClipRange = (
  startTime?: number | null,
  endTime?: number | null,
) => {
  const startLabel = formatReviewSeconds(startTime);
  const endLabel = formatReviewSeconds(endTime);

  if (startLabel && endLabel) return `${startLabel} - ${endLabel}`;
  return startLabel ?? endLabel;
};

export const getYoutubeThumbnailUrl = (youtubeId?: string | null) => {
  if (!youtubeId) return null;
  return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
};

export const getYoutubeEmbedUrl = (
  youtubeId?: string | null,
  startTime?: number | null,
  endTime?: number | null,
  autoplay = false,
) => {
  if (!youtubeId) return null;

  const params = new URLSearchParams({
    rel: "0",
    playsinline: "1",
  });

  if (startTime != null) params.set("start", String(startTime));
  if (endTime != null) params.set("end", String(endTime));
  if (autoplay) params.set("autoplay", "1");

  return `https://www.youtube.com/embed/${youtubeId}?${params.toString()}`;
};

export const getYoutubeWatchUrl = (
  youtubeId?: string | null,
  startTime?: number | null,
) => {
  if (!youtubeId) return null;

  const params = new URLSearchParams({
    v: youtubeId,
  });

  if (startTime != null) params.set("t", String(startTime));

  return `https://www.youtube.com/watch?${params.toString()}`;
};
