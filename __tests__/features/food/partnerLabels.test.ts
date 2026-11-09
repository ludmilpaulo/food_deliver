import { actionNeeds, minutesSince, validatePin, validatePrepMinutes, waitingLabel } from '@/features/food/partner/labels';

describe('partner order helpers', () => {
  it('accepts prep times between 1 and 240 whole minutes only', () => {
    expect(validatePrepMinutes('20')).toBe(20);
    expect(validatePrepMinutes('240')).toBe(240);
    expect(validatePrepMinutes('0')).toBeNull();
    expect(validatePrepMinutes('241')).toBeNull();
    expect(validatePrepMinutes('12.5')).toBeNull();
    expect(validatePrepMinutes('')).toBeNull();
  });

  it('accepts 4 to 8 digit customer PINs', () => {
    expect(validatePin(' 1234 ')).toBe('1234');
    expect(validatePin('123')).toBeNull();
    expect(validatePin('12ab')).toBeNull();
  });

  it('asks for the right input before sending an action', () => {
    expect(actionNeeds('accept')).toBe('prep_minutes');
    expect(actionNeeds('reject')).toBe('reason');
    expect(actionNeeds('collected')).toBe('pin');
    expect(actionNeeds('mark_ready')).toBeNull();
  });

  it('shows waiting time in minutes, hours or days', () => {
    const now = Date.parse('2026-11-08T12:00:00Z');
    expect(minutesSince('2026-11-08T11:45:00Z', now)).toBe(15);
    expect(minutesSince('not a date', now)).toBe(0);
    expect(waitingLabel(15)).toEqual(['fpMinutesAgo', '{minutes} min ago', { minutes: 15 }]);
    expect(waitingLabel(125)).toEqual(['fpHoursAgo', '{hours} h ago', { hours: 2 }]);
    expect(waitingLabel(118215)).toEqual(['fpDaysAgo', '{days} d ago', { days: 82 }]);
  });
});
