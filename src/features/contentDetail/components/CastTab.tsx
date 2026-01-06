import { useContentCast } from "@features/contentDetail/hooks/useContentDetail.ts";

interface CastTabProps {
  contentId: number;
}

export const CastTab = ({ contentId }: CastTabProps) => {
  const { data: casts } = useContentCast(contentId);

  if (!casts) {
    return (
      <div className="py-20 text-center text-gray-400">불러오는 중...</div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
      {casts.map((person) => (
        <div key={person.personId} className="flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full mb-3 overflow-hidden shadow-sm">
            {person.profileImageUrl ? (
              <img
                src={person.profileImageUrl}
                alt={person.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                👤
              </div>
            )}
          </div>

          <span className="font-bold text-gray-900">{person.name}</span>
          <span className="text-sm text-gray-500">{person.charName} 역</span>
        </div>
      ))}
    </div>
  );
};
