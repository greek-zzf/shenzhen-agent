import type { PlaybookId, PublicSlug, UrlKind } from './schema';

export function sourceKindLabel(kind: UrlKind): string {
  if (kind === 'guide') return '指南, 非法律';
  if (kind === 'user_report') return '非法律来源';
  return 'Official';
}

export const PLAYBOOK_ID_LABEL: Record<PlaybookId, string> = {
  'pb-01': 'Payments',
  'pb-02': 'Accommodation registration',
  'pb-03': 'VOA',
  'pb-04': 'SIM / eSIM',
  'pb-05': 'Metro',
  'pb-06': 'Bank',
  'pb-07': 'Housing lease',
  'pb-08': 'Hospital / rabies',
  'pb-09': 'Work / residence',
  'pb-10': 'HR letter',
};

export const PUBLIC_SLUG_LABEL: Record<PublicSlug, string> = {
  'voa-hours': 'VOA hours',
  'alipay-metro': 'Alipay metro',
  'accommodation-registration': 'Accommodation registration',
  bank: 'Bank',
  'housing-lease': 'Housing lease',
  'hospital-rabies': 'Hospital / rabies',
  'work-residence': 'Work / residence',
};

export const STEP_CONFLICT_ID: Record<string, string> = {
  'choose-stack': 'alipay-vs-wechat',
  'tourcard-conflict': 'tourcard-vs-direct',
  'national-pilot-conflict': 'national-2026-pilot',
  'registration-form-vs-lease': 'c-registration-form-vs-lease',
  'hours-conflict': 'voa-hours',
  'west-kowloon-note': 'west-kowloon-outbound',
  'fee-user-report': 'c-fee-130',
  'octopus-post': 'octopus-note',
  'transport-tab-conflict': 'c-transport-tab',
  'tap-to-ride-trial': 'c-tap-to-ride-trial',
  'sit-sources-side-by-side': 'official-vs-reddit-lease',
  'visa-refuse-predict': 'visa-open-predict',
  'airport-sla-conflict': 'airport-onestop-not-bank-sla',
  'commission-conflict': 'commission-half-vs-month',
  'fifty-eight-trap': 'fifty-eight-trap',
  'english-clinic-vs-nearest': 'english-clinic-vs-nearest-public',
  'rabies-now': 'english-clinic-vs-nearest-public',
  'hku-szh-phones': 'hku-only-myth',
  'age-policy-conflict': 'age-policy-2026',
  'employer-submits': 'employer-files',
};
