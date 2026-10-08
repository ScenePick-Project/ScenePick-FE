import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage.tsx";
import Layout from "./components/common/Layout.tsx";
import NotFound from "./pages/NotFound.tsx";
import ContentDetailPage from "@pages/content/ContentDetailPage.tsx";
import SignUpPage from "@pages/signup/SignUpPage.tsx";
import LoginPage from "@pages/login/LoginPage.tsx";
import { RequireAuth } from "@shared/RequireAuth.tsx";
import OAuthCallback from "@pages/auth/OAuthCallback.tsx";
import MyPage from "@pages/mypage/MyPage.tsx";
import MyCollectionPage from "@pages/mypage/MyCollectionPage.tsx";
import MomentPage from "@pages/moment/MomentPage.tsx";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 레이아웃이 필요 없는 페이지 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* 소셜 로그인 콜백 경로 */}
        <Route path="/oauth/callback" element={<OAuthCallback />} />

        {/* 레이아웃이 필요한 페이지 */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/movie" />
          <Route path="/drama" />
          <Route path="/ost" />
          <Route path="/content/:id" element={<ContentDetailPage />} />
          <Route path="/content/:contentId/moments" element={<MomentPage />} />

          {/* 로그인이 필요한 페이지 */}
          <Route element={<RequireAuth />}>
            <Route path="/mypage" element={<MyPage />} />
            <Route
              path="/mypage/reviews"
              element={<MyCollectionPage key="reviews" kind="reviews" />}
            />
            <Route
              path="/mypage/bookmarks"
              element={<MyCollectionPage key="bookmarks" kind="bookmarks" />}
            />
            <Route
              path="/mypage/moments"
              element={<MyCollectionPage key="moments" kind="moments" />}
            />
            <Route
              path="/mypage/album"
              element={<MyCollectionPage key="album" kind="album" />}
            />
            <Route
              path="/mypage/following"
              element={<MyCollectionPage key="following" kind="following" />}
            />
            <Route
              path="/mypage/followers"
              element={<MyCollectionPage key="followers" kind="followers" />}
            />
          </Route>

          {/* 없는 페이지로 갈 경우 */}
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route />
      </Routes>
    </BrowserRouter>
  );
}
