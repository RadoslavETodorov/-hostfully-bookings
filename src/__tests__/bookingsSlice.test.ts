import { describe, it, expect, } from 'vitest';
import reducer, { clearError, createBooking, updateBooking, deleteBooking } from '../features/bookings/bookingsSlice';
import { BookingValidationErrorType } from '../features/bookings/types';

type State = ReturnType<typeof reducer>;

function initState(): State {
	return reducer(undefined, { type: '@@INIT' });
}

function createAction(payload: { guestName: string; startDate: string; endDate: string; notes: string }) {
	return createBooking(payload);
}

function getFirstNonDemoId(state: State): string | null {
	const nonDemo = state.items.find((b) => b.guestName !== 'Kristian Dikov');
	return nonDemo?.id ?? null;
}

describe('bookingsSlice', () => {
	it('creates booking', () => {
		const state = initState();
		const s1 = reducer(
			state,
			createAction({
				guestName: 'John Doe',
				startDate: '2026-01-10',
				endDate: '2026-01-12',
				notes: '',
			}),
		);

		expect(s1.lastError).toBeNull();
		expect(s1.items.some((b) => b.guestName === 'John Doe')).toBe(true);
	});

	it('rejects invalid dates (end <= start)', () => {
		const state = initState();
		const s1 = reducer(
			state,
			createAction({
				guestName: 'Bad Dates',
				startDate: '2026-01-10',
				endDate: '2026-01-10',
				notes: '',
			}),
		);

		expect(s1.lastError?.type).toBe('INVALID_DATES');
		expect(s1.items.some((b) => b.guestName === 'Bad Dates')).toBe(false);
	});

	it('prevents overlap on create', () => {
		const state = initState();

		const s1 = reducer(
			state,
			createAction({
				guestName: 'A',
				startDate: '2026-02-01',
				endDate: '2026-02-03',
				notes: '',
			}),
		);
		expect(s1.lastError).toBeNull();

		const s2 = reducer(
			s1,
			createAction({
				guestName: 'B',
				startDate: '2026-02-02',
				endDate: '2026-02-04',
				notes: '',
			}),
		);

		expect(s2.lastError?.type).toBe(BookingValidationErrorType.OVERLAP);
		expect(s2.items.some((b) => b.guestName === 'B')).toBe(false);
	});

	it('allows boundary touch on create (end == next start)', () => {
		const state = initState();

		const s1 = reducer(
			state,
			createAction({
				guestName: 'A',
				startDate: '2026-03-01',
				endDate: '2026-03-03',
				notes: '',
			}),
		);

		const s2 = reducer(
			s1,
			createAction({
				guestName: 'B',
				startDate: '2026-03-03',
				endDate: '2026-03-05',
				notes: '',
			}),
		);

		expect(s2.lastError).toBeNull();
		expect(s2.items.some((b) => b.guestName === 'B')).toBe(true);
	});

	it('updates booking (non-overlapping)', () => {
		const state = initState();

		const s1 = reducer(
			state,
			createAction({
				guestName: 'ToUpdate',
				startDate: '2026-04-10',
				endDate: '2026-04-12',
				notes: '',
			}),
		);

		const id = getFirstNonDemoId(s1);
		expect(id).not.toBeNull();

		const s2 = reducer(s1, updateBooking({ id: id!, patch: { guestName: 'Updated', startDate: '2026-04-11', endDate: '2026-04-13', notes: '' } }));

		expect(s2.lastError).toBeNull();
		expect(s2.items.find((b) => b.id === id!)?.guestName).toBe('Updated');
	});

	it('prevents overlap on update (ignoreId respected)', () => {
		const state = initState();

		const s1 = reducer(
			state,
			createAction({
				guestName: 'A',
				startDate: '2026-05-01',
				endDate: '2026-05-03',
				notes: '',
			}),
		);

		const s2 = reducer(
			s1,
			createAction({
				guestName: 'B',
				startDate: '2026-05-03',
				endDate: '2026-05-06',
				notes: '',
			}),
		);

		const a = s2.items.find((b) => b.guestName === 'A');
		expect(a).not.toBeUndefined();

		const s3 = reducer(
			s2,
			updateBooking({
				id: a!.id,
				patch: { guestName: 'A', startDate: '2026-05-02', endDate: '2026-05-04', notes: '' },
			}),
		);

		expect(s3.lastError?.type).toBe(BookingValidationErrorType.OVERLAP);
	});

	it('updates booking allows same range (self overlap not counted)', () => {
		const state = initState();

		const s1 = reducer(
			state,
			createAction({
				guestName: 'Self',
				startDate: '2026-06-01',
				endDate: '2026-06-03',
				notes: '',
			}),
		);

		const id = s1.items.find((b) => b.guestName === 'Self')?.id ?? null;
		expect(id).not.toBeNull();

		const s2 = reducer(
			s1,
			updateBooking({
				id: id!,
				patch: { guestName: 'Self', startDate: '2026-06-01', endDate: '2026-06-03', notes: '' },
			}),
		);

		expect(s2.lastError).toBeNull();
	});

	it('deletes booking', () => {
		const state = initState();

		const s1 = reducer(
			state,
			createAction({
				guestName: 'ToDelete',
				startDate: '2026-07-01',
				endDate: '2026-07-03',
				notes: '',
			}),
		);

		const id = s1.items.find((b) => b.guestName === 'ToDelete')?.id ?? null;
		expect(id).not.toBeNull();

		const s2 = reducer(s1, deleteBooking({ id: id! }));

		expect(s2.items.some((b) => b.id === id)).toBe(false);
		expect(s2.lastError).toBeNull();
	});

	it('clearError resets lastError', () => {
		const state = initState();

		const s1 = reducer(
			state,
			createAction({
				guestName: 'Bad Dates',
				startDate: '2026-01-10',
				endDate: '2026-01-10',
				notes: '',
			}),
		);

		expect(s1.lastError).not.toBeNull();

		const s2 = reducer(s1, clearError());

		expect(s2.lastError).toBeNull();
	});
});