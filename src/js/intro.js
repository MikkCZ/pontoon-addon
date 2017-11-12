'use strict';

document.getElementById('close').addEventListener('click', () =>
    browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
        tabs.forEach((tab) => browser.tabs.remove(tab.id));
    })
);

const introSections = {
    toolbarButton: {
        title: 'Toolbar button',
        text: `After installation, Pontoon icon appears in your browser toolbar. When there are new notifications for
                you, a red badge will appear in its corner. Simply click the icon to see the the notifications list.
                Below the list there is also an overview of your localization team progress.`,
        image: '../img/intro/toolbar-button.png',
        imageClass: 'right',
        buttonText: 'Open toolbar button popup',
        buttonOnClick: () => browser.browserAction.openPopup(),
    },
    pageAction: {
        title: 'Page action',
        text: `Page action is a small icon that will appear in your browser address bar on websites that are available
                for translation on Pontoon. Clicking it will open a list of options to open the project overview
                in Pontoon or jump to translation view directly.`,
        image: '../img/intro/page-action.png',
        imageClass: 'bottom',
    },
    contextMenu: {
        title: 'Context menus',
        text: `Context menus are hidden, but very useful feature in Pontoon Tools. If you see a typo on Mozilla website,
                highlight the text with you mouse, right-click it and select to find the string in Pontoon, or report it
                to your team as a bug. If you are a SUMO localizer, you can search for Firefox strings you see
                in articles the same way.`,
        image: '../img/intro/context-menu.png',
        imageClass: 'bottom',
    },
    addonOptions: {
        title: 'Pontoon Tools Options',
        text: `As simple Pontoon Tools may look like, no default settings can fit everyone. In the provided options you
                can change your language you translate too, interval for checking new notifications or adjust
                the toolbar button behaviour.`,
        image: '../img/intro/options.png',
        imageClass: 'bottom',
        buttonText: 'Open Pontoon Tools options',
        buttonOnClick: () => browser.runtime.openOptionsPage(),
    },
    feedback: {
        title: 'Feedback',
        text: `This add-on won't exist and cannot improve without you - Mozilla localizers. Therefore I would like
                to ask you for feedback how Pontoon Tools help you, or how can it help you even more. You can send
                a message to our mailing list "dev-l10n@lists.mozilla.org" or create a request in the GitHub
                repository by clicking the blue button below.`,
        image: '../img/intro/2-Lions-500px.png',
        imageClass: 'bottom',
        buttonText: 'Ask for a feature',
        buttonOnClick: () => browser.tabs.create({url: 'https://github.com/MikkCZ/pontoon-tools/issues'}),
    },
};

const navigation = document.querySelector('nav ul');
const main = document.querySelector('main');
const aside = document.querySelector('aside');

Object.keys(introSections).forEach((sectionId) => {
    const section = introSections[sectionId];

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

    if (section.buttonText) {
        section.asideButton = document.createElement('button');
        section.asideButton.classList.add(sectionId);
        section.asideButton.textContent = section.buttonText;
        section.asideButton.addEventListener('click', section.buttonOnClick);
        aside.appendChild(section.asideButton);
    }
});

[...document.getElementsByClassName(Object.keys(introSections)[0])].forEach(
    elem => elem.classList.add('active')
);
