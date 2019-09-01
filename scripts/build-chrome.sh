#!/bin/bash

set -e

mkdir -p ./build/chrome-src
cp -Lr ./src/* ./build/chrome-src

# TODO: replace this with jq
mv ./build/chrome-src/manifest-chrome.json ./build/chrome-src/manifest.json

web-ext build -s ./build/chrome-src -a ./build/web-ext/chrome
