import pontoonLogo from '@assets/img/pontoon-logo.svg';
import bugImage from '@assets/img/bug.svg';
import {
  reportTranslatedTextToBugzilla,
  searchTextInPontoon,
} from '@commons/backgroundMessaging';
import { colors } from '@frontend/commons/const';

const contextButtonWidth = 24;

function getSelectedText(): string {
  if (window.getSelection) {
    return window.getSelection()?.toString().trim() || '';
  } else if (document.getSelection) {
    return document.getSelection()?.toString().trim() || '';
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
  imageButton.style.backgroundColor = colors.background.white;
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
    pontoonSearchButton.title = `Search for "${selectedText}" in translations of all projects`;
    bugzillaReportButton.title = `Report l10n bug for "${selectedText}"`;

    const yCoord = window.scrollY + e.screenY - 120;
    let xCoord = e.screenX + 6;
    allContextButtons.forEach((button) => {
      button.style.top = yCoord + 'px';
      button.style.left = xCoord + 'px';
      xCoord += contextButtonWidth + 6;
    });
    allContextButtons.forEach((button) => document.body.appendChild(button));
  } else {
    allContextButtons
      .filter((button) => button.parentElement || button.parentNode)
      .forEach((button) => document.body.removeChild(button));
  }
});
