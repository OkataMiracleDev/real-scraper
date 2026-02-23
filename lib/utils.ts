import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhoneToWhatsApp(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    return `234${cleaned.slice(1)}`;
  }
  if (cleaned.startsWith('234')) {
    return cleaned;
  }
  return `234${cleaned}`;
}

export function getWhatsAppLink(phone: string): string {
  return `https://wa.me/${formatPhoneToWhatsApp(phone)}`;
}
