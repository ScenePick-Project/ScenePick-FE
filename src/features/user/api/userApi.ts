import type {
  UserEmailCheckRequestDTO,
  UserSignUpRequestDTO,
  UserSignUpResponseDTO,
} from "@features/user/types/userType.ts";
import { request } from "@shared/request.ts";

/**
 * 회원가입을 합니다.
 * @param UserSignUpRequestDTO 회원가입 정보
 * @return UserSignUpResponseDTO 회원가입 아이디
 */
export const signup = (dto: UserSignUpRequestDTO) => {
  return request<UserSignUpResponseDTO>({
    method: "POST",
    url: "/user/signup",
    body: dto,
  });
};

/**
 * 아이디 중복 확인
 * @param userId 회원가입 아이디
 * @return boolean 아이디 중복 여부
 */
export const checkIdDuplicate = (userId: string) => {
  return request<boolean>({
    method: "GET",
    url: "/user/check-id",
    query: { userId: userId },
  });
};

/**
 * 이메일 중복 확인
 * @param UserEmailCheckRequestDTO
 * @return boolean 이메일 중복 여부
 */
export const checkEmailDuplicate = (dto: UserEmailCheckRequestDTO) => {
  return request<boolean>({
    method: "POST",
    url: "/user/check-email",
    body: dto,
  });
};
