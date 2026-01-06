import { Link } from "react-router-dom";
import { Button } from "../ui/Button.tsx";
import { BiMoviePlay } from "react-icons/bi";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-white border-b border-gray-200 z-50 flex items-center px-4">
      <div className="flex items-center justify-between w-full max-w-screen-xl mx-auto">
        <h1 className="flex gap-4 items-center">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-extrabold text-primary"
          >
            <BiMoviePlay className="size-6" />
            ScenePick
          </Link>
          <Link to="/movie" className="hover:text-primary font-bold">
            영화
          </Link>
          <Link to="/drama" className="hover:text-primary font-bold">
            드라마
          </Link>
          <Link to="/ost" className="hover:text-primary font-bold">
            OST
          </Link>
        </h1>

        <nav className="flex gap-4 items-center">
          <Button asChild>
            <Link to={"/login"}>로그인</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
