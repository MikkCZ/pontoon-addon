#!/bin/bash

set -e
set -o pipefail

CONTAINER_IMAGE='docker.io/library/node:16-bullseye' # LTS
COMMAND=${@}

docker pull "${CONTAINER_IMAGE}"
docker run --user "$(id -u):$(id -g)" \
  -e MODE="${MODE}" \
  -e CODECOV_TOKEN="${CODECOV_TOKEN}" \
  --workdir "${PWD}" \
  -v "${PWD}:${PWD}" \
  -v "${PWD}/scripts/.yarnrc:${PWD}/.yarnrc" \
  --rm=true \
  --entrypoint=/bin/bash \
  "${CONTAINER_IMAGE}" -c "${COMMAND}"
