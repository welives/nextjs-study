import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { BASE_URL } from '../constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function absoluteUrl(path: string) {
  return `${BASE_URL}${path}`
}
