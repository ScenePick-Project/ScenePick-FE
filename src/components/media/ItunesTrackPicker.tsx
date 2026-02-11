import { useState } from "react";
import Input from "@components/ui/Input.tsx";
import { Button } from "@components/ui/Button.tsx";

export interface ItunesTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
}

interface ItunesTrackPickerProps {
  value: ItunesTrack | null;
  onChange: (track: ItunesTrack | null) => void;
  label?: string;
  placeholder?: string;
  searchLabel?: string;
  country?: string;
  limit?: number;
}

export const ItunesTrackPicker = ({
  value,
  onChange,
  label = "OST 첨부",
  placeholder = "곡 제목 또는 아티스트 검색",
  searchLabel = "검색",
  country = "KR",
  limit = 8,
}: ItunesTrackPickerProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ItunesTrack[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  /**
   * iTunes Search API를 호출해 검색 결과를 갱신한다.
   */
  const handleSearchItunes = async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      setError("곡 제목을 입력해주세요.");
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(
          trimmed,
        )}&media=music&entity=song&limit=${limit}&country=${country}`,
      );
      if (!response.ok) throw new Error("iTunes 검색 실패");

      const data = (await response.json()) as { results?: ItunesTrack[] };
      const nextResults = data.results ?? [];
      setResults(nextResults);
      if (nextResults.length === 0) {
        setError("검색 결과가 없습니다.");
      }
    } catch (error) {
      console.error(error);
      setError("iTunes 검색에 실패했습니다. 네트워크 환경을 확인해주세요.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectTrack = (track: ItunesTrack) => {
    onChange(track);
    setResults([]);
    setError(null);
  };

  const handleRemoveTrack = () => {
    onChange(null);
  };

  return (
    <div>
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <div className="mt-3 flex gap-3">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
        />
        <Button
          type="button"
          variant="secondary"
          className="shrink-0 px-5"
          onClick={handleSearchItunes}
          disabled={isSearching}
        >
          {isSearching ? "검색 중" : searchLabel}
        </Button>
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

      {value && (
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-center gap-3">
            {value.artworkUrl100 && (
              <img
                src={value.artworkUrl100}
                alt={value.trackName}
                className="w-12 h-12 rounded-xl object-cover"
              />
            )}
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {value.trackName}
              </p>
              <p className="text-xs text-gray-500">
                {value.artistName}
                {value.collectionName ? ` · ${value.collectionName}` : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemoveTrack}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            제거
          </button>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-4 max-h-56 overflow-y-auto rounded-2xl border border-gray-100 divide-y divide-gray-100">
          {results.map((track) => (
            <div
              key={track.trackId}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                {track.artworkUrl100 && (
                  <img
                    src={track.artworkUrl100}
                    alt={track.trackName}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {track.trackName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {track.artistName}
                    {track.collectionName ? ` · ${track.collectionName}` : ""}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleSelectTrack(track)}
              >
                선택
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
