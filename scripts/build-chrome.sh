#!/bin/bash

set -e
set -o pipefail

mkdir -p ./build/chrome-src
cp -Lr ./src/* ./build/chrome-src

cat ./src/manifest.json | \
  jq 'del(.applications)' | `# remove mozilla-specific applications` \
  jq '.icons={"32":"packages/commons/img/pontoon-logo-32.png", "128":"packages/commons/img/pontoon-logo-128.png"}' | `# no support for SVG icons` \
  jq '.browser_action.default_icon="packages/commons/img/pontoon-logo-32.png"' | `# no support for SVG icons` \
  jq 'del(.page_action)' | `# no support for both browser and page actions at the same time` \
  jq 'del(.permissions[] | select( .=="contextualIdentities" or .=="cookies" or .=="webRequest" or .=="webRequestBlocking" ))' | `# no support for contextual identities` \
  tee ./build/chrome-src/manifest.json &>/dev/null

web-ext build -s ./build/chrome-src -a ./build/web-ext/chrome
