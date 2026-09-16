import axios from "axios";
import { Link } from "react-router-dom";
import { Button } from "@components/ui/Button.tsx";
import { useCurrentUser } from "@features/user/hooks/useUser.ts";
import { useHomeRecommendations } from "@features/home/hooks/useHomeRecommendations.ts";
import PosterCard from "@features/home/components/PosterCard.tsx";

export default function RecommendationSection() {
  const user = useCurrentUser();
  const recommendations = useHomeRecommendations(
    user.isSuccess && !!user.data.userId,
  );
  const unauthorized = (error: unknown) =>
    axios.isAxiosError(error) && error.response?.status === 401;
  let content;

  if (user.isPending) {
    content = <p role="status">로그인 상태를 확인하고 있어요</p>;
  } else if (
    unauthorized(user.error) ||
    (user.isSuccess && !user.data.userId) ||
    unauthorized(recommendations.error)
  ) {
    content = (
      <div>
        <p>로그인하고 추천 작품을 만나보세요</p>
        <Button
          asChild
          className="mt-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <Link to="/login?redirect=%2F">로그인</Link>
        </Button>
      </div>
    );
  } else if (user.isError || recommendations.isError) {
    const failedQuery = user.isError ? user : recommendations;
    content = (
      <div role="alert">
        <p>
          {user.isError
            ? "로그인 상태를 확인하지 못했어요"
            : "추천 작품을 불러오지 못했어요"}
        </p>
        <Button
          type="button"
          className="mt-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          disabled={failedQuery.isFetching}
          onClick={() => void failedQuery.refetch()}
        >
          {failedQuery.isFetching ? "다시 확인하는 중…" : "다시 시도"}
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
