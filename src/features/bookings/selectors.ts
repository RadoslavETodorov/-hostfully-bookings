import type { RootState, } from '../../app/store';

export const selectBookings = (s: RootState) => s.bookings.items;
export const selectBookingById = (id: string) => (s: RootState) =>
  s.bookings.items.find(b => b.id === id) ?? null;
