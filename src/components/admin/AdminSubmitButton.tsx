"use client";

import { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type AdminSubmitButtonProps = {
  children: ReactNode;
  pendingLabel?: ReactNode;
  className: string;
  name?: string;
  value?: string;
};

export default function AdminSubmitButton({
  children,
  pendingLabel = "Working...",
  className,
  name,
  value,
}: AdminSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      aria-busy={pending}
      className={`${className} disabled:cursor-wait disabled:opacity-70`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
