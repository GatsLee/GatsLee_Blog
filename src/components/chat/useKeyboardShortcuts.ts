import { useEffect } from "react";

interface Options {
  onToggle: () => void;
  onClose: () => void;
  isOpen: boolean;
}

export function useKeyboardShortcuts({ onToggle, onClose, isOpen }: Options) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onToggle();
        return;
      }
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onToggle, onClose, isOpen]);
}
