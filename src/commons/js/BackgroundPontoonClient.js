/**
 * Client to communicate with background/RemotePontoon.js. Should be used in all contexts outside of background itself.
 * @requires BackgroundPontoonMessageType.js
 */
class BackgroundPontoonClient {
    constructor() {
        this._notificationsChangeCallbacks = new Set();
    }

    /**
     * Get notifications page URL.
     * @param utm_source to include into the URL
     * @returns {string} promise fulfilled with the url
     * @public
     * @async
     */
    async getNotificationsUrl() {
        return await browser.runtime
            .sendMessage({type: BackgroundPontoon.MessageType.TO_BACKGROUND.GET_NOTIFICATIONS_URL});
    }

    /**
     * Get settings page URL.
     * @param utm_source to include into the URL
     * @returns {string} promise fulfilled with the url
     * @public
     * @async
     */
    async getSettingsUrl(utm_source) {
        return await browser.runtime
            .sendMessage({type: BackgroundPontoon.MessageType.TO_BACKGROUND.GET_SETTINGS_URL});
    }

    /**
     * Get team page URL.
     * @returns {string} promise fulfilled with the url
     * @public
     * @async
     */
    async getTeamPageUrl() {
        return await browser.runtime
            .sendMessage({type: BackgroundPontoon.MessageType.TO_BACKGROUND.GET_TEAM_PAGE_URL});
    }

    /**
     * Get project URL for the team.
     * @param projectUrl general project URL
     * @returns {string} promise fulfilled with the url
     * @public
     * @async
     */
    async getTeamProjectUrl(projectUrl) {
        return await browser.runtime
            .sendMessage({
                type: BackgroundPontoon.MessageType.TO_BACKGROUND.GET_TEAM_PROJECT_URL,
                args: [projectUrl],
            });
    }

    /**
     * Get URL to display translation view with all string in given state.
     * @param status
     * @returns {string} promise fulfilled with the url
     * @public
     * @async
     */
    async getStringsWithStatusSearchUrl(status) {
        return await browser.runtime
            .sendMessage({
                type: BackgroundPontoon.MessageType.TO_BACKGROUND.GET_STRINGS_WITH_STATUS_SEARCH_URL,
                args: [status],
            });
    }

    /**
     * Get URL to sign in.
     * @returns {string} promise fulfilled with the url
     * @public
     * @async
     */
    async getSignInURL() {
        return await browser.runtime
            .sendMessage({type: BackgroundPontoon.MessageType.TO_BACKGROUND.GET_SIGN_IN_URL});
    }

    /**
     * Update list of teams in storage from Pontoon.
     * @returns promise fulfilled with sorted list of locale codes
     * @public
     * @async
     */
    async updateTeamsList() {
        return await browser.runtime
            .sendMessage({type: BackgroundPontoon.MessageType.TO_BACKGROUND.UPDATE_TEAMS_LIST});
    }

    /**
     * Get locale team selected in Pontoon preferences.
     * @returns promise that will be fulfilled with the team code from the Pontoon settings page or from options
     * @public
     * @async
     */
    async getTeamFromPontoon() {
        return await browser.runtime
            .sendMessage({type: BackgroundPontoon.MessageType.TO_BACKGROUND.GET_TEAM_FROM_PONTOON});
    }

    /**
     * Update data in storage from Pontoon page content.
     * @param pageUrl
     * @param documentHTML of the page
     * @public
     */
    pageLoaded(pageUrl, documentHTML) {
        browser.runtime.sendMessage({
            type: BackgroundPontoon.MessageType.TO_BACKGROUND.PAGE_LOADED,
            url: pageUrl,
            value: documentHTML,
        });
    }

    /**
     * Mark all notifications as read both in Pontoon and in the storage.
     * @public
     */
    markAllNotificationsAsRead() {
        browser.runtime.sendMessage({
            type: BackgroundPontoon.MessageType.TO_BACKGROUND.NOTIFICATIONS_READ,
        });
    }

    /**
     * Subscribe to notifications data change.
     * @param callback function to call with the new value
     * @public
     */
    subscribeToNotificationsChange(callback) {
        this._notificationsChangeCallbacks.add(callback);
        if (!browser.runtime.onMessage.hasListener(this._notificationsChangeListener)) {
            browser.runtime.onMessage.addListener(this._notificationsChangeListener);
        }
    }

    /**
     * Unsubscribe from notifications data change.
     * @param callback function to remove as a listener
     * @public
     */
    unsubscribeFromNotificationsChange(callback) {
        const deleted = this._notificationsChangeCallbacks.delete(callback);
        if (deleted && this._notificationsChangeCallbacks.size === 0) {
            browser.runtime.onMessage.removeListener(this._notificationsChangeListener);
        }
    }

    /**
     * Listener to be called when notification data change in the background.
     * @private
     */
    _notificationsChangeListener(message, sender, sendResponse) {
        if (message.type === BackgroundPontoon.MessageType.FROM_BACKGROUND.NOTIFICATIONS_UPDATED) {
            this._notificationsChangeCallbacks.forEach((callback) => callback(message.data));
        }
    }
}
