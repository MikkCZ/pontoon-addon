'use strict';

const options = new Options();

// Load options values from storage.
options.loadAllFromLocalStorage();

// Watch for input changes and store the new values.
document.querySelectorAll('input').forEach((input) =>
    input.addEventListener('change', (e) => options.saveInputOnChange(e))
);
