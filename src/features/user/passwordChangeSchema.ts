import * as yup from "yup";

export const passwordChangeSchema = yup.object({
  currentPassword: yup
    .string()
    .required("현재 비밀번호를 입력해주세요.")
    .test(
      "not-blank",
      "현재 비밀번호를 입력해주세요.",
      (value) => !!value?.trim(),
    ),
  newPassword: yup
    .string()
    .required("새 비밀번호를 입력해주세요.")
    .min(8, "새 비밀번호는 최소 8자 이상이어야 합니다.")
    .test(
      "not-blank",
      "새 비밀번호를 입력해주세요.",
      (value) => !!value?.trim(),
    )
    .test(
      "byte-limit",
      "새 비밀번호는 영문·숫자 기준 최대 72자, 한글 기준 최대 24자까지 입력할 수 있습니다.",
      (value) => new TextEncoder().encode(value ?? "").length <= 72,
    )
    .notOneOf(
      [yup.ref("currentPassword")],
      "현재 비밀번호와 다르게 입력해주세요.",
    ),
  confirmPassword: yup
    .string()
    .required("새 비밀번호를 다시 입력해주세요.")
    .oneOf([yup.ref("newPassword")], "새 비밀번호가 일치하지 않습니다."),
});

export type PasswordChangeValues = yup.InferType<typeof passwordChangeSchema>;
