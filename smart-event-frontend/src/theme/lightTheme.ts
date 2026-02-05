import { createTheme } from '@mui/material/styles'

const lightTheme = createTheme({
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
    mode: 'light',

    primary: {
      main: '#2461be',
    },

    secondary: {
      main: '#F59E0B',
    },

    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },

    text: {
      primary: '#202a41',
      secondary: '#475569',
      disabled: '#94A3B8',
    },

    success: {
      main: '#16A34A',
    },
    error: {
      main: '#DC2626',
    },
    warning: {
      main: '#F97316',
    },
    info: {
      main: '#0284C7',
    },
  },

  shape: {
    borderRadius: 10,
  },


  
})

export default lightTheme
