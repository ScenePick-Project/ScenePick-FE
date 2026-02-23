export interface UserSignUpResponseDto {
  userId: string;
}

export interface UserAuthResponseDto {
  userId: string;
  role: string;
}

export interface UserSignUpRequestDto {
  userId: string;
  email: string;
  username: string;
  password: string;
}

export interface UserEmailCheckRequestDto {
  email: string;
}

export interface UserLoginRequestDto {
  loginId: string;
  password: string;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
}
