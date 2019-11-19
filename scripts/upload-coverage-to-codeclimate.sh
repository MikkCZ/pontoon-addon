#!/bin/bash

set -e
set -o pipefail

COVERAGE_FILES_PATTERN='./src/packages/*/coverage/lcov.info'
CC_COVERAGE_DIR='./coverage'
CC_REPORTER="${CC_COVERAGE_DIR}/cc-test-reporter"

### Check whether the upload should be run or not. ###

if [ "$TRAVIS_BRANCH" != 'master' ]; then
    echo 'The build is not running on branch "master". Coverage report will not be uploaded.'
    exit 0
fi

if [ "$TRAVIS_TEST_RESULT" != 0 ]; then
    echo 'Tests failed. Coverage report will not be uploaded.'
    exit 0
fi

if [ -z "${CC_TEST_REPORTER_ID}" ]; then
    >&2 echo '"CC_TEST_REPORTER_ID" is not set, coverage report cannot be uploaded.'
    exit 1
fi

# Fetch Code Climate reporter
if [ ! -f "$CC_REPORTER" ]; then
    mkdir -p "$CC_COVERAGE_DIR"
    curl -L https://codeclimate.com/downloads/test-reporter/test-reporter-latest-linux-amd64 > "$CC_REPORTER"
    chmod +x "$CC_REPORTER"
fi

# Prepare
"$CC_REPORTER" before-build

# Format coverage files
find . -type f -wholename "$COVERAGE_FILES_PATTERN" -print0 |
    while IFS= read -r -d '' file; do
        src_package_name="$(echo "$file" | cut -d'/' -f 4)"
        "$CC_REPORTER" format-coverage -t lcov -o "${CC_COVERAGE_DIR}/codeclimate.${src_package_name}.json" "$file"
        coverage_files_count=$((coverage_files_count + 1))
        echo "Formatted ${CC_COVERAGE_DIR}/codeclimate.${src_package_name}.json from ${file}."
    done

# Merge all coverage parts
coverage_files_count="$(find . -type f -wholename "$COVERAGE_FILES_PATTERN" | wc -l)"
if [ "$coverage_files_count" != 0 ]; then
    echo "Merging $coverage_files_count coverage files"
    "$CC_REPORTER" sum-coverage "${CC_COVERAGE_DIR}"/codeclimate.*.json -p "$coverage_files_count"
else
    >&2 echo 'No coverage files found to merge.'
    exit 2
fi

# Upload report
"$CC_REPORTER" upload-coverage

# Cleanup
rm -r "$CC_COVERAGE_DIR"
