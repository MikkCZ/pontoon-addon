class DataFetcher {
    constructor(options, remotePontoon) {
        this._options = options;
        this._remotePontoon = remotePontoon;
        this._pontoonRequestTokens = new Set();
        this._pontoonRequestsListener = (details) => this._updatePontoonRequest(details);

        this._watchOptionsUpdates();
        this._watchPontoonRequests();
    }

    _watchOptionsUpdates() {
        this._remotePontoon.subscribeToBaseUrlChange(() => this._watchPontoonRequests());
    }

    _watchPontoonRequests() {
        browser.webRequest.onBeforeSendHeaders.removeListener(this._pontoonRequestsListener);
        browser.webRequest.onBeforeSendHeaders.addListener(
            this._pontoonRequestsListener,
            {urls: [this._remotePontoon.getBaseUrl() + '/*']},
            ['blocking', 'requestHeaders']
        );
    }

    fetch(url) {
        return fetch(url, {credentials: 'omit'});
    }

    fetchFromPontoonSession(url) {
        const headers = new Headers();
        headers.append('X-Requested-With', 'XMLHttpRequest');
        headers.append('pontoon-tools-token', this._issueNewToken());
        return fetch(url, {credentials: 'omit', headers: headers});
    }

    _issueNewToken() {
        const token = this._uuidv4();
        this._pontoonRequestTokens.add(token);
        return token;
    }

    _uuidv4() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    _validateToken(token) {
        const valid = this._pontoonRequestTokens.has(token);
        this._pontoonRequestTokens.delete(token);
        return valid;
    }

    _validateOrigin(requestOrigin) {
        return new URL(browser.runtime.getUrl('/')).origin === requestOrigin;
    }

    _updatePontoonRequest(details) {
        const tokenHeaders = details.requestHeaders
            .filter((header) => header.name === 'pontoon-tools-token');
        const isMarked = tokenHeaders.length > 0 && tokenHeaders.every((header) => this._validateToken(header.value));
        const originHeaders = details.requestHeaders
            .filter((header) => header.name.toLowerCase() === 'origin');
        const validOrigin = originHeaders.length > 0 && originHeaders.every((header) => this._validateOrigin(header.value));
        if (isMarked && validOrigin) {
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
