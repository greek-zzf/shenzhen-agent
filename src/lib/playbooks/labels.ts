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
  'hours-conflict': 'voa-hours',
  'west-kowloon-note': 'west-kowloon-outbound',
  'octopus-post': 'octopus-note',
  'sit-sources-side-by-side': 'official-vs-reddit-lease',
};
