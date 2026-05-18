import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";
import { SignUpCard } from "@/features/auth/components/sign-up-card";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata = pageMetadata(
  "Реєстрація",
  "Створіть обліковий запис FlowForge і почніть організовувати роботу команди.",
);

const SignUpPage = async () => {
  const user = await getCurrent();

  if (user) redirect("/");

  return <SignUpCard />;
};

export default SignUpPage;
