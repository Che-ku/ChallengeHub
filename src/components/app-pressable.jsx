import { forwardRef } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/use-theme';

export const AppPressable = forwardRef(function AppPressable({ style, ...props }, ref) {
  const theme = useTheme();
  const baseStyle = StyleSheet.flatten(style);

  return (
    <Pressable
      ref={ref}
      {...props}
      style={({ pressed }) => [
        { minHeight: 44 },
        style,
        pressed && (baseStyle?.backgroundColor === theme.primary
          ? { backgroundColor: theme.primaryPressed }
          : { opacity: 0.8 }),
      ]}
    />
  );
});
