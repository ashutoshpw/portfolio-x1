"use server";

import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

export async function signupEmail(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email || typeof email !== "string") {
    return { error: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Invalid email format" };
  }

  try {
    const dataDir = join(process.cwd(), "data");
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }

    const filePath = join(dataDir, "signups.txt");
    const timestamp = new Date().toISOString();
    const entry = `${timestamp} - ${email}\n`;

    await writeFile(filePath, entry, { flag: "a" });

    return { success: true, message: "Email saved successfully" };
  } catch (error) {
    console.error("Error saving email:", error);
    return { error: "Failed to save email" };
  }
}

