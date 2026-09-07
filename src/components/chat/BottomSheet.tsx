"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useDragControls,
  useMotionValue,
  animate,
  type PanInfo,
} from "motion/react";

interface BottomSheetProps {
  onClose: () => void;
  children: ReactNode;
}

export default function BottomSheet({ onClose, children }: BottomSheetProps) {
  const dragControls = useDragControls();
  const y = useMotionValue(0);
  const [vh, setVh] = useState(0);
  const initialized = useRef(false);

  useEffect(() => {
    const update = () => setVh(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Open snap = 0 (sheet top at viewport top — full screen)
  const openY = 0;

  useEffect(() => {
    if (vh > 0 && !initialized.current) {
      initialized.current = true;
      y.set(vh);
      animate(y, openY, { type: "spring", damping: 34, stiffness: 320 });
    }
  }, [vh, y]);

  const onDragEnd = (_e: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    if (info.velocity.y > 600 || info.offset.y > 140) {
      animate(y, vh, {
        type: "spring",
        damping: 32,
        stiffness: 320,
        onComplete: onClose,
      });
      return;
    }
    animate(y, openY, { type: "spring", damping: 32, stiffness: 320 });
  };

  const handleScrimClick = () => {
    if (vh === 0) return onClose();
    animate(y, vh, {
      type: "spring",
      damping: 32,
      stiffness: 320,
      onComplete: onClose,
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm"
        onClick={handleScrimClick}
      />
      <motion.div
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: vh }}
        dragElastic={{ top: 0, bottom: 0.35 }}
        style={{ y, height: "100dvh" }}
        onDragEnd={onDragEnd}
        className="fixed inset-x-0 top-0 z-[60] flex flex-col shadow-2xl overflow-hidden"
      >
        <div
          className="flex flex-col h-full"
          style={{ backgroundColor: "var(--color-background)" }}
        >
          <div
            onPointerDown={(e) => dragControls.start(e)}
            className="shrink-0 cursor-grab active:cursor-grabbing touch-none"
            aria-label="Drag handle"
          >
            <div className="chat-handle" />
          </div>
          {children}
        </div>
      </motion.div>
    </>
  );
}
