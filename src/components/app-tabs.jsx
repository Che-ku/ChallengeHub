import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NativeTabs } from 'expo-router/native-tabs';
import { useTheme } from '../hooks/use-theme';
export default function AppTabs() {
    const colors = useTheme();
    return (_jsxs(NativeTabs, { backgroundColor: colors.background, indicatorColor: colors.backgroundElement, labelStyle: { selected: { color: colors.text } }, children: [_jsxs(NativeTabs.Trigger, { name: "index", children: [_jsx(NativeTabs.Trigger.Label, { children: "Home" }), _jsx(NativeTabs.Trigger.Icon, { src: require('../../assets/images/tabIcons/home.png'), renderingMode: "template" })] }), _jsxs(NativeTabs.Trigger, { name: "explore", children: [_jsx(NativeTabs.Trigger.Label, { children: "Explore" }), _jsx(NativeTabs.Trigger.Icon, { src: require('../../assets/images/tabIcons/explore.png'), renderingMode: "template" })] })] }));
}
