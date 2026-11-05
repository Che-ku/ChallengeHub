import { Platform, StyleSheet } from 'react-native';
import { AppText } from './app-text';
import { Fonts, Typography } from '../constants/theme';
import { useTheme } from '../hooks/use-theme';

export function ThemedText({ style, type = 'default', themeColor, ...rest }) {
  const theme = useTheme();
  const color = type === 'linkPrimary'
    ? theme.primaryLight
    : theme[themeColor ?? 'text'];

  return <AppText style={[{ color }, styles[type], style]} {...rest} />;
}

const styles = StyleSheet.create({
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: Typography.body,
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    fontFamily: Typography.medium,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    fontFamily: Typography.body,
  },
  title: {
    fontSize: 48,
    fontWeight: '600',
    lineHeight: 52,
    fontFamily: Typography.heading,
  },
  subtitle: {
    fontSize: 32,
    lineHeight: 44,
    fontWeight: '600',
    fontFamily: Typography.heading,
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
    fontFamily: Typography.body,
  },
  linkPrimary: {
    lineHeight: 30,
    fontSize: 14,
    fontFamily: Typography.button,
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: '700' }) ?? '500',
    fontSize: 12,
  },
});
