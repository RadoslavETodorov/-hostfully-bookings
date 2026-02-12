import { useMemo, useState, useEffect , } from 'react';
import { Box, Button, Stack, TextField, } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import { useAppDispatch, useAppSelector, } from '../app/hooks';
import { clearError, createBooking, deleteBooking, updateBooking, } from '../features/bookings/bookingsSlice';
import { selectBookings, } from '../features/bookings/selectors';
import type { Booking, BookingInput, } from '../features/bookings/types';

import BookingsTable from '../components/BookingsTable';
import BookingFormDialog from '../components/BookingFormDialog';
import BookingDetailsDialog from '../components/BookingDetailsDialog';
import ConfirmDialog from '../components/ConfirmDialog';

export default function BookingsPage() {
  const dispatch = useAppDispatch();
  const bookings = useAppSelector(selectBookings);
  const lastError = useAppSelector(s => s.bookings.lastError);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const filtered = useMemo(() => {
    const trimmedQuery = debouncedQuery.trim().toLowerCase();
    if (!trimmedQuery) {
      return bookings;
    };

    return bookings.filter(b =>
      b.guestName.toLowerCase().includes(trimmedQuery) ||
        (b.notes ?? '').toLowerCase().includes(trimmedQuery) ||
        b.startDate.includes(trimmedQuery) ||  b.endDate.includes(trimmedQuery)
    );
  }, [bookings, debouncedQuery]);

  const [detailsOpen, setDetailsOpen,] = useState(false);
  const [selected, setSelected,] = useState<Booking | null>(null);

  const [formOpen, setFormOpen,] = useState(false);
  const [formMode, setFormMode,] = useState<'create' | 'edit'>('create');

  const [confirmOpen, setConfirmOpen,] = useState(false);
  const [toDelete, setToDelete,] = useState<Booking | null>(null);

  const openCreate = () => {
    dispatch(clearError());
    setSelected(null);
    setFormMode('create');
    setFormOpen(true);
  };

  const openEdit = (b: Booking) => {
    dispatch(clearError());
    setSelected(b);
    setFormMode('edit');
    setFormOpen(true);
  };

  const openView = (b: Booking) => {
    setSelected(b);
    setDetailsOpen(true);
  };

  const askDelete = (b: Booking) => {
    setToDelete(b);
    setConfirmOpen(true);
  };

  const submitForm = (input: BookingInput) => {
    setSubmitted(true);
    if (formMode === 'create') {
      dispatch(createBooking(input));
    } else if (selected) {
      dispatch(updateBooking({ id: selected.id, patch: input }));
    };
  };

  const confirmDelete = () => {
    if (!toDelete) {
      return;
    };

    dispatch(deleteBooking({ id: toDelete.id }));
    setConfirmOpen(false);
    setToDelete(null);
  };

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
  
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    if (!submitted) return;
  
    if (!lastError) {
      setFormOpen(false);
    }
  
    setSubmitted(false);
  }, [submitted, lastError]);

  return (
    <Box>
      <Stack 
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2} mb={2}
        alignItems={{ sm: 'center' }}
      >
        <TextField
          label='Search'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          fullWidth
        />
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Create booking
        </Button>
      </Stack>

      <BookingsTable
        bookings={filtered}
        onView={openView}
        onEdit={openEdit}
        onDelete={askDelete}
      />

      <BookingDetailsDialog
        open={detailsOpen}
        booking={selected}
        onClose={() => setDetailsOpen(false)}
      />

      <BookingFormDialog
        open={formOpen}
        mode={formMode}
        initial={formMode === 'edit' ? selected : null}
        errorText={lastError?.type ? lastError.message : null}
        onClose={() => setFormOpen(false)}
        onSubmit={submitForm}
      />

      <ConfirmDialog
        open={confirmOpen}
        title='Delete booking'
        description={`Are you sure you want to delete "${toDelete?.guestName}"?`}
        confirmText='Delete'
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
      />
    </Box>
  );
};
