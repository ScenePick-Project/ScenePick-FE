import {BrowserRouter, Route, Routes} from "react-router-dom";
import HomePage from "./pages/home/HomePage.tsx";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route> {/*공통 레이아웃 페이지 추가 필요*/}
                    <Route path="/" element={<HomePage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}