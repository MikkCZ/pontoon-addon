/**
 * The enum of message types, that can be sent to or from RemotePontoon.js.
 */
export const BackgroundPontoonMessageType = Object.freeze({
  TO_BACKGROUND: Object.freeze({
    PAGE_LOADED: 'pontoon-page-loaded',
    NOTIFICATIONS_READ: 'notifications-read',
    GET_BASE_URL: 'get-base-url',
    GET_TEAM: 'get-team',
    UPDATE_TEAMS_LIST: 'update-teams-list',
    GET_TEAM_FROM_PONTOON: 'get-team-from-pontoon',
    GET_CURRENT_TAB_PROJECT: 'get-current-tab-project',
  }),
  FROM_BACKGROUND: Object.freeze({
    NOTIFICATIONS_UPDATED: 'notifications-updated',
  }),
});
