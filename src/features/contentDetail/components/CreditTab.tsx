import { useContentCredits } from "@features/contentDetail/hooks/useContentDetail.ts";

interface CreditTabProps {
  contentId: number;
  seasonNo?: number | null;
  isContentLoading?: boolean;
  isSeasonLoading?: boolean;
}

export const CreditTab = ({
  contentId,
  seasonNo,
  isContentLoading,
  isSeasonLoading,
}: CreditTabProps) => {
  const { data: credits, isLoading } = useContentCredits(contentId, seasonNo);

  if (isContentLoading || isSeasonLoading) {
    return (
      <div className="py-20 text-center text-gray-400">불러오는 중...</div>
    );
  }

  if (seasonNo === null) {
    return (
      <div className="py-20 text-center text-gray-400">
        시즌을 선택하세요.
      </div>
    );
  }

  if (isLoading || !credits) {
    return (
      <div className="py-20 text-center text-gray-400">불러오는 중...</div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
      {credits.map((credit) => (
        <div key={credit.creditId} className="flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full mb-3 overflow-hidden shadow-sm">
            {credit.profileImageUrl ? (
              <img
                src={credit.profileImageUrl}
                alt={credit.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                👤
              </div>
            )}
          </div>

          <span className="font-bold text-gray-900">{credit.name}</span>
          <span className="text-sm text-gray-500">{credit.charName} 역</span>
        </div>
      ))}
    </div>
  );
};
