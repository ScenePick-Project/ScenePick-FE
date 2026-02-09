import type { SeasonDto } from "@features/contentDetail/types/contentDetailTypes.ts";
import {
  getSeasonDisplayName,
  getSeasonLabel,
} from "@features/contentDetail/utils/seasonUtils.ts";

type SeasonSelectorVariant = "header" | "sidebar";

interface SeasonSelectorProps {
  seasons: SeasonDto[];
  selectedSeasonNo: number | null;
  onSeasonChange: (seasonNo: number) => void;
  contentTitle?: string;
  variant?: SeasonSelectorVariant;
}

const VARIANT_CLASSES: Record<SeasonSelectorVariant, string> = {
  header: "flex flex-wrap gap-3",
  sidebar:
    "flex gap-3 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible",
};

export const SeasonSelector = ({
  seasons,
  selectedSeasonNo,
  onSeasonChange,
  contentTitle,
  variant = "header",
}: SeasonSelectorProps) => {
  return (
    <div className={VARIANT_CLASSES[variant]}>
      {seasons.map((season) => {
        const isActive = season.seasonNo === selectedSeasonNo;
        const label = getSeasonLabel(season.seasonNo);
        const subtitle = getSeasonDisplayName(season, contentTitle);

        return (
          <button
            key={season.seasonId}
            type="button"
            onClick={() => onSeasonChange(season.seasonNo)}
            className={`min-w-[160px] text-left px-4 py-3 rounded-2xl border transition ${
              isActive
                ? "border-slate-900 bg-slate-900 text-white shadow-[0_12px_30px_rgba(15,23,42,0.2)]"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <div className="text-sm font-black">{label}</div>
            {subtitle && (
              <div
                className={`text-[11px] mt-1 ${
                  isActive ? "text-slate-200" : "text-slate-500"
                }`}
              >
                {subtitle}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
