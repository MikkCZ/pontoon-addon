/**
 * Manually adds cookies from the selected container to HTTP requests to Pontoon.
 * @requires commons/js/Options.js, RemotePontoon.js
 */
class DataFetcher {
    /**
     * Initialize instance, and watch for requests to Pontoon.
     * @param options
     * @param remotePontoon
     */
    constructor(options, remotePontoon) {
        this._requiredPermissions = ['cookies', 'webRequest', 'webRequestBlocking'];
        this._options = options;
        this._remotePontoon = remotePontoon;
        this._pontoonRequestTokens = new Set();
        this._pontoonRequestsListener = (details) => this._updatePontoonRequest(details);

        browser.permissions.contains({permissions: this._requiredPermissions}).then((hasPermissions) => {
            if (hasPermissions) {
                this._watchOptionsUpdates();
                this._watchPontoonRequests();
            }
        });
    }

    /**
     * Update requests watcher when Pontoon URL changes.
     * @private
     */
    _watchOptionsUpdates() {
        this._remotePontoon.subscribeToBaseUrlChange(() => this._watchPontoonRequests());
    }

    /**
     * Register listener to add cookies to requests Pontoon.
     * @private
     */
    _watchPontoonRequests() {
        browser.webRequest.onBeforeSendHeaders.removeListener(this._pontoonRequestsListener);
        browser.webRequest.onBeforeSendHeaders.addListener(
            this._pontoonRequestsListener,
            {urls: [this._remotePontoon.getBaseUrl() + '/*']},
            ['blocking', 'requestHeaders']
        );
    }

    /**
     * Fetch remote HTTP resource without including any cookies to the request.
     * @public
     */
    fetch(url) {
        return fetch(url, {credentials: 'omit'});
    }

    /**
     * Fetch remote HTTP resource from Pontoon including session cookie to the request.
     * @public
     */
    fetchFromPontoonSession(url) {
        const headers = new Headers();
        headers.append('X-Requested-With', 'XMLHttpRequest');
        if (browser.webRequest && browser.webRequest.onBeforeSendHeaders.hasListener(this._pontoonRequestsListener)) {
            headers.append('pontoon-tools-token', this._issueNewToken());
            return fetch(url, {credentials: 'omit', headers: headers});
        } else {
            return fetch(url, {credentials: 'include', headers: headers});
        }
    }

    /**
     * Create new token to mark request to add cookies to.
     * @private
     */
    _issueNewToken() {
        const token = this._uuidv4();
        this._pontoonRequestTokens.add(token);
        return token;
    }

    /**
     * Generate random UUID.
     * @private
     */
    _uuidv4() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    /**
     * Verify token and invalidate it for future use.
     * @private
     */
    _verifyToken(token) {
        const valid = this._pontoonRequestTokens.has(token);
        this._pontoonRequestTokens.delete(token);
        return valid;
    }

    /**
     * HTTP request listener to add Pontoon session cookie.
     * @private
     */
    _updatePontoonRequest(details) {
        const tokenHeaders = details.requestHeaders
            .filter((header) => header.name === 'pontoon-tools-token');
        details.requestHeaders = details.requestHeaders
            .filter((header) => header.name !== 'pontoon-tools-token');
        const isMarked = tokenHeaders.length > 0 && tokenHeaders.every((header) => this._verifyToken(header.value));
        if (isMarked) {
            return this._options.get('contextual_identity').then((item) =>
                browser.cookies.get({
                    url: this._remotePontoon.getBaseUrl(),
                    name: 'sessionid',
                    storeId: item['contextual_identity'],
                })
            ).then((cookie) => {
                const finalHeaders = details.requestHeaders
                    .filter((header) => header.name !== 'pontoon-tools-token')
                    .filter((header) => header.name.toLowerCase() !== 'cookie')
                    .concat({
                        name: 'Cookie',
                        value: `${cookie.name}=${cookie.value}`,
                    });
                return {requestHeaders: finalHeaders};
            });
        }
    }
}
