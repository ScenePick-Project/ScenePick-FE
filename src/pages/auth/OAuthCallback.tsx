import { useEffect } from "react";
import Loading from "@components/common/Loading.tsx";

const OAuthCallback = () => {
  useEffect(() => {
    window.location.href = "/";
  }, []);

  return <Loading message={"소셜 로그인 인증을 처리하고 있습니다"} />;
};

export default OAuthCallback;
