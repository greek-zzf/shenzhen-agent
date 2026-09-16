const STOP = new Set([
  'a',
  'an',
  'and',
  'are',
  'at',
  'be',
  'do',
  'for',
  'from',
  'how',
  'i',
  'in',
  'is',
  'it',
  'my',
  'of',
  'on',
  'or',
  'the',
  'this',
  'to',
  'with',
  'what',
  'when',
  'where',
  'which',
  'can',
  'me',
  'you',
  'your',
  'we',
  'our',
  'best',
  'just',
  'please',
  'about',
  'should',
  'does',
  'will',
]);

const ALIASES: Record<string, readonly string[]> = {
  pay: ['payment', 'payments', 'alipay', 'wechat', 'wallet', 'kyc', 'card'],
  payment: ['payments', 'alipay', 'wechat', 'wallet', 'kyc'],
  payments: ['alipay', 'wechat', 'wallet', 'kyc', 'card'],
  alipay: ['wallet', 'kyc', 'payments'],
  wechat: ['wallet', 'kyc', 'payments'],
  lodging: [
    'accommodation',
    'registration',
    '24h',
    'hotel',
    'apartment',
    '房屋码',
    '住宿',
  ],
  accommodation: ['registration', '24h', '房屋码', '住宿', 'lodging'],
  registration: ['accommodation', '24h', '房屋码', '住宿'],
  hotel: ['accommodation', 'lodging'],
  metro: ['qr', 'transport', '乘车码', 'octopus', 'gate', 'subway'],
  subway: ['metro', 'qr', '乘车码'],
  qr: ['metro', '乘车码', 'transport'],
  voa: ['visa', 'luohu', 'port', 'nia'],
  visa: ['voa', 'nia'],
  sim: ['esim', 'phone', 'yellow'],
  bank: ['account', 'branch'],
};

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP.has(token));
}

export function expandQueryTokens(tokens: string[]): string[] {
  const out = new Set<string>();
  for (const token of tokens) {
    out.add(token);
    const aliases = ALIASES[token];
    if (aliases) {
      for (const alias of aliases) out.add(alias);
    }
  }
  return [...out];
}
