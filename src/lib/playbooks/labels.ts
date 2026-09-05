import type { UrlKind } from './schema';

export function sourceKindLabel(kind: UrlKind): string {
  if (kind === 'guide') return '指南, 非法律';
  if (kind === 'user_report') return '非法律来源';
  return 'Official';
}

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
  'branch-areas': 'c-friendly-branches-are-guides',
  'airport-onestop-conflict': 'c-airport-open-account-sla',
  'channel-fork-58': 'c-58-scam-trap',
  'bite-emergency-fork': 'c-english-clinic-vs-nearest-public',
  'hku-passport-fail': 'c-wechat-booking-passport',
  'layoff-official-only': 'c-12345-english-hours',
};
