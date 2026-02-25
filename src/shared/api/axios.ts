import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { BaseResponse } from "@shared/baseResponse.ts";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || "http://localhost:8080/api/v1",
  timeout: 3000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let queue: Array<() => void> = [];

// refresh 실패 시 쿠키 삭제 시도 후 로그인 페이지로 이동
const forceLogout = async () => {
  try {
    // refresh 실패 시 서버에서도 refresh_token 폐기 + 쿠키 삭제 시도
    await api.post<BaseResponse<null>>("/user/logout");
  } catch (e) {
    console.warn(e);
  } finally {
    const redirect = encodeURIComponent(
      window.location.pathname + window.location.search,
    );
    window.location.href = `/login?redirect=${redirect}`;
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<BaseResponse<unknown>>) => {
    // 실패가 발생한 원래 요청의 config
    // _retry 플래그로 무한 재시도 방지
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const status = error.response?.status;

    const code = error.response?.data?.code;

    if (original?._retry) return Promise.reject(error);

    // checkLogin(/user/me) 요청은 401이 나더라도 forceLogout을 실행하지 않음
    if (status === 401 && original?.url?.includes("/user/me")) {
      return Promise.reject(error);
    }

    const shouldRefresh = status === 401 && code === "JWT4011";

    // refresh 요청 자체가 실패한 경우인지 체크
    const isRefreshCall = original?.url?.includes("/user/refresh");

    // refresh 대상이 아니거나 refresh 자체 요청이면 실패 반환
    if (!shouldRefresh || isRefreshCall) return Promise.reject(error);

    // 이미 refresh를 진행 중인 경우 refresh가 끝나면 재시도
    if (isRefreshing) {
      await new Promise<void>((resolve) => queue.push(resolve));

      // refresh가 끝난 후 재시도
      original._retry = true;
      return api.request(original);
    }

    isRefreshing = true;

    try {
      await api.post<BaseResponse<null>>("/user/refresh");

      queue.forEach((fn) => fn());
      queue = [];

      original._retry = true;
      return api.request(original);
    } catch (refreshErr) {
      await forceLogout();
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
