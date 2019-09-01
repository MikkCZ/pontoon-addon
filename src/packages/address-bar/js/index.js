import { BackgroundPontoonClient } from 'Commons/js/BackgroundPontoonClient';
if (!browser) {
    var browser = require('webextension-polyfill'); // eslint-disable-line no-var, no-inner-declarations
}

/**
 * This is the main script for the content of the page action popup.
 */

// Get the project data from background/RemotePontoon.js.
const backgroundPontoonClient = new BackgroundPontoonClient();
backgroundPontoonClient.getPontoonProjectForTheCurrentTab().then((response) => {
    // Link to open project page in Pontoon
    const openProjectPage = document.getElementById('open-project-page');
    openProjectPage.textContent = `Open ${response.name} project page`;
    openProjectPage.addEventListener('click', () => browser.tabs.create({url: response.pageUrl}));
    // Link to open translation view of the project in Pontoon
    const openTranslationView = document.getElementById('open-translation-view');
    openTranslationView.textContent = `Open ${response.name} translation view`;
    openTranslationView.addEventListener('click', () => browser.tabs.create({url: response.translationUrl}));
});
