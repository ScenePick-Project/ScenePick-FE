import axios from "axios";
import api from "@shared/api/axios.ts";
import type { BaseResponse } from "@shared/baseResponse.ts";

export type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface RequestConfig {
  method: HTTPMethod;
  url: string;
  query?: Record<string, unknown>;
  body?: any;
}

export const request = async <T>(config: RequestConfig): Promise<T> => {
  const { method, url, query, body } = config;

  try {
    const response = await api.request<BaseResponse<T>>({
      method,
      url,
      params: query,
      data: body,
    });

    return response.data.result;
  } catch (error) {
    if (axios.isAxiosError<BaseResponse<unknown>>(error)) {
      const message =
        error.response?.data.message || "서버 에러가 발생했습니다";
      console.error(`[API 실패] ${message}`);
    } else {
      console.error(`[알 수 없는 에러] ${url}:`, error);
    }
    throw error;
  }
};
