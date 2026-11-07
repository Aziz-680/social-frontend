"use client";

import { Toaster } from "sonner";

export default function ToastProvider() {
  return <Toaster position="top-right" theme="system" richColors closeButton />;
}