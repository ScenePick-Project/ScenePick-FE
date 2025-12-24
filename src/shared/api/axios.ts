import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8080", // 백엔드 주소 (Spring Boot)
  timeout: 3000, // 3초 안에 응답 없으면 에러
  withCredentials: true, // 나중에 쿠키(세션) 주고받을 때 필수
});
