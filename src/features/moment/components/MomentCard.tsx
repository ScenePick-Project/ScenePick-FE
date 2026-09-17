import { useState } from "react";
import { FiPlay, FiEdit2, FiTrash2 } from "react-icons/fi";
import {
  formatReviewClipRange,
  formatReviewDate,
  getYoutubeThumbnailUrl,
} from "@features/review/utils/reviewFormat.ts";
import type { Moment } from "../types/momentTypes.ts";

interface Props {
  moment: Moment;
  selected: boolean;
  disabled: boolean;
  onPlay: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const MomentCard = ({
  moment,
  selected,
  disabled,
  onPlay,
  onEdit,
  onDelete,
}: Props) => {
  const [imageFailed, setImageFailed] = useState(false);
  const range = formatReviewClipRange(moment.startTime, moment.endTime);
  return (
    <article
      className={
        "overflow-hidden rounded-2xl border bg-white " +
        (selected
          ? "border-violet-400 ring-2 ring-violet-100"
          : "border-slate-200")
      }
    >
      <button
        type="button"
        onClick={onPlay}
        disabled={disabled}
        aria-label={range + " 장면 재생"}
        className="group relative block aspect-video w-full overflow-hidden bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-violet-500 disabled:opacity-50"
      >
        {imageFailed ? (
          <span className="text-sm text-slate-400">
            썸네일을 불러올 수 없어요
          </span>
        ) : (
          <img
            src={getYoutubeThumbnailUrl(moment.youtubeId) ?? undefined}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            onError={() => setImageFailed(true)}
          />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/10">
          <span className="rounded-full bg-white/95 p-4 text-violet-600 shadow-md">
            <FiPlay aria-hidden="true" size={22} />
          </span>
        </span>
      </button>
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-violet-50 px-2 py-1 text-xs font-bold text-violet-600">
            {range}
          </span>
          <time dateTime={moment.createdAt} className="text-xs text-slate-400">
            {formatReviewDate(moment.createdAt)}
          </time>
        </div>
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-600">
          {moment.memo || "메모 없이 저장한 장면이에요."}
        </p>
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-[10px] font-bold tracking-widest text-slate-400">
            MY MOMENT
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={onEdit}
              disabled={disabled}
              className="flex items-center gap-1 rounded-lg p-2 text-xs text-slate-500 hover:bg-violet-50 focus-visible:ring-2 focus-visible:ring-violet-500 disabled:opacity-50"
            >
              <FiEdit2 aria-hidden="true" /> 편집
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={disabled}
              className="flex items-center gap-1 rounded-lg p-2 text-xs text-slate-500 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-violet-500 disabled:opacity-50"
            >
              <FiTrash2 aria-hidden="true" /> 삭제
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
