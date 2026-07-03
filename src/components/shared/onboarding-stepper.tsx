"use client";

import { usePathname } from "next/navigation";
import { StepIndicator } from "@/components/shared/step-indicator";

const STEPS = ["Bisnis", "Outlet", "Selesai"];

function getStepFromPathname(pathname: string): number {
  if (pathname.includes("/outlet")) return 1;
  if (pathname.includes("/complete")) return 2;
  return 0;
}

export function OnboardingStepper() {
  const pathname = usePathname();
  const currentStep = getStepFromPathname(pathname);
  return <StepIndicator steps={STEPS} currentStep={currentStep} />;
}
