import URITemplate from 'urijs/src/URITemplate';

export const AUTOMATION_UTM_SOURCE = 'pontoon-addon-automation';

export function pontoonGraphQL(baseUrl: string): string {
  return URITemplate('{+baseUrl}{/path*}')
    .expand({
      baseUrl,
      path: ['graphql'],
    })
    .toString();
}

export function pontoonUserData(baseUrl: string): string {
  // without the trailing slash Pontoon returns 301
  return URITemplate('{+baseUrl}{/path*}/{?q*}')
    .expand({
      baseUrl,
      path: ['user-data'],
      q: {
        utm_source: AUTOMATION_UTM_SOURCE,
      },
    })
    .toString();
}

export function markAllNotificationsAsRead(baseUrl: string): string {
  // without the trailing slash Pontoon returns 301
  return URITemplate('{+baseUrl}{/path*}/{?q*}')
    .expand({
      baseUrl,
      path: ['notifications', 'mark-all-as-read'],
      q: {
        utm_source: AUTOMATION_UTM_SOURCE,
      },
    })
    .toString();
}

export function bugzillaTeamComponents(): string {
  return 'https://flod.org/mozilla-l10n-query/?bugzilla=product';
}
