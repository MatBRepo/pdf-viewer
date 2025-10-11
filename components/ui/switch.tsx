// components/ui/switch.tsx
"use client";
import * as React from "react";

type SwitchProps = {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void; // styl shadcn
  onChange?: (checked: boolean) => void;        // Twój dotychczasowy styl
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  "aria-label"?: string;
};

export function Switch({
  checked,
  onCheckedChange,
  onChange,
  disabled,
  className = "",
  ...rest
}: SwitchProps) {
  const toggle = () => {
    if (disabled) return;
    const next = !checked;
    // Wywołaj oba, jeśli podane – zapewnia kompatybilność
    onCheckedChange?.(next);
    onChange?.(next);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          toggle();
        }
      }}
      className={[
        "inline-flex h-6 w-11 items-center rounded-full transition",
        "outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        checked ? "bg-primary" : "bg-slate-300",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        className,
      ].join(" ")}
      {...rest}
    >
      <span
        className={[
          "h-5 w-5 rounded-full bg-white shadow transform transition",
          checked ? "translate-x-5" : "translate-x-1",
        ].join(" ")}
      />
    </button>
  );
}
