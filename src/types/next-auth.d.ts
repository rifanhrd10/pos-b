import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      onboardingStep?: number;
      onboardingDone?: boolean;
      hasCompletedTour?: boolean;
    } & DefaultSession["user"];
  }
}
