/**
 * This is the main script for the content of the page action popup.
 */
'use strict';

// Listen to message from PageAction.js with the project information
browser.runtime.onMessage.addListener((response, sender, sendResponse) => {
    switch (response.type) {
        case 'page-action-project-data':
            // Link to open project page in Pontoon
            const openProjectPage = document.getElementById('open-project-page');
            openProjectPage.textContent = `Open ${response.project.name} project page`;
            openProjectPage.addEventListener('click', () => browser.tabs.create({url: response.project.pageUrl}));
            // Link to open translation view of the project in Pontoon
            const openTranslationView = document.getElementById('open-translation-view');
            openTranslationView.textContent = `Open ${response.project.name} translation view`;
            openTranslationView.addEventListener('click', () => browser.tabs.create({url: response.project.translationUrl}));
            break;
    }
});

// Send a message to PageAction.js to get the project data.
// NOTE: The request-response messaging does not work here, as the project data are fetched asynchronously.
browser.runtime.sendMessage({
    type: 'page-action-opened',
});
