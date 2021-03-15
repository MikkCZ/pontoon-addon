import { BackgroundPontoonClient } from '@pontoon-addon/commons/src/BackgroundPontoonClient';
if (!browser) { // eslint-disable-line no-use-before-define
    var browser = require('webextension-polyfill'); // eslint-disable-line no-var, no-inner-declarations
}

/**
 * This content script sends latest data to background/RemotePontoon.js from loaded Pontoon pages.
 * - https://developer.mozilla.org/Add-ons/WebExtensions/Content_scripts
 */

new BackgroundPontoonClient().pageLoaded(document.location.toString(), document.documentElement.innerHTML);
