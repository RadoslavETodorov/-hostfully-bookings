import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, IconButton, Stack, Typography, Chip, } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Booking, } from '../features/bookings/types';
  
export default function BookingsTable({
  bookings,
  onView,
  onEdit,
  onDelete,
}: {
  bookings: Booking[];
  onView: (b: Booking) => void;
  onEdit: (b: Booking) => void;
  onDelete: (b: Booking) => void;
}) {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
      <Table size='small'>
        <TableHead>
          <TableRow>
            <TableCell><b>Guest</b></TableCell>
            <TableCell><b>Start</b></TableCell>
            <TableCell><b>End</b></TableCell>
            <TableCell><b>Notes</b></TableCell>
            <TableCell align='right'><b>Actions</b></TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {
            bookings.length === 0
            ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography variant='body2' sx={{ py: 2 }}>
                      No bookings yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) 
            : (
                bookings.map((b) => (
                  <TableRow key={b.id} hover>
                    <TableCell>
                      <Stack direction='row' spacing={1} alignItems='center'>
                        <Typography fontWeight={600}>{b.guestName}</Typography>
                        <Chip size='small' label={b.id.slice(0, 6)} />
                      </Stack>
                    </TableCell>
                    <TableCell>{b.startDate}</TableCell>
                    <TableCell>{b.endDate}</TableCell>
                    <TableCell sx={{ maxWidth: 340 }}>
                      <Typography variant='body2' noWrap title={b.notes || ''}>
                        {b.notes || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell align='right'>
                      <IconButton aria-label='view' onClick={() => onView(b)}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton aria-label='edit' onClick={() => onEdit(b)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton aria-label='delete' onClick={() => onDelete(b)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )
          }
        </TableBody>
      </Table>
    </TableContainer>
  );
};
  