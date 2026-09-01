import type { AttachRule, Playbook } from './schema';
import type { CopilotProfile } from './profile';

export const ATTACH_PRIORITY = [
  'pb-03',
  'pb-01',
  'pb-02',
  'pb-04',
  'pb-05',
  'pb-10',
] as const;

export function ruleMatches(rule: AttachRule, profile: CopilotProfile): boolean {
  switch (rule.when) {
    case 'broken_contains':
      return profile.broken.includes(rule.value as CopilotProfile['broken'][number]);
    case 'visa_type_in':
      return profile.visa_type === rule.value;
    case 'location_is':
      return profile.location === rule.value;
    case 'stay_is':
      if (rule.value === 'not_hotel') {
        return profile.stay_type === 'apartment';
      }
      if (rule.value === 'need_24h') {
        return (
          profile.stay_type === 'apartment' ||
          profile.broken.includes('need_24h')
        );
      }
      return profile.stay_type === rule.value;
    case 'flag_is':
      return (
        profile.flags.includes(rule.value) ||
        profile.broken.includes(rule.value as CopilotProfile['broken'][number])
      );
    default:
      return false;
  }
}

export function attachPlaybooks(
  profile: CopilotProfile,
  playbooks: Playbook[]
): Playbook[] {
  const matched = playbooks.filter((pb) =>
    pb.attach_when.some((rule) => ruleMatches(rule, profile))
  );
  return matched.sort(
    (a, b) => ATTACH_PRIORITY.indexOf(a.id as (typeof ATTACH_PRIORITY)[number]) -
      ATTACH_PRIORITY.indexOf(b.id as (typeof ATTACH_PRIORITY)[number])
  );
}

export function primaryAttachedId(attached: Playbook[]): string | null {
  return attached[0]?.id ?? null;
}

export function shouldSkipStep(
  step: Playbook['steps'][number],
  profile: CopilotProfile,
  mode: 'public' | 'run'
): boolean {
  if (mode === 'public') return false;
  if (!step.skip_if) return false;
  const { field, equals } = step.skip_if;
  if (field === 'stay_type') return profile.stay_type === equals;
  if (field === 'location') return profile.location === equals;
  if (field === 'broken') {
    return profile.broken.includes(equals as CopilotProfile['broken'][number]);
  }
  if (field === 'district') {
    if (equals === 'not_nanshan') {
      return Boolean(
        profile.district &&
          profile.district !== 'nanshan' &&
          profile.district !== 'unknown'
      );
    }
    return profile.district === equals;
  }
  return false;
}
