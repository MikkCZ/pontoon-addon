'use strict';

const options = new Options();
const inputs = document.querySelectorAll('input');

options.loadAllFromLocalStorage();
for (const input of inputs) {
  input.addEventListener('change', options.saveInputOnChange.bind(options));
}
