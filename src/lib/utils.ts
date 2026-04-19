import { clsx, type ClassValue } from 'clsx';

/** Class merge helper. Uses `clsx` only so the app runs when `tailwind-merge` is not installed. */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
