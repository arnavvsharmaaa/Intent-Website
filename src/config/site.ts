// Single source of truth for site-wide facts used in metadata, JSON-LD and copy.
// Keep these truthful: they're published to search engines.

export const SITE = {
  name: 'Intent',
  /** Production origin, no trailing slash. Mirrors `site` in astro.config.mjs. */
  url: 'https://intentapp.app',
  title: 'Intent — A Windows Focus App for Returning After Distraction',
  description:
    'A Windows focus app for students, developers and knowledge workers: link monthly goals to daily tasks, run focus sessions, and return calmly after distraction.',
  tagline: 'Getting distracted is expected. Returning is the skill.',
  locale: 'en_US',
  themeColor: '#0F1117',
  ogImage: '/og-image.png',
  ogImageAlt:
    'Intent: Your goals shouldn’t disappear when you get distracted. A focus and goal-planning app for Windows, with Kero the pixel frog companion.',
  os: 'Windows 10, Windows 11',
  version: '0.1.1',
} as const;

const env = (v: string | undefined) => (v && v.trim() ? v.trim() : null);

/**
 * The current Windows release on the stable channel. Update every field together, copied from the
 * published release (the SHA-256 is the one in the build log that `verify-public` confirmed).
 * The installer is not Authenticode-signed; only the in-app updater checks a Tauri updater signature.
 */
export const RELEASE = {
  version: '0.1.1',
  installerName: 'Intent_0.1.1_x64-setup.exe',
  installerUrl: 'https://releases.intentapp.app/windows/stable/Intent_0.1.1_x64-setup.exe',
  sha256: '6da4e0ba89bb6b9116fa8b9a4ca53f39d066e9b7ce0bb5af0a94d3665daef9ba',
  manifestUrl: 'https://releases.intentapp.app/windows/stable/latest.json',
} as const;

/** Direct link to the current Windows installer. */
export const DOWNLOAD_URL: string | null = RELEASE.installerUrl;

/** Reserved for future use; the marketing site must render without it. */
export const API_BASE_URL = env(import.meta.env.PUBLIC_API_BASE_URL);
