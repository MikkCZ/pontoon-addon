import URI from 'urijs';
import URITemplate from 'urijs/src/URITemplate';

const LINK_UTM_SOURCE = 'pontoon-addon';

export function pontoonFxaSignIn(baseUrl: string): string {
  return URITemplate('{+baseUrl}{/path*}')
    .expand({
      baseUrl,
      path: ['accounts', 'fxa', 'login'],
    })
    .toString();
}

export function pontoonNotifications(baseUrl: string): string {
  return URITemplate('{+baseUrl}{/path*}{?q*}')
    .expand({
      baseUrl,
      path: ['notifications'],
      q: {
        utm_source: LINK_UTM_SOURCE,
      },
    })
    .toString();
}

export function pontoonSettings(baseUrl: string, utm_source?: string): string {
  // without the trailing slash Pontoon returns 301
  return URITemplate('{+baseUrl}{/path*}/{?q*}')
    .expand({
      baseUrl,
      path: ['settings'],
      q: {
        utm_source: utm_source ?? LINK_UTM_SOURCE,
      },
    })
    .toString();
}

export function pontoonTeam(baseUrl: string, team: { code: string }): string {
  return URITemplate('{+baseUrl}{/path*}{?q*}')
    .expand({
      baseUrl,
      path: [team.code],
      q: {
        utm_source: LINK_UTM_SOURCE,
      },
    })
    .toString();
}

export function pontoonTeamInsights(
  baseUrl: string,
  team: { code: string },
): string {
  return URITemplate('{+baseUrl}{/path*}{?q*}')
    .expand({
      baseUrl,
      path: [team.code, 'insights'],
      q: {
        utm_source: LINK_UTM_SOURCE,
      },
    })
    .toString();
}

export function pontoonTeamBugs(
  baseUrl: string,
  team: { code: string },
): string {
  // no 'utm_source' here, see https://github.com/mozilla/pontoon/issues/2504
  return URITemplate('{+baseUrl}{/path*}')
    .expand({
      baseUrl,
      path: [team.code, 'bugs'],
    })
    .toString();
}

export function pontoonTeamsProject(
  baseUrl: string,
  team: { code: string },
  project: { slug: string },
): string {
  return URITemplate('{+baseUrl}{/path*}{?q*}')
    .expand({
      baseUrl,
      path: [team.code, project.slug],
      q: {
        utm_source: LINK_UTM_SOURCE,
      },
    })
    .toString();
}

export function pontoonProjectTranslationView(
  baseUrl: string,
  team: { code: string },
  project: { slug: string },
  textToSearch?: string,
): string {
  return URITemplate('{+baseUrl}{/path*}{?q*}')
    .expand({
      baseUrl,
      path: [team.code, project.slug, 'all-resources'],
      q: {
        ...(textToSearch ? { search: textToSearch } : {}),
        utm_source: LINK_UTM_SOURCE,
      },
    })
    .toString();
}

export function pontoonSearchStringsWithStatus(
  baseUrl: string,
  team: { code: string },
  status: string,
): string {
  return URITemplate('{+baseUrl}{/path*}{?q*}')
    .expand({
      baseUrl,
      path: [team.code, 'all-projects', 'all-resources'],
      q: {
        status,
        utm_source: LINK_UTM_SOURCE,
      },
    })
    .toString();
}

export function pontoonTeamsList(baseUrl: string, utm_source?: string): string {
  // without the trailing slash Pontoon returns 301
  return URITemplate('{+baseUrl}{/path*}/{?q*}')
    .expand({
      baseUrl,
      path: ['teams'],
      q: {
        utm_source: utm_source ?? LINK_UTM_SOURCE,
      },
    })
    .toString();
}

export function toPontoonTeamSpecificProjectUrl(
  baseUrl: string,
  team: { code: string },
  projectUrl: string,
): string {
  const { path: parsedPath, query: parsedQuery } = URI.parse(projectUrl);
  const newPath = parsedPath?.replace('/projects/', `/${team.code}/`);
  return URITemplate('{+baseUrl}{+path}{?q*}')
    .expand({
      baseUrl,
      path: URI.joinPaths('/', newPath ?? '').toString(),
      q: {
        ...(parsedQuery ? URI.parseQuery(parsedQuery) : {}),
        utm_source: LINK_UTM_SOURCE,
      },
    })
    .toString();
}

export function transvisionHome(team: string): string {
  return URITemplate('https://transvision.mozfr.org/{?q*}')
    .expand({
      q: {
        locale: team,
        utm_source: LINK_UTM_SOURCE,
      },
    })
    .toString();
}

export function mozillaL10nStyleGuide(team: string): string {
  return URITemplate('https://mozilla-l10n.github.io{/path*}{?q*}')
    .expand({
      path: ['styleguides', team],
      q: {
        utm_source: LINK_UTM_SOURCE,
      },
    })
    .toString();
}

export function mozillaWikiL10nTeamPage(team: string): string {
  return URITemplate('https://wiki.mozilla.org/L10n:Teams:{+team}')
    .expand({ team })
    .toString();
}

export function microsoftTerminologySearch(): string {
  return 'https://www.microsoft.com/language/';
}

export function newLocalizationBug({
  team,
  selectedText,
  url,
}: {
  team: { code: string; bz_component: string };
  selectedText?: string;
  url: string;
}): string {
  return URITemplate('https://bugzilla.mozilla.org/enter_bug.cgi{?q*}')
    .expand({
      q: {
        product: 'Mozilla Localizations',
        component: team.bz_component,
        status_whiteboard: '[pontoon-addon-feedback]',
        bug_file_loc: url,
        short_desc: selectedText
          ? `[${
              team.code
            }] Translation update proposed for "${selectedText.trim()}" on ${url}`
          : `[${team.code}] Translation update proposed on ${url}`,
        ...(selectedText
          ? {
              comment: `The translation:\n${selectedText.trim()}\n\nShould be:\n`,
            }
          : {}),
      },
    })
    .toString();
}

export function pontoonAddonWiki(): string {
  return 'https://github.com/MikkCZ/pontoon-addon/wiki';
}

export function pontoonAddonAmoPage(): string {
  return 'https://addons.mozilla.org/firefox/addon/pontoon-tools/';
}

export function pontoonAddonChromeWebStorePage(): string {
  return 'https://chrome.google.com/webstore/detail/pontoon-add-on/gnbfbnpjncpghhjmmhklfhcglbopagbb';
}

export function containersInfoPage(): string {
  return 'https://support.mozilla.org/kb/containers';
}

export function mozillaOrg(): string {
  return 'https://www.mozilla.org/';
}
