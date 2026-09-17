import type { ReviewTrackDto } from "@features/review/types/reviewTypes.ts";

export const getReviewTracks = async (trackIds: string[]) => {
  const uniqueTrackIds = [...new Set(trackIds)];
  if (uniqueTrackIds.length === 0) return new Map<string, ReviewTrackDto>();

  const response = await fetch(
    `https://itunes.apple.com/lookup?id=${encodeURIComponent(
      uniqueTrackIds.join(","),
    )}&entity=song&country=KR`,
  );

  if (!response.ok) {
    throw new Error("트랙 정보를 불러오지 못했습니다.");
  }

  const data = (await response.json()) as { results?: ReviewTrackDto[] };
  return new Map(
    (data.results ?? []).map((track) => [String(track.trackId), track]),
  );
};

/**
 * iTunes API를 통해 첨부된 트랙 정보를 조회합니다.
 * @param trackId iTunes 트랙 ID
 * @returns 조회된 트랙 정보
 */
export const getReviewTrack = async (trackId: string) => {
  const tracks = await getReviewTracks([trackId]);
  return tracks.get(trackId) ?? null;
};
