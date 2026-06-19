"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field } from "@/components/form/field";
import { FormError } from "@/components/form/form-error";
import { registerSchema, type RegisterInput } from "@/lib/validation/auth";
import { registerAction } from "./actions";

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const [serverError, setServerError] = useState<string | null>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (serverError) alertRef.current?.focus();
  }, [serverError]);

  async function onSubmit(values: RegisterInput) {
    setServerError(null);
    const result = await registerAction(values);
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
        label="Anzeigename"
        id="display_name"
        autoComplete="nickname"
        hint="Öffentlich sichtbar an deinen Projekten und Bewertungen."
        error={errors.display_name?.message}
        {...register("display_name")}
      />
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
        autoComplete="new-password"
        hint="Mindestens 8 Zeichen."
        error={errors.password?.message}
        {...register("password")}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-primary px-4 py-2.5 font-semibold text-bg hover:bg-text disabled:opacity-60"
      >
        {isSubmitting ? "Wird gesendet…" : "Konto erstellen"}
      </button>
    </form>
  );
}
