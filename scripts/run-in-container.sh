#!/bin/bash

set -e
set -o pipefail

CONTAINER_IMAGE=${CONTAINER_IMAGE:-'docker.io/library/node:20-bookworm'} # LTS
COMMAND=${@}

CONTAINER_RUN='podman run'

command -v podman > /dev/null 2>&1 || {
  CONTAINER_RUN="docker run --user $(id -u):$(id -g)"
}

${CONTAINER_RUN} \
  -it \
  -e "TERM=xterm-256color" \
  --pull=always \
  --rm=true \
  -v "${PWD}:${PWD}:Z" \
  --workdir "${PWD}" \
  -e NPM_CONFIG_CACHE="${PWD}/.npm_in_container" \
  -e MODE="${MODE}" \
  --entrypoint=/bin/bash \
  "${CONTAINER_IMAGE}" -c "${COMMAND}"
