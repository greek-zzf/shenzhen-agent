import type { RetrievedChunk } from './retrieve';
import { sanitizeAgentMessage } from './answer-shared';

export type AgentRefuseReason =
  | 'vpn'
  | 'never'
  | 'operate_software'
  | 'invented_hours'
  | 'conflict_winner'
  | 'off_corpus'
  | 'no_sources';

const VPN_ASK =
  /(?:install|use|need|get|turn on|enable|download|set up|how to).{0,28}\bvpn\b|\bvpn\b.{0,28}(?:install|use|need|download|setup|set up|how)/i;
const VPN_OFF_ONLY =
  /vpn[- ]?off|turn(?:ing)? (?:the )?vpn off|disable (?:the )?vpn/i;

const NEVER_ASK =
  /(?:friend[- ]?bind|bind.{0,20}(?:friend|their) (?:wechat|identity)|yellow[- ]?cow|fake (?:居住|住宿|residence|registration|address)|ghost[- ]?writ|guaranteed visa|guarantee.{0,12}visa|illegal workaround)/i;

const OPERATE_ASK =
  /(?:log(?:ged)? in(?:to)? (?:wechat|alipay|i深圳)|submit(?:ted)? (?:the )?(?:form|to police|kyc)|do it for me|operate (?:wechat|alipay))/i;

const HOURS_ASK =
  /(?:what time|closing time|open(?:ing)? hours|until what time|when (?:do|does|is).{0,24}(?:open|close)|close[s]? at|open until|are they open)/i;

const FEE_ASK = /(?:how much|what(?:'s| is) the fee|official fee|cost in rmb)/i;

const NIA_ASK =
  /(?:on the (?:nia )?list|is (?:my )?(?:us|usa|uk|american|british|passport).{0,20}eligib|which nationalit)/i;

const WINNER_ASK =
  /(?:which (?:is |one (?:is )?)?(?:better|easier|faster|recommended)|should i (?:use|pick|choose)|pick a winner|alipay or wechat|wechat or alipay)/i;

const OFF_TOPIC =
  /(?:best (?:dim sum|restaurant|hotel|nightlife)|where to party|dating|touristy|what to see|weather in|stock tip)/i;

const CLOCK_RE =
  /\b(?:[01]?\d|2[0-3]):[0-5]\d\b|\b(?:[1-9]|1[0-2])\s*(?:am|pm)\b/i;

export function detectAgentRefuse(
  message: string,
  hits: RetrievedChunk[]
): AgentRefuseReason | null {
  const q = sanitizeAgentMessage(message);
  if (NEVER_ASK.test(q)) return 'never';
  if (OPERATE_ASK.test(q)) return 'operate_software';
  if (VPN_ASK.test(q) && !VPN_OFF_ONLY.test(q)) return 'vpn';
  if (OFF_TOPIC.test(q)) return 'off_corpus';

  const conflictHits = hits.filter((hit) => (hit.chunk.conflictSides?.length ?? 0) >= 2);
  if (WINNER_ASK.test(q) && conflictHits.length > 0) {
    return 'conflict_winner';
  }

  const packText = hits
    .map((hit) => `${hit.chunk.title}\n${hit.chunk.text}`)
    .join('\n');

  if (HOURS_ASK.test(q)) {
    const hasHoursConflict = hits.some((hit) =>
      /hour/i.test(`${hit.chunk.id} ${hit.chunk.title}`)
    );
    if (hasHoursConflict || !CLOCK_RE.test(packText)) {
      return 'invented_hours';
    }
  }

  if (FEE_ASK.test(q) && !/\b\d{2,4}\s*(?:RMB|CNY|yuan|¥)|fee/i.test(packText)) {
    return 'invented_hours';
  }

  if (NIA_ASK.test(q)) {
    return 'invented_hours';
  }

  return null;
}

export function hasConflictHits(hits: RetrievedChunk[]): boolean {
  return hits.some((hit) => (hit.chunk.conflictSides?.length ?? 0) >= 2);
}
