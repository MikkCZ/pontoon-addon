#!/bin/bash

set -e
set -o pipefail

CONTAINER_IMAGE='docker.io/library/node:14-buster' # LTS
COMMAND=${@}

podman pull "${CONTAINER_IMAGE}"
podman run \
  -e CODECOV_TOKEN="${CODECOV_TOKEN}" \
  --workdir "${PWD}" \
  -v "${PWD}:${PWD}:Z" \
  -v "${PWD}/scripts/.yarnrc:${PWD}/.yarnrc:Z" \
  --rm=true \
  --entrypoint=/bin/bash \
  "${CONTAINER_IMAGE}" -c "${COMMAND}"
