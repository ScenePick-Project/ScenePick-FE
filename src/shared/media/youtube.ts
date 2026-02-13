export interface YoutubeParseResult {
  youtubeId: string | null;
  startTime: number | null;
  endTime: number | null;
}

export const parseTimeToSeconds = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(":");
  if (parts.length === 2 || parts.length === 3) {
    const nums = parts.map((part) => Number(part));
    if (nums.some((num) => Number.isNaN(num))) return null;
    if (parts.length === 2) {
      const [minutes, seconds] = nums;
      if (seconds < 0 || seconds >= 60 || minutes < 0) return null;
      return minutes * 60 + seconds;
    }
    const [hours, minutes, seconds] = nums;
    if (
      seconds < 0 ||
      seconds >= 60 ||
      minutes < 0 ||
      minutes >= 60 ||
      hours < 0
    ) {
      return null;
    }
    return hours * 3600 + minutes * 60 + seconds;
  }

  return null;
};

export const parseYoutubeUrl = (value: string): YoutubeParseResult => {
  const trimmed = value.trim();
  if (!trimmed) {
    return { youtubeId: null, startTime: null, endTime: null };
  }

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return { youtubeId: trimmed, startTime: null, endTime: null };
  }

  try {
    const normalized = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const url = new URL(normalized);
    const host = url.hostname.replace("www.", "");
    let youtubeId: string | null = null;

    if (host === "youtu.be") {
      youtubeId = url.pathname.split("/")[1] ?? null;
    } else if (host.includes("youtube.com")) {
      if (url.pathname === "/watch") {
        youtubeId = url.searchParams.get("v");
      } else if (url.pathname.startsWith("/embed/")) {
        youtubeId = url.pathname.split("/")[2] ?? null;
      } else if (url.pathname.startsWith("/shorts/")) {
        youtubeId = url.pathname.split("/")[2] ?? null;
      }
    }

    return { youtubeId, startTime: null, endTime: null };
  } catch {
    return { youtubeId: null, startTime: null, endTime: null };
  }
};
