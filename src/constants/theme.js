import { Platform } from 'react-native';

export const COLORS = {
  background: '#101225',
  backgroundSecondary: '#15172B',

  surface: '#1C1D35',
  surfaceElevated: '#252743',

  primary: '#8B5CF6',
  primaryPressed: '#7C3AED',
  primaryLight: '#A78BFA',

  secondary: '#38BDF8',
  secondaryLight: '#7DD3FC',

  success: '#A3E635',
  warning: '#FBBF24',
  error: '#F87171',

  streak: '#FB923C',
  achievement: '#FBBF24',

  textPrimary: '#FFFFFF',
  textSecondary: '#A5A7BD',
  textDisabled: '#686B82',

  border: '#30314D',
  overlay: '#090B18',

  categories: {
    fitness: '#F472B6',
    learning: '#38BDF8',
    creativity: '#C084FC',
    productivity: '#2DD4BF',
    wellbeing: '#4ADE80',
    kindness: '#F472B6',
    sustainability: '#4ADE80',
  },
};

export const GRADIENTS = {
  primary: ['#8B5CF6', '#6366F1', '#38BDF8'],
  xp: ['#7C3AED', '#A78BFA'],
  streak: ['#F97316', '#FBBF24'],
  achievement: ['#D97706', '#FBBF24'],
};

export const Typography = {
  heading: 'Poppins_600SemiBold',
  section: 'Poppins_500Medium',
  body: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  button: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const THEME_MODE = 'dark';

const createTheme = (tokens) => ({
  ...tokens,
  text: tokens.textPrimary,
  backgroundElement: tokens.surface,
  backgroundSelected: tokens.surfaceElevated,
});

export const Themes = {
  dark: createTheme(COLORS),
  light: createTheme({
    ...COLORS,
    background: '#F7F7FC',
    backgroundSecondary: '#EEEEF7',
    surface: '#FFFFFF',
    surfaceElevated: '#F0F0FA',
    primary: '#7042D2',
    primaryPressed: '#5D32BE',
    primaryLight: '#7042D2',
    secondary: '#087BAA',
    secondaryLight: '#05658C',
    success: '#4D7C0F',
    warning: '#9A6700',
    error: '#B42318',
    streak: '#C2410C',
    achievement: '#9A6700',
    textPrimary: '#17182C',
    textSecondary: '#55586F',
    textDisabled: '#77798A',
    border: '#D8D8E6',
    overlay: '#090B18',
  }),
};

export const Colors = {
  light: {
    text: Themes.light.textPrimary,
    background: Themes.light.background,
    backgroundElement: Themes.light.surface,
    backgroundSelected: Themes.light.surfaceElevated,
    textSecondary: Themes.light.textSecondary,
  },
  dark: {
    text: Themes.dark.textPrimary,
    background: Themes.dark.background,
    backgroundElement: Themes.dark.surface,
    backgroundSelected: Themes.dark.surfaceElevated,
    textSecondary: Themes.dark.textSecondary,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-body)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
};

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
