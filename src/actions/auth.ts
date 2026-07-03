"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema, loginSchema } from "@/lib/validations";
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
    return { error: result.error.issues[0].message };
  }

  const { name, email, password } = result.data;

  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Email sudah terdaftar" };
  }

  // Create user
  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  try {
    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (signInResult && typeof signInResult === "object" && "error" in signInResult && typeof signInResult.error === "string" && signInResult.error) {
      return { error: signInResult.error };
    }
  } catch {}

  return { success: true };
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
