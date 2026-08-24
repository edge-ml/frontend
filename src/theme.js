import { createTheme } from "@mantine/core";

export const theme = createTheme({
  primaryColor: "brand",
  primaryShade: 6,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  defaultRadius: "md",
  colors: {
    green: [
      "#ebf8f1",
      "#c7eed6",
      "#a3e4bb",
      "#80daa0",
      "#5fd088",
      "#4bc675",
      "#47bb78",
      "#3fa76a",
      "#37935c",
      "#2f7f4e",
    ],
    brand: [
      "#eaf0f7",
      "#d4e1ef",
      "#bfd2e7",
      "#a9c3df",
      "#94b4d7",
      "#5a82b0",
      "#083462",
      "#072b51",
      "#052240",
      "#04192f",
    ],
    dark: [
      "#C1C2C5",
      "#A6A7AB",
      "#909296",
      "#5C5F66",
      "#373A40",
      "#2C2E33",
      "#25262B",
      "#1A1B1E",
      "#141517",
      "#101113",
    ],
  },
  components: {
    Table: {
      defaultProps: {
        striped: true,
        highlightOnHover: true,
        withTableBorder: true,
        withColumnBorders: false,
        borderColor: "rgb(230, 230, 234)",
      },
      styles: {
        table: {
          borderRadius: "10px",
          overflow: "hidden",
          outline: "2px solid rgb(230, 230, 234)",
          outlineOffset: "-2px",
        },
      },
    },
    Modal: {
      defaultProps: {
        centered: true,
        size: "lg",
      },
      styles: {
        title: {
          fontWeight: 700,
          textAlign: "center",
          fontSize: "1.25rem",
          flex: 1,
          color: "var(--mantine-color-brand-6)",
        },
      },
    },
    Button: {
      defaultProps: {
        size: "md",
      },
    },
    Badge: {
      defaultProps: {
        variant: "light",
        color: "blue",
        size: "md",
        radius: "md",
      },
      styles: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          letterSpacing: 0,
          verticalAlign: "middle",
          transition:
            "background-color 120ms ease, color 120ms ease, border-color 120ms ease",
        },
        label: {
          lineHeight: 1.2,
        },
      },
    },
  },
});
