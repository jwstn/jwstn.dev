import { clsx as type, type ClassValue } from "cnfast"
import { clsx } from "cnfast"
import { twMerge } from "cnfast"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
