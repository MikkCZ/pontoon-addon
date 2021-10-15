export PATH := $(shell pwd)/scripts:$(PATH)

.PHONY: prepare
prepare:
	yarn clean-install

.PHONY: build
build:
	yarn build
	yarn test

.PHONY: watch
watch:
	yarn watch

.PHONY: codecov
watch:
	yarn codecov:upload

.PHONY: download_jq_and_build
download_jq_and_build:
	curl -L https://github.com/stedolan/jq/releases/download/jq-1.6/jq-linux64 -o scripts/jq
	chmod u+x scripts/jq
	make build

.PHONY: prepare_in_docker
prepare_in_docker:
	bash ./scripts/run-in-docker.sh make prepare

.PHONY: prepare_in_podman
prepare_in_podman:
	bash ./scripts/run-in-podman.sh make prepare

.PHONY: build_in_docker
build_in_docker:
	bash ./scripts/run-in-docker.sh make download_jq_and_build

.PHONY: build_in_podman
build_in_podman:
	bash ./scripts/run-in-podman.sh make download_jq_and_build

.PHONY: watch_in_docker
watch_in_docker:
	bash ./scripts/run-in-docker.sh make watch

.PHONY: watch_in_podman
watch_in_podman:
	bash ./scripts/run-in-podman.sh make watch

.PHONY: codecov_in_docker
codecov_in_docker:
	bash ./scripts/run-in-docker.sh make codecov

.PHONY: codecov_in_podman
codecov_in_podman:
	bash ./scripts/run-in-podman.sh make watch
