import { Toaster } from "sonner";

export function SonnerToaster() {
  return (
    <Toaster
      theme="system"
      richColors
      expand
      closeButton
      position="top-right"
    />
  );
}
