const API = 'https://api.github.com';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const cacheKey = (username) => `codewaifu:stats:${username.toLowerCase()}`;
const headers = (token) => {
    const h = {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
    };
    if (token)
        h.Authorization = `Bearer ${token}`;
    return h;
};
async function gh(path, token) {
    const res = await fetch(`${API}${path}`, { headers: headers(token) });
    if (!res.ok) {
        if (res.status === 401)
            throw new Error('Недійсний GitHub token або сесія GitHub завершилась.');
        if (res.status === 404)
            throw new Error('Користувача не знайдено');
        if (res.status === 403)
            throw new Error('Перевищено ліміт GitHub API. Спробуй з токеном.');
        throw new Error(`GitHub API: ${res.status}`);
    }
    return res.json();
}
async function fetchUser(username, token) {
    return gh(`/users/${encodeURIComponent(username)}`, token);
}
export async function fetchAuthenticatedGitHubUser(token) {
    return gh('/user', token);
}
async function fetchRepos(username, token) {
    const all = [];
    for (let page = 1; page <= 4; page++) {
        const part = await gh(`/users/${encodeURIComponent(username)}/repos?per_page=100&page=${page}&sort=updated`, token);
        all.push(...part);
        if (part.length < 100)
            break;
    }
    return all;
}
async function fetchEvents(username, token) {
    const all = [];
    for (let page = 1; page <= 3; page++) {
        try {
            const part = await gh(`/users/${encodeURIComponent(username)}/events/public?per_page=100&page=${page}`, token);
            all.push(...part);
            if (part.length < 100)
                break;
        }
        catch {
            break;
        }
    }
    return all;
}
function computeStreaks(commitsByDay) {
    const days = Object.keys(commitsByDay).sort();
    if (!days.length)
        return { current: 0, longest: 0 };
    const set = new Set(days);
    let longest = 0;
    let run = 0;
    let prev = null;
    for (const d of days) {
        const date = new Date(d);
        if (prev) {
            const diff = Math.round((date.getTime() - prev.getTime()) / (24 * 3600 * 1000));
            if (diff === 1)
                run += 1;
            else
                run = 1;
        }
        else {
            run = 1;
        }
        longest = Math.max(longest, run);
        prev = date;
    }
    // current streak counted backwards from today/yesterday
    let current = 0;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    // allow up to 1-day grace (today might just have no events yet)
    const cursor = new Date(today);
    if (!set.has(cursor.toISOString().slice(0, 10))) {
        cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    while (set.has(cursor.toISOString().slice(0, 10))) {
        current += 1;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    return { current, longest };
}
export function buildStats(user, repos, events) {
    const totalStars = repos.reduce((a, r) => a + r.stargazers_count, 0);
    const totalForks = repos.reduce((a, r) => a + r.forks_count, 0);
    const languages = {};
    for (const r of repos) {
        if (r.language)
            languages[r.language] = (languages[r.language] ?? 0) + 1;
    }
    const commitsByDay = {};
    const commitsByMonth = {};
    const commitsByHour = Array(24).fill(0);
    let totalCommits = 0;
    let nightOwlCommits = 0;
    let earlyBirdCommits = 0;
    let prsOpened = 0;
    let prsMerged = 0;
    let issuesOpened = 0;
    for (const ev of events) {
        const date = new Date(ev.created_at);
        const day = date.toISOString().slice(0, 10);
        const month = date.toISOString().slice(0, 7);
        const hour = date.getUTCHours();
        if (ev.type === 'PushEvent') {
            const count = ev.payload.commits?.length ?? 0;
            totalCommits += count;
            commitsByDay[day] = (commitsByDay[day] ?? 0) + count;
            commitsByMonth[month] = (commitsByMonth[month] ?? 0) + count;
            commitsByHour[hour] += count;
            if (count > 0) {
                if (hour >= 0 && hour < 4)
                    nightOwlCommits += count;
                if (hour >= 5 && hour < 8)
                    earlyBirdCommits += count;
            }
        }
        else if (ev.type === 'PullRequestEvent') {
            if (ev.payload.action === 'opened')
                prsOpened += 1;
            if (ev.payload.action === 'closed' && ev.payload.pull_request?.merged)
                prsMerged += 1;
        }
        else if (ev.type === 'IssuesEvent') {
            if (ev.payload.action === 'opened')
                issuesOpened += 1;
        }
    }
    // Approximate "totalCommits" with a baseline if events are too few
    // (events API gives only ~90 days). Use repos count as a soft floor.
    const eventCommits = totalCommits;
    const fallbackCommits = Math.max(eventCommits, repos.filter((r) => !r.fork).length * 4);
    totalCommits = Math.max(eventCommits, fallbackCommits);
    const { current, longest } = computeStreaks(commitsByDay);
    return {
        user,
        repos,
        events,
        totalCommits,
        totalStars,
        totalForks,
        totalRepos: repos.length,
        publicRepos: user.public_repos,
        followers: user.followers,
        following: user.following,
        currentStreak: current,
        longestStreak: longest,
        languages,
        languagesCount: Object.keys(languages).length,
        commitsByDay,
        commitsByHour,
        commitsByMonth,
        prsOpened,
        prsMerged,
        issuesOpened,
        nightOwlCommits,
        earlyBirdCommits,
        fetchedAt: Date.now(),
    };
}
export async function fetchGitHubStats(username, token, options = {}) {
    const key = cacheKey(username);
    if (!options.force) {
        try {
            const raw = localStorage.getItem(key);
            if (raw) {
                const cached = JSON.parse(raw);
                if (Date.now() - cached.fetchedAt < CACHE_TTL)
                    return cached;
            }
        }
        catch {
            /* ignore */
        }
    }
    const [user, repos, events] = await Promise.all([
        fetchUser(username, token),
        fetchRepos(username, token),
        fetchEvents(username, token),
    ]);
    const stats = buildStats(user, repos, events);
    try {
        localStorage.setItem(key, JSON.stringify(stats));
    }
    catch {
        /* storage may be full */
    }
    return stats;
}
export async function fetchLeaderboard(token) {
    const cacheK = 'codewaifu:leaderboard';
    try {
        const raw = localStorage.getItem(cacheK);
        if (raw) {
            const cached = JSON.parse(raw);
            if (Date.now() - cached.at < CACHE_TTL)
                return cached.data;
        }
    }
    catch {
        /* ignore */
    }
    // Fetch top users by followers
    const data = await gh(`/search/users?q=followers:%3E10000&sort=followers&order=desc&per_page=10`, token);
    const enriched = await Promise.all(data.items.map(async (u) => {
        try {
            const full = await gh(`/users/${u.login}`, token);
            return {
                login: full.login,
                avatar_url: full.avatar_url,
                html_url: full.html_url,
                followers: full.followers,
                public_repos: full.public_repos,
            };
        }
        catch {
            return { login: u.login, avatar_url: u.avatar_url, html_url: u.html_url, followers: 0, public_repos: 0 };
        }
    }));
    try {
        localStorage.setItem(cacheK, JSON.stringify({ at: Date.now(), data: enriched }));
    }
    catch {
        /* ignore */
    }
    return enriched;
}
