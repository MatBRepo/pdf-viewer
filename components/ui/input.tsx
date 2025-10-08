import React from "react";
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full rounded-2xl border px-4 py-2 focus:ring-2 focus:ring-brand/40 ${props.className||""}`} />;
}
