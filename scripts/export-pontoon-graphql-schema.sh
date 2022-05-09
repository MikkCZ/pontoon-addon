#!/bin/bash

set -e
set -o pipefail

OUTPUT_FILE="${1}"

PONTOON_REPO_DIR='./tmp/pontoon'

# install minimal system dependencies
apt-get update
apt-get install -y git python3.9 python3-pip python-is-python3 libpq-dev

# clone Pontoon
rm -rf "${PONTOON_REPO_DIR}"
git clone --depth 1 https://github.com/mozilla/pontoon.git "${PONTOON_REPO_DIR}"

# install Pontoon dependencies
PIP_INSTALL='pip install --user --cache-dir ./.pip/cache'
${PIP_INSTALL} mysql
${PIP_INSTALL} --require-hashes -r "${PONTOON_REPO_DIR}/requirements/default.txt"

# export schema definition to file
SECRET_KEY='SECRET_KEY' ${PONTOON_REPO_DIR}/manage.py graphql_schema --schema pontoon.api.schema.schema --out "${OUTPUT_FILE}"

rm -r "${PONTOON_REPO_DIR}"
