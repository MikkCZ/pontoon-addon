/**
 * This content script sends latest data to commons/js/RemotePontoon.js from loaded Pontoon pages.
 * - https://developer.mozilla.org/Add-ons/WebExtensions/Content_scripts
 */
'use strict';

browser.runtime.sendMessage({
    type: 'pontoon-page-loaded',
    url: document.location.toString(),
    value: document.documentElement.innerHTML
});
