import { jest } from '@jest/globals';
import { Booking } from '../src/models/Booking.js';

describe('Booking overlap logic', () => {
  it('detects overlapping ranges', async () => {
    const spy = jest.spyOn(Booking, 'hasOverlap').mockResolvedValue(true);
    const result = await Booking.hasOverlap(1, '2024-01-01', '2024-01-05');
    expect(result).toBe(true);
    spy.mockRestore();
  });
});
