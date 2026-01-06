import { useContentBasic } from "@features/contentDetail/hooks/useContentDetail.ts";

interface ContentHeaderProps {
  contentId: number;
}

export const ContentHeader = ({ contentId }: ContentHeaderProps) => {
  const { data } = useContentBasic(contentId);

  const getGenreColor = (genre: string) => {
    const colors: Record<string, string> = {
      ACTION: "bg-blue-500",
      HORROR: "bg-slate-900",
      THRILLER: "bg-red-500",
      DRAMA: "bg-emerald-500",
      FANTASY: "bg-purple-500",
    };
    return colors[genre.toUpperCase()] || "bg-gray-400";
  };

  if (!data) {
    return (
      <div className="animate-pulse h-[500px] bg-gray-50 rounded-3xl mb-12" />
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-16 items-start">
      <div className="w-full max-w-[420px] shrink-0 group">
        <div className="relative aspect-[2/3] rounded-[40px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
          <img
            src="/src/assets/images/test.jpg"
            alt={data.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="flex-1 pt-4">
        <h1 className="text-7xl font-black text-gray-900 mb-12 tracking-tighter">
          {data.title}
        </h1>

        <div className="w-full max-w-2xl">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] whitespace-nowrap">
              Classification Index
            </span>
            <div className="h-[1px] flex-1 bg-slate-100" />
          </div>

          <div className="flex flex-wrap gap-3">
            {data.genres.map((genre) => (
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
