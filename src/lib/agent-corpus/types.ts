export const AGENT_SOURCE_KINDS = [
  'official',
  'user_report',
  'sop',
  'docs',
] as const;

export type AgentSourceKind = (typeof AGENT_SOURCE_KINDS)[number];

export type AgentSource = {
  id: string;
  title: string;
  kind: AgentSourceKind;
  /** http(s) URL or in-app path such as `/run/pb-01`. */
  url: string;
  date?: string;
  quote?: string;
};

export type AgentConflictSide = {
  claim: string;
  sourceId: string;
};

export type AgentChunk = {
  id: string;
  title: string;
  text: string;
  kind: AgentSourceKind;
  playbookId?: string;
  tokens: string[];
  sources: AgentSource[];
  conflictSides?: AgentConflictSide[];
};

export type AgentCorpus = {
  chunks: AgentChunk[];
  sourcesById: Map<string, AgentSource>;
};

export type CorpusFile = {
  path: string;
  text: string;
};

export type PlaybookSuggestion = {
  playbookId: string;
  title: string;
  href: string;
};

export type AgentChatResult = {
  answerMarkdown: string;
  sources: AgentSource[];
  playbookSuggestions: PlaybookSuggestion[];
  refused: boolean;
  live: boolean;
};

export const REDDIT_1T9YELI =
  'https://www.reddit.com/r/shenzhen/comments/1t9yeli/i_live_in_shenzhen_heres_what_actually_works_for/';

export const AGENT_MAX_MESSAGE_CHARS = 400;
export const AGENT_MAX_ANSWER_CHARS = 1600;
export const AGENT_RETRIEVE_TOP_K = 8;

export const AGENT_FRAMING =
  'Shenzhen errands agent — answers from our sourced notes, not a general chatbot.';

export const AGENT_EMPTY_HINTS = [
  {
    id: 'payments',
    label: 'Payments',
    question:
      'How do I get WeChat Pay or Alipay working on a foreign card?',
  },
  {
    id: 'lodging',
    label: '24h lodging',
    question:
      'I am not in a hotel — how do I do 24-hour accommodation registration?',
  },
  {
    id: 'metro',
    label: 'Metro QR',
    question: 'How do I ride the Shenzhen metro with a QR code?',
  },
] as const;

export const DRAFT_NOT_VERIFIED =
  'These notes are draft — not field-verified. Confirm at the counter.';
