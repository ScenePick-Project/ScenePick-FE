import { useState } from "react";
import { Button } from "@components/ui/Button.tsx";
import { ReviewCreateModal } from "@features/review/components/ReviewCreateModal.tsx";

interface ReviewTabProps {
  contentId: number;
  contentTitle?: string;
}

export const ReviewTab = ({ contentId, contentTitle }: ReviewTabProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">리뷰</h3>
          <p className="text-sm text-gray-500 mt-1">
            작품에 대한 감상과 클립을 공유해보세요.
          </p>
        </div>
        <Button size="lg" onClick={() => setIsModalOpen(true)}>
          리뷰 작성
        </Button>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-10 text-center text-gray-400">
        리뷰가 아직 없습니다.
      </div>

      <ReviewCreateModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contentId={contentId}
        contentTitle={contentTitle}
      />
    </div>
  );
};
