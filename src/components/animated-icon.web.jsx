import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Animated as RNAnimated, StyleSheet, View } from 'react-native';
import Animated, { Keyframe, Easing } from 'react-native-reanimated';
import { useTheme } from '../hooks/use-theme';
const DURATION = 300;
export function AnimatedSplashOverlay({ ready }) {
    const theme = useTheme();
    const [opacity] = useState(() => new RNAnimated.Value(1));
    const [visible, setVisible] = useState(true);
    useEffect(() => {
        if (!ready)
            return undefined;
        const timer = setTimeout(() => {
            RNAnimated.timing(opacity, { toValue: 0, duration: 350, useNativeDriver: false })
                .start(({ finished }) => {
                    if (finished)
                        setVisible(false);
                });
        }, 250);
        return () => clearTimeout(timer);
    }, [opacity, ready]);
    if (!visible)
        return null;
    return (_jsx(RNAnimated.View, { pointerEvents: "none", style: [styles.splashOverlay, { backgroundColor: theme.background, opacity }], children: _jsx(Image, { style: styles.splashImage, source: require('../../assets/images/splash-icon.png'), contentFit: "contain" }) }));
}
const keyframe = new Keyframe({
    0: {
        transform: [{ scale: 0 }],
    },
    60: {
        transform: [{ scale: 1.2 }],
        easing: Easing.elastic(1.2),
    },
    100: {
        transform: [{ scale: 1 }],
        easing: Easing.elastic(1.2),
    },
});
const logoKeyframe = new Keyframe({
    0: {
        opacity: 0,
    },
    60: {
        transform: [{ scale: 1.2 }],
        opacity: 0,
        easing: Easing.elastic(1.2),
    },
    100: {
        transform: [{ scale: 1 }],
        opacity: 1,
        easing: Easing.elastic(1.2),
    },
});
const glowKeyframe = new Keyframe({
    0: {
        transform: [{ rotateZ: '-180deg' }, { scale: 0.8 }],
        opacity: 0,
    },
    [DURATION / 1000]: {
        transform: [{ rotateZ: '0deg' }, { scale: 1 }],
        opacity: 1,
        easing: Easing.elastic(0.7),
    },
    100: {
        transform: [{ rotateZ: '7200deg' }],
    },
});
export function AnimatedIcon() {
    return (_jsxs(View, { style: styles.iconContainer, children: [_jsx(Animated.View, { entering: glowKeyframe.duration(60 * 1000 * 4), style: styles.glow, children: _jsx(Image, { style: styles.glow, source: require('../../assets/images/logo-glow.png') }) }), _jsx(Animated.View, { style: styles.background, entering: keyframe.duration(DURATION) }), _jsx(Animated.View, { style: styles.imageContainer, entering: logoKeyframe.duration(DURATION), children: _jsx(Image, { style: styles.image, source: require('../../assets/images/expo-logo.png') }) })] }));
}
const styles = StyleSheet.create({
    splashOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    splashImage: {
        width: 320,
        height: 320,
    },
    container: {
        alignItems: 'center',
        width: '100%',
        zIndex: 1000,
        position: 'absolute',
        top: 128 / 2 + 138,
    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    glow: {
        width: 201,
        height: 201,
        position: 'absolute',
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 128,
        height: 128,
    },
    image: {
        position: 'absolute',
        width: 76,
        height: 71,
    },
    background: {
        width: 128,
        height: 128,
        position: 'absolute',
    },
});
