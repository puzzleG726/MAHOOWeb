import { createContext, useContext } from "react";

// Keep the context identity independent of animation component hot reloads.
export const MotionContext = createContext(null);
export function useMotion() { return useContext(MotionContext); }

export function getTitleFontSize(width) { return Math.min(200, Math.max(64, width * (width <= 768 ? 0.145 : 0.115))); }
