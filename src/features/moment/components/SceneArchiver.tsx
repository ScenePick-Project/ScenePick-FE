import { useForm } from "react-hook-form";
import { FiBookmark } from "react-icons/fi";
import Input from "@components/ui/Input.tsx";
import { Button } from "@components/ui/Button.tsx";
import { formatReviewSeconds } from "@features/review/utils/reviewFormat.ts";
import { getMomentError } from "../api/momentApi.ts";
import { parseMomentTime } from "../utils/momentInput.ts";
import type { Moment, MomentInput } from "../types/momentTypes.ts";

interface Props {
  youtubeId: string | null;
  editing: Moment | null;
  disabled: boolean;
  onSave: (input: MomentInput) => Promise<void>;
  onCancel: () => void;
  onError: (error: unknown) => void;
}

export const SceneArchiver = ({
  youtubeId,
  editing,
  disabled,
  onSave,
  onCancel,
  onError,
}: Props) => {
  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<{ startTime: string; endTime: string; memo: string }>({
    defaultValues: {
      startTime: formatReviewSeconds(editing?.startTime ?? 0) ?? "0:00",
      endTime: formatReviewSeconds(editing?.endTime ?? 5) ?? "0:05",
      memo: editing?.memo ?? "",
    },
  });

  const submit = handleSubmit(async (values) => {
    if (!youtubeId || disabled || isSubmitting) return;
    const startTime = parseMomentTime(values.startTime);
    const endTime = parseMomentTime(values.endTime);
    if (startTime == null || endTime == null || startTime >= endTime) return;
    try {
      await onSave({
        youtubeId,
        startTime,
        endTime,
        memo: values.memo || null,
      });
    } catch (error) {
      onError(error);
      setError("root", { message: getMomentError(error) });
    }
  });

  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
      <div className="mb-6 flex items-center gap-3">
        <span className="rounded-xl bg-violet-50 p-3 text-violet-600">
          <FiBookmark aria-hidden="true" size={22} />
        </span>
        <div>
          <h2 className="font-extrabold text-slate-900">Scene Archiver</h2>
          <p className="mt-1 text-xs text-slate-500">
            {editing ? "저장한 장면 편집" : "다시 보고 싶은 순간을 간직하세요"}
          </p>
        </div>
      </div>
      <form onSubmit={submit} noValidate>
        <fieldset
          disabled={disabled || isSubmitting || !youtubeId}
          className="space-y-5 disabled:opacity-60"
        >
          <legend className="sr-only">장면의 시간 구간과 개인 메모</legend>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="moment-start"
                className="text-xs font-bold text-slate-700"
              >
                Start Time · 시작
              </label>
              <Input
                id="moment-start"
                className="mt-2"
                placeholder="0:12"
                aria-invalid={!!errors.startTime}
                aria-describedby="moment-start-error"
                {...register("startTime", {
                  validate: (value) =>
                    parseMomentTime(value) != null ||
                    "0:12 또는 1:00:12 형식으로 입력해주세요.",
                })}
              />
              <p id="moment-start-error" className="mt-1 text-xs text-red-600">
                {errors.startTime?.message}
              </p>
            </div>
            <div>
              <label
                htmlFor="moment-end"
                className="text-xs font-bold text-slate-700"
              >
                End Time · 종료
              </label>
              <Input
                id="moment-end"
                className="mt-2"
                placeholder="0:18"
                aria-invalid={!!errors.endTime}
                aria-describedby="moment-end-error"
                {...register("endTime", {
                  validate: (value) => {
                    const end = parseMomentTime(value);
                    if (end == null)
                      return "0:18 또는 1:00:18 형식으로 입력해주세요.";
                    const start = parseMomentTime(getValues("startTime"));
                    return (
                      start == null ||
                      end > start ||
                      "종료는 시작보다 늦어야 합니다."
                    );
                  },
                })}
              />
              <p id="moment-end-error" className="mt-1 text-xs text-red-600">
                {errors.endTime?.message}
              </p>
            </div>
          </div>
          <div>
            <label
              htmlFor="moment-memo"
              className="text-xs font-bold text-slate-700"
            >
              Scene Memo · 메모{" "}
              <span className="font-normal text-slate-400">(선택)</span>
            </label>
            <textarea
              id="moment-memo"
              rows={5}
              {...register("memo")}
              placeholder="이 장면을 기억하고 싶은 이유는 무엇인가요?"
              className="mt-2 block w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-relaxed outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
            <p className="mt-2 text-xs text-slate-500">
              메모는 나에게만 보여요.
            </p>
          </div>
          <Button
            type="submit"
            className="w-full bg-violet-600 text-white hover:bg-violet-700"
          >
            {isSubmitting
              ? "저장 중..."
              : editing
                ? "변경 저장"
                : "+ ARCHIVE SCENE"}
          </Button>
          {editing && (
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={onCancel}
            >
              편집 취소
            </Button>
          )}
        </fieldset>
        {!youtubeId && (
          <p className="mt-4 text-sm text-slate-500">
            먼저 유튜브 영상을 불러와주세요.
          </p>
        )}
        {errors.root && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            {errors.root.message}
          </p>
        )}
      </form>
    </aside>
  );
};
