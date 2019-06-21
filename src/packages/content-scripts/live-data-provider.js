import { BackgroundPontoonClient } from 'Commons/js/BackgroundPontoonClient';
if (!browser) {
    var browser = require('webextension-polyfill'); // eslint-disable-line no-var, no-inner-declarations
}

/**
 * This content script sends latest data to background/RemotePontoon.js from loaded Pontoon pages.
 * - https://developer.mozilla.org/Add-ons/WebExtensions/Content_scripts
 */

new BackgroundPontoonClient().pageLoaded(document.location.toString(), document.documentElement.innerHTML);
