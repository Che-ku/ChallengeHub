export function computeStreakDates(completions) {
    const dates = Array.from(new Set(completions.map((completion) => new Date(completion.completionDate).toISOString().slice(0, 10)))).sort();
    if (!dates.length)
        return { current: 0, longest: 0 };
    let longest = 1;
    let current = 1;
    for (let index = 1; index < dates.length; index += 1) {
        const previous = new Date(dates[index - 1]);
        const currentDate = new Date(dates[index]);
        const diffInDays = Math.round((currentDate.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
        if (diffInDays === 1) {
            current += 1;
            longest = Math.max(longest, current);
        }
        else if (diffInDays === 0) {
            continue;
        }
        else {
            current = 1;
        }
    }
    return { current, longest };
}
export function getTodayKey(date = new Date()) {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
