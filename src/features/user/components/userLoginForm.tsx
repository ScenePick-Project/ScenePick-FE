import Input from "@components/ui/Input.tsx";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import type { ObjectSchema } from "yup";
import { Button } from "@components/ui/Button.tsx";
import { login } from "@features/user/api/userApi.ts";
import { Link, useSearchParams } from "react-router-dom";
import type { UserLoginRequestDto } from "@features/user/types/userType.ts";

const userSignupForm = () => {
  const [searchParams] = useSearchParams(); // 쿼리 스트링 읽기

  const schema: ObjectSchema<UserLoginRequestDto> = yup.object().shape({
    loginId: yup
      .string()
      .nullable()
      .required("아이디 혹은 이메일을 입력해주세요."),
    password: yup
      .string()
      .nullable()
      .required("비밀번호를 입력해주세요.")
      .min(8, "비밀번호는 최소 8자 이상 입력해주세요."),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserLoginRequestDto>({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const onSubmit = async (data: UserLoginRequestDto) => {
    try {
      await login(data);

      // redirect 파라미터가 있는 경우
      const redirectUrl = searchParams.get("redirect");
      // 홈으로 이동
      window.location.href = redirectUrl
        ? decodeURIComponent(redirectUrl)
        : "/";
    } catch (error) {
      console.error(error);
      alert("아이디 또는 비밀번호를 확인해주세요.");
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm mx-auto space-y-4"
      >
        <Input
          {...register("loginId")}
          isError={!!errors.loginId}
          errorMessage={errors.loginId?.message}
          placeholder={"아이디 혹은 이메일"}
        />
        <Input
          {...register("password")}
          isError={!!errors.password}
          errorMessage={errors.password?.message}
          placeholder={"비밀번호"}
          type={"password"}
        />
        <Button
          type={"submit"}
          className={"w-full text-md"}
          size={"lg"}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
              로그인 중...
            </>
          ) : (
            "로그인"
          )}
        </Button>
      </form>
      <div className={"flex items-center justify-center gap-3 mt-3"}>
        <div className={"items-center"}>아이디 찾기</div>
        <div>|</div>
        <div>비밀번호 찾기</div>
      </div>
      <div className={"flex items-center justify-center gap-1.5 mt-1"}>
        <div>계정이 없으신가요?</div>
        <div>
          <Link to={"/signup"} className={"text-primary"}>
            회원가입
          </Link>
        </div>
      </div>
      {/* 소셜 로그인 구분선 및 버튼 추가 */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">또는</span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 w-full">
        {/* 구글 로그인 */}
        <a
          href="http://localhost:8080/oauth2/authorization/google"
          className="flex h-12 w-12 items-center justify-center rounded-md border border-gray-300 bg-white shadow-sm hover:bg-gray-50 transition-colors"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="h-6 w-6"
          />
        </a>

        {/* 카카오 로그인 */}
        <a
          href="http://localhost:8080/oauth2/authorization/kakao"
          className="flex h-12 w-12 items-center justify-center rounded-md bg-[#FEE500] shadow-sm hover:bg-[#FDD835] transition-colors"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 4C7.58172 4 4 6.76371 4 10.1714C4 12.3703 5.48052 14.2922 7.71366 15.4415L6.76371 18.8701C6.67555 19.1892 7.01323 19.4423 7.29806 19.2539L11.3965 16.5326C11.5937 16.558 11.7952 16.5714 12 16.5714C16.4183 16.5714 20 13.8077 20 10.1714C20 6.76371 16.4183 4 12 4Z"
              fill="#191919"
            />
          </svg>
        </a>
      </div>
    </>
  );
};
export default userSignupForm;
