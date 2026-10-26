import type { ReactNode } from "react";
import type {
  ContentBasicDto,
  SeasonDto,
} from "@features/contentDetail/types/contentDetailTypes.ts";
import { SeasonSelector } from "@features/contentDetail/components/SeasonSelector.tsx";

interface ContentHeaderProps {
  children?: ReactNode;
  action?: ReactNode;
  content?: ContentBasicDto;
  season?: SeasonDto | null;
  seasons: SeasonDto[];
  selectedSeasonNo: number | null;
  onSeasonChange: (seasonNo: number) => void;
}

export const ContentHeader = ({
  children,
  action,
  content,
  season,
  seasons,
  selectedSeasonNo,
  onSeasonChange,
}: ContentHeaderProps) => {
  if (!content)
    return <div className="h-[500px] animate-pulse rounded-3xl bg-slate-100" />;
  const poster = season?.posterImageUrl || content.posterImageUrl;
  const synopsis = season?.overview || content.synopsis;
  return (
    <section
      aria-label="작품 소개와 채팅"
      className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]"
    >
      <div className="relative isolate overflow-hidden rounded-3xl bg-[#191827] text-white shadow-sm lg:min-h-[504px]">
        {poster && (
          <img
            src={poster}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 h-full w-full scale-110 object-cover opacity-20 blur-2xl"
          />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-[#191827] via-[#191827]/80 to-violet-950/30" />
        <div className="p-5 sm:p-8">
          <p className="mb-6 flex items-center gap-2 text-[10px] font-bold tracking-[0.25em] text-violet-200">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            SCENE PICK · {seasons.length ? "SERIES" : "FILM"}
          </p>
          <div className="grid grid-cols-[112px_minmax(0,1fr)] items-start gap-x-5 gap-y-6 sm:grid-cols-[190px_minmax(0,1fr)] sm:gap-x-7">
            <div className="row-span-1 sm:row-span-2 overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-2xl">
              {poster ? (
                <img
                  src={poster}
                  alt={content.title}
                  className="aspect-[2/3] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[2/3] items-center justify-center text-xs text-white/50">
                  포스터 준비 중
                </div>
              )}
            </div>
            <div className="min-w-0 pt-1">
              <h1 className="break-words text-2xl font-black leading-tight tracking-tight sm:text-3xl">
                {content.title}
              </h1>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {content.genreList.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-medium tracking-wide text-slate-300"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
            <div className="col-span-2 min-w-0 sm:col-span-1">
              <p className="mb-2 text-[10px] font-bold tracking-[0.15em] text-violet-200">
                STORY
              </p>
              <p className="line-clamp-5 text-sm leading-7 text-slate-300">
                {synopsis || "아직 등록된 줄거리가 없어요."}
              </p>
              {action && <div className="mt-6">{action}</div>}
            </div>
          </div>
          <div className="mt-8 border-t border-white/10 pt-5">
            <p className="text-xs leading-6 text-slate-400">
              기억하고 싶은 장면을 담고, 작품의 여운을 함께 나눠보세요.
            </p>
          </div>
        </div>
      </div>
      {children}
      {seasons.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <h2 className="mb-3 text-sm font-bold text-slate-800">시즌 선택</h2>
          <SeasonSelector
            seasons={seasons}
            selectedSeasonNo={selectedSeasonNo}
            onSeasonChange={onSeasonChange}
            contentTitle={content.title}
            variant="header"
          />
        </div>
      )}
    </section>
  );
};
