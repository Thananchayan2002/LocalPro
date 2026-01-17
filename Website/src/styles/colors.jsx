// Color configuration aligned to the shared palette defined in App.css
export const colors = {
  primary: {
    DEFAULT: "var(--color-primary)",
    light: "var(--color-primary-soft)",
    dark: "var(--color-primary-strong)",
    gradient:
      "linear-gradient(135deg, var(--color-primary), var(--color-primary-strong))",
  },
  secondary: {
    DEFAULT: "var(--color-secondary)",
    light: "var(--color-secondary-soft)",
    dark: "var(--color-secondary-strong)",
    gradient:
      "linear-gradient(135deg, var(--color-secondary), var(--color-secondary-strong))",
  },
  success: {
    DEFAULT: "var(--color-success)",
    light: "var(--color-success-strong)",
    bg: "var(--color-success-soft)",
  },
  warning: {
    DEFAULT: "var(--color-danger)",
    light: "var(--color-danger-strong)",
    bg: "var(--color-danger-soft)",
  },
  error: {
    DEFAULT: "var(--color-danger)",
    light: "var(--color-danger-strong)",
    bg: "var(--color-danger-soft)",
  },
  neutral: {
    50: "var(--color-surface-alt)",
    100: "var(--color-border)",
    200: "var(--color-border)",
    300: "var(--color-border-strong)",
    400: "var(--color-text-subtle)",
    500: "var(--color-text-muted)",
    600: "var(--color-text-muted)",
    700: "var(--color-text)",
    800: "var(--color-text)",
    900: "var(--color-text)",
  },
  background: {
    primary: "var(--color-surface)",
    secondary: "var(--color-surface-alt)",
    tertiary: "var(--color-border)",
  },
  text: {
    primary: "var(--color-text)",
    secondary: "var(--color-text-muted)",
    tertiary: "var(--color-text-subtle)",
    inverse: "var(--color-surface)",
  },
  border: {
    light: "var(--color-border)",
    DEFAULT: "var(--color-border)",
    dark: "var(--color-border-strong)",
  },
  category: {
    blue: { bg: "var(--color-primary-soft)", text: "var(--color-primary)" },
    yellow: { bg: "var(--color-surface-alt)", text: "var(--color-text-muted)" },
    orange: { bg: "var(--color-surface-alt)", text: "var(--color-text-muted)" },
    green: { bg: "var(--color-success-soft)", text: "var(--color-success)" },
    purple: {
      bg: "var(--color-primary-soft)",
      text: "var(--color-primary-strong)",
    },
    cyan: { bg: "var(--color-primary-soft)", text: "var(--color-primary)" },
    emerald: { bg: "var(--color-success-soft)", text: "var(--color-success)" },
    rose: { bg: "var(--color-danger-soft)", text: "var(--color-danger)" },
  },
};

// Tailored utility class tokens that map to palette-aware styles
export const getColorClasses = () => ({
  btnPrimary: "btn-primary",
  btnSecondary: "btn-secondary",
  btnIcon: "btn-icon",
  card: "card-surface",
  input: "input-surface",
  badge: "badge-primary",
  verified: "text-primary",
  rating: "text-success fill-current",
});
