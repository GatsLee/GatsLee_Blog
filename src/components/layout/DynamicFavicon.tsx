"use client";

import { useEffect } from "react";

export default function DynamicFavicon() {
  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = "/white_pawn.ico";
  }, []);

  return null;
}
