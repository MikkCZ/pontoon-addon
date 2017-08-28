'use-strict';

chrome.runtime.sendMessage({
    type: 'pontoon-page-loaded',
    value: document.documentElement.innerHTML
});