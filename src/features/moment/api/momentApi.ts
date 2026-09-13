import axios from "axios";
import { request } from "@shared/request.ts";
import type {
  Moment,
  MomentCursor,
  MomentInput,
  MomentSlice,
  MomentUpdate,
} from "../types/momentTypes.ts";

export const getMoments = (
  contentId: number,
  youtubeId: string | null,
  cursor: MomentCursor | null,
) =>
  request<MomentSlice>({
    method: "GET",
    url: "/me/moments",
    query: {
      contentId,
      size: 10,
      ...(youtubeId ? { youtubeId } : {}),
      ...(cursor
        ? {
            cursorCreatedAt: cursor.createdAt,
            cursorMomentId: cursor.momentId,
          }
        : {}),
    },
  });

export const getMoment = (momentId: number) =>
  request<Moment>({ method: "GET", url: "/moments/" + momentId });

export const createMoment = (contentId: number, body: MomentInput) =>
  request<{ momentId: number }>({
    method: "POST",
    url: "/contents/" + contentId + "/moments",
    body,
  });

export const updateMoment = (momentId: number, body: MomentUpdate) =>
  request<Moment>({ method: "PATCH", url: "/moments/" + momentId, body });

export const deleteMoment = (momentId: number) =>
  request<null>({ method: "DELETE", url: "/moments/" + momentId });

export const getErrorStatus = (error: unknown) =>
  axios.isAxiosError(error) ? error.response?.status : undefined;

export const getMomentError = (error: unknown) => {
  switch (getErrorStatus(error)) {
    case 400:
      return "입력한 영상과 시간 구간을 확인해주세요.";
    case 401:
      return "로그인이 필요합니다. 다시 로그인해주세요.";
    case 404:
      return "대상을 찾을 수 없거나 이미 삭제되었습니다.";
    default:
      return "요청을 완료하지 못했습니다. 잠시 후 다시 시도해주세요.";
  }
};
