type ProjectsListData = Array<{
  slug: string;
  domains: string[];
}>;

export const projectsListData: ProjectsListData = [
  {
    slug: 'amo',
    domains: [
      'addons.mozilla.org',
      'addons.allizom.org',
      'addons-dev.allizom.org',
    ],
  },
  {
    slug: 'common-voice',
    domains: [
      'commonvoice.mozilla.org',
      'commonvoice.allizom.org',
      'dev.commonvoice.allizom.org',
    ],
  },
  {
    slug: 'firefox-monitor-website',
    domains: [
      'monitor.firefox.com',
      'monitor-localization.herokuapp.com',
      'fx-breach-alerts.herokuapp.com',
    ],
  },
  {
    slug: 'firefox-profiler',
    domains: ['profiler.firefox.com', 'l10n--perf-html.netlify.app'],
  },
  {
    slug: 'firefox-relay-website',
    domains: [
      'relay.firefox.com',
      'stage.fxprivaterelay.nonprod.cloudops.mozgcp.net',
      'dev.fxprivaterelay.nonprod.cloudops.mozgcp.net',
    ],
  },
  {
    slug: 'foundation-website-content',
    domains: ['foundation.mozilla.org', 'foundation.mofostaging.net'],
  },
  {
    slug: 'mozilla-accounts',
    domains: ['accounts.firefox.com', 'accounts.stage.mozaws.net'],
  },
  {
    slug: 'mozilla-festival',
    domains: ['www.mozillafestival.org', 'mozillafestival.mofostaging.net'],
  },
  {
    slug: 'mozillaorg',
    domains: ['www.mozilla.org', 'www-dev.allizom.org'],
  },
  {
    slug: 'sumo',
    domains: ['support.mozilla.org', 'support.allizom.org'],
  },
  {
    slug: 'thunderbirdnet',
    domains: [
      'www.thunderbird.net',
      'www-stage.thunderbird.net',
      'start.thunderbird.net',
    ],
  },
];
