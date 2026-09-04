import { z } from 'zod';

export const urlKindSchema = z.enum(['official', 'guide', 'user_report']);

export const officialUrlSchema = z.object({
  label: z.string().min(1),
  url: z.string().url(),
  kind: urlKindSchema,
  // Remote-research fetch time may be committed. last_verified stays null
  // until a door photo / live field check. Never treat fetched_at as verified.
  fetched_at: z.string().nullable().optional().default(null),
});

export const ctaIdSchema = z.enum([
  'next_step',
  'start_kyc',
  'open_official',
  'i_have_these',
  'preview_hr_letter',
  'mark_paid',
  'i_am_at_window',
  'confirm_single_entry',
]);

export const primaryCtaSchema = z.object({
  id: ctaIdSchema,
  label_en: z.string().min(1),
});

export const attachWhenSchema = z.object({
  when: z.enum([
    'broken_contains',
    'visa_type_in',
    'location_is',
    'stay_is',
    'flag_is',
  ]),
  value: z.string().min(1),
});

export const skipIfSchema = z.object({
  field: z.string().min(1),
  equals: z.string().min(1),
});

export const passportFailSchema = z.object({
  title_en: z.string().min(1),
  body_en: z.string().min(1),
});

export const gettingThereSchema = z.object({
  poi_en: z.string().min(1),
  copy_name_zh: z.string().min(1),
  metro_line: z.string().nullable(),
  metro_exit: z.string().nullable(),
  notes_en: z.string().min(1),
});

export const bringItemSchema = z.object({
  id: z.string().min(1),
  label_en: z.string().min(1),
  required: z.boolean(),
});

export const speechCardSchema = z.object({
  hanzi: z.string().min(1),
  pinyin: z.string().min(1),
  en: z.string().min(1),
});

export const clickPathStepSchema = z.object({
  n: z.number().int().positive(),
  text_en: z.string().min(1),
  screenshot: z.string().nullable(),
  // Caption under a non-null screenshot. Stock art must say
  // "Stock photo — confirm at the window". Omit on missing-art steps.
  note: z.string().min(1).optional(),
});

export const clickPathSchema = z.object({
  steps: z.array(clickPathStepSchema).min(1),
});

export const requiredCheckboxSchema = z.object({
  id: z.string().min(1),
  label_en: z.string().min(1),
});

export const timerSchema = z.object({
  kind: z.literal('arrival_24h'),
  label_en: z.string().min(1),
});

export const slotSchema = z.enum([
  'getting_there',
  'what_to_bring',
  'passport_fail',
  'speech',
  'click_path',
  'required_check',
  'timer',
  'conflict',
]);

export const stepSchema = z.object({
  id: z.string().min(1),
  title_en: z.string().min(1),
  slot: slotSchema,
  why: z.string().min(1),
  skippable: z.boolean(),
  skip_if: skipIfSchema.nullable(),
  passport_fail_warning: passportFailSchema.nullable(),
  getting_there: gettingThereSchema.nullable(),
  what_to_bring: z.array(bringItemSchema),
  speech_card: speechCardSchema.nullable(),
  click_path: clickPathSchema.nullable(),
  official_urls: z.array(officialUrlSchema),
  prefill: z.record(z.string(), z.unknown()),
  required_checkboxes: z.array(requiredCheckboxSchema),
  primary_cta: primaryCtaSchema,
  stuck_node: z.string().min(1),
  timer: timerSchema.nullable(),
});

export const conflictSourceSchema = z.object({
  label: z.string().min(1),
  url: z.string().url(),
  kind: urlKindSchema,
  claim_en: z.string().min(1),
  as_of: z.string().min(1),
});

export const conflictSchema = z.object({
  id: z.string().min(1),
  title_en: z.string().min(1),
  resolution: z.literal('verify_at_window'),
  sources: z.array(conflictSourceSchema).min(2),
});

export const failureNodeSchema = z.object({
  id: z.string().min(1),
  question_en: z.string().min(1),
  advice_en: z.string().min(1),
  never: z.array(z.string()),
  next: z.string().nullable(),
  vpn_off_only: z.boolean(),
});

export const failureTreeSchema = z.object({
  id: z.string().min(1),
  title_en: z.string().min(1),
  nodes: z.array(failureNodeSchema).min(1),
});

export const playbookSchema = z.object({
  id: z.string().regex(/^pb-\d{2}$/),
  title_en: z.string().min(1),
  status: z.enum(['draft', 'published']),
  version: z.number().int().positive(),
  last_verified: z.string().nullable(),
  source_max_age_days: z.number().int().positive(),
  lifecycle: z.enum(['72h', 'first_week', 'later']),
  public_slug: z.string().nullable(),
  summary_en: z.string().min(1),
  disclaimer_en: z.string().min(1),
  attach_when: z.array(attachWhenSchema),
  primary_cta: primaryCtaSchema,
  official_urls: z.array(officialUrlSchema),
  conflicts: z.array(conflictSchema),
  failure_tree: failureTreeSchema,
  attached_playbooks: z.array(z.string()),
  steps: z.array(stepSchema).min(1),
});

export type Playbook = z.infer<typeof playbookSchema>;
export type PlaybookStep = z.infer<typeof stepSchema>;
export type OfficialUrl = z.infer<typeof officialUrlSchema>;
export type Conflict = z.infer<typeof conflictSchema>;
export type FailureTree = z.infer<typeof failureTreeSchema>;
export type FailureNode = z.infer<typeof failureNodeSchema>;
export type AttachRule = z.infer<typeof attachWhenSchema>;
export type SpeechCard = z.infer<typeof speechCardSchema>;
export type GettingThere = z.infer<typeof gettingThereSchema>;
export type PrimaryCta = z.infer<typeof primaryCtaSchema>;
export type UrlKind = z.infer<typeof urlKindSchema>;
