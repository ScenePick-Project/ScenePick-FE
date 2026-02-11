import { useMemo, useState } from "react";
import type { FieldPathByValue, UseFormReturn } from "react-hook-form";
import Input from "@components/ui/Input.tsx";
import { Button } from "@components/ui/Button.tsx";
import {
  parseYoutubeUrl,
  type YoutubeParseResult,
} from "@shared/media/youtube.ts";

type YoutubeClipFieldValues = {
  youtubeUrl: string;
  startTime: string;
  endTime: string;
};

interface YoutubeClipSectionProps<TFieldValues extends YoutubeClipFieldValues> {
  form: UseFormReturn<TFieldValues>;
  label?: string;
  placeholder?: string;
  applyLabel?: string;
}

export const YoutubeClipSection = <
  TFieldValues extends YoutubeClipFieldValues,
>({
  form,
  label = "유튜브 클립 링크",
  placeholder = "https://youtu.be/영상ID?t=1m20s",
  applyLabel = "불러오기",
}: YoutubeClipSectionProps<TFieldValues>) => {
  type StringFieldPath = FieldPathByValue<TFieldValues, string>;

  const youtubeUrlField = "youtubeUrl" as StringFieldPath;
  const startTimeField = "startTime" as StringFieldPath;
  const endTimeField = "endTime" as StringFieldPath;
  const {
    register,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = form;
  const [youtubeMeta, setYoutubeMeta] = useState<YoutubeParseResult | null>(
    null,
  );

  /**
   * 입력한 유튜브 URL을 검증하고 유효하면 유튜브 영상 ID와 썸네일을 갱신한다.
   */
  const handleYoutubeApply = () => {
    const url = (watch(youtubeUrlField) ?? "").trim();
    if (!url) {
      setError(youtubeUrlField, {
        type: "manual",
        message: "유튜브 링크를 입력해주세요.",
      });
      return;
    }

    const parsed = parseYoutubeUrl(url);
    if (!parsed.youtubeId) {
      setError(youtubeUrlField, {
        type: "manual",
        message: "유효한 유튜브 영상 링크를 입력해주세요.",
      });
      return;
    }

    clearErrors(youtubeUrlField);
    setYoutubeMeta(parsed);
  };

  const youtubePreview = useMemo(() => {
    if (!youtubeMeta?.youtubeId) return null;
    return `https://img.youtube.com/vi/${youtubeMeta.youtubeId}/mqdefault.jpg`;
  }, [youtubeMeta]);

  const youtubeError = errors.youtubeUrl as { message?: string } | undefined;
  const startTimeError = errors.startTime as { message?: string } | undefined;
  const endTimeError = errors.endTime as { message?: string } | undefined;

  return (
    <div>
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <div className="mt-3 flex gap-3">
        <Input
          {...register(youtubeUrlField, {
            onChange: () => {
              if (youtubeMeta) setYoutubeMeta(null);
            },
          })}
          placeholder={placeholder}
          isError={!!youtubeError}
          errorMessage={youtubeError?.message}
        />
        <Button
          type="button"
          variant="secondary"
          className="shrink-0 px-5"
          onClick={handleYoutubeApply}
        >
          {applyLabel}
        </Button>
      </div>
      {youtubeMeta?.youtubeId && (
        <div className="mt-3 flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-3">
          {youtubePreview && (
            <img
              src={youtubePreview}
              alt="youtube thumbnail"
              className="w-20 h-12 rounded-lg object-cover"
            />
          )}
          <div className="text-sm text-gray-600">
            연결된 영상 ID:{" "}
            <span className="font-semibold">{youtubeMeta.youtubeId}</span>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-gray-700">
            클립 시작 시간
          </label>
          <div className="mt-3">
            <Input
              {...register(startTimeField)}
              placeholder="예) 01:20"
              isError={!!startTimeError}
              errorMessage={startTimeError?.message}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700">
            클립 종료 시간
          </label>
          <div className="mt-3">
            <Input
              {...register(endTimeField)}
              placeholder="예) 02:05"
              isError={!!endTimeError}
              errorMessage={endTimeError?.message}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
