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

.PHONY: graphql_generate
graphql_generate:
	npm run graphql:generate

.PHONY: graphql_download_schema
graphql_download_schema:
	npm run graphql:download

.PHONY: bump_version
bump_version:
	npm version "$(bump)"

.PHONY: all_in_container
all_in_container:
	bash ./scripts/run-in-container.sh make all

.PHONY: prepare_in_container
prepare_in_container:
	bash ./scripts/run-in-container.sh make prepare

.PHONY: build_in_container
build_in_container:
	bash ./scripts/run-in-container.sh make build

.PHONY: test_in_container
test_in_container:
	bash ./scripts/run-in-container.sh make test

.PHONY: watch_in_container
watch_in_container:
	bash ./scripts/run-in-container.sh make watch

.PHONY: graphql_download_schema_in_container
graphql_download_schema_in_container:
	bash ./scripts/run-in-container.sh make graphql_download_schema

.PHONY: graphql_generate_in_container
graphql_generate_in_container:
	bash ./scripts/run-in-container.sh make graphql_generate

.PHONY: update_pontoon_graphql_schema
update_pontoon_graphql_schema:
	make graphql_download_schema_in_container
	make graphql_generate_in_container

.PHONY: bump_version_in_container
bump_version_in_container:
	bash ./scripts/run-in-container.sh make bump_version bump="$(bump)"
