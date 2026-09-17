import {
  parseTimeToSeconds,
  parseYoutubeUrl,
} from "../../../shared/media/youtube";
import type { Moment, MomentInput, MomentUpdate } from "../types/momentTypes";

export const parseMomentVideo = (value: string) => {
  const input = value.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(input)) return input;
  try {
    const url = new URL(
      /^https?:\/\//i.test(input) ? input : "https://" + input,
    );
    if (!["http:", "https:"].includes(url.protocol)) return null;
    if (
      !["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"].includes(
        url.hostname,
      )
    )
      return null;
    const id = parseYoutubeUrl(url.toString()).youtubeId;
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
};

export const parseMomentTime = (value: string) => {
  if (!/^[0-9]+:[0-9]{2}(:[0-9]{2})?$/.test(value.trim())) return null;
  const seconds = parseTimeToSeconds(value);
  return seconds != null &&
    Number.isInteger(seconds) &&
    seconds >= 0 &&
    seconds <= 2147483647
    ? seconds
    : null;
};

export const getMomentPatch = (
  original: Moment,
  input: MomentInput,
): MomentUpdate => ({
  ...(input.startTime !== original.startTime
    ? { startTime: input.startTime }
    : {}),
  ...(input.endTime !== original.endTime ? { endTime: input.endTime } : {}),
  ...(input.memo !== original.memo ? { memo: input.memo } : {}),
});
