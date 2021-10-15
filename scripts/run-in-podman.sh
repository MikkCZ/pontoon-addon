#!/bin/bash

set -e
set -o pipefail

CONTAINER_IMAGE='docker.io/library/node:14-buster' # LTSs
COMMAND=${@}

podman pull "${CONTAINER_IMAGE}"
podman run \
  --workdir "${PWD}" \
  -v "${PWD}:${PWD}:Z" \
  -v "${PWD}/scripts/.yarnrc:${PWD}/.yarnrc:Z" \
  --rm=true \
  --entrypoint=/bin/bash \
  "${CONTAINER_IMAGE}" -c "${COMMAND}"  \
  -e CODECOV_TOKEN = $CODECOV_TOKEN 
