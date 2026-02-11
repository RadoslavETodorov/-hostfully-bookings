import { configureStore, } from '@reduxjs/toolkit';
import bookingsReducer from '../features/bookings/bookingsSlice';

export const makeStore = () =>
	configureStore({
		reducer: { bookings: bookingsReducer },
	});

export type TestStore = ReturnType<typeof makeStore>;
export type TestDispatch = TestStore['dispatch'];
export type TestState = ReturnType<TestStore['getState']>;