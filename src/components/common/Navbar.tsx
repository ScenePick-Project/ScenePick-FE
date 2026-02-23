import { Link } from "react-router-dom";
import { Button } from "../ui/Button.tsx";
import { Logo } from "@components/common/Logo.tsx";
import { useEffect, useState } from "react";
import type { UserAuthResponseDto } from "@features/user/types/userType.ts";
import { checkLogin } from "@features/user/api/userApi.ts";

export default function Navbar() {
  const [userAuth, setUserAuth] = useState<UserAuthResponseDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    // 토큰이 아예 없는 경우 API 호출도 하지 않고 바로 null 처리
    if (!token) {
      setUserAuth(null);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await checkLogin();
        setUserAuth(data);
      } catch {
        setUserAuth(null);
        localStorage.removeItem("accessToken"); // 유효하지 않은 토큰 삭제
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const isAuthed = !!userAuth;
  const isAdmin = userAuth?.role === "ROLE_ADMIN";

  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-white border-b border-gray-200 z-50 flex items-center px-4">
      <div className="flex items-center justify-between w-full max-w-screen-xl mx-auto">
        <div className="flex items-center gap-8">
          {" "}
          {/* 로고와 메뉴 사이 간격 조절 */}
          <Link to="/" className="flex items-center">
            <Logo />
          </Link>
          <nav className="flex gap-6 items-center">
            <Link
              to="/movie"
              className="text-gray-600 hover:text-blue-600 font-semibold transition-colors"
            >
              영화
            </Link>
            <Link
              to="/drama"
              className="text-gray-600 hover:text-blue-600 font-semibold transition-colors"
            >
              드라마
            </Link>
            <Link
              to="/ost"
              className="text-gray-600 hover:text-blue-600 font-semibold transition-colors"
            >
              OST
            </Link>
            {/* ADMIN일 때만 관리자 메뉴 노출 */}
            {isAdmin && (
              <Link
                to="/admin"
                className="text-gray-600 hover:text-blue-600 font-semibold transition-colors"
              >
                관리자
              </Link>
            )}
          </nav>
        </div>

        <nav className="flex gap-4 items-center">
          {loading ? null : isAuthed ? (
            <Link to="/mypage" className="flex items-center">
              <img
                src={""}
                alt={"profile"}
                className="w-9 h-9 rounded-full border border-gray-200 object-cover"
              />
            </Link>
          ) : (
            <Button variant={"ghost"} asChild>
              <Link to={"/login"}>로그인 / 회원가입</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
