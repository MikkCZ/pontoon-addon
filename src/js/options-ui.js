var optionsPrefix = 'options.';

function loadOptionsFromLocalStorage() {
  chrome.storage.local.get(function (items) {
    Object.keys(items).map(function(key, index) {
      if (key.startsWith(optionsPrefix)) {
        var value = items[key];
        var inputId = key.replace(new RegExp('^' + optionsPrefix), '');
        document.getElementById(inputId).value = value;
      }
    });
  });
}

function isValid(input) {
  return (input.parentElement.querySelector(':valid') === input);
}

function saveChangedOptionToLocalStorage(e) {
  var input = e.target;
  if (isValid(input)) {
    var optionId = optionsPrefix + input.id;
    var option = { };
    option[optionId] = input.value;
    chrome.storage.local.set(option);
  }
}

for (input of document.querySelectorAll('input')) {
  input.addEventListener('change', saveChangedOptionToLocalStorage);
}

loadOptionsFromLocalStorage();
