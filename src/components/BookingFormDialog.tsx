import { z, } from 'zod';
import { zodResolver, } from '@hookform/resolvers/zod';
import { Controller, useForm, } from 'react-hook-form';
import { Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stack, TextField, Alert, } from '@mui/material';
import { DatePicker, } from '@mui/x-date-pickers/DatePicker';
import { parseISO, } from 'date-fns';
import type { Booking, BookingInput, } from '../features/bookings/types';
import { toISODateOnly, } from '../lib/dates';
import { useEffect } from 'react';

const schema = z
  .object({
    guestName: z.string()
      .trim()
      .nonempty('Guest name must be at least 2 characters')
      .min(2, 'Guest name must be at least 2 characters'),

      startDate: z.date().refine((d) => {
        const date = new Date(d);
        date.setHours(0, 0, 0, 0);
      
        const today = new Date();
        today.setHours(0, 0, 0, 0);
      
        return date >= today;
      }, {
        message: 'Start date cannot be in the past',
      }),
      
    endDate: z.date(),
    notes: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.startDate >= v.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Start date should be before end date',
        path: ['startDate'],
      });

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Start date should be before end date',
        path: ['endDate'],
      });
    }
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
    reset,
    trigger,
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

  useEffect(() => {
    if (!open) {
      return;
    };
  
    reset({
      guestName: initial?.guestName ?? '',
      startDate: initial ? parseISO(initial.startDate) : new Date(),
      endDate: initial ? parseISO(initial.endDate) :  new Date((new Date()).setDate((new Date()).getDate() + 1)),
      notes: initial?.notes ?? '',
    });
  }, [open, initial, reset]);

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
                  onChange={(d) => {
                    field.onChange(d);
                    void trigger(['guestName', 'startDate', 'endDate']);
                  }}
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
                  onChange={(d) => {
                    field.onChange(d);
                    void trigger(['guestName', 'startDate', 'endDate']);
                  }}
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
