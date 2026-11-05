import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useTheme } from '../hooks/use-theme';
const INITIAL_SCALE_FACTOR = Dimensions.get('screen').height / 90;
const DURATION = 600;
export function AnimatedSplashOverlay({ ready }) {
    const theme = useTheme();
    const [visible, setVisible] = useState(true);
    const [nativeSplashHidden, setNativeSplashHidden] = useState(false);
    const [hideStarted, setHideStarted] = useState(false);
    if (!visible)
        return null;
    const animate = ready && nativeSplashHidden;
    const splashKeyframe = new Keyframe({
        0: {
            transform: [{ scale: 1 }],
            opacity: 1,
        },
        20: {
            opacity: 1,
        },
        70: {
            opacity: 0,
            easing: Easing.elastic(0.7),
        },
        100: {
            opacity: 0,
            transform: [{ scale: 1 }],
            easing: Easing.elastic(0.7),
        },
    });
    const image = _jsx(Image, { style: styles.splashImage, contentFit: "contain", source: require('../../assets/images/splash-icon.png') });
    return animate ? (_jsx(Animated.View, { entering: splashKeyframe.duration(DURATION).withCallback((finished) => {
            'worklet';
            if (finished) {
                scheduleOnRN(setVisible, false);
            }
        }), style: [styles.splashOverlay, { backgroundColor: theme.background }], children: image })) : (_jsx(View, { onLayout: () => {
            if (hideStarted)
                return;
            setHideStarted(true);
            SplashScreen.hideAsync().then(() => setNativeSplashHidden(true)).catch((error) => {
                console.error('Unable to hide the native splash screen before animating.', error);
                setNativeSplashHidden(true);
            });
        }, style: [styles.splashOverlay, { backgroundColor: theme.background }], children: image }));
}
const keyframe = new Keyframe({
    0: {
        transform: [{ scale: INITIAL_SCALE_FACTOR }],
    },
    100: {
        transform: [{ scale: 1 }],
        easing: Easing.elastic(0.7),
    },
});
const logoKeyframe = new Keyframe({
    0: {
        transform: [{ scale: 1.3 }],
        opacity: 0,
    },
    40: {
        transform: [{ scale: 1.3 }],
        opacity: 0,
        easing: Easing.elastic(0.7),
    },
    100: {
        opacity: 1,
        transform: [{ scale: 1 }],
        easing: Easing.elastic(0.7),
    },
});
const glowKeyframe = new Keyframe({
    0: {
        transform: [{ rotateZ: '0deg' }],
    },
    100: {
        transform: [{ rotateZ: '7200deg' }],
    },
});
export function AnimatedIcon() {
    const theme = useTheme();
    return (_jsxs(View, { style: styles.iconContainer, children: [_jsx(Animated.View, { entering: glowKeyframe.duration(60 * 1000 * 4), style: styles.glow, children: _jsx(Image, { style: styles.glow, source: require('../../assets/images/logo-glow.png') }) }), _jsx(Animated.View, { entering: keyframe.duration(DURATION), style: [styles.background, { backgroundColor: theme.primary }] }), _jsx(Animated.View, { style: styles.imageContainer, entering: logoKeyframe.duration(DURATION), children: _jsx(Image, { style: styles.image, source: require('../../assets/images/expo-logo.png') }) })] }));
}
const styles = StyleSheet.create({
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
        zIndex: 100,
    },
    image: {
        width: 76,
        height: 71,
    },
    splashImage: {
        width: 320,
        height: 320,
    },
    background: {
        borderRadius: 40,
        width: 128,
        height: 128,
        position: 'absolute',
    },
    splashOverlay: {
        ...StyleSheet.absoluteFill,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
});
