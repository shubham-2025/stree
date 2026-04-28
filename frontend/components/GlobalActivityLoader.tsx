"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import BrandSpinner from "@/components/BrandSpinner";

const START_EVENT = "stree:loading:start";
const STOP_EVENT = "stree:loading:stop";

function isInternalNavigationLink(anchor: HTMLAnchorElement): boolean {
  const href = anchor.getAttribute("href");
  if (!href) return false;
  if (href.startsWith("#")) return false;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  if (anchor.target === "_blank" || anchor.hasAttribute("download")) return false;
  return href.startsWith("/") || href.startsWith(window.location.origin);
}

export function startGlobalLoader() {
  window.dispatchEvent(new Event(START_EVENT));
}

export function stopGlobalLoader() {
  window.dispatchEvent(new Event(STOP_EVENT));
}

export default function GlobalActivityLoader() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setVisible(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const start = () => {
      setVisible(true);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = window.setTimeout(() => setVisible(false), 15000);
    };
    const stop = () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      setVisible(false);
    };

    const onDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest("a");
      if (anchor instanceof HTMLAnchorElement && isInternalNavigationLink(anchor)) {
        start();
      }
    };

    const onSubmit = () => start();

    window.addEventListener(START_EVENT, start);
    window.addEventListener(STOP_EVENT, stop);
    document.addEventListener("click", onDocumentClick);
    document.addEventListener("submit", onSubmit);

    return () => {
      window.removeEventListener(START_EVENT, start);
      window.removeEventListener(STOP_EVENT, stop);
      document.removeEventListener("click", onDocumentClick);
      document.removeEventListener("submit", onSubmit);
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  if (!visible) return null;
  return <BrandSpinner label="Loading..." />;
}
