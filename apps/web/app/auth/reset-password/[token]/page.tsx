import { ResetPasswordForm } from "components/auth/reset-password-form";

export const metadata = {
  title: "Reset Password",
  description: "Reset your password",
};

interface ResetPasswordPageProps {
  params: {
    token: string;
  };
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  return <ResetPasswordForm token={params.token} />;
}
