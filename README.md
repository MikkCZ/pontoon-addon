# Pontoon Tools
Pontoon Tools is an add-on integrating [Pontoon](https://pontoon.mozilla.org/) into Firefox. The aim is to ease localization work and provide tools beyond what a web app can do.

[![Build Status](https://travis-ci.org/MikkCZ/pontoon-tools.svg?branch=master)](https://travis-ci.org/MikkCZ/pontoon-tools) [![Mozilla Add-on](https://img.shields.io/amo/v/pontoon-tools.svg)](https://addons.mozilla.org/firefox/addon/pontoon-tools/) [![Mozilla Add-on](https://img.shields.io/amo/users/pontoon-tools.svg)](https://addons.mozilla.org/firefox/addon/pontoon-tools/)

## How to use
This add-on is a WebExtension, but because of limitations in Chromium-based browsers it's currently compatible with Firefox only. Please see the [listing on AMO](https://addons.mozilla.org/firefox/addon/pontoon-tools/) how to install and use it.

## How to get involved
For Mozilla localizers the easiest way to get involved is to use Pontoon Tools, [report bugs, request features](https://github.com/MikkCZ/pontoon-tools/issues) or send some short feedback to the [dev-l10n list](https://lists.mozilla.org/listinfo/dev-l10n).

For those, who prefer coding, Pontoon Tools add-on is written in pure JS, HTML and CSS. If you know these and a bit of [WebExtensions API](https://developer.mozilla.org/Add-ons/WebExtensions), [pick a task here](https://github.com/MikkCZ/pontoon-tools/issues) and leave a comment you would like to work on it. In the meantime, before I get back to you, here are few tips to help you start.

Prior making any changes in the code, make sure bulding the add-on works on your machine. The only dependency you should need is [npm](https://www.npmjs.com/get-npm). After installing npm, [fork](https://help.github.com/articles/fork-a-repo/) this repository, [clone](https://help.github.com/articles/cloning-a-repository/) it and use this command to run linting and all applicable tests.

`npm test`

If there are only warnings, no errors, you should be good to go. I use IntelliJ IDEs and gedit, but you can use any editor you feel comfortable with. [Atom](https://atom.io/) or [Notepad++](https://notepad-plus-plus.org/) are never bad choices.

Before pushing your commits and making a [pull request](https://help.github.com/articles/about-pull-requests/), please run `npm test` again to make sure your code is well formatted and without obvious errors.

In any moment, if you are not sure, what to do, do not hesitate to write a comment in the task you are working on and we will find out a solution.
