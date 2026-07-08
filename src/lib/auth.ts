import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 }, // 8 hours
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
      }

      if (trigger === "signIn" && user) {
        const [business, dbUser] = await Promise.all([
          prisma.business.findFirst({
            where: { ownerId: user.id as string },
            select: { onboardingStep: true, onboardingDone: true },
            orderBy: { createdAt: "desc" },
          }),
          prisma.user.findUnique({
            where: { id: user.id as string },
            select: { hasCompletedTour: true },
          }),
        ]);

        token.onboardingStep = business?.onboardingStep ?? 1;
        token.onboardingDone = business?.onboardingDone ?? false;
        token.hasCompletedTour = dbUser?.hasCompletedTour ?? false;
      }

      if (trigger === "update" && session) {
        if (session.onboardingStep !== undefined)
          token.onboardingStep = session.onboardingStep;
        if (session.onboardingDone !== undefined)
          token.onboardingDone = session.onboardingDone;
        if (session.hasCompletedTour !== undefined)
          token.hasCompletedTour = session.hasCompletedTour;
      }

      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
      }
      if (token.onboardingStep !== undefined)
        session.user.onboardingStep = token.onboardingStep as number;
      if (token.onboardingDone !== undefined)
        session.user.onboardingDone = token.onboardingDone as boolean;
      if (token.hasCompletedTour !== undefined)
        session.user.hasCompletedTour = token.hasCompletedTour as boolean;
      return session;
    },
  },
});

// Helper to get business context from session
export async function getBusinessContext(userId: string) {
  const business = await prisma.business.findFirst({
    where: { ownerId: userId },
    include: { outlets: { where: { isActive: true }, take: 1 } },
  });

  if (!business) return null;

  return {
    businessId: business.id,
    businessName: business.name,
    businessLogo: business.logo,
    outletId: business.outlets[0]?.id || null,
    outletName: business.outlets[0]?.name || null,
  };
}
