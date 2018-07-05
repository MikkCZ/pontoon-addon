/**
 * Takes care of displaying the toolbar button badge and if the popup should be open on click or not.
 * @requires commons/js/Options.js, RemotePontoon.js
 */
class ToolbarButton {
    /**
     * Initialize instance, add button click action, watch for future data and options changes.
     * @param options
     * @param remotePontoon
     */
    constructor(options, remotePontoon) {
        this._options = options;
        this._remotePontoon = remotePontoon;
        this._defaultTitle = 'Pontoon notifications';
        this._badgeText = '';

        this._openPontoonTeamPage = () => browser.tabs.create({url: this._remotePontoon.getTeamPageUrl()});
        this._openPontoonHomePage = () => browser.tabs.create({url: this._remotePontoon.getBaseUrl()});
        this._addOnClickAction();
        this._watchStorageChanges();
        this._watchOptionsUpdates();
    }

    /**
     * Update button badge when notification data change in storage.
     * @private
     */
    _watchStorageChanges() {
        this._remotePontoon.subscribeToNotificationsChange((change) => {
            const notificationsData = change.newValue;
            if (notificationsData !== undefined) {
                this._updateBadge(`${Object.values(notificationsData).filter(n => n.unread).length}`);
            } else {
                this._updateBadge('!');
            }
        });
    }

    /**
     * Keep button click action in sync with options.
     * @private
     */
    _watchOptionsUpdates() {
        this._options.subscribeToOptionChange('toolbar_button_action', (change) =>
            this._setButtonAction(change.newValue)
        );
        this._options.subscribeToOptionChange('display_toolbar_button_badge', (change) => {
            if (change.newValue) {
                this._updateBadge(this._badgeText);
            } else {
                this.hideBadge();
            }
        });
    }

    /**
     * Set action for button click.
     * @param buttonAction from options
     * @private
     */
    _setButtonAction(buttonAction) {
        browser.browserAction.setPopup({popup: ''});
        browser.browserAction.onClicked.removeListener(this._openPontoonTeamPage);
        browser.browserAction.onClicked.removeListener(this._openPontoonHomePage);
        switch (buttonAction) {
            case 'popup':
                browser.browserAction.setPopup({popup: browser.runtime.getURL('toolbar-button/index.html')});
                break;
            case 'team-page':
                browser.browserAction.onClicked.addListener(this._openPontoonTeamPage);
                break;
            case 'home-page':
                browser.browserAction.onClicked.addListener(this._openPontoonHomePage);
                break;
        }
    }

    /**
     * Add button click actions.
     * @private
     */
    _addOnClickAction() {
        const buttonActionOption = 'toolbar_button_action';
        this._options.get(buttonActionOption).then(
            (item) => this._setButtonAction(item[buttonActionOption])
        );
    }

    /**
     * Update button badge with the given text and corresponding color.
     * @param text to set
     * @private
     */
    _updateBadge(text) {
        if (text.trim().length > 0) {
            this._badgeText = text;
        }
        const optionKey = 'display_toolbar_button_badge';
        this._options.get(optionKey).then(
            (item) => {
                if (item[optionKey]) {
                    browser.browserAction.setBadgeText({text: text});
                    browser.browserAction.setTitle({title: `${this._defaultTitle} (${text})`});
                    if (text !== '0') {
                        browser.browserAction.setBadgeBackgroundColor({color: '#F36'});
                    } else {
                        browser.browserAction.setBadgeBackgroundColor({color: '#4d5967'});
                    }
                } else {
                    this.hideBadge();
                }
            }
        );
    }

    /**
     * Hide the button badge.
     * @public
     */
    hideBadge() {
        browser.browserAction.setBadgeText({text: ''});
        browser.browserAction.setTitle({title: this._defaultTitle});
    }
}
