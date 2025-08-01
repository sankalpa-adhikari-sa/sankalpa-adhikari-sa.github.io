import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function functionRestartAfterSwap(functionName: any) {
  functionName();
  document.addEventListener("astro:after-swap", functionName);
}
