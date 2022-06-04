#!/bin/bash

set -e
set -o pipefail

CONTAINER_IMAGE='docker.io/library/node:16-bullseye' # LTS
COMMAND=${@}

CONTAINER_RUN='podman run'

command -v podman > /dev/null 2>&1 || {
  CONTAINER_RUN="docker run --user $(id -u):$(id -g)"
}

${CONTAINER_RUN} \
  -e MODE="${MODE}" \
  --workdir "${PWD}" \
  -v "${PWD}:${PWD}:Z" \
  -v "${PWD}/scripts/.npmrc:${PWD}/.npmrc:Z" \
  --pull=always \
  --rm=true \
  --entrypoint=/bin/bash \
  "${CONTAINER_IMAGE}" -c "${COMMAND}"
