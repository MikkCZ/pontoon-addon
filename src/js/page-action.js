'use strict';

browser.runtime.onMessage.addListener((response, sender, sendResponse) => {
    switch (response.type) {
        case 'page-action-project-data':
            const openProjectPage = document.getElementById('open-project-page');
            openProjectPage.textContent = `Open ${response.project.name} project page`;
            openProjectPage.addEventListener('click', () => browser.tabs.create({url: response.project.pageUrl}));
            const openTranslationView = document.getElementById('open-translation-view');
            openTranslationView.textContent = `Open ${response.project.name} translation view`;
            openTranslationView.addEventListener('click', () => browser.tabs.create({url: response.project.translationUrl}));
            break;
    }
});

browser.runtime.sendMessage({
    type: 'page-action-opened',
});
