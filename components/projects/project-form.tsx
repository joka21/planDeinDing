"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field } from "@/components/form/field";
import { TextareaField } from "@/components/form/textarea-field";
import { FormError } from "@/components/form/form-error";
import { COVERS } from "@/lib/covers";
import { projectSchema, type ProjectInput } from "@/lib/validation/project";
import {
  createProjectAction,
  updateProjectAction,
} from "@/app/einreichen/actions";

export function ProjectForm({
  mode,
  projectId,
  initial,
}: {
  mode: "create" | "edit";
  projectId?: string;
  initial?: ProjectInput;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: initial,
  });

  const [serverError, setServerError] = useState<string | null>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (serverError) alertRef.current?.focus();
  }, [serverError]);

  async function onSubmit(values: ProjectInput) {
    setServerError(null);
    const result =
      mode === "edit" && projectId
        ? await updateProjectAction(projectId, values)
        : await createProjectAction(values);
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
        label="Titel"
        id="title"
        error={errors.title?.message}
        {...register("title")}
      />
      <Field
        label="Teaser"
        id="teaser"
        hint="Kurzbeschreibung – wird auch als SEO-Text verwendet."
        error={errors.teaser?.message}
        {...register("teaser")}
      />
      <TextareaField
        label="Beschreibung"
        id="description"
        rows={8}
        error={errors.description?.message}
        {...register("description")}
      />

      <fieldset>
        <legend className="font-medium text-text">Cover-Vorlage</legend>
        {errors.cover_template && (
          <p
            id="cover-error"
            role="alert"
            className="mt-1 text-small font-medium text-text-accent"
          >
            {errors.cover_template.message}
          </p>
        )}
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {COVERS.map((c) => (
            <label
              key={c.value}
              className="cursor-pointer rounded-lg border-2 border-divider p-1 transition has-[:checked]:border-primary has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-border"
            >
              <input
                type="radio"
                value={c.value}
                className="sr-only"
                aria-describedby={
                  errors.cover_template ? "cover-error" : undefined
                }
                {...register("cover_template")}
              />
              {/* Cover-Vorschau ist dekorativ -> alt="" (Label-Text benennt die Option) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.file}
                alt=""
                className="aspect-video w-full rounded object-cover"
              />
              <span className="mt-1 block text-center text-small text-text">
                {c.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-primary px-4 py-2.5 font-semibold text-bg hover:bg-text disabled:opacity-60"
      >
        {isSubmitting
          ? "Wird gesendet…"
          : mode === "edit"
            ? "Änderungen speichern"
            : "Projekt einreichen"}
      </button>
    </form>
  );
}
