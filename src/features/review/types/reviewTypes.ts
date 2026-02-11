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
