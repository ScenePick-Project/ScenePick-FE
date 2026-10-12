import { request } from "@shared/request.ts";
import { getMoments } from "@features/moment/api/momentApi.ts";
import type {
  Moment,
  MomentCursor,
} from "@features/moment/types/momentTypes.ts";

export interface Profile {
  userId: string;
  nickname: string;
  bio: string | null;
  imageKey: string | null;
  imageUrl: string | null;
  followingCount: number;
  followerCount: number;
}
export interface Ratings {
  totalCount: number;
  buckets: { rating: number; count: number }[];
}
export interface Cursor {
  createdAt: string;
  id: number;
}
export interface ReviewItem {
  reviewId: number;
  contentId: number;
  title: string;
  reviewBody: string;
  rating: number | null;
  createdAt: string;
}
export interface UserItem {
  userId: string;
  nickname: string;
}
export interface TrackItem {
  trackId: string;
  trackName: string;
  artist: string;
}
export type CollectionItem = ReviewItem | UserItem | TrackItem | Moment;
export interface CollectionPage {
  items: CollectionItem[];
  nextCursor: Cursor | MomentCursor | null;
  hasNext: boolean;
}
export const collections = {
  reviews: { title: "리뷰", endpoint: "reviews" },
  bookmarks: { title: "북마크", endpoint: "review-bookmarks" },
  moments: { title: "내 장면", endpoint: "moments" },
  album: { title: "내 앨범", endpoint: "track-bookmarks" },
  following: { title: "팔로잉", endpoint: "following" },
  followers: { title: "팔로워", endpoint: "followers" },
} as const;
export type CollectionKind = keyof typeof collections;
export const getProfile = () =>
  request<Profile>({ method: "GET", url: "/me/profile" });
export const updateProfile = (
  body: Pick<Profile, "nickname" | "bio"> & { imageKey?: string },
) => request<null>({ method: "PATCH", url: "/me/profile", body });
export const uploadProfileImage = async (file: File) => {
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size === 0 ||
    file.size > 5 * 1024 * 1024
  )
    throw new Error("JPG, PNG, WebP 형식의 5MB 이하 사진을 선택해주세요.");
  const signed = await request<{ keyName: string; url: string }>({
    method: "POST",
    url: "/s3/presigned/upload/PROFILES",
    body: {
      fileName:
        "profile." +
        { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[
          file.type
        ],
      contentType: file.type,
    },
  });
  // Presigned S3 requests must not carry the application's authentication cookies.
  const response = await fetch(signed.url, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
    credentials: "omit",
  });
  if (!response.ok)
    throw new Error("사진 업로드에 실패했습니다. 다시 시도해주세요.");
  return signed.keyName;
};
export const getRatings = () =>
  request<Ratings>({ method: "GET", url: "/me/rating-statistics" });
export const getCollection = async (
  kind: CollectionKind,
  cursor: CollectionPage["nextCursor"],
): Promise<CollectionPage> => {
  if (kind === "moments") {
    const page = await getMoments(
      undefined,
      null,
      cursor as MomentCursor | null,
    );
    return {
      items: page.momentList,
      nextCursor: page.nextCursor,
      hasNext: page.hasNext,
    };
  }
  return request<CollectionPage>({
    method: "GET",
    url: "/me/" + collections[kind].endpoint,
    query: {
      size: 10,
      ...(cursor && "id" in cursor
        ? { cursorCreatedAt: cursor.createdAt, cursorId: cursor.id }
        : {}),
    },
  });
};
