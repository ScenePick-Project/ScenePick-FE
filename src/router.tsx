import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage.tsx";
import Layout from "./components/common/Layout.tsx";
import NotFound from "./pages/NotFound.tsx";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 레이아웃이 필요한 페이지 */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/movie" />
          <Route path="/drama" />
          <Route path="/ost" />

          {/* 없는 페이지로 갈 경우 */}
          <Route path="*" element={<NotFound />} />
        </Route>
        {/* 레이아웃이 필요 없는 페이지 */}
        <Route path="/login" />
        <Route />
      </Routes>
    </BrowserRouter>
  );
}
