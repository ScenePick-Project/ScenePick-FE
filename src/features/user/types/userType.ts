export interface UserSignUpResponseDTO {
  userId: string;
}

export interface UserSignUpRequestDTO {
  userId: string;
  email: string;
  username: string;
  password: string;
}

export interface UserEmailCheckRequestDTO {
  email: string;
}
