#!/bin/bash

set -e
set -o pipefail

OUTPUT_FILE="${1}"

PONTOON_REPO_DIR='./tmp/pontoon'

# clone Pontoon
rm -rf "${PONTOON_REPO_DIR}"
git clone --depth 1 https://github.com/mozilla/pontoon.git "${PONTOON_REPO_DIR}"

# install Pontoon dependencies
PIP_INSTALL='pip install --user --cache-dir ./tmp/.pip/cache --no-warn-script-location'
${PIP_INSTALL} mysql
${PIP_INSTALL} --require-hashes -r "${PONTOON_REPO_DIR}/requirements/default.txt"

# export schema definition to file
SECRET_KEY='SECRET_KEY' ${PONTOON_REPO_DIR}/manage.py graphql_schema --schema pontoon.api.schema.schema --out=-.graphql | grep -v '__debug' > "${OUTPUT_FILE}"

rm -r "${PONTOON_REPO_DIR}"
