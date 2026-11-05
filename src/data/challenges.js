import { COLORS } from '../constants/theme';

const challengeTemplates = [
    {
        title: 'Morning Stretch Reset',
        description: 'Wake up your body with a focused mobility flow.',
        instructions: 'Complete 10 minutes of dynamic stretching, focus on hips, calves, and shoulders.',
        category: 'Fitness',
        difficulty: 'Easy',
        duration: 10,
        imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
    },
    {
        title: 'Deep Work Sprint',
        description: 'Block out distractions and focus for a meaningful work session.',
        instructions: 'Set a timer for 25 minutes, close all tabs unrelated to your goal, and complete one important task.',
        category: 'Productivity',
        difficulty: 'Medium',
        duration: 25,
        imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
    },
    {
        title: 'Journal Reflection',
        description: 'Capture your thoughts and reset your energy.',
        instructions: 'Write three insights from your day and one action you want to improve tomorrow.',
        category: 'Wellbeing',
        difficulty: 'Easy',
        duration: 15,
        imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80',
    },
    {
        title: 'Tea Break Walk',
        description: 'Take a short walk and reset your attention.',
        instructions: 'Take a 15-minute walk without your phone and notice your breathing and mood.',
        category: 'Wellbeing',
        difficulty: 'Easy',
        duration: 15,
        imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    },
    {
        title: 'Read One Chapter',
        description: 'Build a healthy learning habit with focused reading.',
        instructions: 'Read one chapter or 20 pages from a book or notes and summarize the key idea.',
        category: 'Learning',
        difficulty: 'Medium',
        duration: 20,
        imageUrl: 'https://images.unsplash.com/photo-1516979187454-437ec8d23b31?auto=format&fit=crop&w=900&q=80',
    },
    {
        title: 'Sketch a Concept',
        description: 'Let creativity flow without perfectionism.',
        instructions: 'Create a quick concept board or sketch a new idea for 20 minutes.',
        category: 'Creativity',
        difficulty: 'Medium',
        duration: 20,
        imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=900&q=80',
    },
    {
        title: 'Plant-Based Meal Prep',
        description: 'Choose one nourishing meal and prepare it mindfully.',
        instructions: 'Cook a simple healthy meal, focus on ingredients, and pack leftovers for later.',
        category: 'Fitness',
        difficulty: 'Medium',
        duration: 30,
        imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
    },
    {
        title: 'Inbox Zero Sprint',
        description: 'Clear the clutter and create momentum.',
        instructions: 'Organize your inbox or to-do list until the next task list is clean and actionable.',
        category: 'Productivity',
        difficulty: 'Easy',
        duration: 15,
        imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
    },
    {
        title: 'Mindful Breathing Session',
        description: 'Reduce stress with a deliberate breathing practice.',
        instructions: 'Spend 10 minutes in box breathing or alternate nostril breathing.',
        category: 'Wellbeing',
        difficulty: 'Easy',
        duration: 10,
        imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80',
    },
    {
        title: 'Vocabulary Builder',
        description: 'Sharpen your language skills in a focused burst.',
        instructions: 'Learn 10 new words, write them down, and use three in a sentence.',
        category: 'Learning',
        difficulty: 'Easy',
        duration: 15,
        imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80',
    },
    {
        title: 'Creative Mini-Project',
        description: 'Make something tangible in under 30 minutes.',
        instructions: 'Sketch, write a short poem, or build a simple prototype from a single prompt.',
        category: 'Creativity',
        difficulty: 'Hard',
        duration: 30,
        imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
    },
    {
        title: 'Workout Circuit',
        description: 'Build strength and discipline with a short circuit.',
        instructions: 'Complete 3 rounds of bodyweight squats, pushups, lunges, and planks.',
        category: 'Fitness',
        difficulty: 'Hard',
        duration: 25,
        imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
    },
];

const expandedChallengeGroups = [
    {
        category: 'Fitness',
        imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
        challenges: [
            ['Mobility Flow', 'Loosen up after a long day with gentle full-body movement.', 'Move through hip circles, shoulder rolls, calf stretches, and comfortable spinal twists for 12 minutes.', 'Easy', 12],
            ['Brisk Neighborhood Walk', 'Get outside and add a little movement to your day.', 'Walk at a pace that feels energizing for 20 minutes. Choose a safe, familiar route and adjust the pace as needed.', 'Easy', 20],
            ['Desk Break Movement', 'Reset your posture with a short movement break.', 'Stand, stretch your arms overhead, do gentle seated twists, and take a few laps around your room for 8 minutes.', 'Easy', 8],
            ['Beginner Bodyweight Set', 'Build strength with a no-equipment routine.', 'Complete two comfortable rounds of chair squats, wall push-ups, and glute bridges, resting whenever needed.', 'Medium', 15],
            ['Balance Practice', 'Practice steady, controlled balance in a safe space.', 'Stand near a stable support and practice single-leg balance on each side for three short rounds.', 'Easy', 10],
            ['Stair Climb Session', 'Add a simple cardio interval to your routine.', 'Walk up and down a safe flight of stairs at a comfortable pace for 10 minutes, taking breaks as needed.', 'Medium', 10],
            ['Core Stability Basics', 'Practice controlled core movements at your own pace.', 'Complete two rounds of dead bugs, bird dogs, and modified side planks, stopping if anything feels painful.', 'Medium', 18],
            ['Dance Break', 'Move to music and lift your energy.', 'Choose three favorite songs and dance or move in a way that feels comfortable for their duration.', 'Easy', 12],
            ['Recovery Stretch', 'Give your muscles a gentle recovery session.', 'Spend 15 minutes on relaxed hamstring, chest, hip, and shoulder stretches without forcing any range of motion.', 'Easy', 15],
            ['Walk and Notice', 'Combine light activity with attention to your surroundings.', 'Take a 25-minute walk and notice five things you can see, hear, or feel along the route.', 'Medium', 25],
            ['Personal Movement Mix', 'Create a short routine from movements you enjoy.', 'Pick four gentle movements, set a 20-minute timer, and alternate them with breaks at a comfortable effort.', 'Medium', 20],
        ],
    },
    {
        category: 'Learning',
        imageUrl: 'https://images.unsplash.com/photo-1516979187454-437ec8d23b31?auto=format&fit=crop&w=900&q=80',
        challenges: [
            ['Teach Back a New Idea', 'Strengthen understanding by explaining it simply.', 'Learn one new concept, then explain it aloud or in writing as if introducing it to a beginner.', 'Medium', 20],
            ['Curiosity Question', 'Follow one question that has been on your mind.', 'Write a question, consult a reliable book or source, and note three useful things you learned.', 'Easy', 15],
            ['Language Listening Practice', 'Build listening fluency in a language you are learning.', 'Listen to a short beginner-friendly audio clip and write down five words or phrases you recognize.', 'Easy', 15],
            ['Memory Map', 'Organize what you know into a visual overview.', 'Choose a topic and sketch its main ideas and connections from memory, then check one reference for gaps.', 'Medium', 20],
            ['Science in Everyday Life', 'Explore the science behind an ordinary experience.', 'Pick something you noticed today and read a short reliable explanation of how it works. Summarize it in your own words.', 'Easy', 20],
            ['Skill Tutorial Practice', 'Turn a short tutorial into hands-on learning.', 'Follow one beginner tutorial in a skill you want to learn and practice the steps for at least 20 minutes.', 'Medium', 25],
            ['History Snapshot', 'Learn about a person, place, or event from history.', 'Read a short source about a historical topic and record its date, context, and one question you still have.', 'Easy', 20],
            ['Vocabulary in Context', 'Make new vocabulary easier to remember.', 'Choose five useful words, look up their meanings, and write an original sentence for each one.', 'Easy', 15],
            ['Read and Reflect', 'Make time for focused reading and reflection.', 'Read for 20 minutes, then write one key idea and one way it connects to something you already know.', 'Medium', 25],
            ['Practice a Mental Model', 'Try a practical framework for thinking through a decision.', 'Learn one simple thinking framework and apply it to a low-stakes choice you are making this week.', 'Medium', 20],
            ['Question a Claim', 'Practice checking information before accepting it.', 'Choose a factual claim, find two credible sources about it, and note what each source supports.', 'Hard', 30],
        ],
    },
    {
        category: 'Creativity',
        imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=900&q=80',
        challenges: [
            ['One-Color Sketch', 'Make a small artwork with a playful limitation.', 'Create a quick sketch using only one color. Focus on shapes and marks rather than making it perfect.', 'Easy', 15],
            ['Found Object Still Life', 'Practice noticing form and light around you.', 'Arrange three everyday objects and draw or photograph them from one viewpoint.', 'Easy', 20],
            ['Six-Word Story', 'Tell a tiny story with a strict word limit.', 'Write five different stories, each exactly six words, then choose a favorite.', 'Easy', 15],
            ['Invent a Tiny Tool', 'Imagine a simple solution to a small everyday annoyance.', 'Sketch a tool or app that could help with a minor daily problem and label its three most useful features.', 'Medium', 25],
            ['Soundtrack a Scene', 'Use music to create a mood for an imagined scene.', 'Choose three pieces of music for the beginning, middle, and end of an imaginary short film. Give the scene a title.', 'Easy', 20],
            ['Photo Texture Hunt', 'Find patterns and textures in familiar surroundings.', 'Take five original photos of different textures nearby and arrange them into a simple visual collection.', 'Easy', 20],
            ['Rewrite a Routine', 'Use creative writing to reimagine an ordinary moment.', 'Describe a familiar routine as if it were taking place in a different setting or time period.', 'Medium', 20],
            ['Paper Prototype', 'Explore an idea with a quick hands-on mock-up.', 'Fold or sketch a paper prototype for a small product idea, then label how someone would use it.', 'Medium', 25],
            ['Make a Mini Collage', 'Combine images and words into a small visual story.', 'Use scrap paper or digital shapes to make a collage around a mood, place, or idea.', 'Medium', 25],
            ['Draw Without Lifting', 'Loosen your approach with a continuous-line exercise.', 'Draw a familiar object using one continuous line without lifting your pen. Try it three times.', 'Easy', 15],
            ['Creative Remix', 'Create something new by combining two unrelated ideas.', 'Pick two random objects or themes and make a short poem, sketch, or concept that includes both.', 'Hard', 30],
        ],
    },
    {
        category: 'Productivity',
        imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
        challenges: [
            ['Choose the Next Action', 'Make a stalled task easier to begin.', 'Pick one task you have been putting off and write the smallest physical next action. Do that action now.', 'Easy', 15],
            ['Tidy One Digital Folder', 'Make one small part of your digital workspace easier to use.', 'Choose a single folder, rename unclear files, and remove only items you are sure you no longer need.', 'Easy', 15],
            ['Plan Tomorrow', 'End the day with a clear starting point for tomorrow.', 'Write down your top three priorities for tomorrow and identify the first step for the most important one.', 'Easy', 10],
            ['Meeting-Free Focus Block', 'Protect a short block for one meaningful task.', 'Choose one task, silence optional notifications, and work on it for 30 minutes before checking messages.', 'Medium', 30],
            ['Inbox Triage', 'Reduce email clutter without trying to solve everything at once.', 'Spend 15 minutes archiving, labeling, or flagging messages. Reply only to messages that take two minutes or less.', 'Easy', 15],
            ['Break a Big Task Down', 'Turn an overwhelming task into manageable pieces.', 'Write the outcome you want, divide it into five or fewer steps, and schedule the first step.', 'Medium', 20],
            ['Workspace Reset', 'Prepare a comfortable place to focus.', 'Clear one work surface, gather the items you need, and put away unrelated items for 10 minutes.', 'Easy', 10],
            ['Batch Small Tasks', 'Handle several quick tasks together with a time limit.', 'List small tasks that each take under five minutes and complete as many as you comfortably can in 20 minutes.', 'Medium', 20],
            ['Calendar Reality Check', 'Make your schedule more realistic.', 'Review the next two days, add travel or transition time, and move one task if your calendar is overfilled.', 'Medium', 15],
            ['Write a Reusable Checklist', 'Make a repeated process easier to remember.', 'Choose one routine you repeat and write a short checklist of its key steps.', 'Easy', 20],
            ['Close the Loop', 'Finish or clearly hand off one open commitment.', 'Choose one outstanding message or task and either complete it, reply with a clear next step, or schedule time for it.', 'Hard', 25],
        ],
    },
    {
        category: 'Wellbeing',
        imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80',
        challenges: [
            ['Five-Minute Breathing Pause', 'Create a calm pause in the middle of your day.', 'Sit comfortably and breathe at a natural pace for five minutes, returning your attention gently when it wanders.', 'Easy', 5],
            ['Name the Feeling', 'Make space to notice and describe your current mood.', 'Write down how you feel, what may have contributed to it, and one kind thing you can do for yourself.', 'Easy', 10],
            ['Screen-Free Wind Down', 'Create a little more quiet before bedtime.', 'Set aside your phone or other screens for 20 minutes and choose a relaxing offline activity instead.', 'Easy', 20],
            ['Step Outside Reset', 'Get a brief change of scenery and fresh air.', 'Spend 10 minutes outside or by an open window, noticing the air, light, and sounds around you.', 'Easy', 10],
            ['Gratitude Details', 'Notice specific moments that felt meaningful today.', 'Write three small details from today that you appreciated and why each one mattered to you.', 'Easy', 10],
            ['Hydration Check-In', 'Pause and check whether you need a drink.', 'Have a glass of water if it is appropriate for you, and set a reminder to check in with your needs later.', 'Easy', 5],
            ['Gentle Body Scan', 'Notice physical sensations without judging them.', 'Take 10 quiet minutes to notice sensations from your feet to your head, adjusting your position for comfort.', 'Easy', 10],
            ['Restful Reading', 'Make a small pocket of time for enjoyable reading.', 'Read something you enjoy for 15 minutes in a comfortable place, without a goal to finish a set number of pages.', 'Easy', 15],
            ['Reach Out for Support', 'Reconnect with someone you trust.', 'Send a brief message to someone you trust to say hello or ask for a conversation when it works for both of you.', 'Easy', 10],
            ['Make a Comfort List', 'Prepare a list of small activities that help you recharge.', 'Write five accessible things that tend to help you feel settled, then choose one to try today.', 'Medium', 15],
            ['Unhurried Meal', 'Give one meal a little more attention.', 'If practical, sit down for a meal without multitasking and notice its taste, texture, and how you feel afterward.', 'Medium', 20],
        ],
    },
    {
        category: 'Kindness',
        imageUrl: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=900&q=80',
        challenges: [
            ['Send a Thank-You Note', 'Let someone know you appreciate something they did.', 'Write a short, specific thank-you message to someone who helped you, and send it if appropriate.', 'Easy', 10],
            ['Offer a Genuine Compliment', 'Notice and name something you value in another person.', 'Give someone a sincere, specific compliment about their effort, idea, or thoughtful action.', 'Easy', 5],
            ['Listen Without Interrupting', 'Give someone your full attention in conversation.', 'In a conversation today, focus on understanding the other person before preparing your reply.', 'Medium', 15],
            ['Share Useful Knowledge', 'Help someone with something you already know.', 'Offer a practical tip, resource, or explanation to someone who could use it, without expecting anything in return.', 'Easy', 15],
            ['Make Room for Someone', 'Create a small moment of welcome or inclusion.', 'Invite someone into a conversation or activity, or make space for a quieter person to contribute.', 'Medium', 10],
            ['Support a Local Cause', 'Find a small, realistic way to support your community.', 'Look up a local community group or mutual-aid organization and learn one appropriate way to support its work.', 'Medium', 20],
            ['Leave a Helpful Review', 'Recognize a small business or service that treated you well.', 'Write a fair and specific positive review for a local place or service you genuinely recommend.', 'Easy', 10],
            ['Offer Practical Help', 'Offer a manageable form of help to someone you know.', 'Ask someone if there is one small practical task you can help with, and respect their answer.', 'Medium', 15],
            ['Reconnect Thoughtfully', 'Let someone know you are thinking of them.', 'Send a warm, low-pressure message to someone you have not spoken with recently and give them room to respond later.', 'Easy', 10],
            ['Share Credit', 'Recognize another person’s contribution to a shared effort.', 'In a group or work setting, name one specific contribution someone else made and give them credit.', 'Medium', 10],
            ['Kindness Reflection', 'Notice how everyday kindness shows up around you.', 'Write down one kind action you witnessed or received and one small way you might pass that care along.', 'Easy', 10],
        ],
    },
    {
        category: 'Sustainability',
        imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=900&q=80',
        challenges: [
            ['Reusable Bag Reminder', 'Make reusable bags easier to remember next time.', 'Put a reusable bag by your keys or in your everyday carry so it is ready for your next shopping trip.', 'Easy', 5],
            ['Low-Waste Lunch', 'Try a meal with fewer disposable extras.', 'Prepare or choose a lunch using reusable containers or utensils where convenient and safe.', 'Easy', 20],
            ['Repair Before Replacing', 'Check whether a small household item can be repaired.', 'Choose one item that needs attention and look up a safe repair option before deciding whether to replace it.', 'Medium', 20],
            ['Sort Household Recycling', 'Learn what your local recycling program accepts.', 'Check your local guidance and sort a small batch of clean recyclables according to its rules.', 'Easy', 15],
            ['Unplug One Idle Device', 'Reduce standby power from an unused device.', 'Identify one device that can safely be unplugged when not in use and add a reminder or habit to do so.', 'Easy', 5],
            ['Plan a Plant-Forward Meal', 'Explore a satisfying meal centered on plant ingredients.', 'Find or prepare one plant-forward meal using ingredients available to you, without needing to change your whole diet.', 'Medium', 25],
            ['Choose a Walkable Errand', 'Consider a lower-impact option for a nearby trip.', 'For a short errand, consider walking, cycling, or public transit if the route and your needs make it safe and practical.', 'Medium', 20],
            ['Save Water at Home', 'Notice one small opportunity to use water thoughtfully.', 'Check for a running tap or avoidable water use and make one practical adjustment that works for your household.', 'Easy', 10],
            ['Borrow or Share an Item', 'Explore sharing before buying something for one-time use.', 'Ask a neighbor, friend, or local lending group about borrowing one item you only need occasionally.', 'Medium', 15],
            ['Nature Observation', 'Spend a few minutes noticing local plants or wildlife.', 'Observe a nearby green space from a respectful distance and identify three plants, birds, or other natural details.', 'Easy', 15],
            ['Find a Local Reuse Option', 'Learn where an item can be reused or donated locally.', 'Choose one clean item you no longer need and find a responsible local donation, reuse, or repair option for it.', 'Medium', 20],
        ],
    },
];

const expandedChallenges = expandedChallengeGroups.flatMap(({ category, imageUrl, challenges }) => (
    challenges.map(([title, description, instructions, difficulty, duration]) => ({
        title,
        description,
        instructions,
        category,
        difficulty,
        duration,
        imageUrl,
    }))
));

challengeTemplates.push(...expandedChallenges);

export const CHALLENGE_CATEGORIES = [...new Set(challengeTemplates.map((challenge) => challenge.category))];
export const DEFAULT_BADGES = [
    { id: 'first-step', name: 'First Step', description: 'Complete your first challenge.', icon: '🏁', unlocked: false },
    { id: 'getting-started', name: 'Getting Started', description: 'Complete 5 challenges.', icon: '🌱', unlocked: false },
    { id: 'challenge-explorer', name: 'Challenge Explorer', description: 'Complete 10 challenges.', icon: '🧭', unlocked: false },
    { id: 'dedicated-learner', name: 'Dedicated Learner', description: 'Complete 25 challenges.', icon: '📘', unlocked: false },
    { id: 'challenge-master', name: 'Challenge Master', description: 'Complete 50 challenges.', icon: '🏆', unlocked: false },
    { id: 'streak-3', name: '3-Day Streak', description: 'Maintain a 3-day streak.', icon: '🔥', unlocked: false },
    { id: 'streak-7', name: '7-Day Streak', description: 'Maintain a 7-day streak.', icon: '⚡', unlocked: false },
    { id: 'streak-14', name: '14-Day Streak', description: 'Maintain a 14-day streak.', icon: '💪', unlocked: false },
    { id: 'streak-30', name: '30-Day Streak', description: 'Maintain a 30-day streak.', icon: '🌟', unlocked: false },
    { id: 'fitness-enthusiast', name: 'Fitness Enthusiast', description: 'Complete 10 fitness challenges.', icon: '💪', unlocked: false },
    { id: 'knowledge-seeker', name: 'Knowledge Seeker', description: 'Complete 10 learning challenges.', icon: '🧠', unlocked: false },
    { id: 'creative-mind', name: 'Creative Mind', description: 'Complete 10 creativity challenges.', icon: '🎨', unlocked: false },
    { id: 'productivity-pro', name: 'Productivity Pro', description: 'Complete 10 productivity challenges.', icon: '🚀', unlocked: false },
    { id: 'wellness-champion', name: 'Wellness Champion', description: 'Complete 10 wellbeing challenges.', icon: '🌿', unlocked: false },
    { id: 'kindness-champion', name: 'Kindness Champion', description: 'Complete 10 kindness challenges.', icon: '💛', unlocked: false },
    { id: 'sustainability-champion', name: 'Earth Steward', description: 'Complete 10 sustainability challenges.', icon: '🌎', unlocked: false },
    { id: 'goal-getter', name: 'Goal Getter', description: 'Complete a weekly goal.', icon: '✅', unlocked: false },
];
export function buildChallengeLibrary() {
    return challengeTemplates.map((challenge, index) => ({
        ...challenge,
        id: `challenge-${index + 1}`,
        xpReward: challenge.difficulty === 'Easy' ? 10 : challenge.difficulty === 'Medium' ? 25 : 50,
    }));
}
function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
const currentDate = new Date();
const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
const weekStart = new Date(currentDate);
weekStart.setDate(currentDate.getDate() - ((currentDate.getDay() + 6) % 7));
const weekEnd = new Date(weekStart);
weekEnd.setDate(weekStart.getDate() + 6);
export const DEFAULT_SEASONS = [
    {
        id: 'learning-month',
        title: 'Learning Month',
        description: 'Build a consistent learning streak with reading and study challenges.',
        startDate: formatLocalDate(monthStart),
        endDate: formatLocalDate(monthEnd),
        challengeIds: ['challenge-5', 'challenge-10'],
        isActive: true,
    },
    {
        id: 'healthy-lifestyle-week',
        title: 'Healthy Lifestyle Week',
        description: 'Focus on fitness and wellbeing habits for the week.',
        startDate: formatLocalDate(weekStart),
        endDate: formatLocalDate(weekEnd),
        challengeIds: ['challenge-1', 'challenge-9', 'challenge-12'],
        isActive: true,
    },
];
export const DEFAULT_TEAM = {
    id: 'team-alpha',
    name: 'Campus Momentum',
    members: ['demo-user'],
    createdBy: 'demo-user',
    challengeId: 'challenge-3',
    createdAt: new Date().toISOString(),
};
export function getDifficultyColor() {
    return COLORS.textSecondary;
}
export function getCategoryColor(category) {
    const categoryKey = category.toLowerCase();
    return COLORS.categories[categoryKey] ?? COLORS.textDisabled;
}
