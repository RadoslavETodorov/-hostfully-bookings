import { render, waitForElementToBeRemoved,
	waitFor, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { describe, test, expect, vi, beforeEach, } from 'vitest';

import App from '../App';
import { makeStore } from './testStore';

vi.mock('@mui/x-date-pickers/DatePicker', () => {
	const DatePicker = ({ label, value, onChange, slotProps }: any) => {
		const toIsoDate = (d: unknown) =>
			d instanceof Date && !Number.isNaN(d.getTime())
				? d.toISOString().slice(0, 10)
				: '';

		const error = Boolean(slotProps?.textField?.error);
		const helperText = slotProps?.textField?.helperText;

		return (
			<div>
				<label>
					{label}
					<input
						aria-label={label}
						value={toIsoDate(value)}
						onChange={(e) => onChange(new Date(e.target.value))}
					/>
				</label>
				{error && helperText ? <div role='alert'>{String(helperText)}</div> : null}
			</div>
		);
	};

	return { DatePicker };
});

type TestCtx = {
	user: UserEvent;
	ui: RenderResult;
};

function renderApp(): TestCtx {
	const store = makeStore();
	const user = userEvent.setup();

	const ui = render(
		<Provider store={store}>
			<App />
		</Provider>,
	);

	return { user, ui };
}

const page = {
	heading: (ui: RenderResult) => ui.getByText('Bookings'),
	searchInput: (ui: RenderResult) => ui.getByLabelText(/search/i),
	openCreate: async (ctx: TestCtx) => {
		await ctx.user.click(ctx.ui.getByRole('button', { name: /create booking/i }));
	},
	openDetailsForFirst: async (ctx: TestCtx) => {
		const btns = ctx.ui.getAllByRole('button', { name: /view/i });
		await ctx.user.click(btns[0]);
	},
	openEditForFirst: async (ctx: TestCtx) => {
		const btns = ctx.ui.getAllByRole('button', { name: /edit/i });
		await ctx.user.click(btns[0]);
	},
	openDeleteForFirst: async (ctx: TestCtx) => {
		const btns = ctx.ui.getAllByRole('button', { name: /delete/i });
		await ctx.user.click(btns[0]);
	},
	dialog: (ui: RenderResult) => ui.getByRole('dialog'),
	dialogTitleCreate: (ui: RenderResult) => ui.getByRole('heading', { name: /create booking/i }),
	dialogTitleDetails: (ui: RenderResult) => ui.getByRole('heading', { name: /booking details/i }),
	dialogTitleEdit: (ui: RenderResult) => ui.getByRole('heading', { name: /edit booking/i }),
	guestNameInput: (ui: RenderResult) => ui.getByLabelText(/guest name/i),
	startDateInput: (ui: RenderResult) => ui.getByLabelText(/start date/i),
	endDateInput: (ui: RenderResult) => ui.getByLabelText(/end date/i),
	notesInput: (ui: RenderResult) => ui.getByLabelText(/notes/i),
	createButton: (ui: RenderResult) => ui.getByRole('button', { name: /^create$/i }),
	saveButton: (ui: RenderResult) => ui.getByRole('button', { name: /^save$/i }),
	closeButton: (ui: RenderResult) => ui.getByRole('button', { name: /^close$/i }),
	cancelButton: (ui: RenderResult) => ui.getByRole('button', { name: /^cancel$/i }),
	confirmDeleteButton: (ui: RenderResult) => ui.getByRole('button', { name: /^delete$/i }),
};

beforeEach(() => {
	localStorage.clear();
});

describe('BookingsPage', () => {
	test('renders base page', async () => {
		const ctx = renderApp();
		expect(page.heading(ctx.ui)).toBeInTheDocument();
		expect(page.searchInput(ctx.ui)).toBeInTheDocument();
	});

	test('opens create dialog', async () => {
		const ctx = renderApp();
		await page.openCreate(ctx);
		expect(page.dialog(ctx.ui)).toBeInTheDocument();
		expect(page.dialogTitleCreate(ctx.ui)).toBeInTheDocument();
		expect(page.guestNameInput(ctx.ui)).toBeInTheDocument();
	});

	test('cancel closes create dialog without creating booking', async () => {
		const ctx = renderApp();

		await page.openCreate(ctx);
		expect(page.dialog(ctx.ui)).toBeInTheDocument();

		await ctx.user.type(page.guestNameInput(ctx.ui), 'Should Not Exist');
		await ctx.user.type(page.startDateInput(ctx.ui), '2026-01-10');
		await ctx.user.type(page.endDateInput(ctx.ui), '2026-01-12');

		await ctx.user.click(page.cancelButton(ctx.ui));

		await waitForElementToBeRemoved(() => ctx.ui.queryByRole('dialog'));

		expect(ctx.ui.queryByText('Should Not Exist')).toBeNull();
	});

	test('create button is disabled when form is invalid and dialog stays open', async () => {
		const ctx = renderApp();

		await page.openCreate(ctx);
		expect(page.dialog(ctx.ui)).toBeInTheDocument();

		await ctx.user.type(page.guestNameInput(ctx.ui), 'Bad Dates');
		await ctx.user.type(page.startDateInput(ctx.ui), '2026-01-10');
		await ctx.user.type(page.endDateInput(ctx.ui), '2026-01-10');

		await waitFor(() => {
			expect(page.createButton(ctx.ui)).toBeDisabled();
		});

		expect(page.dialog(ctx.ui)).toBeInTheDocument();
	});

	test('typing in search does not close create dialog or reset form', async () => {
		const ctx = renderApp();

		await page.openCreate(ctx);
		expect(page.dialog(ctx.ui)).toBeInTheDocument();

		await ctx.user.type(page.guestNameInput(ctx.ui), 'Persistent Name');
		await ctx.user.type(page.startDateInput(ctx.ui), '2026-02-10');
		await ctx.user.type(page.endDateInput(ctx.ui), '2026-02-12');

		await ctx.user.type(page.searchInput(ctx.ui), 'anything');

		expect(page.dialog(ctx.ui)).toBeInTheDocument();
		expect(page.guestNameInput(ctx.ui)).toHaveValue('Persistent Name');
		expect(page.startDateInput(ctx.ui)).toBeInTheDocument();
		expect(page.endDateInput(ctx.ui)).toBeInTheDocument();
	});

	test('create dialog has required fields visible', async () => {
		const ctx = renderApp();

		await page.openCreate(ctx);

		expect(page.dialog(ctx.ui)).toBeInTheDocument();
		expect(page.dialogTitleCreate(ctx.ui)).toBeInTheDocument();

		expect(page.guestNameInput(ctx.ui)).toBeInTheDocument();
		expect(page.startDateInput(ctx.ui)).toBeInTheDocument();
		expect(page.endDateInput(ctx.ui)).toBeInTheDocument();
		expect(page.notesInput(ctx.ui)).toBeInTheDocument();
		expect(page.createButton(ctx.ui)).toBeInTheDocument();
		expect(page.cancelButton(ctx.ui)).toBeInTheDocument();
	});

	test('create dialog closes with Escape', async () => {
		const ctx = renderApp();

		await page.openCreate(ctx);
		expect(page.dialog(ctx.ui)).toBeInTheDocument();

		await ctx.user.keyboard('{Escape}');

		await waitForElementToBeRemoved(() => ctx.ui.queryByRole('dialog'));
	});

	test('notes field accepts input', async () => {
		const ctx = renderApp();

		await page.openCreate(ctx);

		expect(page.dialog(ctx.ui)).toBeInTheDocument();
		expect(page.notesInput(ctx.ui)).toBeInTheDocument();

		await ctx.user.type(page.notesInput(ctx.ui), 'Optional notes');

		expect(page.notesInput(ctx.ui)).toHaveValue('Optional notes');
	});

	test('view opens details dialog and close hides it', async () => {
		const ctx = renderApp();
	
		await page.openDetailsForFirst(ctx);
		expect(page.dialog(ctx.ui)).toBeInTheDocument();
		expect(page.dialogTitleDetails(ctx.ui)).toBeInTheDocument();
	
		await ctx.user.click(page.closeButton(ctx.ui));
		await waitForElementToBeRemoved(() => ctx.ui.queryByRole('dialog'));
	});

	test('edit opens dialog and shows Save button', async () => {
		const ctx = renderApp();
	
		await page.openEditForFirst(ctx);
		expect(page.dialog(ctx.ui)).toBeInTheDocument();
		expect(page.dialogTitleEdit(ctx.ui)).toBeInTheDocument();
		expect(page.saveButton(ctx.ui)).toBeInTheDocument();
	});

	test('delete opens confirm dialog and cancel closes it', async () => {
		const ctx = renderApp();
	
		await page.openDeleteForFirst(ctx);
		expect(page.dialog(ctx.ui)).toBeInTheDocument();
		expect(ctx.ui.getByText(/delete booking/i)).toBeInTheDocument();
	
		await ctx.user.click(page.cancelButton(ctx.ui));
		await waitForElementToBeRemoved(() => ctx.ui.queryByRole('dialog'));
	});

	test('delete confirm removes booking row from table', async () => {
		const ctx = renderApp();

		const demoName = 'Radoslav Todorov';
		expect(ctx.ui.getByText(demoName)).toBeInTheDocument();
	
		await page.openDeleteForFirst(ctx);
		expect(page.dialog(ctx.ui)).toBeInTheDocument();
	
		await ctx.user.click(page.confirmDeleteButton(ctx.ui));
		await waitForElementToBeRemoved(() => ctx.ui.queryByRole('dialog'));
	
		expect(ctx.ui.queryByText(demoName)).toBeNull();
	});

	test('search filters table rows by guest name', async () => {
		const ctx = renderApp();
		const demoName = 'Radoslav Todorov';
		expect(ctx.ui.getByText(demoName)).toBeInTheDocument();
		await ctx.user.clear(page.searchInput(ctx.ui));
		await ctx.user.type(page.searchInput(ctx.ui), 'zzzz-no-match');

		await waitFor(() => {
			expect(ctx.ui.getByText(/no bookings yet/i)).toBeInTheDocument();
		});

		expect(ctx.ui.queryByText(demoName)).toBeNull();
	});
});