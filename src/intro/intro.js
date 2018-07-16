/**
 * This script contains all the logic of the introduction tour.
 * @requires commons/js/Options.js
 */
'use strict';

const options = new Options();

// Add close button click even handler
document.getElementById('close').addEventListener('click', () =>
    browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
        tabs.forEach((tab) => browser.tabs.remove(tab.id));
    })
);

/**
 * Data and actions for all steps of the tour
 * { sectionId: { title, text, image, imageClass, buttonText, buttonOnClick } }
 */
const introSections = {
    toolbarButton: {
        title: 'Toolbar button',
        text: `After installation is complete, a Pontoon icon will appear in your browser toolbar. When there are new notifications for
                you, a red badge will appear in its corner. Simply click the icon to see the list of notifications.
                Below the list there is also an overview of your localization team progress.`,
        image: 'img/toolbar-button.png',
        imageClass: 'right',
        buttonText: 'Open toolbar button popup',
        buttonOnClick: () => browser.browserAction.openPopup(),
    },
    notifications: {
        title: 'System notifications',
        text: `The toolbar button and its popup are not the only way to get notified about something new and interesting
                in Pontoon. Pontoon Tools can also display system notifications to inform you about new notifications
                in Pontoon. Of course these notifications are configurable in the add-on settings. If you would like to
                preview Pontoon notifications in the system area, click the button below.`,
        buttonText: 'Preview system notifications',
        buttonOnClick: (e) => {
            options.set('show_notifications', true);
            browser.notifications.create({
                type: 'basic',
                iconUrl: browser.runtime.getURL('commons/img/pontoon-logo.svg'),
                title: 'Pontoon notification',
                message: 'Similar notification will appear if there is something new in Pontoon. If you click it, related ' +
                        'project or your Pontoon team page will open.',
            });
        },
    },
    pageAction: {
        title: 'Page action',
        text: `Page action is a small icon that will appear in your browser address bar on websites that are available
                for translation on Pontoon. Clicking it will display a list of options to open the project overview
                in Pontoon or jump to translation view directly.`,
        image: 'img/page-action.png',
        imageClass: 'bottom',
    },
    contextMenu: {
        title: 'Context menus',
        text: `Context menus are a hidden, but very useful feature in Pontoon Tools. If you see a typo on Mozilla websites,
                highlight the text with you mouse, right-click it and select to find the string in Pontoon, or report it
                to your team as a bug. If you are a SUMO localizer, you can search for Firefox strings you see
                in articles the same way.`,
        image: 'img/context-menu.png',
        imageClass: 'bottom',
    },
    addonSettings: {
        title: 'Add-on settings',
        text: `No default settings can fit everyone. In the add-on setting you can change your localization team,
                interval for checking new notifications, their appearing in the system notification area or adjust
                the toolbar button behaviour.`,
        image: 'img/settings.png',
        imageClass: 'bottom',
        buttonText: 'Open Pontoon Tools settings',
        buttonOnClick: () => browser.runtime.openOptionsPage(),
    },
    feedback: {
        title: 'Feedback',
        text: `This add-on won't exist and cannot improve without you - Mozilla localizers. Therefore, I would like
                to ask you for feedback on how Pontoon Tools helps you, or how can it help you even more. You can send
                a message to our mailing list "dev-l10n@lists.mozilla.org" or create a request in the GitHub
                repository by clicking the blue button below.`,
        image: 'img/2-Lions.png',
        imageClass: 'bottom',
        buttonText: 'Ask for a feature',
        buttonOnClick: () => browser.tabs.create({url: 'https://github.com/MikkCZ/pontoon-tools/issues'}),
    },
};

if (browser.pageAction === undefined) {
    // Address bar button is only supported in Firefox at this moment.
    delete introSections.pageAction;
}

// Get the main DOM elements of the introduction tour
const navigation = document.querySelector('nav ul');
const main = document.querySelector('main');
const aside = document.querySelector('aside');

/**
 * For each step specified in the data above, create a navigation item, prepare content and create navigation handlers.
 */
Object.keys(introSections).forEach((sectionId) => {
    const section = introSections[sectionId];

    // Create navigation item including the click event handler
    section.navItem = document.createElement('li');
    section.navItem.classList.add(sectionId);
    section.navItem.textContent = section.title;
    section.navItem.addEventListener('click', () => {
        [...navigation.childNodes].concat([...main.childNodes], [...aside.childNodes]).forEach(
            elem => (elem.classList) && elem.classList.remove('active')
        );
        [...document.getElementsByClassName(sectionId)].forEach(
            elem => elem.classList.add('active')
        );
    });
    navigation.appendChild(section.navItem);

    // Create step content (title, text and image)
    section.mainContent = document.createElement('section');
    section.mainContent.classList.add(sectionId);
    if (section.image && section.imageClass === 'right') {
        section.mainContent.appendChild(document.createElement('div'));
        section.mainContent.lastChild.classList.add('image', section.imageClass);
        section.mainContent.lastChild.appendChild(document.createElement('img'));
        section.mainContent.lastChild.lastChild.src = section.image;
    }
    section.mainContent.appendChild(document.createElement('h2'));
    section.mainContent.lastChild.textContent = section.title;
    section.mainContent.appendChild(document.createElement('p'));
    section.mainContent.lastChild.textContent = section.text;
    if (section.image && section.imageClass === 'bottom') {
        section.mainContent.appendChild(document.createElement('div'));
        section.mainContent.lastChild.classList.add('image', section.imageClass);
        section.mainContent.lastChild.appendChild(document.createElement('img'));
        section.mainContent.lastChild.lastChild.src = section.image;
    }
    main.appendChild(section.mainContent);

    // Create button for the tour step, including the click event handler
    if (section.buttonText) {
        section.asideButton = document.createElement('button');
        section.asideButton.classList.add(sectionId);
        section.asideButton.textContent = section.buttonText;
        section.asideButton.addEventListener('click', section.buttonOnClick);
        aside.appendChild(section.asideButton);
    }
});

// Activate the first step
[...document.getElementsByClassName(Object.keys(introSections)[0])].forEach(
    elem => elem.classList.add('active')
);
