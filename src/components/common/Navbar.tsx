import { Link } from "react-router-dom";
import { Button } from "../ui/Button.tsx";
import { Logo } from "@components/common/Logo.tsx";

export default function Navbar() {
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
          </nav>
        </div>

        <nav className="flex gap-4 items-center">
          {/*<Button asChild>*/}
          {/*  <Link to={"/login"}>로그인</Link>*/}
          {/*</Button>*/}
          <Button variant={"ghost"} asChild>
            <Link to={"/login"}>로그인 / 회원가입</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
