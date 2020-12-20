#!/bin/bash

set -e
set -o pipefail

CONTAINER_IMAGE='docker.io/library/node:lts-buster'
COMMAND=${@}

docker pull "${CONTAINER_IMAGE}"
docker run --user "$(id -u):$(id -g)" \
  --workdir "${PWD}" \
  -v "${PWD}:${PWD}" \
  --rm=true \
  --entrypoint=/bin/bash \
  "${CONTAINER_IMAGE}" -c "${COMMAND}"
