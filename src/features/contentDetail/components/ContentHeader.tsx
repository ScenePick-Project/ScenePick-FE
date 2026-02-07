import type {
  ContentBasicDTO,
  SeasonDTO,
} from "@features/contentDetail/types/contentDetailTypes.ts";
import { SeasonSelector } from "@features/contentDetail/components/SeasonSelector.tsx";

interface ContentHeaderProps {
  content?: ContentBasicDTO;
  season?: SeasonDTO | null;
  seasons: SeasonDTO[];
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
  const getGenreColor = (genre: string) => {
    const colors: Record<string, string> = {
      ACTION: "bg-red-500",
      ADVENTURE: "bg-orange-500",
      ANIMATION: "bg-amber-400",
      COMEDY: "bg-yellow-400",
      DOCUMENTARY: "bg-lime-500",
      FAMILY: "bg-green-500",
      DRAMA: "bg-emerald-500",
      SCIENCE_FICTION: "bg-teal-500",
      SCI_FI: "bg-teal-500",
      MYSTERY: "bg-cyan-500",
      TV_MOVIE: "bg-sky-500",
      HISTORY: "bg-blue-500",
      WAR: "bg-indigo-500",
      FANTASY: "bg-violet-500",
      WESTERN: "bg-purple-500",
      MUSIC: "bg-fuchsia-500",
      ROMANCE: "bg-pink-500",
      THRILLER: "bg-rose-500",
      HORROR: "bg-slate-900",
      CRIME: "bg-stone-600",
    };
    const key = genre.toUpperCase().replace(/[\s-]/g, "_");
    if (colors[key]) return colors[key];
    const palette = [
      "bg-blue-500",
      "bg-emerald-500",
      "bg-amber-400",
      "bg-rose-500",
      "bg-violet-500",
      "bg-teal-500",
      "bg-orange-500",
      "bg-lime-500",
      "bg-cyan-500",
      "bg-fuchsia-500",
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
            {content.genreList.map((genre) => (
              <div
                key={genre}
                className="flex items-center gap-2.5 px-5 py-2 rounded-full border border-slate-200 bg-white shadow-sm"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${getGenreColor(genre)}`}
                />
                <span className="text-sm font-black text-slate-700 tracking-tight uppercase">
                  {genre}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
