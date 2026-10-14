"use client";

import { useEffect } from "react";

/**
 * Entrades discretes. Sense JS, o amb moviment reduït, tot es veu des del principi: el CSS només
 * amaga `.reveal` quan aquest component posa `data-live` a <html>.
 */
export function RevealObserver() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    root.dataset.live = "";
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.shown = "";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    const watch = () => document.querySelectorAll<HTMLElement>(".reveal:not([data-shown])").forEach((el) => observer.observe(el));
    watch();
    // Les pàgines noves (navegació del client) afegeixen elements: es tornen a buscar.
    const mutations = new MutationObserver(watch);
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      mutations.disconnect();
      delete root.dataset.live;
    };
  }, []);
  return null;
}
