import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  fonts: {
    heading: 'Sarabun, sans-serif',
    body: 'Sarabun, sans-serif',
  },
  colors: {
    brand: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
    },
  },
  styles: {
    global: {
      'html, body': {
        padding: 0,
        margin: 0,
        minHeight: '100vh',
        backgroundColor: 'gray.50',
      },
      '#root': {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      },
    },
  },
});

export default theme;
