export const getNotificationsUrlMock = jest.fn();
export const getSignInURLMock = jest.fn();
export const getPontoonProjectForTheCurrentTabMock = jest.fn();
export const markAllNotificationsAsReadMock = jest.fn();

export class BackgroundPontoonClient {
  getBaseUrl = jest.fn();
  getTeam = jest.fn();
  getNotificationsUrl = getNotificationsUrlMock;
  getSettingsUrl = jest.fn();
  getTeamPageUrl = jest.fn();
  getTeamProjectUrl = jest.fn();
  getStringsWithStatusSearchUrl = jest.fn();
  getSignInURL = getSignInURLMock;
  updateTeamsList = jest.fn();
  getTeamFromPontoon = jest.fn();
  getPontoonProjectForTheCurrentTab = getPontoonProjectForTheCurrentTabMock;
  pageLoaded = jest.fn();
  markAllNotificationsAsRead = markAllNotificationsAsReadMock;
}
