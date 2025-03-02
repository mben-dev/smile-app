"use client";

import { ForgotPasswordForm } from "components/auth/forgot-password-form";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const showInvalidTokenMessage = searchParams.get("invalid") === "true";

  return <ForgotPasswordForm showError={showInvalidTokenMessage} />;
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          Chargement...
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
