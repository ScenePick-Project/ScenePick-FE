import type { LoadingProps } from "@shared/types/LoadingProps.tsx";

const Loading = ({ message = "잠시만 기다려 주세요..." }: LoadingProps) => {
  return (
    <div
      className={
        "flex min-h-screen flex-col items-center justify-center bg-white"
      }
    >
      <div
        className={
          'className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500'
        }
      ></div>

      <h2 className={"mt-6 text-xl font-semibold text-primary"}>{message}</h2>
      <p className={"mt-2 text-sm text-gray-400"}>
        페이지를 새로고침하지 마세요.
      </p>
    </div>
  );
};

export default Loading;
