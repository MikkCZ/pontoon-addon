#!/bin/bash

set -e
set -o pipefail

CONTAINER_IMAGE='docker.io/library/node:16-bullseye' # LTS
COMMAND=${@}

podman pull "${CONTAINER_IMAGE}"
podman run \
  -e MODE="${MODE}" \
  -e CODECOV_TOKEN="${CODECOV_TOKEN}" \
  --workdir "${PWD}" \
  -v "${PWD}:${PWD}:Z" \
  -v "${PWD}/scripts/.npmrc:${PWD}/.npmrc:Z" \
  --rm=true \
  --entrypoint=/bin/bash \
  "${CONTAINER_IMAGE}" -c "${COMMAND}"
