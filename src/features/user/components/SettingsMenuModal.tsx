import { Button } from "@components/ui/Button.tsx";

interface SettingsMenuModalProps {
  onClose: () => void;
  onLogout: () => void;
}

export const SettingsMenuModal = ({
  onClose,
  onLogout,
}: SettingsMenuModalProps) => {
  return (
    <div className="flex flex-col">
      {/* 모달 헤더 */}
      <div className="flex justify-between items-center p-5 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">설정</h2>
        <Button
          onClick={onClose}
          variant={"ghost"}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          {/* 닫기(X) 아이콘 */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </Button>
      </div>

      {/* 메뉴 리스트 */}
      <div className="flex flex-col py-2">
        <Button
          variant={"ghost"}
          className="text-left px-5 py-4 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          계정 설정
        </Button>
        <Button
          variant={"ghost"}
          className="text-left px-5 py-4 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          알림 설정
        </Button>

        {/* 구분선 */}
        <div className="w-full h-[1px] bg-gray-100 my-2" />

        {/* 로그아웃 버튼 */}
        <Button
          onClick={onLogout}
          variant={"ghost"}
          className="text-left px-5 py-4 font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          로그아웃
        </Button>
      </div>
    </div>
  );
};
