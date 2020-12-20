.PHONY: prepare
prepare:
	yarn install --frozen-lockfile
	yarn bootstrap

.PHONY: build
build:
	yarn build

.PHONY: download_jq_and_build
download_jq_and_build: # DO NOT USE LOCALLY, MODIFIES LOCAL SYSTEM
	curl -L https://github.com/stedolan/jq/releases/download/jq-1.6/jq-linux64 -o /usr/local/sbin/jq
	chmod +x /usr/local/sbin/jq
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
