/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */
import { useMemo } from 'react';
import { THEME_MODE, Themes } from '../constants/theme';
import { useColorScheme } from './use-color-scheme';

export function useThemeMode() {
    const scheme = useColorScheme();
    return THEME_MODE === 'system'
        ? scheme === 'light' ? 'light' : 'dark'
        : THEME_MODE;
}

export function useTheme() {
    return Themes[useThemeMode()];
}

export function useThemeStyles(createStyles) {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [createStyles, theme]);
    return { theme, styles };
}
