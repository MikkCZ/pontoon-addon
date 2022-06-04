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

.PHONY: graphql_generate
graphql_generate:
	npm run graphql:generate

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

.PHONY: graphql_generate_in_container
graphql_generate_in_container:
	bash ./scripts/run-in-container.sh make graphql_generate

.PHONY: export_pontoon_graphql_schema
export_pontoon_graphql_schema:
	bash ./scripts/run-in-container.sh 'bash ./scripts/export-pontoon-graphql-schema.sh ./src/pontoon.graphql'
	make graphql_generate_in_container
