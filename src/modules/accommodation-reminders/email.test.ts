import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildReminderEmail,
  computeDueAt,
  isEmailConfigured,
  isHotelStay,
  parseArrivalAt,
  reminderLinks,
  selectDueReminders,
  shouldSendDueReminder,
  TWENTY_FOUR_HOURS_MS,
} from './email';

describe('accommodation reminder rules', () => {
  it('never treats hotel as eligible', () => {
    assert.equal(isHotelStay('hotel'), true);
    assert.equal(isHotelStay('apartment'), false);
    assert.equal(isHotelStay('unknown'), false);
    assert.equal(isHotelStay(''), false);
  });

  it('requires both Resend keys to be configured', () => {
    assert.equal(isEmailConfigured({}), false);
    assert.equal(isEmailConfigured({ resend_api_key: 're_x' }), false);
    assert.equal(
      isEmailConfigured({
        resend_api_key: 're_x',
        resend_sender_email: 'hello@example.com',
      }),
      true
    );
  });

  it('parses ISO arrival times and rejects junk', () => {
    const iso = '2026-09-02T04:00:00.000Z';
    assert.equal(parseArrivalAt(iso)?.toISOString(), iso);
    assert.equal(parseArrivalAt(''), null);
    assert.equal(parseArrivalAt('not-a-date'), null);
    assert.equal(parseArrivalAt(123), null);
  });

  it('defaults due_at to arrival + 24h and accepts a user-set time', () => {
    const arrival = new Date('2026-09-02T00:00:00.000Z');
    assert.equal(
      computeDueAt(arrival).toISOString(),
      '2026-09-03T00:00:00.000Z'
    );
    const custom = new Date('2026-09-02T12:00:00.000Z');
    assert.equal(computeDueAt(arrival, custom).toISOString(), custom.toISOString());
  });
});

describe('scheduled send: not yet due / hotel skip / due send once', () => {
  const arrival = new Date('2026-09-02T00:00:00.000Z');
  const dueAt = computeDueAt(arrival);

  const base = {
    optedIn: true,
    stayType: 'apartment',
    sentAt: null as Date | null,
    dueAt,
    arrivalAt: arrival,
  };

  it('does not send before due_at', () => {
    assert.equal(
      shouldSendDueReminder(base, new Date(dueAt.getTime() - 1)),
      false
    );
  });

  it('skips hotel even when due', () => {
    assert.equal(
      shouldSendDueReminder(
        { ...base, stayType: 'hotel' },
        new Date(dueAt.getTime() + 1)
      ),
      false
    );
  });

  it('sends once when due, then skips after sentAt', () => {
    const now = new Date(dueAt.getTime());
    assert.equal(shouldSendDueReminder(base, now), true);
    assert.equal(
      shouldSendDueReminder({ ...base, sentAt: now }, now),
      false
    );
  });

  it('selectDueReminders keeps only the first due apartment row', () => {
    const now = new Date(dueAt.getTime() + 60_000);
    const rows = [
      { id: 'early', ...base, dueAt: new Date(dueAt.getTime() + TWENTY_FOUR_HOURS_MS) },
      { id: 'hotel', ...base, stayType: 'hotel' },
      { id: 'sent', ...base, sentAt: now },
      { id: 'due', ...base },
    ];
    assert.deepEqual(
      selectDueReminders(rows, now).map((row) => row.id),
      ['due']
    );
  });
});

describe('accommodation reminder email copy', () => {
  const arrival = new Date('2026-09-02T04:00:00.000Z');

  it('is English, calm, and links the two copilot pages', () => {
    const { subject, text, html } = buildReminderEmail({
      appUrl: 'https://example.com/',
      arrivalAt: arrival,
      dueAt: computeDueAt(arrival),
    });
    const { guideUrl, runUrl } = reminderLinks('https://example.com/');

    assert.equal(guideUrl, 'https://example.com/p/accommodation-registration');
    assert.equal(runUrl, 'https://example.com/run/pb-02');
    assert.match(subject, /24-hour accommodation registration/i);
    assert.match(text, /24-hour/);
    assert.match(text, /hotel may have filed/i);
    assert.match(text, /房屋码/);
    assert.match(text, /verify at the window/i);
    assert.match(text, /not legal, medical, or immigration advice/);
    assert.ok(text.includes(guideUrl));
    assert.ok(text.includes(runUrl));
    assert.ok(html.includes(guideUrl));
    assert.ok(html.includes(runUrl));
  });

  it('never includes passport scans or marketing', () => {
    const { subject, text, html } = buildReminderEmail({
      appUrl: 'https://example.com',
      arrivalAt: arrival,
    });
    const blob = `${subject}\n${text}\n${html}`.toLowerCase();
    assert.doesNotMatch(blob, /passport scan|unsubscribe|newsletter|promo|discount|sms/);
    assert.doesNotMatch(blob, /data:image|cid:/);
  });
});
