"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "./ToastProvider";
import { ConfirmProvider } from "./ConfirmDialog";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <ConfirmProvider>{children}</ConfirmProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
