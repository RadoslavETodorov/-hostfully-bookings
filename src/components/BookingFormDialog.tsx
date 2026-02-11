import { z, } from 'zod';
import { zodResolver, } from '@hookform/resolvers/zod';
import { Controller, useForm, } from 'react-hook-form';
import { Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stack, TextField, Alert, } from '@mui/material';
import { DatePicker, } from '@mui/x-date-pickers/DatePicker';
import { parseISO, } from 'date-fns';
import type { Booking, BookingInput, } from '../features/bookings/types';
import { toISODateOnly, } from '../lib/dates';

const schema = z
  .object({
    guestName: z.string().min(2, 'Guest name is required'),
    startDate: z.date()
      .refine(d => d instanceof Date && !Number.isNaN(d.getTime()), {
        message: 'Start date is required',
      }),
    endDate: z.date()
      .refine(d => d instanceof Date && !Number.isNaN(d.getTime()), {
        message: 'End date is required',
      }),
    notes: z.string().optional(),
  })
  .refine((v) => v.endDate > v.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

type FormValues = z.infer<typeof schema>;

export default function BookingFormDialog({
  open,
  mode,
  initial,
  errorText,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: 'create' | 'edit';
  initial: Booking | null;
  errorText?: string | null;
  onClose: () => void;
  onSubmit: (input: BookingInput) => void;
}) {
  const defaultValues: FormValues = {
    guestName: initial?.guestName ?? '',
    startDate: initial ? parseISO(initial.startDate) : new Date(),
    endDate: initial ? parseISO(initial.endDate) : new Date(),
    notes: initial?.notes ?? '',
  };

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
  });

  const submit = handleSubmit((v) => {
    const input: BookingInput = {
      guestName: v.guestName.trim(),
      startDate: toISODateOnly(v.startDate),
      endDate: toISODateOnly(v.endDate),
      notes: v.notes?.trim() || '',
    };
    onSubmit(input);
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle fontWeight={700}>
        {mode === 'create' ? 'Create Booking' : 'Edit Booking'}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          {errorText ? <Alert severity='error'>{errorText}</Alert> : null}

          <TextField
            label='Guest name'
            {...register('guestName')}
            error={!!errors.guestName}
            helperText={errors.guestName?.message}
            autoFocus
            fullWidth
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Controller
              control={control}
              name='startDate'
              render={({ field }) => (
                <DatePicker
                  label='Start date'
                  value={field.value}
                  onChange={(d) => field.onChange(d)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.startDate,
                      helperText: errors.startDate?.message,
                    },
                  }}
                />
              )}
            />

            <Controller
              control={control}
              name='endDate'
              render={({ field }) => (
                <DatePicker
                  label='End date'
                  value={field.value}
                  onChange={(d) => field.onChange(d)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.endDate,
                      helperText: errors.endDate?.message,
                    },
                  }}
                />
              )}
            />
          </Stack>

          <TextField
            label='Notes'
            {...register('notes')}
            multiline
            minRows={3}
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        <Button
          variant='contained'
          onClick={submit}
          disabled={isSubmitting || !isValid}
        >
          {mode === 'create' ? 'Create' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
