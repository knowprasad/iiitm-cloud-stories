import { describe, it, expect } from 'vitest';
import { fetchGithubAvatar } from '../utils/github';

describe('GitHub Avatar Fetcher', () => {
  it('rejects empty or whitespace-only usernames', async () => {
    await expect(fetchGithubAvatar('')).rejects.toThrow('Please enter a GitHub username');
    await expect(fetchGithubAvatar('   ')).rejects.toThrow('Please enter a GitHub username');
  });

  it('rejects invalid GitHub username characters', async () => {
    await expect(fetchGithubAvatar('invalid username with spaces')).rejects.toThrow(
      'Invalid GitHub username format'
    );
    await expect(fetchGithubAvatar('user_with_underscore!')).rejects.toThrow(
      'Invalid GitHub username format'
    );
  });
});
