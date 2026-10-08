import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FiEdit2, FiUser } from "react-icons/fi";
import { Modal } from "@components/ui/Modal.tsx";
import { Button } from "@components/ui/Button.tsx";
import { SettingsMenuModal } from "@features/user/components/SettingsMenuModal.tsx";
import { logout } from "@features/user/api/userApi.ts";
import { useCurrentUser } from "@features/user/hooks/useUser.ts";
import { getErrorStatus } from "@features/moment/api/momentApi.ts";
import {
  getProfile,
  getRatings,
  collections,
} from "@features/mypage/mypageApi.ts";
import { ProfileEditor } from "@features/mypage/ProfileEditor.tsx";

export default function MyPage() {
  const user = useCurrentUser();
  const userId = user.data?.userId;
  const client = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [settings, setSettings] = useState(false);
  const [imageFailed, setImageFailed] = useState<string | null>(null);
  const [logoutError, setLogoutError] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const profile = useQuery({
    queryKey: ["mypage", userId, "profile"],
    queryFn: getProfile,
    enabled: !!userId,
    retry: false,
  });
  const ratings = useQuery({
    queryKey: ["mypage", userId, "ratings"],
    queryFn: getRatings,
    enabled: !!userId,
    retry: false,
  });
  const handleLogout = async () => {
    setLoggingOut(true);
    setLogoutError(false);
    try {
      await logout();
      client.clear();
      window.location.href = "/";
    } catch {
      setLogoutError(true);
      setLoggingOut(false);
    }
  };
  if (
    [user.error, profile.error, ratings.error].some(
      (e) => getErrorStatus(e) === 401,
    )
  )
    return <Navigate replace to="/login?redirect=%2Fmypage" />;
  const data = profile.data;
  return (
    <div className="mx-auto min-h-[70vh] max-w-5xl bg-white px-4 py-8 sm:px-8 sm:py-12">
      <h1 className="sr-only">마이페이지</h1>
      {user.isError && (
        <div role="alert">
          <p>로그인 상태를 확인하지 못했습니다.</p>
          <Button onClick={() => void user.refetch()}>다시 확인</Button>
        </div>
      )}
      {(user.isPending || profile.isPending) && !user.isError && (
        <p role="status">프로필을 불러오는 중...</p>
      )}
      {profile.isError && (
        <div role="alert">
          <p>
            {getErrorStatus(profile.error) === 403
              ? "이 계정으로 마이페이지를 이용할 수 없습니다."
              : "프로필을 불러오지 못했습니다."}
          </p>
          <Button onClick={() => void profile.refetch()}>
            프로필 다시 불러오기
          </Button>
        </div>
      )}
      {data && !profile.isError && (
        <section
          aria-label="내 프로필"
          className="relative flex flex-col gap-6 sm:flex-row sm:items-start"
        >
          <div className="relative w-32 shrink-0 sm:w-36">
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-full border bg-slate-100">
              {data.imageUrl && imageFailed !== data.imageUrl ? (
                <img
                  src={data.imageUrl}
                  alt="내 프로필 사진"
                  className="h-full w-full object-cover"
                  onError={() => setImageFailed(data.imageUrl)}
                />
              ) : (
                <FiUser
                  className="h-16 w-16 text-slate-400"
                  aria-label="기본 프로필"
                />
              )}
            </div>
            <button
              type="button"
              aria-label="프로필 수정"
              onClick={() => setEditing(true)}
              className="absolute bottom-0 right-0 rounded-full border bg-white p-2 text-slate-600 shadow-sm focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              <FiEdit2 aria-hidden="true" />
            </button>
          </div>
          <div className="min-w-0 flex-1 sm:pt-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="min-w-0 break-all text-2xl font-bold">
                {data.nickname}
              </h2>
              <Button
                variant="ghost"
                className="absolute right-0 top-0 sm:static"
                onClick={() => setEditing(true)}
              >
                내 계정 관리 ›
              </Button>
            </div>
            <p className="mt-2 flex flex-wrap gap-2 text-sm text-slate-600">
              <Link
                className="rounded hover:text-violet-600 focus-visible:ring-2 focus-visible:ring-violet-500"
                to="/mypage/following"
              >
                팔로잉 {data.followingCount}
              </Link>
              <span aria-hidden="true">|</span>
              <Link
                className="rounded hover:text-violet-600 focus-visible:ring-2 focus-visible:ring-violet-500"
                to="/mypage/followers"
              >
                팔로워 {data.followerCount}
              </Link>
            </p>
            <p className="mt-5 whitespace-pre-wrap break-all text-sm leading-relaxed text-slate-700">
              {data.bio || "아직 자기소개가 없어요."}
            </p>
          </div>
        </section>
      )}
      <section aria-labelledby="storage-heading" className="mt-12">
        <h2 id="storage-heading" className="text-xl font-bold">
          보관함
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(["reviews", "bookmarks", "moments", "album"] as const).map(
            (kind) => (
              <Link
                key={kind}
                to={"/mypage/" + kind}
                className="flex min-h-28 items-center justify-center rounded-xl bg-slate-100 px-3 text-center text-lg font-bold transition-colors hover:bg-violet-100 focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                {collections[kind].title}
              </Link>
            ),
          )}
        </div>
      </section>
      <section aria-labelledby="rating-heading" className="mt-10">
        <h2 id="rating-heading" className="text-xl font-bold">
          별점 통계
        </h2>
        {ratings.isPending && !user.isError && (
          <p role="status" className="py-8">
            별점 통계를 불러오는 중...
          </p>
        )}
        {ratings.isError && (
          <div role="alert" className="py-8">
            <p>별점 통계를 불러오지 못했습니다.</p>
            <Button onClick={() => void ratings.refetch()}>
              통계 다시 불러오기
            </Button>
          </div>
        )}
        {ratings.data && !ratings.isError && (
          <>
            <p className="mt-3 text-sm text-slate-500">
              평가한 리뷰 {ratings.data.totalCount}개
            </p>
            {ratings.data.totalCount === 0 ? (
              <p className="py-12 text-center text-slate-500">
                아직 별점을 남긴 리뷰가 없어요.
              </p>
            ) : (
              <>
                <div
                  role="img"
                  aria-label="별점 분포 그래프. 구간별 개수와 비율은 아래 표에서 확인할 수 있습니다."
                  className="mt-8 flex h-56 items-end gap-1 border-b border-slate-200 sm:gap-3"
                >
                  {ratings.data.buckets.map((bucket) => (
                    <div
                      key={bucket.rating}
                      className="flex h-full min-w-0 flex-1 flex-col justify-end text-center"
                    >
                      <span className="mb-1 text-[10px] text-slate-600 sm:text-xs">
                        {(
                          (bucket.count / ratings.data!.totalCount) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                      <div
                        className="rounded-t-lg bg-blue-400"
                        style={{
                          height:
                            (bucket.count /
                              Math.max(
                                ...ratings.data!.buckets.map((b) => b.count),
                                1,
                              )) *
                              150 +
                            "px",
                        }}
                      />
                      <span className="mt-2 text-xs text-slate-500">
                        {bucket.rating}
                      </span>
                    </div>
                  ))}
                </div>
                <table className="sr-only">
                  <caption>별점별 리뷰 개수와 비율</caption>
                  <thead>
                    <tr>
                      <th>별점</th>
                      <th>리뷰 수</th>
                      <th>비율</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ratings.data.buckets.map((b) => (
                      <tr key={b.rating}>
                        <th>{b.rating}</th>
                        <td>{b.count}</td>
                        <td>
                          {((b.count / ratings.data!.totalCount) * 100).toFixed(
                            1,
                          )}
                          %
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </>
        )}
      </section>
      <div className="mt-10 text-right">
        <Button variant="ghost" onClick={() => setSettings(true)}>
          설정
        </Button>
      </div>
      <Modal
        open={settings}
        onClose={() => {
          if (!loggingOut) setSettings(false);
        }}
        className="max-w-md p-0"
      >
        <SettingsMenuModal
          onClose={() => {
            if (!loggingOut) setSettings(false);
          }}
          onLogout={() => {
            if (!loggingOut) void handleLogout();
          }}
        />
        {loggingOut && (
          <p role="status" className="p-4">
            로그아웃 중...
          </p>
        )}
        {logoutError && (
          <p role="alert" className="p-4 text-red-600">
            로그아웃하지 못했습니다. 다시 시도해주세요.
          </p>
        )}
      </Modal>
      {editing && data && (
        <Modal open onClose={() => setEditing(false)} className="max-w-md p-6">
          <ProfileEditor profile={data} onClose={() => setEditing(false)} />
        </Modal>
      )}
    </div>
  );
}
