export interface ReviewCreateDto {
  reviewBody: string;
  isSpoiler: boolean;
  trackId?: string;
  youtubeId?: string;
  startTime?: number;
  endTime?: number;
}

export interface ReviewCreatedDto {
  reviewId: number;
}

export interface ReviewDto {
  reviewId: number;
  contentId: number;
  userId: string;
  reviewBody: string;
  startTime?: number | null;
  endTime?: number | null;
  youtubeId?: string | null;
  isSpoiler: boolean;
  trackId?: string | null;
  likeCount: number;
  isLikedByCurrentUser: boolean;
  createdAt: string;
}

export interface ReviewListCursorDto {
  createdAt: string;
  reviewId: number;
  likeCount: number;
}

export interface ReviewSliceDto {
  reviewList: ReviewDto[];
  nextCursor: ReviewListCursorDto | null;
  hasNext: boolean;
}

export interface ReviewListQueryParams
  extends Partial<ReviewListCursorDto> {
  [key: string]: unknown;
  size?: number;
}

export interface ReviewTrackDto {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100?: string;
  previewUrl?: string;
}
