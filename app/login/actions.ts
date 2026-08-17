"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { COOKIE_NAME, deriveToken } from "@/app/_auth/site-auth";

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const sitePassword = process.env.SITE_PASSWORD;

  if (!sitePassword || password !== sitePassword) {
    redirect("/login?error=1");
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, deriveToken(sitePassword), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect("/");
}
