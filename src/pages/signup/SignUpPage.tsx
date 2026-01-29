import UserSignupForm from "@features/user/components/userSignupForm.tsx";
import ReturnHomeHeader from "@components/common/ReturnHomeHeader.tsx";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col gap-4 justify-center items-center px-4">
      <div>
        <ReturnHomeHeader />
      </div>
      <div className="w-full max-w-md mx-auto">
        <UserSignupForm />
      </div>
    </div>
  );
}
