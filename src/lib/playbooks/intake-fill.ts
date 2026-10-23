import { z } from 'zod';

import {
  BROKEN_OPTIONS,
  COUNTRY_CHIPS,
  DISTRICTS,
  EMPTY_PROFILE,
  LOCATIONS,
  PAY_STATES,
  STAY_TYPES,
  VISA_TYPES,
  YES_NO_UNKNOWN,
  type BrokenFlag,
  type CopilotProfile,
} from './profile';

const emptyToNull = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => {
    if (value === '' || value === undefined) return null;
    return value;
  }, schema);

export const intakeFillSchema = z.object({
  passport_country: emptyToNull(z.string().trim().max(80).nullable()),
  visa_type: emptyToNull(z.enum(VISA_TYPES).nullable()),
  broken: z.array(z.enum(BROKEN_OPTIONS)).max(BROKEN_OPTIONS.length).default([]),
  district: emptyToNull(z.enum(DISTRICTS).nullable()),
  arrival_date: emptyToNull(
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD')
      .nullable()
  ),
  stay_type: emptyToNull(z.enum(STAY_TYPES).nullable()),
  wechat_pay: emptyToNull(z.enum(PAY_STATES).nullable()),
  alipay: emptyToNull(z.enum(PAY_STATES).nullable()),
  has_cn_phone: emptyToNull(z.enum(YES_NO_UNKNOWN).nullable()),
  has_cn_bank: emptyToNull(z.enum(YES_NO_UNKNOWN).nullable()),
  location: emptyToNull(z.enum(LOCATIONS).nullable()),
});

export type IntakeFill = z.infer<typeof intakeFillSchema>;

/** Empty overlay. Chip taps never invent a visa or a playbook step. */
export const EMPTY_INTAKE_FILL: IntakeFill = {
  passport_country: null,
  visa_type: null,
  broken: [],
  district: null,
  arrival_date: null,
  stay_type: null,
  wechat_pay: null,
  alipay: null,
  has_cn_phone: null,
  has_cn_bank: null,
  location: null,
};

const COUNTRY_ALIASES: Record<string, string> = {
  us: 'United States',
  usa: 'United States',
  'u.s.': 'United States',
  'u.s.a.': 'United States',
  american: 'United States',
  uk: 'United Kingdom',
  britain: 'United Kingdom',
  british: 'United Kingdom',
  england: 'United Kingdom',
  aus: 'Australia',
  oz: 'Australia',
  ca: 'Canada',
  de: 'Germany',
  fr: 'France',
  sg: 'Singapore',
  jp: 'Japan',
  kr: 'South Korea',
  korea: 'South Korea',
  in: 'India',
};

export function normalizePassportCountry(raw: string | null | undefined): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (trimmed.toLowerCase() === 'unknown') return 'unknown';
  const alias = COUNTRY_ALIASES[trimmed.toLowerCase()];
  if (alias) return alias;
  const chip = COUNTRY_CHIPS.find(
    (c) => c.toLowerCase() === trimmed.toLowerCase()
  );
  return chip ?? trimmed;
}

export function arrivalDateToIso(date: string | null | undefined): string | null {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  return `${date}T00:00:00.000Z`;
}

export function parseIntakeFill(raw: unknown): IntakeFill {
  const parsed = intakeFillSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues
        .map((issue) => `${issue.path.join('.') || 'fill'}: ${issue.message}`)
        .join('; ')
    );
  }
  return parsed.data;
}

function mergeBroken(
  current: BrokenFlag[],
  fill: IntakeFill
): BrokenFlag[] {
  const next = new Set(current);
  for (const flag of fill.broken) next.add(flag);
  if (fill.wechat_pay === 'dead' || fill.alipay === 'dead') {
    next.add('payments');
  }
  if (fill.has_cn_phone === 'no') {
    next.add('no_cn_phone');
  }
  return [...next];
}

/**
 * Overlay a partial profile onto the chip/form profile.
 * Null does not invent visa_type.
 */
export function applyIntakeFill(
  profile: CopilotProfile,
  fill: IntakeFill
): CopilotProfile {
  const next: CopilotProfile = { ...profile };

  const country = normalizePassportCountry(fill.passport_country);
  if (country) next.passport_country = country;

  if (fill.visa_type) next.visa_type = fill.visa_type;
  if (fill.district) next.district = fill.district;
  if (fill.stay_type) next.stay_type = fill.stay_type;
  if (fill.location) next.location = fill.location;
  if (fill.wechat_pay) next.wechat_pay = fill.wechat_pay;
  if (fill.alipay) next.alipay = fill.alipay;
  if (fill.has_cn_phone) next.has_cn_phone = fill.has_cn_phone;
  if (fill.has_cn_bank) next.has_cn_bank = fill.has_cn_bank;

  const arrival = arrivalDateToIso(fill.arrival_date);
  if (arrival) next.arrival_at = arrival;

  next.broken = mergeBroken(profile.broken, fill);
  return next;
}

export function profileFromModelJson(
  raw: unknown,
  base: CopilotProfile = EMPTY_PROFILE
): CopilotProfile {
  return applyIntakeFill(base, parseIntakeFill(raw));
}

/** Chip/form path: add derived broken flags without removing user taps. */
export function syncDerivedBroken(profile: CopilotProfile): CopilotProfile {
  return applyIntakeFill(profile, {
    ...EMPTY_INTAKE_FILL,
    wechat_pay: profile.wechat_pay || null,
    alipay: profile.alipay || null,
    has_cn_phone: profile.has_cn_phone || null,
    has_cn_bank: profile.has_cn_bank || null,
  });
}
