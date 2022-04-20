export PATH := $(shell pwd)/scripts:$(PATH)

.DEFAULT_GOAL := all
.PHONY: all
all: prepare build test

.PHONY: prepare
prepare:
	yarn clean-install

.PHONY: build
build:
	yarn build

.PHONY: download_jq_and_build
download_jq_and_build:
	curl -L https://github.com/stedolan/jq/releases/download/jq-1.6/jq-linux64 -o scripts/jq
	chmod u+x scripts/jq
	make build

.PHONY: test
test:
	yarn test

.PHONY: watch
watch:
	yarn watch

.PHONY: codecov
codecov:
	yarn codecov

.PHONY: all_in_docker
all_in_docker:
	bash ./scripts/run-in-docker.sh make all

.PHONY: all_in_podman
all_in_podman:
	bash ./scripts/run-in-podman.sh make all

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

.PHONY: test_in_docker
test_in_docker:
	bash ./scripts/run-in-docker.sh make test

.PHONY: test_in_podman
test_in_podman:
	bash ./scripts/run-in-podman.sh make test

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
	bash ./scripts/run-in-podman.sh make codecov
