import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchAuthenticatedGitHubUser, fetchGitHubStats } from '../utils/github';
export const useStore = create()(persist((set, get) => ({
    username: null,
    token: null,
    stats: null,
    characterName: 'CodeWaifu',
    loading: false,
    error: null,
    mood: 'idle',
    unlockedAchievements: [],
    lastSeenLevel: 1,
    connect: async (username, token) => {
        set({ loading: true, error: null, mood: 'climbing' });
        try {
            const stats = await fetchGitHubStats(username.trim(), token, { force: true });
            set({ username: stats.user.login, token: token ?? null, stats, loading: false });
            get().triggerMood('rumbaDancing', 3200);
        }
        catch (e) {
            set({
                loading: false,
                error: e instanceof Error ? e.message : 'Помилка завантаження',
            });
            get().triggerMood('sad', 2600);
            throw e;
        }
    },
    connectWithGitHub: async (token) => {
        set({ loading: true, error: null, mood: 'climbing' });
        try {
            const user = await fetchAuthenticatedGitHubUser(token);
            const stats = await fetchGitHubStats(user.login, token, { force: true });
            set({ username: stats.user.login, token, stats, loading: false });
            get().triggerMood('rumbaDancing', 3200);
        }
        catch (e) {
            set({
                loading: false,
                error: e instanceof Error ? e.message : 'GitHub OAuth помилка',
            });
            get().triggerMood('sad', 2600);
            throw e;
        }
    },
    refresh: async () => {
        const { username, token } = get();
        if (!username)
            return;
        set({ loading: true, error: null, mood: 'climbing' });
        try {
            const stats = await fetchGitHubStats(username, token ?? undefined, { force: true });
            set({ stats, loading: false });
            get().triggerMood('sittingLaughing', 2200);
        }
        catch (e) {
            set({
                loading: false,
                error: e instanceof Error ? e.message : 'Помилка',
            });
            get().triggerMood('sad', 2600);
        }
    },
    logout: () => set({
        username: null,
        token: null,
        stats: null,
        error: null,
        mood: 'idle',
        unlockedAchievements: [],
        lastSeenLevel: 1,
    }),
    setMood: (mood) => set({ mood }),
    triggerMood: (mood, durationMs = 2400) => {
        set({ mood });
        window.setTimeout(() => {
            // Only revert if still in this mood
            if (get().mood === mood)
                set({ mood: 'idle' });
        }, durationMs);
    },
    setCharacterName: (name) => set({ characterName: name.trim() || 'CodeWaifu' }),
    setUnlocked: (ids) => set({ unlockedAchievements: ids }),
    setLastSeenLevel: (lvl) => set({ lastSeenLevel: lvl }),
}), {
    name: 'codewaifu-store',
    partialize: (s) => ({
        username: s.username,
        token: s.token,
        characterName: s.characterName,
        unlockedAchievements: s.unlockedAchievements,
        lastSeenLevel: s.lastSeenLevel,
    }),
}));
