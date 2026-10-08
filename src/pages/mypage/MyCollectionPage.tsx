import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@features/user/hooks/useUser.ts";
import { getErrorStatus } from "@features/moment/api/momentApi.ts";
import { formatReviewClipRange } from "@features/review/utils/reviewFormat.ts";
import { ReviewDetailModal } from "@features/review/components/ReviewDetailModal.tsx";
import { Button } from "@components/ui/Button.tsx";
import {
  collections,
  getCollection,
  type CollectionKind,
  type CollectionPage,
} from "@features/mypage/mypageApi.ts";

export default function MyCollectionPage({ kind }: { kind: CollectionKind }) {
  const user = useCurrentUser();
  const [reviewId, setReviewId] = useState<number | null>(null);
  const list = useInfiniteQuery({
    queryKey: ["mypage", user.data?.userId, kind],
    queryFn: ({ pageParam }) => getCollection(kind, pageParam),
    initialPageParam: null as CollectionPage["nextCursor"],
    getNextPageParam: (page) =>
      page.hasNext ? (page.nextCursor ?? undefined) : undefined,
    enabled: !!user.data?.userId,
    retry: false,
  });
  if ([user.error, list.error].some((e) => getErrorStatus(e) === 401))
    return (
      <Navigate
        replace
        to={"/login?redirect=" + encodeURIComponent("/mypage/" + kind)}
      />
    );
  const items = list.data?.pages.flatMap((page) => page.items) ?? [];
  return (
    <section className="mx-auto min-h-[70vh] max-w-5xl px-4 py-8 sm:px-8">
      <Link to="/mypage" className="text-sm text-violet-600 underline">
        마이페이지로 돌아가기
      </Link>
      <h1 className="mb-8 mt-5 text-2xl font-bold">
        {collections[kind].title}
      </h1>
      {user.isError && (
        <div role="alert">
          <p>로그인 상태를 확인하지 못했습니다.</p>
          <Button onClick={() => void user.refetch()}>다시 확인</Button>
        </div>
      )}
      {(user.isPending || list.isPending) && !user.isError && (
        <p role="status">목록을 불러오는 중...</p>
      )}
      {list.isError && !list.isFetchNextPageError && (
        <div role="alert">
          <p>
            {getErrorStatus(list.error) === 403
              ? "이 계정으로 목록을 이용할 수 없습니다."
              : "목록을 불러오지 못했습니다."}
          </p>
          <Button onClick={() => void list.refetch()}>
            목록 다시 불러오기
          </Button>
        </div>
      )}
      {list.isSuccess && items.length === 0 && (
        <p className="rounded-xl border border-dashed py-16 text-center text-slate-500">
          아직 {collections[kind].title} 목록이 없어요.
        </p>
      )}
      <ul className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => {
          if ("reviewId" in item)
            return (
              <li key={item.reviewId} className="min-w-0 rounded-xl border p-5">
                <Link
                  to={"/content/" + item.contentId}
                  className="break-all font-bold text-violet-600 hover:underline"
                >
                  {item.title}
                </Link>
                <p className="mt-3 whitespace-pre-wrap break-all text-sm text-slate-700">
                  {item.reviewBody}
                </p>
                <p className="mt-3 text-sm text-slate-500">
                  {item.rating == null
                    ? "별점 미입력"
                    : "별점 " + item.rating + "점"}
                </p>
                <Button
                  variant="ghost"
                  className="mt-3"
                  onClick={() => setReviewId(item.reviewId)}
                >
                  리뷰 상세 보기
                </Button>
              </li>
            );
          if ("momentId" in item)
            return (
              <li key={item.momentId} className="min-w-0 rounded-xl border p-5">
                <p className="break-all font-bold">
                  {item.memo || "저장한 장면"}
                </p>
                <p className="mt-3 text-sm text-slate-500">
                  {formatReviewClipRange(item.startTime, item.endTime)}
                </p>
                <Link
                  to={"/content/" + item.contentId + "/moments"}
                  className="mt-4 inline-block text-sm text-violet-600 underline"
                >
                  작품의 장면 보기
                </Link>
              </li>
            );
          if ("trackId" in item)
            return (
              <li key={item.trackId} className="min-w-0 rounded-xl border p-5">
                <p className="break-all font-bold">{item.trackName}</p>
                <p className="mt-2 break-all text-sm text-slate-500">
                  {item.artist}
                </p>
              </li>
            );
          return (
            <li key={item.userId} className="min-w-0 rounded-xl border p-5">
              <p className="break-all font-bold">{item.nickname}</p>
              <p className="mt-2 break-all text-sm text-slate-500">
                @{item.userId}
              </p>
            </li>
          );
        })}
      </ul>
      {list.isFetchNextPageError && (
        <p role="alert" className="mt-5 text-red-600">
          다음 페이지를 불러오지 못했습니다.
        </p>
      )}
      {list.hasNextPage && (
        <Button
          className="mt-6 w-full"
          disabled={list.isFetching}
          onClick={() => void list.fetchNextPage()}
        >
          {list.isFetchingNextPage
            ? "불러오는 중..."
            : list.isFetchNextPageError
              ? "다음 페이지 재시도"
              : "더 보기"}
        </Button>
      )}
      <ReviewDetailModal
        reviewId={reviewId}
        open={reviewId !== null}
        onClose={() => setReviewId(null)}
      />
    </section>
  );
}
