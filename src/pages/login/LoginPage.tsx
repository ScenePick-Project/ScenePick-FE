import ReturnHomeHeader from "@components/common/ReturnHomeHeader.tsx";
import UserLoginForm from "@features/user/components/userLoginForm.tsx";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col gap-4 justify-center items-center px-4">
      <div>
        <ReturnHomeHeader />
      </div>
      <div className="w-full max-w-md mx-auto">
        <UserLoginForm />
      </div>
    </div>
  );
}
