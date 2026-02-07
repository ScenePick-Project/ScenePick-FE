import type {
  ContentBasicDTO,
  SeasonDTO,
} from "@features/contentDetail/types/contentDetailTypes.ts";

interface InfoTabProps {
  content?: ContentBasicDTO;
  season?: SeasonDTO | null;
  isSeasonLoading?: boolean;
  hasSeasons?: boolean;
}

export const InfoTab = ({
  content,
  season,
  isSeasonLoading,
  hasSeasons,
}: InfoTabProps) => {
  if (!content || isSeasonLoading)
    return <div className="py-10 text-gray-400">정보를 불러오는 중...</div>;

  const isTv = hasSeasons ?? (content.seasonList?.length ?? 0) > 0;
  if (isTv && !season) {
    return <div className="py-10 text-gray-400">시즌을 선택하세요.</div>;
  }
  const synopsis = isTv ? season?.overview : content.synopsis;

  return (
    <div className="space-y-8">
      <section>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {synopsis || "등록된 줄거리가 없습니다."}
        </p>
      </section>
    </div>
  );
};
