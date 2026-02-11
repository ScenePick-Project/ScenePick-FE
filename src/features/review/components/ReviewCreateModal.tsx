import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import type { ObjectSchema } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "@components/ui/Button.tsx";
import { Modal } from "@components/ui/Modal.tsx";
import { YoutubeClipSection } from "@components/media/YoutubeClipSection.tsx";
import {
  ItunesTrackPicker,
  type ItunesTrack,
} from "@components/media/ItunesTrackPicker.tsx";
import type { ReviewCreateDto } from "@features/review/types/reviewTypes.ts";
import { useCreateReview } from "@features/review/hooks/useReview.ts";
import { parseTimeToSeconds, parseYoutubeUrl } from "@shared/media/youtube.ts";

interface ReviewCreateModalProps {
  open: boolean;
  onClose: () => void;
  contentId: number;
  contentTitle?: string;
}

interface ReviewFormValues {
  reviewBody: string;
  isSpoiler: boolean;
  youtubeUrl: string;
  startTime: string;
  endTime: string;
}

const schema: ObjectSchema<ReviewFormValues> = yup.object().shape({
  reviewBody: yup
    .string()
    .required("리뷰 내용을 입력해주세요.")
    .min(10, "최소 10자 이상 작성해주세요."),
  isSpoiler: yup.boolean().required(),
  youtubeUrl: yup
    .string()
    .transform((value) => value?.trim() ?? "")
    .default("")
    .defined()
    .test("youtube-url", "유튜브 링크를 확인해주세요.", (value) => {
      if (!value) return true;
      const { youtubeId } = parseYoutubeUrl(value);
      return !!youtubeId;
    }),
  startTime: yup
    .string()
    .transform((value) => value?.trim() ?? "")
    .default("")
    .defined()
    .test("time-format", "시간 형식이 올바르지 않습니다.", (value) => {
      if (!value) return true;
      return parseTimeToSeconds(value) !== null;
    }),
  endTime: yup
    .string()
    .transform((value) => value?.trim() ?? "")
    .default("")
    .defined()
    .test("time-format", "시간 형식이 올바르지 않습니다.", (value) => {
      if (!value) return true;
      return parseTimeToSeconds(value) !== null;
    }),
});

export const ReviewCreateModal = ({
  open,
  onClose,
  contentId,
  contentTitle,
}: ReviewCreateModalProps) => {
  const [selectedTrack, setSelectedTrack] = useState<ItunesTrack | null>(null);
  const [mediaResetKey, setMediaResetKey] = useState(0);

  const form = useForm<ReviewFormValues>({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: {
      reviewBody: "",
      isSpoiler: false,
      youtubeUrl: "",
      startTime: "",
      endTime: "",
    },
  });

  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const reviewBody = watch("reviewBody") ?? "";
  const { mutateAsync, isPending } = useCreateReview(contentId);
  const isSaving = isSubmitting || isPending;
  /**
   * 폼과 선택 상태를 초기화한다.
   */
  const resetForm = () => {
    reset();
    setSelectedTrack(null);
    setMediaResetKey((key) => key + 1);
  };
  /**
   * 모달을 닫고 상태를 초기화한다.
   */
  const handleClose = () => {
    resetForm();
    onClose();
  };
  /**
   * 리뷰 작성 요청을 전송한다.
   * @param values 폼 값
   */
  const onSubmit = async (values: ReviewFormValues) => {
    const { youtubeUrl, startTime, endTime } = values;
    const youtubeInfo = youtubeUrl.trim()
      ? parseYoutubeUrl(youtubeUrl)
      : { youtubeId: null, startTime: null, endTime: null };

    if (youtubeUrl.trim() && !youtubeInfo.youtubeId) {
      setError("youtubeUrl", {
        type: "manual",
        message: "유효한 유튜브 영상 링크를 입력해주세요.",
      });
      return;
    }

    const startSeconds = parseTimeToSeconds(startTime);
    const endSeconds = parseTimeToSeconds(endTime);

    if (
      startSeconds !== null &&
      endSeconds !== null &&
      endSeconds < startSeconds
    ) {
      setError("endTime", {
        type: "manual",
        message: "종료 시간은 시작 시간 이후여야 합니다.",
      });
      return;
    }

    const payload: ReviewCreateDto = {
      reviewBody: values.reviewBody.trim(),
      isSpoiler: values.isSpoiler,
    };

    if (selectedTrack?.trackId) payload.trackId = String(selectedTrack.trackId);
    if (youtubeInfo.youtubeId) payload.youtubeId = youtubeInfo.youtubeId;
    if (startSeconds !== null) payload.startTime = startSeconds;
    if (endSeconds !== null) payload.endTime = endSeconds;

    try {
      await mutateAsync(payload);
      alert("리뷰가 등록되었습니다.");
      handleClose();
    } catch (error) {
      console.error(error);
      alert("리뷰 등록에 실패했습니다.");
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">리뷰 작성</h2>
          {contentTitle && (
            <p className="text-sm text-gray-400 mt-1">{contentTitle}</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          aria-label="닫기"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-6 space-y-6">
        <div>
          <label className="text-sm font-semibold text-gray-700">
            리뷰 본문
          </label>
          <div className="mt-3">
            <textarea
              {...register("reviewBody")}
              rows={6}
              placeholder="작품에 대한 감상이나 분석을 남겨주세요. (최소 10자)"
              className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all ${
                errors.reviewBody
                  ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  : "border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary-100"
              }`}
            />
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>{errors.reviewBody?.message}</span>
              <span>{reviewBody.length}자</span>
            </div>
          </div>
        </div>

        <YoutubeClipSection key={`youtube-${mediaResetKey}`} form={form} />

        <ItunesTrackPicker
          key={`itunes-${mediaResetKey}`}
          value={selectedTrack}
          onChange={setSelectedTrack}
        />

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" {...register("isSpoiler")} />
          스포일러가 포함되어 있습니다.
        </label>

        <Button
          type="submit"
          size="lg"
          className="w-full rounded-full"
          disabled={isSaving}
        >
          {isSaving ? "등록 중..." : "리뷰 등록하기"}
        </Button>
      </form>
    </Modal>
  );
};
