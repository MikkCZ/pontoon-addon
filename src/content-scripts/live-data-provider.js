/**
 * This content script sends latest data to commons/js/RemotePontoon.js from loaded Pontoon pages.
 * - https://developer.mozilla.org/Add-ons/WebExtensions/Content_scripts
 * @requires commons/js/BackgroundPontoonClient.js
 */
'use strict';

new BackgroundPontoonClient().pageLoaded(document.location.toString(), document.documentElement.innerHTML);
