'use-strict';

var options = new Options();
var inputs = document.querySelectorAll('input');

inputs.forEach(options.loadDefault.bind(options));
options.loadAllFromLocalStorage();
for (const input of inputs) {
  input.addEventListener('change', options.saveInputOnChange.bind(options));
}