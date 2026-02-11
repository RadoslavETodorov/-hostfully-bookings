import { Container, Box, Typography, } from '@mui/material';
import BookingsPage from './pages/BookingsPage';

export default function App() {
  return (
    <Container maxWidth='lg'>
      <Box py={3}>
        <Typography variant='h5' fontWeight={700} gutterBottom>
          Bookings
        </Typography>
        <BookingsPage />
      </Box>
    </Container>
  );
};
