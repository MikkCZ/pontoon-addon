#!/bin/bash

set -e
set -o pipefail

command -v 'jq' >/dev/null 2>&1 || { echo >&2 "ERROR: Packaging for Chromium requires 'jq'. Install 'jq' first and re-run the build. Aborting."; exit 1; }

mkdir -p ./dist/chrome-src
cp -LR ./dist/src/* ./dist/chrome-src

cat ./dist/src/manifest.json | \
  jq 'del(.applications)' | `# remove mozilla-specific applications` \
  jq '.icons={"32":"assets/img/pontoon-logo-32.png", "128":"assets/img/pontoon-logo-128.png"}' | `# no support for SVG icons` \
  jq '.browser_action.default_icon="assets/img/pontoon-logo-32.png"' | `# no support for SVG icons` \
  jq 'del(.page_action)' | `# no support for both browser and page actions at the same time` \
  jq 'del(.permissions[] | select( .=="contextualIdentities" or .=="cookies" or .=="webRequest" or .=="webRequestBlocking" ))' | `# no support for contextual identities` \
  tee ./dist/chrome-src/manifest.json &>/dev/null
