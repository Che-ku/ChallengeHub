import { doc, runTransaction } from 'firebase/firestore';
import { firestoreDb } from '../config/firebase';
import { DEFAULT_BADGES } from '../data/challenges';
export function calculateLevel(xp) {
    let level = 1;
    let threshold = 100;
    while (xp >= threshold) {
        level += 1;
        threshold += 150 + (level - 2) * 50;
    }
    return level;
}
export function calculateProgressToNextLevel(xp) {
    let level = 1;
    let threshold = 100;
    let previous = 0;
    while (xp >= threshold) {
        previous = threshold;
        level += 1;
        threshold += 150 + (level - 2) * 50;
    }
    const nextThreshold = threshold;
    const currentRangeStart = previous;
    const xpIntoLevel = xp - currentRangeStart;
    const totalNeeded = nextThreshold - currentRangeStart;
    return {
        currentLevel: level,
        nextLevelThreshold: nextThreshold,
        progressPct: totalNeeded > 0 ? Math.min((xpIntoLevel / totalNeeded) * 100, 100) : 0,
        xpIntoLevel,
    };
}
function localDateKey(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return null;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function getStreakStats(completions) {
    const dates = new Set(completions.map((entry) => localDateKey(entry.completionDate)).filter(Boolean));
    const sortedDates = [...dates].sort();
    let longest = 0;
    let run = 0;
    let previousDay = null;
    for (const date of sortedDates) {
        const day = Date.parse(`${date}T00:00:00Z`);
        run = previousDay !== null && day - previousDay === 86400000 ? run + 1 : 1;
        longest = Math.max(longest, run);
        previousDay = day;
    }
    const today = localDateKey(new Date());
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    let cursor = dates.has(today) ? today : dates.has(localDateKey(yesterdayDate)) ? localDateKey(yesterdayDate) : null;
    let current = 0;
    while (cursor && dates.has(cursor)) {
        current += 1;
        const previous = new Date(`${cursor}T00:00:00`);
        previous.setDate(previous.getDate() - 1);
        cursor = localDateKey(previous);
    }
    return { current, longest };
}
export async function awardCompletion(userId, completion) {
    if (!firestoreDb)
        return;
    const userRef = doc(firestoreDb, 'users', userId);
    await runTransaction(firestoreDb, async (transaction) => {
        const snapshot = await transaction.get(userRef);
        const current = snapshot.data();
        const existingXP = Number(current?.totalXP ?? 0);
        const nextXP = existingXP + completion.xpEarned;
        const nextLevel = calculateLevel(nextXP);
        transaction.update(userRef, {
            totalXP: nextXP,
            currentLevel: nextLevel,
            updatedAt: new Date().toISOString(),
        });
    });
}
export function computeBadgeUnlocks(completions, currentStreak, weeklyGoalComplete) {
    const countsByCategory = {};
    completions.forEach((completion) => {
        countsByCategory[completion.category] = (countsByCategory[completion.category] ?? 0) + 1;
    });
    const total = completions.length;
    const unlockRules = {
        'first-step': total >= 1,
        'getting-started': total >= 5,
        'challenge-explorer': total >= 10,
        'dedicated-learner': total >= 25,
        'challenge-master': total >= 50,
        'streak-3': currentStreak >= 3,
        'streak-7': currentStreak >= 7,
        'streak-14': currentStreak >= 14,
        'streak-30': currentStreak >= 30,
        'fitness-enthusiast': (countsByCategory.Fitness ?? 0) >= 10,
        'knowledge-seeker': (countsByCategory.Learning ?? 0) >= 10,
        'creative-mind': (countsByCategory.Creativity ?? 0) >= 10,
        'productivity-pro': (countsByCategory.Productivity ?? 0) >= 10,
        'wellness-champion': (countsByCategory.Wellbeing ?? 0) >= 10,
        'kindness-champion': (countsByCategory.Kindness ?? 0) >= 10,
        'sustainability-champion': (countsByCategory.Sustainability ?? 0) >= 10,
        'goal-getter': weeklyGoalComplete,
    };

    return DEFAULT_BADGES
        .filter((badge) => unlockRules[badge.id])
        .map((badge) => ({ ...badge, unlocked: true }));
}
