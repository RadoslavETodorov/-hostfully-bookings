import { createSlice, nanoid, } from '@reduxjs/toolkit';
import type { PayloadAction, } from '@reduxjs/toolkit';
import { BookingValidationErrorType, type Booking, type BookingInput, type BookingValidationError } from './types';
import { isDateRangeValid, doesOverlaps, } from '../../lib/dates';
import { loadFromStorage, saveToStorage, } from '../../lib/storage';

type BookingsState = {
  items: Booking[];
  lastError: BookingValidationError | null;
};

const demo: Booking[] = [
  {
    id: 'b1',
    guestName: 'Radoslav Todorov',
    startDate: '2026-01-19',
    endDate: '2026-01-20',
    notes: 'Demo booking',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const initialState: BookingsState = loadFromStorage<BookingsState>({
  items: demo,
  lastError: null,
});

function persist(state: BookingsState) {
  saveToStorage(state);
}

function hasOverlap(items: Booking[], input: BookingInput, ignoreId?: string) {
  return items.some(b => {
    if (ignoreId && b.id === ignoreId) {
      return false;
    };

    return doesOverlaps(input.startDate, input.endDate, b.startDate, b.endDate);
  });
};

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearError(state) {
      state.lastError = null;
    },
    createBooking(state, action: PayloadAction<BookingInput>) {
      const input = action.payload;

      if (!isDateRangeValid(input.startDate, input.endDate)) {
        state.lastError = {
          type: BookingValidationErrorType.INVALID_DATES,
          message: 'End date must be after start date.',
        };

        return;
      };

      if (hasOverlap(state.items, input)) {
        state.lastError = {
          type: BookingValidationErrorType.OVERLAP,
          message: 'This booking overlaps an existing booking.',
        };

        return;
      };

      const now = new Date().toISOString();
      const booking: Booking = {
        id: nanoid(),
        ...input,
        createdAt: now,
        updatedAt: now,
      };

      state.items.unshift(booking);
      state.lastError = null;
      persist(state);
    },
    updateBooking(
      state,
      action: PayloadAction<{ id: string; patch: BookingInput }>
    ) {
      const { id, patch, } = action.payload;

      const idx = state.items.findIndex(b => b.id === id);
      if (idx === -1) {
        return;
      };

      if (!isDateRangeValid(patch.startDate, patch.endDate)) {
        state.lastError = {
          type: BookingValidationErrorType.INVALID_DATES,
          message: 'End date must be after start date.',
        };

        return;
      };

      if (hasOverlap(state.items, patch, id)) {
        state.lastError = {
          type: BookingValidationErrorType.OVERLAP,
          message: 'This booking overlaps an existing booking.',
        };

        return;
      };

      state.items[idx] = {
        ...state.items[idx],
        ...patch,
        updatedAt: new Date().toISOString(),
      };

      state.lastError = null;
      persist(state);
    },
    deleteBooking(state, action: PayloadAction<{ id: string }>) {
      state.items = state.items.filter(b => b.id !== action.payload.id);
      state.lastError = null;
      persist(state);
    },
  },
});

export const { createBooking, updateBooking, deleteBooking, clearError, } = bookingsSlice.actions;
export default bookingsSlice.reducer;
