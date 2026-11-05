import * as Notifications from 'expo-notifications';
export async function requestNotificationPermissions() {
    const settings = await Notifications.getPermissionsAsync();
    if (settings.granted) {
        return true;
    }
    const result = await Notifications.requestPermissionsAsync();
    return result.granted;
}
export async function scheduleReminder(time) {
    const [hours, minutes] = time.split(':').map(Number);
    const trigger = {
        type: 'calendar',
        hour: hours,
        minute: minutes,
        repeats: true,
    };
    const id = await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Challenge Hub reminder',
            body: 'Time to complete your next challenge and keep your streak alive.',
        },
        trigger,
    });
    return id;
}
