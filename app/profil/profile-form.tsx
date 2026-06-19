"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field } from "@/components/form/field";
import { FormError } from "@/components/form/form-error";
import { profileSchema, type ProfileInput } from "@/lib/validation/auth";
import { updateProfileAction } from "./actions";

export function ProfileForm({ displayName }: { displayName: string }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { display_name: displayName },
  });

  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (serverError) alertRef.current?.focus();
  }, [serverError]);

  async function onSubmit(values: ProfileInput) {
    setServerError(null);
    setSaved(false);
    const result = await updateProfileAction(values);
    if (result && "error" in result) {
      setServerError(result.error);
    } else {
      setSaved(true);
      reset(values); // setzt den "dirty"-Zustand zurück
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="mt-6 flex flex-col gap-5"
    >
      <FormError ref={alertRef} message={serverError} />

      <Field
        label="Anzeigename"
        id="display_name"
        autoComplete="nickname"
        error={errors.display_name?.message}
        {...register("display_name")}
      />

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-primary px-4 py-2.5 font-semibold text-bg hover:bg-text disabled:opacity-60"
        >
          {isSubmitting ? "Wird gespeichert…" : "Speichern"}
        </button>
        <p role="status" aria-live="polite" className="text-small text-text-accent">
          {saved ? "Gespeichert." : ""}
        </p>
      </div>
    </form>
  );
}
