import type {
  ContentBasicDto,
  SeasonDto,
} from "@features/contentDetail/types/contentDetailTypes.ts";
import { SeasonSelector } from "@features/contentDetail/components/SeasonSelector.tsx";

interface ContentHeaderProps {
  content?: ContentBasicDto;
  season?: SeasonDto | null;
  seasons: SeasonDto[];
  selectedSeasonNo: number | null;
  onSeasonChange: (seasonNo: number) => void;
}

export const ContentHeader = ({
  content,
  season,
  seasons,
  selectedSeasonNo,
  onSeasonChange,
}: ContentHeaderProps) => {
  const getGenreStyles = (genre: string) => {
    const colors: Record<
      string,
      { dot: string; text: string; bg: string; border: string }
    > = {
      ACTION: {
        dot: "bg-red-500",
        text: "text-red-700",
        bg: "bg-red-50",
        border: "border-red-200",
      },
      ADVENTURE: {
        dot: "bg-orange-500",
        text: "text-orange-700",
        bg: "bg-orange-50",
        border: "border-orange-200",
      },
      ANIMATION: {
        dot: "bg-amber-400",
        text: "text-amber-700",
        bg: "bg-amber-50",
        border: "border-amber-200",
      },
      COMEDY: {
        dot: "bg-yellow-400",
        text: "text-yellow-700",
        bg: "bg-yellow-50",
        border: "border-yellow-200",
      },
      DOCUMENTARY: {
        dot: "bg-lime-500",
        text: "text-lime-700",
        bg: "bg-lime-50",
        border: "border-lime-200",
      },
      FAMILY: {
        dot: "bg-green-500",
        text: "text-green-700",
        bg: "bg-green-50",
        border: "border-green-200",
      },
      DRAMA: {
        dot: "bg-emerald-500",
        text: "text-emerald-700",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
      },
      SCIENCE_FICTION: {
        dot: "bg-teal-500",
        text: "text-teal-700",
        bg: "bg-teal-50",
        border: "border-teal-200",
      },
      SCI_FI: {
        dot: "bg-teal-500",
        text: "text-teal-700",
        bg: "bg-teal-50",
        border: "border-teal-200",
      },
      MYSTERY: {
        dot: "bg-cyan-500",
        text: "text-cyan-700",
        bg: "bg-cyan-50",
        border: "border-cyan-200",
      },
      TV_MOVIE: {
        dot: "bg-sky-500",
        text: "text-sky-700",
        bg: "bg-sky-50",
        border: "border-sky-200",
      },
      HISTORY: {
        dot: "bg-blue-500",
        text: "text-blue-700",
        bg: "bg-blue-50",
        border: "border-blue-200",
      },
      WAR: {
        dot: "bg-indigo-500",
        text: "text-indigo-700",
        bg: "bg-indigo-50",
        border: "border-indigo-200",
      },
      FANTASY: {
        dot: "bg-violet-500",
        text: "text-violet-700",
        bg: "bg-violet-50",
        border: "border-violet-200",
      },
      WESTERN: {
        dot: "bg-purple-500",
        text: "text-purple-700",
        bg: "bg-purple-50",
        border: "border-purple-200",
      },
      MUSIC: {
        dot: "bg-fuchsia-500",
        text: "text-fuchsia-700",
        bg: "bg-fuchsia-50",
        border: "border-fuchsia-200",
      },
      ROMANCE: {
        dot: "bg-pink-500",
        text: "text-pink-700",
        bg: "bg-pink-50",
        border: "border-pink-200",
      },
      THRILLER: {
        dot: "bg-rose-500",
        text: "text-rose-700",
        bg: "bg-rose-50",
        border: "border-rose-200",
      },
      HORROR: {
        dot: "bg-slate-900",
        text: "text-slate-700",
        bg: "bg-slate-100",
        border: "border-slate-200",
      },
      CRIME: {
        dot: "bg-stone-600",
        text: "text-stone-700",
        bg: "bg-stone-100",
        border: "border-stone-200",
      },
    };

    const key = genre.toUpperCase().replace(/[\s-]/g, "_");
    if (colors[key]) return colors[key];

    const palette = [
      {
        dot: "bg-blue-500",
        text: "text-blue-700",
        bg: "bg-blue-50",
        border: "border-blue-200",
      },
      {
        dot: "bg-emerald-500",
        text: "text-emerald-700",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
      },
      {
        dot: "bg-amber-400",
        text: "text-amber-700",
        bg: "bg-amber-50",
        border: "border-amber-200",
      },
      {
        dot: "bg-rose-500",
        text: "text-rose-700",
        bg: "bg-rose-50",
        border: "border-rose-200",
      },
      {
        dot: "bg-violet-500",
        text: "text-violet-700",
        bg: "bg-violet-50",
        border: "border-violet-200",
      },
      {
        dot: "bg-teal-500",
        text: "text-teal-700",
        bg: "bg-teal-50",
        border: "border-teal-200",
      },
      {
        dot: "bg-orange-500",
        text: "text-orange-700",
        bg: "bg-orange-50",
        border: "border-orange-200",
      },
      {
        dot: "bg-lime-500",
        text: "text-lime-700",
        bg: "bg-lime-50",
        border: "border-lime-200",
      },
      {
        dot: "bg-cyan-500",
        text: "text-cyan-700",
        bg: "bg-cyan-50",
        border: "border-cyan-200",
      },
      {
        dot: "bg-fuchsia-500",
        text: "text-fuchsia-700",
        bg: "bg-fuchsia-50",
        border: "border-fuchsia-200",
      },
    ];

    const hash = key
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return palette[hash % palette.length];
  };

  if (!content) {
    return (
      <div className="animate-pulse h-[500px] bg-gray-50 rounded-3xl mb-12" />
    );
  }

  const posterImageUrl =
    season?.posterImageUrl ||
    content.posterImageUrl ||
    "/src/assets/images/test.jpg";

  return (
    <section className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-16 items-start">
      <div className="w-full max-w-[300px] shrink-0 group">
        <div className="relative aspect-[2/3] rounded-[40px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
          <img
            src={posterImageUrl}
            alt={content.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="flex-1 pt-4">
        <h1 className="text-7xl font-black text-gray-900 mb-12 tracking-tighter">
          {content.title}
        </h1>

        {seasons.length > 0 && (
          <div className="mb-12 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] whitespace-nowrap">
                Season Select
              </span>
              <div className="h-[1px] flex-1 bg-slate-100" />
            </div>
            <SeasonSelector
              seasons={seasons}
              selectedSeasonNo={selectedSeasonNo}
              onSeasonChange={onSeasonChange}
              contentTitle={content.title}
              variant="header"
            />
          </div>
        )}

        <div className="w-full max-w-2xl">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] whitespace-nowrap">
              Genres
            </span>
            <div className="h-[1px] flex-1 bg-slate-100" />
          </div>

          <div className="flex flex-wrap gap-3">
            {content.genreList.map((genre) => {
              const genreStyles = getGenreStyles(genre);
              return (
                <div
                  key={genre}
                  className={`flex items-center gap-2.5 px-5 py-2 rounded-full border ${genreStyles.border} ${genreStyles.bg}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${genreStyles.dot}`}
                  />
                  <span
                    className={`text-sm font-black tracking-tight uppercase ${genreStyles.text}`}
                  >
                    {genre}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
