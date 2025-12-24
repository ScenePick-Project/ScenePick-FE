import { api } from "./axios.ts";

/**
 * 공통 GET 함수
 */
export async function getApi<T>(url: string, params?: any): Promise<T> {
  try {
    const res = await api.get<T>(url, { params });
    // 백엔드에서 받은 데이터(DTO)를 그대로 반환
    return res.data;
  } catch (error) {
    console.error(`GET ${url} Error:`, error);
    throw error;
  }
}
