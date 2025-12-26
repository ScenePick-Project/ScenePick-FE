import { Button } from "../components/ui/Button.tsx";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center relative overflow-hidden">
      <span className="absolute text-[15rem] font-black text-gray-100 select-none -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        404
      </span>

      <p className="text-gray-500 mb-8 max-w-sm">
        요청하신 페이지를 찾을 수 없습니다. <br />
        입력하신 주소가 정확한지 다시 한번 확인해주세요.
      </p>

      <Button asChild className="rounded-full px-8">
        <Link to="/">홈으로 이동</Link>
      </Button>
    </div>
  );
}
