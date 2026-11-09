import { useContentEpisodes } from "@features/contentDetail/hooks/useContentDetail.ts";

interface EpisodeTabProps {
  contentId: number;
  seasonNo: number | null;
  isContentLoading?: boolean;
  isSeasonLoading?: boolean;
}

export const EpisodeTab = ({
  contentId,
  seasonNo,
  isContentLoading,
  isSeasonLoading,
}: EpisodeTabProps) => {
  const {
    data: episodes,
    isLoading,
    isError,
  } = useContentEpisodes(contentId, seasonNo);

  if (isContentLoading || isSeasonLoading || seasonNo == null || isLoading) {
    return (
      <div className="py-20 text-center text-gray-400">
        에피소드를 불러오는 중...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-20 text-center text-gray-400">
        에피소드를 불러오지 못했습니다.
      </div>
    );
  }

  if (!episodes?.length) {
    return (
      <div className="py-20 text-center text-gray-400">
        등록된 에피소드가 없습니다.
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {episodes.map((episode) => (
        <article
          key={episode.episodeId}
          className="flex items-start gap-4 py-5 first:pt-0 last:pb-0 sm:items-center sm:gap-6"
        >
          <div className="aspect-[16/9] w-24 shrink-0 overflow-hidden rounded-md bg-slate-100 sm:w-40">
            {episode.stillImageUrl ? (
              <img
                src={episode.stillImageUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 text-[10px] sm:text-xs">
                썸네일 없음
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:gap-5">
            <span
              className="shrink-0 text-xs tabular-nums text-slate-500 sm:w-6 sm:pt-1"
              aria-label={`${episode.episodeNo}화`}
            >
              {String(episode.episodeNo).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="break-words text-sm font-semibold leading-6 text-slate-900 sm:text-base">
                {episode.title || `에피소드 ${episode.episodeNo}`}
              </h3>
              <p className="mt-1.5 line-clamp-2 break-words text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                {episode.summary || "등록된 요약이 없습니다."}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};
