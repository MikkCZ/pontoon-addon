#!/bin/bash

set -e
set -o pipefail

command -v 'jq' >/dev/null 2>&1 || { echo >&2 "ERROR: Packaging for Chromium requires 'jq'. Install 'jq' first and re-run the build. Aborting."; exit 1; }

mkdir -p ./tmp/chrome-src
cp -LR ./src/* ./tmp/chrome-src

cat ./src/manifest.json | \
  jq 'del(.applications)' | `# remove mozilla-specific applications` \
  jq '.icons={"32":"packages/commons/static/img/pontoon-logo-32.png", "128":"packages/commons/static/img/pontoon-logo-128.png"}' | `# no support for SVG icons` \
  jq '.browser_action.default_icon="packages/commons/static/img/pontoon-logo-32.png"' | `# no support for SVG icons` \
  jq 'del(.page_action)' | `# no support for both browser and page actions at the same time` \
  jq 'del(.permissions[] | select( .=="contextualIdentities" or .=="cookies" or .=="webRequest" or .=="webRequestBlocking" ))' | `# no support for contextual identities` \
  tee ./tmp/chrome-src/manifest.json &>/dev/null

web-ext build -s ./tmp/chrome-src -i 'packages/*/assets/' 'packages/*/public/' 'packages/*/src/' '**/.eslintrc.js' '**/.eslintrc.yml' '**/babel.config.js' '**/jest.config.js' '**/jest.setup.js' '**/package.json' '**/webpack.config.js' '**/node_modules/' 'packages/*/coverage/' -a ./dist/web-ext/chrome
