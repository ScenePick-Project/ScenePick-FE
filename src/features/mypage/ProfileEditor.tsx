import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@components/ui/Button.tsx";
import { updateProfile, type Profile } from "./mypageApi.ts";

export function ProfileEditor({
  profile,
  onClose,
}: {
  profile: Profile;
  onClose: () => void;
}) {
  const [nickname, setNickname] = useState(profile.nickname);
  const [bio, setBio] = useState(profile.bio ?? "");
  const client = useQueryClient();
  const form = useRef<HTMLFormElement>(null);
  const save = useMutation({
    mutationFn: updateProfile,
    retry: false,
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: ["mypage", profile.userId, "profile"],
      });
      onClose();
    },
  });
  useEffect(() => {
    const previous = document.activeElement;
    form.current?.querySelector("input")?.focus();
    return () => {
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);
  return (
    <form
      ref={form}
      aria-label="프로필 설정"
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const elements = Array.from(
          form.current!.querySelectorAll<HTMLElement>(
            "input, textarea, button:not(:disabled)",
          ),
        );
        const first = elements[0],
          last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }}
      onSubmit={(event) => {
        event.preventDefault();
        if (!save.isPending && nickname.trim())
          save.mutate({ nickname: nickname.trim(), bio: bio || null });
      }}
    >
      <h2 className="mb-6 text-xl font-bold">프로필 설정</h2>
      <label className="block text-sm font-semibold" htmlFor="profile-nickname">
        닉네임
      </label>
      <input
        id="profile-nickname"
        value={nickname}
        maxLength={30}
        required
        onChange={(e) => setNickname(e.target.value)}
        className="mt-2 w-full rounded-lg border p-3"
      />
      <label className="mt-5 block text-sm font-semibold" htmlFor="profile-bio">
        자기소개
      </label>
      <textarea
        id="profile-bio"
        value={bio}
        maxLength={500}
        rows={4}
        onChange={(e) => setBio(e.target.value)}
        className="mt-2 w-full resize-y rounded-lg border p-3"
      />
      <p className="mt-1 text-right text-xs text-slate-500">{bio.length}/500</p>
      {save.isError && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          저장하지 못했습니다. 입력 내용을 확인하고 다시 시도해주세요.
        </p>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onClose}>
          취소
        </Button>
        <Button type="submit" disabled={save.isPending || !nickname.trim()}>
          {save.isPending ? "저장 중..." : "저장"}
        </Button>
      </div>
    </form>
  );
}
