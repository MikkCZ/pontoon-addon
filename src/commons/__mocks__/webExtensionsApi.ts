import { browser as mockedBrowser } from '@commons/test/mockWebExtensionsApi';

export const browser = mockedBrowser;

export const getFromStorage = jest.fn();

export const getOneFromStorage = jest.fn();

export const listenToStorageChange = jest.fn();

export const saveToStorage = jest.fn();

export const deleteFromStorage = jest.fn();

export const { create: createNotification, clear: closeNotification } = {
  create: jest.fn(),
  clear: jest.fn(),
};

export const { create: createContextMenu, remove: removeContextMenu } = {
  create: jest.fn(),
  remove: jest.fn(),
};

export const browserFamily = jest.fn().mockReturnValue('mozilla');

export const openNewTab = jest.fn();

export const getAllTabs = jest.fn();

export const getTabsWithBaseUrl = jest.fn();

export const getActiveTab = jest.fn();

export const { getURL: getResourceUrl, openOptionsPage: openOptions } = {
  getURL: jest.fn(),
  openOptionsPage: jest.fn(),
};

export const openIntro = jest.fn();

export const openPrivacyPolicy = jest.fn();

export const openSnakeGame = jest.fn();

export const { openPopup: openToolbarButtonPopup } = { openPopup: jest.fn() };

export const supportsAddressBar = jest.fn().mockReturnValue(true);

export const showAddressBarIcon = jest.fn();

export const hideAddressBarIcon = jest.fn();

export const supportsContainers = jest.fn().mockReturnValue(true);

export const getAllContainers = jest.fn().mockReturnValue([]);

export const requestPermissionForPontoon = jest.fn();

export const registerScriptForBaseUrl = jest.fn();

export const executeScript = jest.fn();

export const callWithInterval = jest.fn();

export const callDelayed = jest.fn();

export const listenToMessages = jest.fn();

export const listenToMessagesExclusively = jest.fn();
