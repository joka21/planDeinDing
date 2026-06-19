"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field } from "@/components/form/field";
import { FormError } from "@/components/form/form-error";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";
import { loginAction } from "./actions";

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const [serverError, setServerError] = useState<string | null>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (serverError) alertRef.current?.focus();
  }, [serverError]);

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    const result = await loginAction(values, redirectTo);
    if (result?.error) setServerError(result.error);
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="mt-8 flex flex-col gap-5"
    >
      <FormError ref={alertRef} message={serverError} />

      <Field
        label="E-Mail"
        id="email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Field
        label="Passwort"
        id="password"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-primary px-4 py-2.5 font-semibold text-bg hover:bg-text disabled:opacity-60"
      >
        {isSubmitting ? "Wird angemeldet…" : "Anmelden"}
      </button>
    </form>
  );
}
