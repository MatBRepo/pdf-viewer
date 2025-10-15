"use client";
import { Toaster } from "sonner";

export default function ToasterClient() {
  return (
    <Toaster
      richColors
      position="top-right"
      theme="system"
      expand
      closeButton
      duration={3500}
      style={{ zIndex: 10000 }} // stay above headers/loaders
    />
  );
}
