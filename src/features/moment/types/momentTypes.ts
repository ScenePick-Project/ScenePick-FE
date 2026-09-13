export interface Moment {
  momentId: number;
  contentId: number;
  youtubeId: string;
  startTime: number;
  endTime: number;
  memo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MomentInput {
  youtubeId: string;
  startTime: number;
  endTime: number;
  memo: string | null;
}

export type MomentUpdate = Partial<Omit<MomentInput, "youtubeId">>;

export interface MomentCursor {
  createdAt: string;
  momentId: number;
}

export interface MomentSlice {
  momentList: Moment[];
  nextCursor: MomentCursor | null;
  hasNext: boolean;
}
