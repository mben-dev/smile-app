import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Réinitialisation du mot de passe",
  description: "Réinitialisez votre mot de passe",
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
