import { StyleSheet, Text as NativeText } from 'react-native';
import { Typography } from '../constants/theme';

function getFontFamily(style) {
  if (style.fontFamily) return style.fontFamily;
  const weight = Number.parseInt(style.fontWeight ?? '400', 10);
  if (style.fontSize >= 24) return Typography.heading;
  if (style.fontSize >= 17 && weight >= 600) return Typography.section;
  if (weight >= 700) return style.fontSize <= 16 ? Typography.button : Typography.bold;
  if (weight >= 500) return Typography.medium;
  return Typography.body;
}

export function AppText({ style, ...props }) {
  const flattenedStyle = StyleSheet.flatten(style) ?? {};
  return (
    <NativeText
      {...props}
      style={[{ fontFamily: getFontFamily(flattenedStyle) }, style]}
    />
  );
}
