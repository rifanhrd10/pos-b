"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema } from "@/lib/validations";
import { signIn } from "@/lib/auth";

export async function registerUser(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const result = registerSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Data pendaftaran tidak valid" };
  }

  const email = result.data.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    return { error: "Email sudah terdaftar. Silakan login atau gunakan email lain." };
  }

  try {
    await prisma.user.create({
      data: {
        name: result.data.name.trim(),
        email,
        password: await bcrypt.hash(result.data.password, 10),
        role: "user",
      },
    });

    const signInResult = await signIn("credentials", {
      email,
      password: result.data.password,
      redirect: false,
    });

    if (
      signInResult &&
      typeof signInResult === "object" &&
      "error" in signInResult &&
      typeof signInResult.error === "string" &&
      signInResult.error
    ) {
      return { error: signInResult.error };
    }

    return { success: true, redirectTo: "/onboarding/business" };
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return { error: "Email sudah terdaftar. Silakan login atau gunakan email lain." };
    }
    return { error: "Gagal membuat akun. Silakan coba lagi." };
  }
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
