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
  const { data: episodes, isLoading, isError } = useContentEpisodes(
    contentId,
    seasonNo,
  );

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

  if (!episodes || episodes.length === 0) {
    return (
      <div className="py-20 text-center text-gray-400">
        등록된 에피소드가 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {episodes.map((episode) => (
        <article
          key={episode.episodeId}
          className="rounded-3xl border border-slate-100 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.08)] overflow-hidden"
        >
          <div className="aspect-[16/9] bg-slate-100">
            {episode.stillImageUrl ? (
              <img
                src={episode.stillImageUrl}
                alt={episode.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                썸네일 없음
              </div>
            )}
          </div>

          <div className="p-6 space-y-3">
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              Episode {episode.episodeNo}
            </div>
            <h3 className="text-xl font-black text-slate-900">
              {episode.title || `에피소드 ${episode.episodeNo}`}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
              {episode.summary || "등록된 요약이 없습니다."}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
};
