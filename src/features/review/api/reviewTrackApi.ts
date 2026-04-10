import type { ReviewTrackDto } from "@features/review/types/reviewTypes.ts";

/**
 * iTunes API를 통해 첨부된 트랙 정보를 조회합니다.
 * @param trackId iTunes 트랙 ID
 * @returns 조회된 트랙 정보
 */
export const getReviewTrack = async (trackId: string) => {
  const response = await fetch(
    `https://itunes.apple.com/lookup?id=${encodeURIComponent(
      trackId,
    )}&entity=song&country=KR`,
  );

  if (!response.ok) {
    throw new Error("트랙 정보를 불러오지 못했습니다.");
  }

  const data = (await response.json()) as { results?: ReviewTrackDto[] };
  return data.results?.[0] ?? null;
};
