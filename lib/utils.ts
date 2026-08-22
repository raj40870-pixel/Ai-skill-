import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getUserAvatar(email?: string, name?: string, photoURL?: string) {
  // Priority 1: User's explicitly uploaded photoURL
  if (photoURL && photoURL.trim()) {
    return photoURL;
  }
  // Priority 2: Neutral silhouette logo (professional abstract)
  return `https://api.dicebear.com/7.x/shapes/svg?seed=neutral&backgroundColor=cbd5e1`;
}

export function getUserCleanName(user: any) {
  if (!user) return '';
  const name = user.displayName || user.name || user.preferences?.fullname || '';
  if (name && name.trim() !== '' && name.trim().toLowerCase() !== 'user' && name.trim().toLowerCase() !== 'candidate' && name.trim().toLowerCase() !== 'aviator' && name.trim().toLowerCase() !== 'guest explorer' && name.trim().toLowerCase() !== 'temporary guest') {
    return name;
  }
  if (user.email) {
    const prefix = user.email.split('@')[0];
    return prefix.charAt(0).toUpperCase() + prefix.slice(1);
  }
  return 'Aviator';
}
