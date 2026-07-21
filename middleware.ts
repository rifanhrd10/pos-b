import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const STEP_ROUTES: Record<number, string> = {
  1: "/onboarding/business",
  2: "/onboarding/plan",
  3: "/onboarding/outlet",
  4: "/onboarding/operations",
  5: "/onboarding/complete",
};

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Public routes
  const publicRoutes = ["/login", "/forgot-password"];
  const isPublicRoute = publicRoutes.some((r) => pathname.startsWith(r));

  // Auth routes — redirect to dashboard if already logged in
  if (isPublicRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Unauthenticated → login
  if (!isPublicRoute && !isLoggedIn && !pathname.startsWith("/api")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!isLoggedIn) return NextResponse.next();

  const onboardingDone = req.auth?.user?.onboardingDone ?? false;
  const onboardingStep = req.auth?.user?.onboardingStep ?? 1;
  const isOnboarding = pathname.startsWith("/onboarding");
  const isDashboard = pathname.startsWith("/dashboard");

  // Onboarding not done → force to correct step
  if (!onboardingDone && isDashboard) {
    const targetRoute = STEP_ROUTES[onboardingStep] ?? "/onboarding/business";
    return NextResponse.redirect(new URL(targetRoute, req.url));
  }

  // Onboarding done → no need to stay on onboarding
  if (onboardingDone && isOnboarding) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|uploads|favicon.ico).*)"],
};
