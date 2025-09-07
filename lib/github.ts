import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

const REPO = 'NA-Fury/seven-wonders-companion';

export async function openPrefilledBugReport(title?: string, body?: string) {
  try {
    const version =
      Constants.expoConfig?.version ||
      (Constants as any)?.manifest2?.extra?.expoClient?.version ||
      'dev';
    const platform = typeof navigator !== 'undefined' ? navigator.userAgent : '';

    const base = `https://github.com/${REPO}/issues/new`;
    const params = new URLSearchParams();
    params.append('template', 'bug_report.yml');
    if (title) params.append('title', title);

    const footer = `\n\nVersion: ${version}\nPlatform: ${platform}`;
    params.append('body', `${body ?? ''}${footer}`);

    const url = `${base}?${params.toString()}`;
    await Linking.openURL(url);
  } catch {}
}

export async function openDiscussions() {
  try {
    await Linking.openURL(`https://github.com/${REPO}/discussions`);
  } catch {}
}

