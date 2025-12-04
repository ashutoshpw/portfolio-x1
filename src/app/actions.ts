"use server";

export async function signupEmail(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email || typeof email !== "string") {
    return { error: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Invalid email format" };
  }

  const timestamp = new Date().toISOString();
  const entry = `${timestamp} - ${email}\n`;
  console.log("NOTIFY_EMAIL", entry);

  return { success: true, message: "Email saved successfully" };
}
