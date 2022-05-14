import pontoonLogo from '@assets/img/pontoon-logo.svg';
import bugImage from '@assets/img/bug.svg';
import {
  reportTranslatedTextToBugzilla,
  searchTextInPontoon,
} from '@background/backgroundClient';

const contextButtonWidth = 24;

function getSelectedText(): string {
  if (window.getSelection) {
    return window.getSelection()?.toString() || '';
  } else if (document.getSelection) {
    return document.getSelection()?.toString() || '';
  } else {
    return '';
  }
}

function createButton(imageSrc: string): HTMLElement {
  const imageButton = document.createElement('img');
  imageButton.src = imageSrc;
  imageButton.style.all = 'unset';
  imageButton.style.width = `${contextButtonWidth}px`;
  imageButton.style.position = 'absolute';
  imageButton.style.zIndex = '9999';
  imageButton.style.backgroundColor = 'white';
  imageButton.style.cursor = 'pointer';
  return imageButton;
}
const pontoonSearchButton = createButton(pontoonLogo);
const bugzillaReportButton = createButton(bugImage);
const allContextButtons = [pontoonSearchButton, bugzillaReportButton];

pontoonSearchButton.addEventListener('click', (e: MouseEvent) => {
  e.stopPropagation();
  searchTextInPontoon(getSelectedText());
  allContextButtons.forEach((button) => document.body.removeChild(button));
});
bugzillaReportButton.addEventListener('click', (e: MouseEvent) => {
  e.stopPropagation();
  reportTranslatedTextToBugzilla(getSelectedText());
  allContextButtons.forEach((button) => document.body.removeChild(button));
});

allContextButtons.forEach((button) => {
  button.addEventListener('mouseup', (e) => {
    e.stopPropagation();
  });
});

document.addEventListener('mouseup', (e) => {
  const selectedText = getSelectedText();
  if (selectedText.length > 0) {
    pontoonSearchButton.title = `Search for "${selectedText.trim()}" in translations of all projects`;
    bugzillaReportButton.title = `Report l10n bug for "${selectedText.trim()}"`;

    const yCoord = window.scrollY + e.screenY - 120;
    let xCoord = e.screenX + 6;
    allContextButtons.forEach((button) => {
      button.style.top = yCoord + 'px';
      button.style.left = xCoord + 'px';
      xCoord += contextButtonWidth + 6;
    });
    allContextButtons.forEach((button) => document.body.appendChild(button));
  } else {
    allContextButtons.forEach((button) => document.body.removeChild(button));
  }
});
