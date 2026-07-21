"use server";

import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { signIn } from "@/lib/auth";

export async function registerUser() {
  return { error: "Pendaftaran mandiri tidak tersedia. Hubungi admin Bayaro." };
}

export async function loginUser(formData: FormData) {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const result = loginSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  try {
    const signInResult = await signIn("credentials", {
      email: raw.email,
      password: raw.password,
      redirect: false,
    });

    if (signInResult && typeof signInResult === "object" && "error" in signInResult && typeof signInResult.error === "string" && signInResult.error) {
      return { error: signInResult.error };
    }

    // Check if user is itadmin for redirect
    const user = await prisma.user.findUnique({
      where: { email: raw.email },
      select: { role: true },
    });

    if (user?.role === "itadmin") {
      return { success: true, redirectTo: "/itadmin/dashboard" };
    }

    return { success: true };
  } catch (error) {
    if (error && typeof error === "object" && "type" in error && error.type === "CredentialsSignin") {
      return { error: "Email atau password salah" };
    }

    if (error && typeof error === "object" && "message" in error && typeof error.message === "string" && error.message) {
      return { error: error.message };
    }

    return { error: "Email atau password salah" };
  }
}
