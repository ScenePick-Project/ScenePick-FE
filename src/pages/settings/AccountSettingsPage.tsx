import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { isAxiosError } from "axios";
import Input from "@components/ui/Input.tsx";
import { Button } from "@components/ui/Button.tsx";
import { changePassword } from "@features/user/api/userApi.ts";
import {
  passwordChangeSchema,
  type PasswordChangeValues,
} from "@features/user/passwordChangeSchema.ts";
import type { BaseResponse } from "@shared/baseResponse.ts";

export default function AccountSettingsPage() {
  const [error, setError] = useState("");
  const [unavailable, setUnavailable] = useState(false);
  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<PasswordChangeValues>({
    resolver: yupResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const submit = async ({
    currentPassword,
    newPassword,
  }: PasswordChangeValues) => {
    setError("");
    try {
      await changePassword({ currentPassword, newPassword });
      window.location.replace("/login?passwordChanged=1");
    } catch (cause) {
      if (isAxiosError<BaseResponse<unknown>>(cause)) {
        const code = cause.response?.data?.code;
        if (code === "USER4006") {
          setFieldError(
            "currentPassword",
            { message: "현재 비밀번호가 올바르지 않습니다." },
            { shouldFocus: true },
          );
          return;
        }
        if (code === "USER4007") {
          setFieldError(
            "newPassword",
            { message: "현재 비밀번호와 다르게 입력해주세요." },
            { shouldFocus: true },
          );
          return;
        }
        if (code === "USER4008") {
          setUnavailable(true);
          setError(
            "소셜 로그인으로 가입한 계정은 비밀번호를 변경할 수 없습니다.",
          );
          return;
        }
        if (cause.response?.status === 401) {
          window.location.replace("/login?redirect=%2Fsettings%2Faccount");
          return;
        }
      }
      setError(
        "비밀번호를 변경하지 못했습니다. 연결 상태를 확인하고 다시 시도해주세요.",
      );
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <Link to="/mypage" className="text-sm text-gray-600 hover:text-primary">
        ← 마이페이지
      </Link>
      <h1 className="mb-6 mt-4 text-2xl font-bold">계정 설정</h1>
      <h2 className="mb-2 text-lg font-semibold">비밀번호 변경</h2>
      <p className="mb-6 text-sm text-gray-600">
        변경 후 다시 로그인해주세요. 다른 기기의 로그인도 순차적으로 종료됩니다.
        소셜 로그인으로 가입한 계정은 비밀번호를 변경할 수 없습니다.
      </p>
      <form
        onSubmit={handleSubmit(submit)}
        noValidate
        className="space-y-5"
        aria-label="비밀번호 변경"
      >
        <fieldset disabled={isSubmitting || unavailable} className="space-y-5">
          <div>
            <label
              htmlFor="current-password"
              className="mb-2 block text-sm font-medium"
            >
              현재 비밀번호
            </label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              {...register("currentPassword")}
              aria-invalid={!!errors.currentPassword}
              aria-describedby={
                errors.currentPassword ? "current-password-error" : undefined
              }
              isError={!!errors.currentPassword}
            />
            {errors.currentPassword && (
              <p
                id="current-password-error"
                role="alert"
                className="mt-1 text-sm text-red-600"
              >
                {errors.currentPassword.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="new-password"
              className="mb-2 block text-sm font-medium"
            >
              새 비밀번호
            </label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              {...register("newPassword")}
              aria-invalid={!!errors.newPassword}
              aria-describedby={
                errors.newPassword ? "new-password-error" : "password-help"
              }
              isError={!!errors.newPassword}
            />
            <p id="password-help" className="mt-1 text-xs text-gray-500">
              최소 8자, 현재 비밀번호와 다르게 입력해주세요.
            </p>
            {errors.newPassword && (
              <p
                id="new-password-error"
                role="alert"
                className="mt-1 text-sm text-red-600"
              >
                {errors.newPassword.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="confirm-password"
              className="mb-2 block text-sm font-medium"
            >
              새 비밀번호 확인
            </label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={
                errors.confirmPassword ? "confirm-password-error" : undefined
              }
              isError={!!errors.confirmPassword}
            />
            {errors.confirmPassword && (
              <p
                id="confirm-password-error"
                role="alert"
                className="mt-1 text-sm text-red-600"
              >
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || unavailable}
          >
            {isSubmitting ? "변경 중..." : "비밀번호 변경"}
          </Button>
        </fieldset>
        {isSubmitting && (
          <p role="status" className="text-sm text-gray-600">
            비밀번호를 변경하고 있습니다.
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
