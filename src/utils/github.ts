/**
 * Fetch GitHub user profile avatar with error handling, timeout, and validation.
 */
export async function fetchGithubAvatar(username: string): Promise<{ avatarUrl: string; name?: string }> {
  const cleanUsername = username.trim().replace(/^@/, '');
  if (!cleanUsername) {
    throw new Error('Please enter a GitHub username');
  }

  // GitHub username regex: alphanumeric with single hyphens, 1-39 chars
  if (!/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(cleanUsername)) {
    throw new Error('Invalid GitHub username format');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}`, {
      signal: controller.signal,
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    clearTimeout(timeoutId);

    if (res.status === 404) {
      throw new Error(`GitHub user "${cleanUsername}" not found`);
    }

    if (res.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Try uploading your photo directly.');
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch GitHub avatar (${res.status})`);
    }

    const data = await res.json();
    if (!data.avatar_url) {
      throw new Error('No avatar found for this user');
    }

    // Append sizing query to fetch high-res 460px avatar
    const avatarUrl = `${data.avatar_url}${data.avatar_url.includes('?') ? '&' : '?'}s=460`;
    return {
      avatarUrl,
      name: data.name || undefined,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('GitHub request timed out. Please check your internet connection.');
    }
    throw err;
  }
}
