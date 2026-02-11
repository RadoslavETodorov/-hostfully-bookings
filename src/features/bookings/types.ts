export type BookingId = string;

export type Booking = {
  id: BookingId;
  guestName: string;
  startDate: string;
  endDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type BookingInput = Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>;

export enum BookingValidationErrorType {
  OVERLAP = 'OVERLAP',
  INVALID_DATES = 'INVALID_DATES',
};

export type BookingValidationError =
  | { type: BookingValidationErrorType.OVERLAP; message: string }
  | { type: BookingValidationErrorType.INVALID_DATES; message: string };
