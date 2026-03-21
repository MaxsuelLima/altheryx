import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function Modal({ open, onClose, title, children, maxWidth = "max-w-3xl" }: ModalProps) {
  const [closing, setClosing] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 200);
  };

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open && !closing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[5vh] sm:pt-[8vh] px-4">
      <div
        ref={overlayRef}
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm ${closing ? "animate-modal-out" : "animate-modal-overlay"}`}
        onClick={handleClose}
      />
      <div
        className={`relative w-full ${maxWidth} bg-theme-card-bg rounded-2xl border border-theme-card-border shadow-2xl max-h-[85vh] flex flex-col ${closing ? "animate-modal-out" : "animate-modal-in"}`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border-secondary shrink-0">
          <h2 className="text-lg font-semibold text-theme-text-primary">{title}</h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-theme-text-tertiary hover:text-theme-text-primary hover:bg-theme-bg-hover transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto p-6 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
