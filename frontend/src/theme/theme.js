import { createTheme, alpha } from '@mui/material/styles';

/**
 * Custom MUI theme for LeaveFlow
 * Premium enterprise aesthetic with glassmorphism and rich micro-interactions
 */

const getTheme = (mode) => {
  const isDark = mode === 'dark';

  // Curated palette
  const palette = {
    primary: isDark
      ? { main: '#818cf8', light: '#a5b4fc', dark: '#6366f1', contrastText: '#0f0f23' }
      : { main: '#4f46e5', light: '#6366f1', dark: '#4338ca', contrastText: '#ffffff' },
    secondary: isDark
      ? { main: '#2dd4bf', light: '#5eead4', dark: '#14b8a6', contrastText: '#0f0f23' }
      : { main: '#0d9488', light: '#14b8a6', dark: '#0f766e', contrastText: '#ffffff' },
    background: isDark
      ? { default: '#06070e', paper: '#0d0f1a' }
      : { default: '#f4f6fb', paper: '#ffffff' },
    text: isDark
      ? { primary: '#eef0f6', secondary: '#8892b0' }
      : { primary: '#1a1d2e', secondary: '#5a6178' },
    divider: isDark ? 'rgba(136, 146, 176, 0.1)' : 'rgba(0, 0, 0, 0.06)',
    success: { main: isDark ? '#34d399' : '#059669', light: '#6ee7b7', dark: '#047857' },
    warning: { main: isDark ? '#fbbf24' : '#d97706', light: '#fde68a', dark: '#b45309' },
    error: { main: isDark ? '#f87171' : '#dc2626', light: '#fca5a5', dark: '#b91c1c' },
    info: { main: isDark ? '#60a5fa' : '#2563eb', light: '#93c5fd', dark: '#1d4ed8' },
  };

  return createTheme({
    palette: {
      mode,
      ...palette,
    },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      h1: { fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.1 },
      h2: { fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 },
      h3: { fontWeight: 700, letterSpacing: '-0.015em' },
      h4: { fontWeight: 700, letterSpacing: '-0.01em' },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600, fontSize: '1.05rem' },
      subtitle1: { fontWeight: 500, letterSpacing: '0.005em' },
      subtitle2: { fontWeight: 600, letterSpacing: '0.005em' },
      body1: { lineHeight: 1.65 },
      body2: { lineHeight: 1.6 },
      button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
      caption: { letterSpacing: '0.015em' },
    },
    shape: {
      borderRadius: 14,
    },
    shadows: [
      'none',
      isDark ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.05)',
      isDark ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.06)',
      isDark ? '0 4px 12px rgba(0,0,0,0.45)' : '0 4px 12px rgba(0,0,0,0.07)',
      isDark ? '0 6px 16px rgba(0,0,0,0.5)' : '0 6px 16px rgba(0,0,0,0.08)',
      isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.09)',
      ...Array(19).fill(isDark ? '0 10px 32px rgba(0,0,0,0.55)' : '0 10px 32px rgba(0,0,0,0.1)'),
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundImage: isDark
              ? 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.08), transparent), radial-gradient(ellipse 60% 40% at 85% 100%, rgba(20,184,166,0.05), transparent)'
              : 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(79,70,229,0.04), transparent)',
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 11,
            padding: '10px 22px',
            fontSize: '0.875rem',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          containedPrimary: {
            background: isDark
              ? 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)'
              : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            boxShadow: isDark
              ? '0 4px 14px rgba(129, 140, 248, 0.25)'
              : '0 4px 14px rgba(99, 102, 241, 0.3)',
            '&:hover': {
              background: isDark
                ? 'linear-gradient(135deg, #a5b4fc 0%, #818cf8 100%)'
                : 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
              boxShadow: isDark
                ? '0 6px 20px rgba(129, 140, 248, 0.35)'
                : '0 6px 20px rgba(99, 102, 241, 0.4)',
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0px)',
            },
          },
          outlined: {
            borderWidth: '1.5px',
            '&:hover': {
              borderWidth: '1.5px',
              transform: 'translateY(-1px)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            backgroundImage: 'none',
            border: isDark ? '1px solid rgba(136,146,176,0.08)' : '1px solid rgba(0,0,0,0.05)',
            backgroundColor: isDark ? alpha('#0d0f1a', 0.7) : '#ffffff',
            backdropFilter: isDark ? 'blur(12px)' : 'none',
            boxShadow: isDark
              ? '0 4px 24px rgba(0, 0, 0, 0.35)'
              : '0 1px 8px rgba(0, 0, 0, 0.04), 0 4px 24px rgba(0, 0, 0, 0.03)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 11,
              transition: 'all 0.2s ease',
              '&.Mui-focused': {
                boxShadow: isDark
                  ? '0 0 0 3px rgba(129,140,248,0.15)'
                  : '0 0 0 3px rgba(99,102,241,0.1)',
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 9,
            letterSpacing: '0.01em',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: isDark
              ? '1px solid rgba(136,146,176,0.06)'
              : '1px solid rgba(0,0,0,0.04)',
            padding: '14px 16px',
          },
          head: {
            fontWeight: 700,
            textTransform: 'uppercase',
            fontSize: '0.72rem',
            letterSpacing: '0.06em',
            color: isDark ? '#8892b0' : '#5a6178',
            backgroundColor: isDark ? 'rgba(13,15,26,0.6)' : 'rgba(244,246,251,0.8)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            border: 'none',
            backgroundImage: 'none',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 20,
            backgroundImage: 'none',
            border: isDark ? '1px solid rgba(136,146,176,0.1)' : '1px solid rgba(0,0,0,0.06)',
            boxShadow: isDark
              ? '0 24px 48px rgba(0,0,0,0.6)'
              : '0 24px 48px rgba(0,0,0,0.12)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            height: 5,
            backgroundColor: isDark ? 'rgba(136,146,176,0.08)' : 'rgba(0,0,0,0.04)',
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 3,
            borderRadius: '3px 3px 0 0',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 8,
            fontSize: '0.76rem',
            fontWeight: 500,
            backdropFilter: 'blur(8px)',
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            fontWeight: 700,
          },
        },
      },
      MuiPagination: {
        styleOverrides: {
          root: {
            '& .MuiPaginationItem-root': {
              fontWeight: 600,
              borderRadius: 9,
            },
          },
        },
      },
    },
  });
};

export default getTheme;
