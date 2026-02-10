import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ContentHeader } from "@features/contentDetail/components/ContentHeader.tsx";
import { ContentTabs } from "@features/contentDetail/components/ContentTabs.tsx";
import {
  useContentBasic,
  useContentSeasons,
} from "@features/contentDetail/hooks/useContentDetail.ts";
import { sortSeasons } from "@features/contentDetail/utils/seasonUtils.ts";

const ContentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const contentId = Number(id);
  const { data: content, isLoading: isContentLoading } =
    useContentBasic(contentId);
  const { data: seasonData, isLoading: isSeasonLoading } =
    useContentSeasons(contentId);

  const seasons = useMemo(
    () => sortSeasons(seasonData ?? content?.seasonList),
    [seasonData, content?.seasonList],
  );

  const isTv = seasons.length > 0;
  const isSeasonDataLoading =
    isSeasonLoading && !seasonData && !content?.seasonList;
  const preferredSeasonNo = isTv
    ? seasons.find((season) => season.seasonNo === 1)?.seasonNo ??
      seasons[0]?.seasonNo ??
      null
    : null;

  const [selectedSeasonNo, setSelectedSeasonNo] = useState<number | null>(null);

  useEffect(() => {
    if (!isTv) {
      setSelectedSeasonNo(null);
      return;
    }
    if (preferredSeasonNo == null) return;
    setSelectedSeasonNo((prev) => {
      if (prev != null && seasons.some((season) => season.seasonNo === prev)) {
        return prev;
      }
      return preferredSeasonNo;
    });
  }, [isTv, preferredSeasonNo, seasons]);

  const effectiveSeasonNo = selectedSeasonNo ?? preferredSeasonNo;
  const selectedSeason =
    seasons.find((season) => season.seasonNo === effectiveSeasonNo) ?? null;

  return (
    <div className="animate-in fade-in duration-700 min-h-screen pt-24 pb-20 px-8 max-w-7xl mx-auto">
      <ContentHeader
        content={content}
        season={selectedSeason}
        seasons={seasons}
        selectedSeasonNo={effectiveSeasonNo}
        onSeasonChange={(seasonNo) => setSelectedSeasonNo(seasonNo)}
      />

      <section className="mt-20 pt-10">
        <ContentTabs
          contentId={contentId}
          content={content}
          seasons={seasons}
          selectedSeason={selectedSeason}
          selectedSeasonNo={effectiveSeasonNo}
          isContentLoading={isContentLoading}
          isTv={isTv}
          isSeasonLoading={isSeasonDataLoading}
        />
      </section>
    </div>
  );
};

export default ContentDetailPage;
