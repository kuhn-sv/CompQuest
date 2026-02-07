import type {UserProfile} from '../interfaces/auth.interface';

const PROFILE_CACHE_KEY = (uid: string) => `cq_profile:${uid}:v1`;

export const loadProfileFromCache = (uid: string): UserProfile | null => {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY(uid));
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
};

export const saveProfileToCache = (
  uid: string,
  profile: UserProfile | null,
) => {
  try {
    if (!profile) return localStorage.removeItem(PROFILE_CACHE_KEY(uid));
    localStorage.setItem(PROFILE_CACHE_KEY(uid), JSON.stringify(profile));
  } catch {
    // ignore quota/availability issues
  }
};

export const clearProfileCache = (uid: string | null) => {
  try {
    if (!uid) return;
    localStorage.removeItem(PROFILE_CACHE_KEY(uid));
  } catch {
    // ignore
  }
};
