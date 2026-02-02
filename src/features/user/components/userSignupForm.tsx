import Input from "@components/ui/Input.tsx";
import * as yup from "yup";
import type { UserSignUpRequestDto } from "@features/user/types/userType.ts";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import type { ObjectSchema } from "yup";
import { Button } from "@components/ui/Button.tsx";
import {
  checkEmailDuplicate,
  checkIdDuplicate,
  signup,
} from "@features/user/api/userApi.ts";
import { useNavigate } from "react-router-dom";

const userSignupForm = () => {
  const navigate = useNavigate();

  const schema: ObjectSchema<UserSignUpRequestDto> = yup.object().shape({
    userId: yup
      .string()
      .nullable()
      .required("아이디를 입력해주세요.")
      .matches(/^[a-z0-9]+$/, "아이디는 영문 소문자와 숫자만 사용 가능합니다.")
      .min(4, "아이디는 최소 4자 이상 입력해주세요.")
      .max(20, "아이디는 최대 20자까지만 입력 가능합니다."),
    email: yup
      .string()
      .nullable()
      .required("이메일을 입력해주세요.")
      .email("이메일 형식이 올바르지 않습니다."),
    username: yup
      .string()
      .nullable()
      .required("이름을 입력해주세요.")
      .min(2, "이름은 최소 2자 이상 입력해주세요.")
      .max(20, "이름은 최대 20자까지만 입력 가능합니다."),
    password: yup
      .string()
      .nullable()
      .required("비밀번호를 입력해주세요.")
      .min(8, "비밀번호는 최소 8자 이상 입력해주세요."),
  });

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<UserSignUpRequestDto>({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  // 아이디 중복 검사 핸들러
  const handleIdBlur = async () => {
    // yup 스키마가 유효한지 확인
    const isValid = await trigger("userId");
    if (!isValid) return; // 형식이 틀리면 서버에서 확인하지 않음

    const currentId = getValues("userId");
    if (!currentId) return;

    try {
      const isDuplicate = await checkIdDuplicate(currentId);
      if (isDuplicate) {
        setError("userId", {
          type: "manual",
          message: "이미 사용 중인 아이디입니다.",
        });
      } else {
        // 이미 manual 에러가 있는 경우 삭제
        if (errors.userId?.type === "manual") clearErrors("userId");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 이메일 중복 검사 핸들러
  const handleEmailBlur = async () => {
    const isValid = await trigger("email");
    if (!isValid) return;

    const currentEmail = getValues("email");
    if (!currentEmail) return;

    try {
      const isDuplicate = await checkEmailDuplicate({ email: currentEmail });
      if (isDuplicate) {
        setError("email", {
          type: "manual",
          message: "이미 가입된 이메일입니다.",
        });
      } else {
        if (errors.email?.type === "manual") clearErrors("email");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmit = async (data: UserSignUpRequestDto) => {
    try {
      await signup(data);
      alert("회원가입이 완료되었습니다.");
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm mx-auto space-y-4"
      >
        <Input
          {...register("username")}
          isError={!!errors.username}
          errorMessage={errors.username?.message}
          placeholder={"이름"}
        />
        <Input
          {...register("userId", {
            onBlur: handleIdBlur,
          })}
          isError={!!errors.userId}
          errorMessage={errors.userId?.message}
          placeholder={"아이디"}
        />
        <Input
          {...register("email", {
            onBlur: handleEmailBlur,
          })}
          isError={!!errors.email}
          errorMessage={errors.email?.message}
          placeholder={"이메일"}
          type={"email"}
        />
        <Input
          {...register("password")}
          isError={!!errors.password}
          errorMessage={errors.password?.message}
          placeholder={"비밀번호"}
          type={"password"}
        />
        <Button type={"submit"} className={"w-full text-md"} size={"lg"}>
          회원가입
        </Button>
      </form>
    </>
  );
};
export default userSignupForm;
