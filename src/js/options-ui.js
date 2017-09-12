'use strict';

const options = new Options();
options.loadAllFromLocalStorage();
document.querySelectorAll('input').forEach((input) =>
    input.addEventListener('change', (e) => options.saveInputOnChange(e))
);
