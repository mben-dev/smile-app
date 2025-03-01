import { ForgotPasswordForm } from "components/auth/forgot-password-form";
import Metadata from "next";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your password",
};

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: { invalid?: string };
}) {
  const showInvalidTokenMessage = searchParams.invalid === "true";

  return <ForgotPasswordForm showError={showInvalidTokenMessage} />;
}
