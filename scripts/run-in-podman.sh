#!/bin/bash

set -e
set -o pipefail

CONTAINER_IMAGE='docker.io/library/node:lts-buster'
COMMAND=${@}

podman pull "${CONTAINER_IMAGE}"
podman run \
  --workdir "${PWD}" \
  -v "${PWD}:${PWD}:Z" \
  --rm=true \
  --entrypoint=/bin/bash \
  "${CONTAINER_IMAGE}" -c "${COMMAND}"
