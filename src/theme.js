import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'blue',
  primaryShade: 6,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  defaultRadius: 'md',
  colors: {
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5C5F66',
      '#373A40',
      '#2C2E33',
      '#25262B',
      '#1A1B1E',
      '#141517',
      '#101113',
    ],
  },
  components: {
    Table: {
      defaultProps: {
        striped: true,
        highlightOnHover: true,
        withTableBorder: true,
        withColumnBorders: false,
        borderColor: 'rgb(230, 230, 234)',
      },
      styles: {
        table: {
          borderRadius: '10px',
          overflow: 'hidden',
          outline: '2px solid rgb(230, 230, 234)',
          outlineOffset: '-2px',
        },
      },
    },
    Modal: {
      defaultProps: {
        centered: true,
        size: 'lg',
      },
    },
    Button: {
      defaultProps: {
        size: 'md',
      },
    },
    Badge: {
      defaultProps: {
        variant: 'light',
        color: 'blue',
        size: 'md',
        radius: 'md',
      },
      styles: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          letterSpacing: 0,
          verticalAlign: 'middle',
          transition: 'background-color 120ms ease, color 120ms ease, border-color 120ms ease',
        },
        label: {
          lineHeight: 1.2,
        },
      },
    },
  },
});
