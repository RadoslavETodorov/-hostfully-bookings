import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { CssBaseline, ThemeProvider, createTheme, } from '@mui/material';
import { AdapterDateFns, } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, } from '@mui/x-date-pickers/LocalizationProvider';

import App from './App';
import { store, } from './app/store';

const theme = createTheme({
  palette: { mode: 'light', },
  shape: { borderRadius: 12, },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <App />
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
