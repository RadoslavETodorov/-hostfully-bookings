# Bookings Management App

A React + TypeScript application for managing bookings.

This project was implemented as a technical assignment and demonstrates
state management, form validation, date handling, and UI testing.

---

## Features

- Create, view, edit and delete bookings
- Form validation using React Hook Form + Zod
- Date validation and utilities powered by date-fns
- Prevents invalid date ranges
- Prevents overlapping bookings
- Client-side persistence using localStorage
- Search with debounced filtering
- UI tests implemented with Vitest + Testing Library

---

## Tech Stack

- React 18
- TypeScript
- Vite
- Redux Toolkit
- Material UI
- React Hook Form
- Zod
- date-fns
- Vitest
- @testing-library/react

---

## Validation Rules

- Guest name is required (minimum 2 characters)
- Start date cannot be in the past
- End date must be after start date
- Bookings cannot overlap existing bookings

Validation is implemented on:
- Form level (Zod schema)
- Business logic level (Redux slice)

---

## Project Structure

src/
├── app/                # Redux store and typed hooks  
├── components/         # UI components and dialogs  
├── features/bookings/  # Redux slice, selectors, types  
├── lib/                # Date utilities and storage helpers  
├── pages/              # Page-level components  
├── __tests__/          # UI tests  

---

## Assumptions

- Dates are handled in local time (date-only, no time component)
- All data is stored client-side (localStorage)
- No backend or API integration was required for this assignment

## Running the Project

Install dependencies:

npm install

Start development server:

npm run dev

---

## Running Tests

npm run test

Tests cover:

- Base page rendering
- Dialog open/close behavior
- Create / Edit / Delete flows
- Form validation states
- Search filtering behavior

---

## Notes

- The application is fully client-side.
- Data is persisted in localStorage.
- DatePicker is mocked in tests to ensure deterministic behavior.
