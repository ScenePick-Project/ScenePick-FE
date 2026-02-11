import { useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils.ts";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Modal = ({ open, onClose, children, className }: ModalProps) => {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        role="presentation"
      />
      <div
        className={cn(
          "relative w-full max-w-2xl max-h-[calc(100vh-4rem)] overflow-y-auto bg-white rounded-3xl shadow-[0_30px_60px_rgba(15,23,42,0.25)]",
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
};
