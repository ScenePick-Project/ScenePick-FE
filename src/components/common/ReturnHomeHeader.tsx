import { BiMoviePlay } from "react-icons/bi";
import { Link } from "react-router-dom";

export default function ReturnHomeHeader() {
  return (
    <>
      <div>
        <Link
          to="/"
          className="flex items-center gap-2 text-4xl font-extrabold text-primary mb-2"
        >
          <BiMoviePlay className="size-10" />
          ScenePick
        </Link>
      </div>
    </>
  );
}
