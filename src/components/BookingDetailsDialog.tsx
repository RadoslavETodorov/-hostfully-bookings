import { Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Stack, Typography } from '@mui/material';
import type { Booking, } from '../features/bookings/types';

export default function BookingDetailsDialog({
  open,
  booking,
  onClose,
}: {
  open: boolean;
  booking: Booking | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle fontWeight={700}>Booking Details</DialogTitle>
      <DialogContent>
        {
          booking
          ? (
              <Stack spacing={1}>
                <Typography><b>Guest:</b> {booking.guestName}</Typography>
                <Typography><b>Start:</b> {booking.startDate}</Typography>
                <Typography><b>End:</b> {booking.endDate}</Typography>
                <Typography><b>Notes:</b> {booking.notes || '-'}</Typography>
              </Stack>
            )
          : (<Typography variant='body2'>No booking selected.</Typography>)
        }
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
