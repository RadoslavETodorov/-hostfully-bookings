import { describe, it, expect } from 'vitest';
import { doesOverlaps, isDateRangeValid } from '../lib/dates';

describe('dates', () => {
	it('validates end > start', () => {
		expect(isDateRangeValid('2026-01-01', '2026-01-02')).toBe(true);
		expect(isDateRangeValid('2026-01-01', '2026-01-01')).toBe(false);
		expect(isDateRangeValid('2026-01-02', '2026-01-01')).toBe(false);
	});

	it('detects overlap for [start,end)', () => {
		expect(doesOverlaps('2026-01-01', '2026-01-03', '2026-01-02', '2026-01-04')).toBe(true);
		expect(doesOverlaps('2026-01-01', '2026-01-03', '2026-01-03', '2026-01-05')).toBe(false);
		expect(doesOverlaps('2026-01-01', '2026-01-10', '2026-01-03', '2026-01-05')).toBe(true);
	});

	it('detects non-overlap when fully before', () => {
		expect(doesOverlaps('2026-01-01', '2026-01-03', '2026-01-03', '2026-01-06')).toBe(false);
		expect(doesOverlaps('2026-01-01', '2026-01-03', '2026-01-04', '2026-01-06')).toBe(false);
	});

	it('detects non-overlap when fully after', () => {
		expect(doesOverlaps('2026-01-05', '2026-01-07', '2026-01-01', '2026-01-05')).toBe(false);
		expect(doesOverlaps('2026-01-05', '2026-01-07', '2026-01-01', '2026-01-04')).toBe(false);
	});

	it('detects overlap when same range', () => {
		expect(doesOverlaps('2026-01-01', '2026-01-03', '2026-01-01', '2026-01-03')).toBe(true);
	});

	it('detects overlap when start inside other', () => {
		expect(doesOverlaps('2026-01-01', '2026-01-10', '2026-01-05', '2026-01-12')).toBe(true);
	});

	it('detects overlap when end inside other', () => {
		expect(doesOverlaps('2026-01-05', '2026-01-12', '2026-01-01', '2026-01-10')).toBe(true);
	});
});
