import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildReminderEmail,
  isEmailConfigured,
  isHotelStay,
  parseArrivalAt,
  reminderLinks,
  shouldSendClockStarted,
  shouldSendDeadlineNudge,
  TWELVE_HOURS_MS,
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

  it('sends T+0 clock-started only when opted in, not hotel, not sent, email on', () => {
    assert.equal(
      shouldSendClockStarted({
        optedIn: true,
        stayType: 'apartment',
        sentAt: null,
        emailConfigured: true,
      }),
      true
    );
    assert.equal(
      shouldSendClockStarted({
        optedIn: true,
        stayType: 'hotel',
        sentAt: null,
        emailConfigured: true,
      }),
      false
    );
    assert.equal(
      shouldSendClockStarted({
        optedIn: false,
        stayType: 'apartment',
        sentAt: null,
        emailConfigured: true,
      }),
      false
    );
    assert.equal(
      shouldSendClockStarted({
        optedIn: true,
        stayType: 'apartment',
        sentAt: new Date(),
        emailConfigured: true,
      }),
      false
    );
    assert.equal(
      shouldSendClockStarted({
        optedIn: true,
        stayType: 'apartment',
        sentAt: null,
        emailConfigured: false,
      }),
      false
    );
  });

  it('T+12h nudge window is [start+12h, start+24h)', () => {
    const arrival = new Date('2026-09-02T00:00:00.000Z');
    const base = {
      optedIn: true,
      stayType: 'apartment' as const,
      sentAt: null as Date | null,
      arrivalAt: arrival,
    };
    assert.equal(
      shouldSendDeadlineNudge({
        ...base,
        now: new Date(arrival.getTime() + TWELVE_HOURS_MS - 1),
      }),
      false
    );
    assert.equal(
      shouldSendDeadlineNudge({
        ...base,
        now: new Date(arrival.getTime() + TWELVE_HOURS_MS),
      }),
      true
    );
    assert.equal(
      shouldSendDeadlineNudge({
        ...base,
        now: new Date(arrival.getTime() + TWENTY_FOUR_HOURS_MS - 1),
      }),
      true
    );
    assert.equal(
      shouldSendDeadlineNudge({
        ...base,
        now: new Date(arrival.getTime() + TWENTY_FOUR_HOURS_MS),
      }),
      false
    );
    assert.equal(
      shouldSendDeadlineNudge({
        ...base,
        stayType: 'hotel',
        now: new Date(arrival.getTime() + TWELVE_HOURS_MS + 1),
      }),
      false
    );
  });
});

describe('accommodation reminder email copy', () => {
  const arrival = new Date('2026-09-02T04:00:00.000Z');

  it('is English, calm, and links the two copilot pages', () => {
    const { subject, text, html } = buildReminderEmail({
      kind: 'clock_started',
      appUrl: 'https://example.com/',
      arrivalAt: arrival,
    });
    const { guideUrl, runUrl } = reminderLinks('https://example.com/');

    assert.equal(guideUrl, 'https://example.com/p/accommodation-registration');
    assert.equal(runUrl, 'https://example.com/run/pb-02');
    assert.match(subject, /24-hour accommodation registration/i);
    assert.match(text, /12-hour/);
    assert.match(text, /24 hours/);
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
    for (const kind of ['clock_started', 'deadline_nudge'] as const) {
      const { subject, text, html } = buildReminderEmail({
        kind,
        appUrl: 'https://example.com',
        arrivalAt: arrival,
      });
      const blob = `${subject}\n${text}\n${html}`.toLowerCase();
      assert.doesNotMatch(blob, /passport scan|unsubscribe|newsletter|promo|discount|sms/);
      assert.doesNotMatch(blob, /data:image|cid:/);
    }
  });
});
