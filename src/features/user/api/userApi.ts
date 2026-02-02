import type {
  UserAuthResponseDto,
  UserEmailCheckRequestDto,
  UserLoginRequestDto,
  UserSignUpRequestDto,
  UserSignUpResponseDto,
} from "@features/user/types/userType.ts";
import { request } from "@shared/request.ts";

/**
 * 회원가입을 합니다.
 * @param UserSignUpRequestDto 회원가입 정보
 * @return UserSignUpResponseDTO 회원가입 아이디
 */
export const signup = (dto: UserSignUpRequestDto) => {
  return request<UserSignUpResponseDto>({
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
 * @param UserEmailCheckRequestDto
 * @return boolean 이메일 중복 여부
 */
export const checkEmailDuplicate = (dto: UserEmailCheckRequestDto) => {
  return request<boolean>({
    method: "POST",
    url: "/user/check-email",
    body: dto,
  });
};

/**
 * 로그인을 합니다.
 * @Param UserLoginRequestDto 로그인 정보
 * @return null
 */
export const login = (dto: UserLoginRequestDto) => {
  return request<null>({
    method: "POST",
    url: "/user/login",
    body: dto,
  });
};

/**
 * 로그인 여부를 확인합니다.
 * @Param null
 * @return UserAuthResponseDto
 */
export const checkLogin = () => {
  return request<UserAuthResponseDto>({
    method: "GET",
    url: "/user/me",
  });
};
