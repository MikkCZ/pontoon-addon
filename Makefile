export PATH := $(shell pwd)/scripts:$(PATH)

.DEFAULT_GOAL := all
.PHONY: all
all: prepare build test

.PHONY: prepare
prepare:
	npm run clean-install

.PHONY: build
build:
	npm run build

.PHONY: test
test:
	npm run test

.PHONY: watch
watch:
	npm run watch

.PHONY: codecov
codecov:
	npm run codecov

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
	bash ./scripts/run-in-docker.sh make build

.PHONY: build_in_podman
build_in_podman:
	bash ./scripts/run-in-podman.sh make build

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
