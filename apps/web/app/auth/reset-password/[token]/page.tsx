"use client";

import { ResetPasswordForm } from "components/auth/reset-password-form";
import { useParams } from "next/navigation";
import { Suspense } from "react";

function ResetPasswordContent() {
  const params = useParams();
  const token = params.token as string;

  return <ResetPasswordForm token={token} />;
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          Chargement...
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
