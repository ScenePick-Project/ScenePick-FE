import Input from "@components/ui/Input.tsx";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import type { ObjectSchema } from "yup";
import { Button } from "@components/ui/Button.tsx";
import { login } from "@features/user/api/userApi.ts";
import { useNavigate } from "react-router-dom";
import type { UserLoginRequestDto } from "@features/user/types/userType.ts";

const userSignupForm = () => {
  const navigate = useNavigate();

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
    formState: { errors },
  } = useForm<UserLoginRequestDto>({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const onSubmit = async (data: UserLoginRequestDto) => {
    try {
      await login(data);
      alert("로그인이 완료되었습니다.");
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
        <Button type={"submit"} className={"w-full text-md"} size={"lg"}>
          로그인
        </Button>
      </form>
    </>
  );
};
export default userSignupForm;
