/**
 * Encapsulates communication to commons/js/RemotePontoon.js.
 * @requires BackgroundPontoonMessageType.js
 */
class BackgroundPontoonClient {

    /**
     * Get notifications page URL.
     * @param utm_source to include into the URL
     * @returns {string} promise fulfilled with the url
     * @public
     * @async
     */
    async getNotificationsUrl() {
        return (await browser.runtime
            .sendMessage({type: BackgroundPontoon.MessageType.TO_BACKGROUND.GET_NOTIFICATIONS_URL})
            ).response;
    }

    /**
     * Get team page URL.
     * @returns {string} promise fulfilled with the url
     * @public
     * @async
     */
    async getTeamPageUrl() {
        return (await browser.runtime
            .sendMessage({type: BackgroundPontoon.MessageType.TO_BACKGROUND.GET_TEAM_PAGE_URL})
            ).response;
    }

    /**
     * Get project URL for the team.
     * @param projectUrl general project URL
     * @returns {string} promise fulfilled with the url
     * @public
     * @async
     */
    async getTeamProjectUrl(projectUrl) {
        return await (browser.runtime
            .sendMessage({
                type: BackgroundPontoon.MessageType.TO_BACKGROUND.GET_TEAM_PROJECT_URL,
                args: [projectUrl],
            })
            ).response;
    }

    /**
     * Get URL to display translation view with all string in given state.
     * @param status
     * @returns {string} promise fulfilled with the url
     * @public
     * @async
     */
    async getStringsWithStatusSearchUrl(status) {
        return (await browser.runtime
            .sendMessage({
                type: BackgroundPontoon.MessageType.TO_BACKGROUND.GET_STRINGS_WITH_STATUS_SEARCH_URL,
                args: [status],
            })
            ).response;
    }

    /**
     * Get URL to sign in.
     * @returns {string} promise fulfilled with the url
     * @public
     * @async
     */
    async getSignInURL() {
        return (await browser.runtime
            .sendMessage({type: BackgroundPontoon.MessageType.TO_BACKGROUND.GET_SIGN_IN_URL})
            ).response;
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
        browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === BackgroundPontoon.MessageType.FROM_BACKGROUND.NOTIFICATIONS_UPDATED) {
                callback(message.data);
            }
        });
    }
}
