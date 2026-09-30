import { Button } from "@components/ui/Button.tsx";
import { useHomeRecommendations } from "@features/home/hooks/useHomeRecommendations.ts";
import PosterCard from "@features/home/components/PosterCard.tsx";

export default function RecommendationSection() {
  const recommendations = useHomeRecommendations();
  let content;

  if (recommendations.isError) {
    content = (
      <div role="alert">
        <p>추천 작품을 불러오지 못했어요</p>
        <Button
          type="button"
          className="mt-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          disabled={recommendations.isFetching}
          onClick={() => void recommendations.refetch()}
        >
          {recommendations.isFetching ? "다시 확인하는 중…" : "다시 시도"}
        </Button>
      </div>
    );
  } else if (recommendations.isPending) {
    content = <p role="status">추천 작품을 불러오는 중이에요</p>;
  } else if (recommendations.data.contentList.length === 0) {
    content = <p role="status">아직 표시할 작품이 없어요</p>;
  } else {
    content = (
      <ul
        aria-label="추천 작품 목록"
        className="flex gap-4 overflow-x-auto p-1 pb-4"
      >
        {recommendations.data.contentList.map((item) => (
          <li key={item.contentId} className="w-36 shrink-0 sm:w-44 lg:w-48">
            <PosterCard content={item} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section aria-labelledby="recommendations-title" className="min-w-0 py-8">
      <h1 id="recommendations-title" className="text-2xl font-bold">
        추천 작품
      </h1>
      <p className="mt-2 text-gray-600">다양한 작품을 랜덤으로 만나보세요</p>
      <div className="mt-6">{content}</div>
    </section>
  );
}
