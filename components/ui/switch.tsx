"use client";
import React from "react";
export function Switch({checked, onChange}:{checked:boolean; onChange:(v:boolean)=>void}) {
  return (
    <button onClick={()=>onChange(!checked)} className={`inline-flex h-6 w-11 items-center rounded-full transition ${checked?"bg-brand":"bg-slate-300"}`}>
      <span className={`h-5 w-5 bg-white rounded-full transform transition ${checked?"translate-x-5":"translate-x-1"}`}></span>
    </button>
  );
}
