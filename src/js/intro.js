'use strict';

document.getElementById('close').addEventListener('click', () =>
    browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
        tabs.forEach((tab) => browser.tabs.remove(tab.id));
    })
);

const introSections = {
    toolbarButton: {
        title: 'Toolbar button',
        text: 'Toolbar button lorem ipsum',
        buttonText: 'Open toolbar button popup',
        buttonOnClick: () => browser.browserAction.openPopup(),
    },
    pageAction: {
        title: 'Page action',
        text: 'Page action lorem ipsum',
    },
    contextMenu: {
        title: 'Context menus',
        text: 'Context menu lorem ipsum',
    },
    addonOptions: {
        title: 'Pontoon Tools Options',
        text: 'Pontoon Tools lorem ipsum',
        buttonText: 'Open Pontoon Tools options',
        buttonOnClick: () => browser.runtime.openOptionsPage(),
    },
    feedback: {
        title: 'Feedback',
        text: 'Feedback lorem ipsum',
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
    section.mainContent.appendChild(document.createElement('h2'));
    section.mainContent.lastChild.textContent = section.title;
    section.mainContent.appendChild(document.createElement('p'));
    section.mainContent.lastChild.textContent = section.text;
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
