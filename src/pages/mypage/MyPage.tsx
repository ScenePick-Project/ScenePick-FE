import { useState } from "react";
import { Modal } from "@components/ui/Modal.tsx";
import { SettingsMenuModal } from "@features/user/components/SettingsMenuModal.tsx";
import { logout } from "@features/user/api/userApi.ts";
import { Button } from "@components/ui/Button.tsx";

export default function MyPage() {
  // 설정 모달 상태 관리
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setIsSettingsOpen(false);

      window.location.href = "/";
    } catch (error) {
      console.error("로그아웃 실패: ", error);
      alert("로그아웃에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-12 px-4 bg-gray-50">
      {/* 카드 컨테이너: 하얀색 배경, 둥근 모서리, 테두리 적용 */}
      <div className="w-full max-w-2xl bg-white rounded-[20px] border border-gray-200 p-8 shadow-sm">
        <div className="flex justify-between items-start">
          {/* 왼쪽 위: 프로필 이미지 (임시 회색 원) */}
          <div className="w-[100px] h-[100px] rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100">
            {/* 임시 유저 아이콘 */}
            <svg
              className="w-16 h-16 text-gray-300 mt-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>

          {/* 오른쪽 위: 설정 버튼 */}
          <Button
            onClick={() => setIsSettingsOpen(true)}
            variant={"ghost"}
            className="text-gray-800 hover:text-gray-500 transition-colors p-1"
          >
            {/* 임시 톱니바퀴 아이콘 */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </Button>
        </div>

        {/* 이 아래에 닉네임, 팔로워, 버튼 등이 들어갈 빈 영역 */}
        <div className="mt-4"></div>

        {/* 설정 모달 */}
        <Modal
          open={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          className="max-w-md p-0"
        >
          <SettingsMenuModal
            onClose={() => setIsSettingsOpen(false)}
            onLogout={handleLogout}
          />
        </Modal>
      </div>
    </div>
  );
}
