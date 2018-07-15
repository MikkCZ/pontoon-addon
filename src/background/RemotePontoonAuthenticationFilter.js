class RemotePontoonAuthenticationFilter {
    constructor(options, remotePontoon, requestsToken) {
        this._options = options;
        this._remotePontoon = remotePontoon;
        this._requestsToken = requestsToken;

        this._watchPontoonRequests();
    }

    _watchPontoonRequests() {
        browser.webRequest.onBeforeSendHeaders.addListener(
            (details) => this._updateHeaders(details),
            {urls: [this._remotePontoon.getBaseUrl() + '/*']},
            ['blocking', 'requestHeaders']
        );
    }

    _updateHeaders(details) {
        const regularHeaders = details.requestHeaders
            .filter((header) => !(header.name === 'pontoon-tools-token' && header.value === this._requestsToken));
        const addSessionCookie = regularHeaders.length < details.requestHeaders.length;
        if (addSessionCookie) {
            return this._options.get('contextual_identity').then((item) =>
                browser.cookies.get({
                    url: this._remotePontoon.getBaseUrl(),
                    name: 'sessionid',
                    storeId: item['contextual_identity'],
                })
            ).then((cookie) => {
                const finalHeaders = regularHeaders
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
