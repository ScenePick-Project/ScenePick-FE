import { Link } from "react-router-dom";
import { useState } from "react";
import type { HomeContent } from "@features/home/types/homeTypes.ts";

export default function PosterCard({ content }: { content: HomeContent }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const failed =
    !content.posterImageUrl?.trim() || failedUrl === content.posterImageUrl;
  return (
    <Link
      to={`/content/${content.contentId}`}
      aria-label={`${content.title} 상세 보기`}
      className="block rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    >
      <div className="aspect-[2/3] overflow-hidden rounded-lg bg-gray-100">
        {failed ? (
          <div
            role="img"
            aria-label={`${content.title} 포스터 없음`}
            className="flex h-full items-center justify-center p-4 text-center text-sm text-gray-500"
          >
            포스터를 불러올 수 없어요
          </div>
        ) : (
          <img
            src={content.posterImageUrl}
            alt={`${content.title} 포스터`}
            className="h-full w-full object-cover"
            onError={() => setFailedUrl(content.posterImageUrl)}
          />
        )}
      </div>
      <p
        title={content.title}
        className="mt-3 truncate font-semibold text-gray-900"
      >
        {content.title}
      </p>
    </Link>
  );
}
