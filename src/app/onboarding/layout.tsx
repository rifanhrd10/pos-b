import { BayaroLogo } from "@/components/shared/logo";
import { OnboardingStepper } from "@/components/shared/onboarding-stepper";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-10">
        {/* Logo */}
        <div className="flex justify-center">
          <BayaroLogo />
        </div>

        {/* Stepper */}
        <div className="mt-8">
          <OnboardingStepper />
        </div>

        {/* Content */}
        <div className="mt-10 flex-1">{children}</div>
      </div>
    </div>
  );
}
