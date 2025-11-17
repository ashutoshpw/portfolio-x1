"use client";

import { useState, useTransition } from "react";
import { Button } from "./Button";
import { signupEmail } from "@/app/actions";

export function EmailSignup() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    setMessage("");

    startTransition(async () => {
      const result = await signupEmail(formData);

      if (result.error) {
        setMessage(result.error);
      } else if (result.success) {
        setMessage("Thanks! We'll notify you when the portfolio is ready.");
        setEmail("");
      }
    });
  };

  return (
    <form
      action={handleSubmit}
      className="flex flex-col gap-4 w-full max-w-md mx-auto"
    >
      <div className="flex flex-col sm:flex-row gap-2 items-stretch">
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          disabled={isPending}
          required
          className="flex-1 h-10 px-4 py-2 bg-background text-foreground border border-foreground font-mono text-base focus:outline-none focus:ring-1 focus:ring-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <Button
          type="submit"
          variant="primary"
          disabled={isPending}
          className="sm:w-auto shrink-0"
        >
          {isPending ? "Submitting..." : "Notify Me"}
        </Button>
      </div>
      {message && (
        <p
          className={`text-sm font-mono ${
            message.includes("Thanks") ? "text-green-400" : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
