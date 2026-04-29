const DEVICE_CODE_URL = 'https://github.com/login/device/code';
const ACCESS_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const DEFAULT_SCOPE = 'read:user public_repo';
const githubClientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
function formBody(data) {
    return new URLSearchParams(data).toString();
}
function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
}
export function isGitHubOAuthConfigured() {
    return Boolean(githubClientId?.trim());
}
export async function requestGitHubDeviceCode() {
    if (!githubClientId) {
        throw new Error('Додай VITE_GITHUB_CLIENT_ID у .env, щоб увімкнути GitHub OAuth.');
    }
    const response = await fetch(DEVICE_CODE_URL, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody({
            client_id: githubClientId,
            scope: DEFAULT_SCOPE,
        }),
    });
    if (!response.ok)
        throw new Error(`GitHub OAuth: ${response.status}`);
    return response.json();
}
export async function pollGitHubAccessToken(device) {
    if (!githubClientId) {
        throw new Error('GitHub OAuth не налаштований.');
    }
    let interval = Math.max(device.interval, 5);
    const expiresAt = Date.now() + device.expires_in * 1000;
    while (Date.now() < expiresAt) {
        await wait(interval * 1000);
        const response = await fetch(ACCESS_TOKEN_URL, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formBody({
                client_id: githubClientId,
                device_code: device.device_code,
                grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
            }),
        });
        if (!response.ok)
            throw new Error(`GitHub OAuth token: ${response.status}`);
        const data = (await response.json());
        if (data.access_token)
            return data.access_token;
        if (data.error === 'authorization_pending')
            continue;
        if (data.error === 'slow_down') {
            interval += 5;
            continue;
        }
        if (data.error === 'expired_token') {
            throw new Error('Код GitHub авторизації застарів. Спробуй ще раз.');
        }
        throw new Error(data.error_description ?? data.error ?? 'GitHub OAuth скасовано.');
    }
    throw new Error('Код GitHub авторизації застарів. Спробуй ще раз.');
}
