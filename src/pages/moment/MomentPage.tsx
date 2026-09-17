import { useState } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  FiArrowLeft,
  FiBookmark,
  FiExternalLink,
  FiFilm,
} from "react-icons/fi";
import { Button } from "@components/ui/Button.tsx";
import Input from "@components/ui/Input.tsx";
import { checkLogin } from "@features/user/api/userApi.ts";
import { getContentBasic } from "@features/contentDetail/api/contentApi.ts";
import {
  getYoutubeEmbedUrl,
  getYoutubeWatchUrl,
  formatReviewClipRange,
} from "@features/review/utils/reviewFormat.ts";
import {
  getErrorStatus,
  getMoment,
  getMomentError,
} from "@features/moment/api/momentApi.ts";
import {
  useMomentActions,
  useMoments,
} from "@features/moment/hooks/useMoments.ts";
import { SceneArchiver } from "@features/moment/components/SceneArchiver.tsx";
import { MomentCard } from "@features/moment/components/MomentCard.tsx";
import {
  getMomentPatch,
  parseMomentVideo,
} from "@features/moment/utils/momentInput.ts";
import type {
  Moment,
  MomentInput,
} from "@features/moment/types/momentTypes.ts";

const pageClass = "mx-auto min-h-screen max-w-7xl px-4 pb-16 pt-24 sm:px-8";
const loading = (
  <p role="status" className="py-16 text-center text-slate-500">
    모먼트를 준비하고 있어요...
  </p>
);

function LoginRedirect() {
  const location = useLocation();
  return (
    <Navigate
      replace
      to={
        "/login?redirect=" +
        encodeURIComponent(location.pathname + location.search)
      }
    />
  );
}

interface WorkspaceProps {
  contentId: number;
  userId: string;
}

function MomentWorkspace({ contentId, userId }: WorkspaceProps) {
  const content = useQuery({
    queryKey: ["content", "basic", contentId],
    queryFn: () => getContentBasic(contentId),
    retry: false,
  });
  const [youtubeId, setYoutubeId] = useState<string | null>(null);
  const [videoInput, setVideoInput] = useState("");
  const [videoError, setVideoError] = useState("");
  const [editing, setEditing] = useState<Moment | null>(null);
  const [clip, setClip] = useState<{
    youtubeId: string;
    startTime?: number;
    endTime?: number;
    momentId?: number;
    version: number;
    autoplay?: boolean;
  } | null>(null);
  const [notice, setNotice] = useState<{
    text: string;
    error?: boolean;
  } | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const moments = useMoments(userId, contentId, youtubeId);
  const actions = useMomentActions(userId, contentId);

  const handleError = (error: unknown) => {
    if (getErrorStatus(error) === 401) setSessionExpired(true);
  };
  const edit = useMutation({
    mutationFn: getMoment,
    gcTime: 0,
    retry: false,
    onSuccess: (moment) => {
      playMoment(moment, false);
      setEditing(moment);
    },
    onError: (error) => {
      handleError(error);
      setNotice({ text: getMomentError(error), error: true });
    },
  });
  const busy =
    edit.isPending ||
    actions.create.isPending ||
    actions.update.isPending ||
    actions.remove.isPending;

  const loadVideo = () => {
    if (busy || editing) return;
    const id = parseMomentVideo(videoInput);
    if (!id) {
      setVideoError("유효한 유튜브 URL 또는 11자리 영상 ID를 입력해주세요.");
      return;
    }
    setVideoError("");
    setNotice(null);
    setYoutubeId(id);
    setClip((previous) => ({
      youtubeId: id,
      version: (previous?.version ?? 0) + 1,
    }));
  };

  const playMoment = (moment: Moment, autoplay = true) => {
    setEditing(null);
    setYoutubeId(moment.youtubeId);
    setVideoInput(moment.youtubeId);
    setVideoError("");
    setNotice(null);
    setClip((previous) => ({
      youtubeId: moment.youtubeId,
      startTime: moment.startTime,
      endTime: moment.endTime,
      momentId: moment.momentId,
      version: (previous?.version ?? 0) + 1,
      autoplay,
    }));
  };

  const save = async (input: MomentInput) => {
    if (editing) {
      const body = getMomentPatch(editing, input);
      if (Object.keys(body).length === 0) {
        setNotice({ text: "변경된 내용이 없습니다." });
        return;
      }
      const updated = await actions.update.mutateAsync({
        momentId: editing.momentId,
        body,
      });
      if (clip?.momentId === updated.momentId) playMoment(updated, false);
      setEditing(null);
      setNotice({ text: "모먼트를 수정했습니다." });
    } else {
      await actions.create.mutateAsync(input);
      setNotice({ text: "나만의 모먼트에 저장했습니다." });
    }
  };

  const remove = async (moment: Moment) => {
    if (
      busy ||
      !window.confirm("이 모먼트를 삭제할까요? 삭제 후에는 복구할 수 없습니다.")
    )
      return;
    setNotice(null);
    try {
      await actions.remove.mutateAsync(moment.momentId);
      if (editing?.momentId === moment.momentId) setEditing(null);
      if (clip?.momentId === moment.momentId) setClip(null);
      setNotice({ text: "모먼트를 삭제했습니다." });
    } catch (error) {
      handleError(error);
      setNotice({ text: getMomentError(error), error: true });
    }
  };

  if (
    sessionExpired ||
    getErrorStatus(content.error) === 401 ||
    getErrorStatus(moments.error) === 401
  )
    return <LoginRedirect />;
  if (content.isPending) return <main className={pageClass}>{loading}</main>;
  if (content.isError || !content.data)
    return (
      <main className={pageClass}>
        <p role="alert" className="py-8 text-slate-600">
          {getMomentError(content.error)}
        </p>
        <Button onClick={() => void content.refetch()}>
          작품 다시 불러오기
        </Button>
      </main>
    );

  const cards = moments.data?.pages.flatMap((page) => page.momentList) ?? [];
  const embed = clip
    ? getYoutubeEmbedUrl(
        clip.youtubeId,
        clip.startTime,
        clip.endTime,
        clip.autoplay ?? false,
      )
    : null;
  const watchUrl = clip
    ? getYoutubeWatchUrl(clip.youtubeId, clip.startTime)
    : null;

  return (
    <main className={pageClass}>
      <Link
        to={"/content/" + contentId}
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-violet-600 focus-visible:ring-2 focus-visible:ring-violet-500"
      >
        <FiArrowLeft aria-hidden="true" /> 작품으로 돌아가기
      </Link>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-2 text-xs font-bold tracking-[0.2em] text-violet-500">
            MY SCENE COLLECTION
          </p>
          <h1 className="break-words text-2xl font-extrabold text-slate-900 sm:text-3xl">
            {content.data.title}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            오래 간직하고 싶은 순간, 나만의 모먼트
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-2 text-xs font-bold text-violet-600">
          <FiBookmark aria-hidden="true" /> 나에게만 공개
        </span>
      </div>

      {notice && (
        <p
          role={notice.error ? "alert" : "status"}
          className={
            "mb-5 rounded-xl p-4 text-sm " +
            (notice.error
              ? "bg-red-50 text-red-700"
              : "bg-violet-50 text-violet-700")
          }
        >
          {notice.text}
        </p>
      )}

      <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <section className="min-w-0" aria-label="유튜브 영상">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              loadVideo();
            }}
            className="mb-4"
          >
            <label
              htmlFor="moment-video"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              유튜브 영상
            </label>
            <div className="flex min-w-0 gap-2">
              <Input
                id="moment-video"
                value={videoInput}
                onChange={(event) => {
                  setVideoInput(event.target.value);
                  setVideoError("");
                }}
                disabled={busy || !!editing}
                placeholder="유튜브 URL 또는 영상 ID"
                aria-invalid={!!videoError}
                aria-describedby="moment-video-error"
              />
              <Button
                type="submit"
                variant="secondary"
                disabled={busy || !!editing}
                className="shrink-0 px-4"
              >
                불러오기
              </Button>
            </div>
            <p
              id="moment-video-error"
              role={videoError ? "alert" : undefined}
              className="mt-2 text-xs text-red-600"
            >
              {videoError}
            </p>
          </form>
          <div className="aspect-video overflow-hidden rounded-2xl bg-slate-950 shadow-sm">
            {embed ? (
              <iframe
                key={clip?.version}
                src={embed}
                title={content.data.title + " 모먼트 영상"}
                className="h-full w-full"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center text-slate-400">
                <FiFilm size={36} aria-hidden="true" />
                <p className="text-sm">
                  영상 링크를 불러오거나
                  <br />
                  저장한 모먼트를 선택해보세요.
                </p>
              </div>
            )}
          </div>
          <div className="mt-3 flex min-h-5 flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-violet-600">
              {clip?.startTime != null
                ? formatReviewClipRange(clip.startTime, clip.endTime)
                : ""}
            </span>
            {watchUrl && (
              <a
                href={watchUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-slate-500 underline"
              >
                재생이 안 되나요? 유튜브에서 보기{" "}
                <FiExternalLink aria-hidden="true" />
              </a>
            )}
          </div>
        </section>

        <div className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          {edit.isPending && (
            <p role="status" className="mb-3 text-sm text-slate-500">
              편집할 모먼트를 불러오는 중...
            </p>
          )}
          <SceneArchiver
            key={
              String(editing?.momentId ?? "new") +
              ":" +
              youtubeId +
              ":" +
              (editing?.updatedAt ?? "")
            }
            youtubeId={youtubeId}
            editing={editing}
            disabled={busy}
            onSave={save}
            onCancel={() => {
              setEditing(null);
              setNotice(null);
            }}
            onError={handleError}
          />
        </div>

        <section
          className="min-w-0 lg:col-start-1"
          aria-labelledby="moments-heading"
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h2
                id="moments-heading"
                className="text-lg font-extrabold text-violet-600"
              >
                Collected Moments
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {youtubeId ? "선택한 영상" : "이 작품"} · 불러온 {cards.length}
                개
              </p>
            </div>
            {youtubeId && (
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setYoutubeId(null);
                  setVideoInput("");
                  setEditing(null);
                  setClip(null);
                  setVideoError("");
                  setNotice(null);
                }}
                className="rounded-lg px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                작품 전체 보기
              </button>
            )}
          </div>
          {moments.isPending && (
            <p
              role="status"
              className="py-12 text-center text-sm text-slate-500"
            >
              저장한 모먼트를 불러오는 중...
            </p>
          )}
          {moments.isError && !moments.isFetchNextPageError && (
            <div
              role="alert"
              className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700"
            >
              <p>{getMomentError(moments.error)}</p>
              <Button
                className="mt-3"
                variant="ghost"
                disabled={moments.isFetching}
                onClick={() => void moments.refetch()}
              >
                목록 다시 불러오기
              </Button>
            </div>
          )}
          {moments.isSuccess && cards.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-14 text-center">
              <FiBookmark
                className="mx-auto mb-3 text-violet-300"
                size={28}
                aria-hidden="true"
              />
              <p className="text-sm font-bold text-slate-600">
                아직 저장한 모먼트가 없어요.
              </p>
              <p className="mt-2 text-xs text-slate-400">
                첫 번째 장면을 간직해보세요.
              </p>
            </div>
          )}
          <div className="grid gap-5 sm:grid-cols-2">
            {cards.map((moment) => (
              <MomentCard
                key={moment.momentId}
                moment={moment}
                selected={clip?.momentId === moment.momentId}
                disabled={busy}
                onPlay={() => playMoment(moment)}
                onEdit={() => edit.mutate(moment.momentId)}
                onDelete={() => void remove(moment)}
              />
            ))}
          </div>
          {moments.isFetchNextPageError && (
            <p role="alert" className="mt-5 text-sm text-red-600">
              다음 모먼트를 불러오지 못했습니다. 다시 시도해주세요.
            </p>
          )}
          {moments.hasNextPage && (
            <Button
              variant="secondary"
              className="mt-6 w-full"
              disabled={moments.isFetching || busy}
              onClick={() => void moments.fetchNextPage()}
            >
              {moments.isFetchingNextPage
                ? "불러오는 중..."
                : moments.isFetchNextPageError
                  ? "다음 페이지 재시도"
                  : "더 보기"}
            </Button>
          )}
        </section>
      </div>
    </main>
  );
}

export default function MomentPage() {
  const params = useParams<{ contentId: string }>();
  const contentId = Number(params.contentId);
  const validId = Number.isSafeInteger(contentId) && contentId > 0;
  // Recheck the session before displaying any cached private data.
  const user = useQuery({
    queryKey: ["user", "me"],
    queryFn: checkLogin,
    enabled: validId,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    retry: false,
  });

  if (!validId)
    return (
      <main className={pageClass}>
        <p role="alert">올바르지 않은 작품 주소입니다.</p>
        <Link to="/">홈으로 돌아가기</Link>
      </main>
    );
  if (user.isPending || (!user.isFetchedAfterMount && user.isFetching))
    return <main className={pageClass}>{loading}</main>;
  if (
    getErrorStatus(user.error) === 401 ||
    (!user.isError && !user.data?.userId)
  )
    return <LoginRedirect />;
  if (user.isError)
    return (
      <main className={pageClass}>
        <p role="alert" className="mb-4">
          로그인 상태를 확인하지 못했습니다.
        </p>
        <Button onClick={() => void user.refetch()}>다시 확인</Button>
      </main>
    );
  return (
    <>
      {user.isFetching && <main className={pageClass}>{loading}</main>}
      <div hidden={user.isFetching}>
        <MomentWorkspace
          key={user.data!.userId + ":" + contentId}
          userId={user.data!.userId}
          contentId={contentId}
        />
      </div>
    </>
  );
}
