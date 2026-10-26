import { ContentChat } from "@features/chat/ContentChat.tsx";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ContentHeader } from "@features/contentDetail/components/ContentHeader.tsx";
import { ContentTabs } from "@features/contentDetail/components/ContentTabs.tsx";
import {
  useContentBasic,
  useContentSeasons,
} from "@features/contentDetail/hooks/useContentDetail.ts";
import { sortSeasons } from "@features/contentDetail/utils/seasonUtils.ts";
import { useCurrentUser } from "@features/user/hooks/useUser.ts";

const ContentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const contentId = Number(id);
  const user = useCurrentUser();
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
    ? (seasons.find((season) => season.seasonNo === 1)?.seasonNo ??
      seasons[0]?.seasonNo ??
      null)
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
    <div className="animate-in fade-in duration-700 min-h-screen bg-[#f6f7fb] pt-24 pb-20">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-8">
        <div className="mb-5 flex items-center gap-2 text-xs text-slate-400">
          <Link
            to={isTv ? "/drama" : "/movie"}
            className="transition hover:text-violet-600"
          >
            {isTv ? "드라마" : "영화"}
          </Link>
          <span>/</span>
          <span className="truncate text-slate-600">
            {content?.title || "작품 상세"}
          </span>
        </div>
        <ContentHeader
          action={
            content &&
            user.isSuccess &&
            !!user.data.userId && (
              <Link
                to={"/content/" + contentId + "/moments"}
                className="inline-flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-xs font-bold text-slate-900 transition hover:bg-violet-100 focus-visible:ring-4 focus-visible:ring-violet-300"
              >
                내 모먼트 <span aria-hidden="true">↗</span>
              </Link>
            )
          }
          content={content}
          season={selectedSeason}
          seasons={seasons}
          selectedSeasonNo={effectiveSeasonNo}
          onSeasonChange={(seasonNo) => setSelectedSeasonNo(seasonNo)}
        >
          {content && (
            <ContentChat
              key={contentId}
              contentId={contentId}
              title={content.title}
            />
          )}
        </ContentHeader>

        <section className="mt-6 rounded-3xl border border-slate-200/80 bg-white px-5 pb-2 pt-3 sm:px-8">
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
    </div>
  );
};

export default ContentDetailPage;
