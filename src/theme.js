import { createTheme, virtualColor } from '@mantine/core';

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
        size: 'sm',
      },
    },
    Badge: {
      defaultProps: {
        size: 'sm',
      },
    },
  },
});
