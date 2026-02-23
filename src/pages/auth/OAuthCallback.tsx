import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import Loading from "@components/common/Loading.tsx";

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const nevigate = useNavigate();

  useEffect(() => {
    // 백엔드 SuccessHandler가 보낸 쿼리 스트링 추출
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (accessToken) {
      // 토큰 저장
      localStorage.setItem("accessToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

      // 메인 페이지로 이동
      window.location.href = "/";
    } else {
      // 토큰이 없으면 로그인 페이지로 리다이렉트
      alert("로그인에 실패했습니다.");
      nevigate("/login");
    }
  }, [searchParams, nevigate]);

  return <Loading message={"소셜 로그인 인증을 처리하고 있습니다"} />;
};

export default OAuthCallback;
