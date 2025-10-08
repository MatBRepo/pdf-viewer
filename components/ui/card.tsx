import React from "react";
export function Card({children, className}:{children:React.ReactNode; className?:string}) {
  return <div className={`rounded-2xl border shadow-soft ${className||""}`}>{children}</div>;
}
export function CardHeader({children, className}:{children:React.ReactNode; className?:string}) {
  return <div className={`p-4 border-b ${className||""}`}>{children}</div>;
}
export function CardContent({children, className}:{children:React.ReactNode; className?:string}) {
  return <div className={`p-4 ${className||""}`}>{children}</div>;
}
