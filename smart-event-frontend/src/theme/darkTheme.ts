import { createTheme } from '@mui/material/styles'

const darkTheme = createTheme({
    components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          overflowY: 'auto',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow:
            '0px 4px 12px rgba(15, 23, 42, 0.06)',
        },
      },
    },
  },
  palette: {
    mode: 'dark',

    primary: {
      main: '#4F46E5',
      light: '#6366F1',
      dark: '#3730A3',
    },

    secondary: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#B45309',
    },

    background: {
      default: '#0b0f19',
      paper: '#111827',
    },

    text: {
      primary: '#E5E7EB',
      secondary: '#9CA3AF',
      disabled: '#6B7280',
    },

    success: {
      main: '#22C55E',
    },
    error: {
      main: '#EF4444',
    },
    warning: {
      main: '#F97316',
    },
    info: {
      main: '#38BDF8',
    },

    divider: '#1F2937',
  },

  shape: {
    borderRadius: 10,
  },

})

export default darkTheme