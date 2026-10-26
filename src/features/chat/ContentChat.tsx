import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { isAxiosError } from "axios";
import { Link, useLocation } from "react-router-dom";
import {
  FiArrowDown,
  FiArrowUp,
  FiMessageCircle,
  FiRefreshCw,
  FiWifi,
  FiWifiOff,
} from "react-icons/fi";
import defaultProfileImage from "@/assets/images/default-profile.png";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { verifyChatIdentity } from "./chatApi";
import { messageLength, validateBody, type ChatConnection } from "./chatModel";
import { useContentChat } from "./useContentChat";

const connectionLabels: Record<ChatConnection, string> = {
  connecting: "연결 중",
  syncing: "대화 불러오는 중",
  connected: "실시간 연결",
  reconnecting: "다시 연결하는 중",
  offline: "연결 확인 필요",
};

function Avatar({ url }: { url: string | null }) {
  const [failed, setFailed] = useState(false);
  return (
    <img
      src={url && !failed ? url : defaultProfileImage}
      onError={() => setFailed(true)}
      alt=""
      className="h-9 w-9 shrink-0 rounded-full border border-white bg-violet-50 object-cover shadow-sm"
    />
  );
}

function ChatRoom({
  contentId,
  title,
  userId,
  verifyUser,
  authNotice,
}: {
  contentId: number;
  title?: string;
  userId?: string;
  authNotice?: ReactNode;
  verifyUser: () => Promise<{ userId: string | undefined; refreshed: boolean }>;
}) {
  const chat = useContentChat(contentId, userId);
  const location = useLocation();
  const [draft, setDraft] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [checkingUser, setCheckingUser] = useState(false);
  const [unread, setUnread] = useState(false);
  const list = useRef<HTMLDivElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const atBottom = useRef(true);
  const previousLast = useRef<string | undefined>(undefined);
  const olderAnchor = useRef<{ id: string; offset: number } | null>(null);
  const composing = useRef(false);
  const mounted = useRef(true);
  const draftOwner = useRef(userId);
  const connected = chat.connection === "connected";
  const length = messageLength(draft);
  const loginUrl = "/login?redirect=" + encodeURIComponent(location.pathname);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (userId && draftOwner.current && userId !== draftOwner.current) {
      setDraft("");
      setInputError(null);
    }
    if (userId) draftOwner.current = userId;
  }, [userId]);

  useLayoutEffect(() => {
    const element = list.current;
    if (!element) return;
    const lastId = chat.messages.at(-1)?.messageId;
    if (olderAnchor.current && !chat.loadingOlder) {
      const anchor = element.querySelector<HTMLElement>(
        `[data-message-id="${olderAnchor.current.id}"]`,
      );
      if (anchor)
        element.scrollTop +=
          anchor.getBoundingClientRect().top -
          element.getBoundingClientRect().top -
          olderAnchor.current.offset;
      olderAnchor.current = null;
    }
    if (lastId !== previousLast.current) {
      if (atBottom.current && !chat.loadingOlder)
        element.scrollTop = element.scrollHeight;
      else if (previousLast.current) setUnread(true);
    }
    previousLast.current = lastId;
  }, [chat.messages, chat.loadingOlder]);

  async function send() {
    const error = validateBody(draft);
    if (error) {
      setInputError(error);
      return;
    }
    if (checkingUser || chat.sending || chat.coolingDown || !connected) return;
    setInputError(null);
    setCheckingUser(true);
    const body = draft;
    try {
      const currentUser = await verifyUser();
      if (
        !mounted.current ||
        currentUser.userId !== userId ||
        !currentUser.userId
      ) {
        if (mounted.current)
          setInputError("로그인 상태가 변경됐어요. 다시 로그인해 주세요.");
        return;
      }
      if (currentUser.refreshed) {
        chat.retry();
        setInputError("로그인을 갱신했어요. 연결이 완료되면 다시 보내주세요.");
        return;
      }
      const sent = await chat.send(body);
      if (sent && mounted.current) {
        setDraft((value) => (value === body ? "" : value));
        atBottom.current = true;
        if (list.current) list.current.scrollTop = list.current.scrollHeight;
      }
    } catch {
      if (mounted.current)
        setInputError(
          "로그인 상태를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.",
        );
    } finally {
      if (mounted.current) {
        setCheckingUser(false);
        textarea.current?.focus();
      }
    }
  }

  function loadOlder() {
    if (chat.loadingOlder || !list.current) return;
    const top = list.current.getBoundingClientRect().top;
    const anchor = [
      ...list.current.querySelectorAll<HTMLElement>("[data-message-id]"),
    ].find((item) => item.getBoundingClientRect().bottom > top);
    if (anchor)
      olderAnchor.current = {
        id: anchor.dataset.messageId!,
        offset: anchor.getBoundingClientRect().top - top,
      };
    void chat.loadOlder();
  }

  return (
    <section
      id="content-chat"
      aria-label="작품 채팅"
      className="min-w-0 scroll-mt-24"
    >
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-violet-50/80 to-white px-4 py-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-sm shadow-violet-200">
              <FiMessageCircle size={20} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-bold tracking-wide text-slate-900">
                작품 라운지
              </h2>
              <p className="mt-1 text-xs text-slate-500" title={title}>
                지금, 이 작품을 함께 이야기해요
              </p>
            </div>
          </div>
          <span
            role="status"
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${connected ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-500"}`}
          >
            {connected ? (
              <FiWifi aria-hidden="true" />
            ) : (
              <FiWifiOff aria-hidden="true" />
            )}
            {connectionLabels[chat.connection]}
          </span>
        </header>

        <div className="relative">
          <div
            ref={list}
            tabIndex={0}
            aria-label="메시지 목록"
            onScroll={() => {
              const element = list.current;
              if (!element) return;
              atBottom.current =
                element.scrollHeight -
                  element.scrollTop -
                  element.clientHeight <
                60;
              if (atBottom.current) setUnread(false);
            }}
            className="h-[280px] overflow-y-auto overscroll-contain bg-slate-50/60 px-4 py-5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-400 sm:h-[280px] sm:px-5"
          >
            {chat.hasOlder && (
              <div className="mb-6 text-center">
                <button
                  type="button"
                  onClick={loadOlder}
                  disabled={chat.loadingOlder}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition hover:border-violet-300 hover:text-violet-600 focus-visible:ring-2 focus-visible:ring-violet-400 disabled:opacity-50"
                >
                  {chat.loadingOlder ? "불러오는 중…" : "이전 대화 불러오기"}
                </button>
              </div>
            )}
            {chat.olderError && (
              <p
                role="alert"
                className="mb-4 text-center text-xs text-rose-600"
              >
                {chat.olderError}
              </p>
            )}
            {chat.loading && (
              <div role="status" className="space-y-6 py-8">
                <span className="sr-only">대화 내역 불러오는 중</span>
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    aria-hidden="true"
                    className={`flex gap-3 motion-safe:animate-pulse ${index === 1 ? "flex-row-reverse" : ""}`}
                  >
                    <div className="h-9 w-9 rounded-full bg-slate-200/70" />
                    <div className="h-16 w-3/5 rounded-2xl bg-slate-200/60" />
                  </div>
                ))}
              </div>
            )}
            {!chat.loading &&
              !chat.historyError &&
              chat.messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center pb-8 text-center">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-violet-50 text-violet-400">
                    <FiMessageCircle size={28} aria-hidden="true" />
                  </div>
                  <p className="font-semibold text-slate-700">
                    첫 이야기를 기다리고 있어요
                  </p>
                  <p className="mt-2 max-w-56 text-sm leading-6 text-slate-400">
                    기억에 남는 장면이나 감상을 가볍게 나눠보세요.
                  </p>
                </div>
              )}
            <ol className="space-y-5">
              {chat.messages.map((message, index) => {
                const own = message.userId === userId;
                const day = message.createdAt.slice(0, 10);
                const showDay =
                  index === 0 ||
                  chat.messages[index - 1].createdAt.slice(0, 10) !== day;
                return (
                  <li key={message.messageId}>
                    {showDay && (
                      <div
                        className="mb-5 flex items-center gap-4"
                        aria-label={day}
                      >
                        <span className="h-px flex-1 bg-slate-200/70" />
                        <span className="text-[11px] text-slate-400">
                          {day.replaceAll("-", ". ")}
                        </span>
                        <span className="h-px flex-1 bg-slate-200/70" />
                      </div>
                    )}
                    <div
                      data-message-id={message.messageId}
                      className={`flex items-start gap-2.5 ${own ? "flex-row-reverse" : ""}`}
                    >
                      {!own && (
                        <Avatar
                          key={message.profileImageUrl}
                          url={message.profileImageUrl}
                        />
                      )}
                      <div
                        className={`min-w-0 max-w-[82%] sm:max-w-[75%] ${own ? "text-right" : ""}`}
                      >
                        <p className="mb-1.5 truncate text-xs font-medium text-slate-500">
                          {own ? "나" : message.nickname}
                        </p>
                        <p
                          className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-left text-sm leading-6 [overflow-wrap:anywhere] ${own ? "rounded-tr-md bg-violet-600 text-white shadow-sm shadow-violet-200" : "rounded-tl-md border border-slate-200/70 bg-white text-slate-700 shadow-sm"}`}
                        >
                          {message.body}
                        </p>
                        <time
                          dateTime={message.createdAt}
                          className="mt-1.5 block text-[10px] text-slate-400"
                        >
                          {message.createdAt.slice(11, 16)}
                        </time>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
          {unread && (
            <button
              type="button"
              onClick={() => {
                if (list.current)
                  list.current.scrollTop = list.current.scrollHeight;
                atBottom.current = true;
                setUnread(false);
              }}
              className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-lg focus-visible:ring-2 focus-visible:ring-violet-400"
            >
              새 메시지 <FiArrowDown aria-hidden="true" />
            </button>
          )}
        </div>

        {(chat.historyError ||
          chat.connectionError ||
          chat.connection === "reconnecting" ||
          chat.connection === "offline") && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-800 sm:px-5">
            <span role="status">
              {chat.historyError ||
                chat.connectionError ||
                "연결이 끊겼어요. 대화 내역은 그대로 유지됩니다."}
            </span>
            <button
              type="button"
              onClick={chat.retry}
              className="inline-flex items-center gap-1 font-bold underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <FiRefreshCw aria-hidden="true" />
              다시 연결
            </button>
          </div>
        )}

        <footer className="border-t border-slate-100 p-4">
          {authNotice ? (
            authNotice
          ) : userId ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void send();
              }}
            >
              <label htmlFor="chat-message" className="sr-only">
                메시지
              </label>
              <div className="flex items-end gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2 transition focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-100">
                <textarea
                  id="chat-message"
                  ref={textarea}
                  rows={1}
                  value={draft}
                  onChange={(event) => {
                    setDraft(event.target.value);
                    setInputError(null);
                  }}
                  onCompositionStart={() => {
                    composing.current = true;
                  }}
                  onCompositionEnd={() => {
                    composing.current = false;
                  }}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey &&
                      !event.nativeEvent.isComposing &&
                      !composing.current &&
                      event.keyCode !== 229
                    ) {
                      event.preventDefault();
                      void send();
                    }
                  }}
                  aria-describedby="chat-input-help chat-input-error"
                  aria-invalid={length > 500 || !!inputError}
                  placeholder="이 작품에 대한 생각을 남겨보세요"
                  className="min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  aria-label="메시지 보내기"
                  disabled={
                    !connected ||
                    checkingUser ||
                    chat.sending ||
                    chat.coolingDown ||
                    !!validateBody(draft)
                  }
                  className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm transition hover:bg-violet-700 focus-visible:ring-4 focus-visible:ring-violet-200 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                >
                  {checkingUser || chat.sending ? (
                    <FiRefreshCw
                      className="motion-safe:animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <FiArrowUp size={20} aria-hidden="true" />
                  )}
                </button>
              </div>
              <div
                id="chat-input-help"
                className="mt-2 flex justify-between gap-2 text-[10px] text-slate-400"
              >
                <span>Enter 전송 · Shift + Enter 줄바꿈</span>
                <span className={length > 500 ? "text-rose-500" : ""}>
                  {length} / 500
                </span>
              </div>
              <p
                id="chat-input-error"
                role="alert"
                className="mt-2 text-xs text-rose-600"
              >
                {inputError ||
                  chat.sendError ||
                  (length > 500 ? "메시지는 500자까지 보낼 수 있어요." : "")}
              </p>
            </form>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-violet-50 px-4 py-4">
              <p className="text-sm text-slate-600">함께 이야기하고 싶다면</p>
              <Link
                to={loginUrl}
                className="rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-violet-700 focus-visible:ring-4 focus-visible:ring-violet-200"
              >
                로그인하고 참여하기
              </Link>
            </div>
          )}
          <p className="mt-3 text-center text-[10px] leading-5 text-slate-400">
            서로의 감상을 존중해 주세요. 대화에 스포일러가 포함될 수 있어요.
          </p>
        </footer>
      </div>
    </section>
  );
}

export function ContentChat({
  contentId,
  title,
}: {
  contentId: number;
  title?: string;
}) {
  const queryClient = useQueryClient();
  const user = useQuery({
    queryKey: ["user", "me"],
    queryFn: async () => (await verifyChatIdentity()).user,
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: "always",
  });
  const userId = user.isError ? undefined : user.data?.userId;
  const loginCheckFailed =
    user.isError &&
    !(isAxiosError(user.error) && user.error.response?.status === 401);
  const authNotice = user.isPending ? (
    <p role="status" className="py-4 text-center text-sm text-slate-500">
      로그인 상태 확인 중…
    </p>
  ) : loginCheckFailed ? (
    <div
      role="status"
      className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-800"
    >
      <p>로그인 상태를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.</p>
      <button
        type="button"
        disabled={user.isFetching}
        onClick={() => void user.refetch()}
        className="mt-3 font-bold underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-50"
      >
        {user.isFetching ? "확인 중…" : "로그인 상태 다시 확인"}
      </button>
    </div>
  ) : undefined;
  return (
    <ChatRoom
      key={contentId}
      contentId={contentId}
      title={title}
      userId={userId}
      authNotice={authNotice}
      verifyUser={async () => {
        try {
          const result = await verifyChatIdentity();
          queryClient.setQueryData(["user", "me"], result.user);
          return { userId: result.user.userId, refreshed: result.refreshed };
        } catch (error) {
          void user.refetch();
          throw error;
        }
      }}
    />
  );
}
