export const PROFILE_STORAGE_KEY = 'sz-copilot-profile';
export const DOCS_STORAGE_KEY = 'sz-copilot-docs';

export const VISA_TYPES = [
  'VOA',
  'tourist',
  'work',
  'residence',
  'unknown',
] as const;

export const STAY_TYPES = ['hotel', 'apartment', 'unknown'] as const;

export const DISTRICTS = [
  'nanshan',
  'futian',
  'luohu',
  'baoan',
  'longhua',
  'longgang',
  'unknown',
] as const;

export const BROKEN_OPTIONS = [
  'payments',
  'need_24h',
  'no_cn_phone',
  'metro_qr',
  'hr_lease_6m',
] as const;

export type VisaType = (typeof VISA_TYPES)[number];
export type StayType = (typeof STAY_TYPES)[number];
export type District = (typeof DISTRICTS)[number];
export type BrokenFlag = (typeof BROKEN_OPTIONS)[number];

export type CopilotProfile = {
  passport_country: string;
  visa_type: VisaType | '';
  location: 'hk_no_visa' | 'already_in_shenzhen' | 'already_in_city' | '';
  stay_type: StayType | '';
  district: District | '';
  broken: BrokenFlag[];
  flags: string[];
  arrival_at: string | null;
};

export const EMPTY_PROFILE: CopilotProfile = {
  passport_country: '',
  visa_type: '',
  location: '',
  stay_type: '',
  district: '',
  broken: [],
  flags: [],
  arrival_at: null,
};

export type WalletDoc = {
  name: string;
  addedAt: string;
};

export function filledIntakeCount(profile: CopilotProfile): number {
  let n = 0;
  if (profile.passport_country.trim()) n += 1;
  if (profile.visa_type) n += 1;
  if (profile.broken.length) n += 1;
  if (profile.stay_type) n += 1;
  if (profile.district) n += 1;
  if (profile.location) n += 1;
  return n;
}

export function canStartPlaybook(profile: CopilotProfile): boolean {
  return filledIntakeCount(profile) >= 3;
}

export function loadProfile(): CopilotProfile {
  if (typeof window === 'undefined') return { ...EMPTY_PROFILE };
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return { ...EMPTY_PROFILE };
    const parsed = JSON.parse(raw) as Partial<CopilotProfile>;
    return {
      ...EMPTY_PROFILE,
      ...parsed,
      broken: Array.isArray(parsed.broken) ? parsed.broken : [],
      flags: Array.isArray(parsed.flags) ? parsed.flags : [],
    };
  } catch {
    return { ...EMPTY_PROFILE };
  }
}

export function saveProfile(profile: CopilotProfile): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function loadDocs(): WalletDoc[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(DOCS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WalletDoc[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDocs(docs: WalletDoc[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(docs));
}

export const COUNTRY_CHIPS = [
  'United States',
  'United Kingdom',
  'Australia',
  'Canada',
  'Germany',
  'France',
  'Singapore',
  'Japan',
  'South Korea',
  'India',
  'unknown',
] as const;
