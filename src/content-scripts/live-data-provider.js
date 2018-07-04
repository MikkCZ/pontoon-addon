/**
 * This content script sends latest data to commons/js/RemotePontoon.js from loaded Pontoon pages.
 * - https://developer.mozilla.org/Add-ons/WebExtensions/Content_scripts
 * @requires commons/js/BackgroundPontoonMessageType.js
 */
'use strict';

browser.runtime.sendMessage({
    type: BackgroundPontoon.MessageType.TO_BACKGROUND.PAGE_LOADED,
    url: document.location.toString(),
    value: document.documentElement.innerHTML
});
