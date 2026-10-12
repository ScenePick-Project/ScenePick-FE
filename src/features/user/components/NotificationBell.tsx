import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { FiBell } from "react-icons/fi";
import { Button } from "@components/ui/Button.tsx";
import { Modal } from "@components/ui/Modal.tsx";
import { request } from "@shared/request.ts";
import { getErrorStatus } from "@features/moment/api/momentApi.ts";
import type { Cursor } from "@features/mypage/mypageApi.ts";

interface Notice {
  notificationId: number;
  type: "REVIEW_LIKE" | "REVIEW_BOOKMARK";
  reviewId: number | null;
  contentId: number | null;
  actorNickname: string;
  createdAt: string;
  readAt: string | null;
}
interface Page {
  items: Notice[];
  nextCursor: Cursor | null;
  hasNext: boolean;
}

export function NotificationBell({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const bell = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const client = useQueryClient();
  const navigate = useNavigate();
  const count = useQuery({
    queryKey: ["notifications", userId, "count"],
    enabled: !!userId,
    retry: false,
    refetchInterval: 30_000,
    queryFn: () =>
      request<{ count: number }>({
        method: "GET",
        url: "/me/notifications/unread-count",
      }),
  });
  const list = useInfiniteQuery({
    queryKey: ["notifications", userId, "list"],
    enabled: !!userId && open,
    retry: false,
    initialPageParam: null as Cursor | null,
    queryFn: ({ pageParam }) =>
      request<Page>({
        method: "GET",
        url: "/me/notifications",
        query: {
          size: 10,
          ...(pageParam
            ? { cursorCreatedAt: pageParam.createdAt, cursorId: pageParam.id }
            : {}),
        },
      }),
    getNextPageParam: (page) =>
      page.hasNext ? (page.nextCursor ?? undefined) : undefined,
  });
  const read = useMutation({
    mutationFn: (notice: Notice) =>
      request<null>({
        method: "PATCH",
        url: `/me/notifications/${notice.notificationId}/read`,
      }),
    onSuccess: async (_, notice) => {
      await client.invalidateQueries({ queryKey: ["notifications", userId] });
      if (notice.contentId != null) {
        setOpen(false);
        navigate(`/content/${notice.contentId}`);
      }
    },
  });
  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => bell.current?.focus();
  }, [open]);
  if (
    [count.error, list.error, read.error].some(
      (error) => getErrorStatus(error) === 401,
    )
  )
    return (
      <Navigate
        replace
        to={"/login?redirect=" + encodeURIComponent(window.location.pathname)}
      />
    );
  return (
    <>
      <Button
        ref={bell}
        variant="ghost"
        size="icon"
        className="relative"
        aria-label={
          count.isError
            ? "알림 확인 실패"
            : `알림, 미읽음 ${count.data?.count ?? 0}개`
        }
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <FiBell aria-hidden="true" />
        {count.data && count.data.count > 0 && (
          <span
            aria-hidden="true"
            className="absolute right-0 top-0 min-w-4 rounded-full bg-primary px-1 text-[10px] text-white"
          >
            {count.data.count > 99 ? "99+" : count.data.count}
          </span>
        )}
        {count.isError && (
          <span aria-hidden="true" className="absolute right-0 top-0 text-xs">
            !
          </span>
        )}
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        className="max-w-md p-6"
      >
        <div
          ref={panel}
          onKeyDown={(event) => {
            if (event.key !== "Tab") return;
            const buttons = Array.from(
              panel.current!.querySelectorAll<HTMLButtonElement>(
                "button:not(:disabled)",
              ),
            );
            const first = buttons[0],
              last = buttons[buttons.length - 1];
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first?.focus();
            }
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">알림</h2>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              알림 닫기
            </Button>
          </div>
          {list.isPending && <p role="status">알림을 불러오는 중...</p>}
          {list.isError && !list.isFetchNextPageError && (
            <div role="alert">
              <p>알림을 불러오지 못했습니다.</p>
              <Button onClick={() => void list.refetch()}>다시 시도</Button>
            </div>
          )}
          {list.isSuccess &&
            list.data.pages.every((page) => page.items.length === 0) && (
              <p>아직 알림이 없어요.</p>
            )}
          <ul className="divide-y">
            {list.data?.pages
              .flatMap((page) => page.items)
              .map((notice) => (
                <li key={notice.notificationId} className="py-3">
                  <Button
                    variant="ghost"
                    disabled={read.isPending}
                    className="h-auto w-full justify-start whitespace-normal text-left"
                    onClick={() => read.mutate(notice)}
                  >
                    <span>
                      {!notice.readAt && (
                        <span className="mr-2 text-primary">
                          ●<span className="sr-only">미읽음</span>
                        </span>
                      )}
                      {notice.actorNickname}님이 내 리뷰를{" "}
                      {notice.type === "REVIEW_LIKE"
                        ? "좋아합니다"
                        : "북마크했습니다"}
                      . {notice.reviewId == null && "(삭제된 리뷰)"}
                      <time
                        className="mt-1 block text-xs text-gray-500"
                        dateTime={notice.createdAt}
                      >
                        {notice.createdAt.replace("T", " ").slice(0, 16)}
                      </time>
                    </span>
                  </Button>
                </li>
              ))}
          </ul>
          {read.isError && (
            <p role="alert">읽음 처리에 실패했습니다. 다시 시도해주세요.</p>
          )}
          {list.isFetchNextPageError && (
            <p role="alert">다음 알림을 불러오지 못했습니다.</p>
          )}
          {(list.hasNextPage || list.isFetchNextPageError) && (
            <Button
              disabled={list.isFetchingNextPage}
              onClick={() => void list.fetchNextPage()}
            >
              {list.isFetchingNextPage ? "불러오는 중..." : "알림 더 보기"}
            </Button>
          )}
        </div>
      </Modal>
    </>
  );
}
