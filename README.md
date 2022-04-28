# Pontoon Add-on

[![Build](https://github.com/MikkCZ/pontoon-addon/actions/workflows/build.yml/badge.svg)](https://github.com/MikkCZ/pontoon-addon/actions/workflows/build.yml)
[![codecov](https://codecov.io/gh/MikkCZ/pontoon-addon/branch/master/graph/badge.svg?token=wV84O1ujms)](https://codecov.io/gh/MikkCZ/pontoon-addon)

[![Mozilla Add-on](https://img.shields.io/amo/v/pontoon-tools.svg?label=Firefox)](https://addons.mozilla.org/firefox/addon/pontoon-tools/)
[![Mozilla Add-on](https://img.shields.io/amo/users/pontoon-tools.svg)](https://addons.mozilla.org/firefox/addon/pontoon-tools/statistics/)

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/gnbfbnpjncpghhjmmhklfhcglbopagbb.svg?label=Chrome)](https://chrome.google.com/webstore/detail/pontoon-tools/gnbfbnpjncpghhjmmhklfhcglbopagbb)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/users/gnbfbnpjncpghhjmmhklfhcglbopagbb.svg?text=users)](https://chrome.google.com/webstore/detail/pontoon-tools/gnbfbnpjncpghhjmmhklfhcglbopagbb)

Pontoon Add-on is an add-on integrating [Pontoon](https://pontoon.mozilla.org/) into your browser. The aim is to ease localization work and provide tools beyond what a web app can do.

## How to install & use

This add-on is a WebExtension and works both in Firefox and Chrome. Please read the [wiki](https://github.com/MikkCZ/pontoon-addon/wiki), how to install and use it.

## Get involved

Pontoon Add-on started as [Michal's](https://people.mozilla.org/p/mstanke/) personal project, but is dedicated to all Mozilla localizers. You are welcome to [report bugs, request new features](https://github.com/MikkCZ/pontoon-addon/issues) or send your feedback to [Mozilla Discourse](https://discourse.mozilla.org/c/pontoon). During any involvement with this project, please mind both the [project's contributing guidelines](.github/CONTRIBUTING.md) and [Mozilla Community Participation Guidelines](.github/CODE_OF_CONDUCT.md).

### Build instructions

To build the extension, the supported operating systems are Linux (or WSL) and macOS, with Make and Node.js installed. For an initial full build, run `make`. Alternatively if you have Docker instead of Node.js, run `make all_in_docker`. The extension can then be found in `dist/<browser>/web-ext` folder. Please see the [wiki](https://github.com/MikkCZ/pontoon-addon/wiki/Technical-Overview) for more detailed info.

## Privacy policy

The privacy policy is available [here](PRIVACY.md) and apply to both Firefox and Chrome versions of Pontoon Add-on.
