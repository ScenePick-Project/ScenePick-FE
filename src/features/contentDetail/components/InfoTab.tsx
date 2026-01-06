import { useContentBasic } from "@features/contentDetail/hooks/useContentDetail.ts";

interface InfoTabProps {
  contentId: number;
}

export const InfoTab = ({ contentId }: InfoTabProps) => {
  const { data } = useContentBasic(contentId);

  if (!data)
    return <div className="py-10 text-gray-400">정보를 불러오는 중...</div>;

  return (
    <div className="space-y-8">
      <section>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {data.synopsis || "등록된 줄거리가 없습니다."}
        </p>
      </section>
    </div>
  );
};
