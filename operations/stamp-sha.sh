#!/usr/bin/env bash
# Rewrites the deployed commit sha across both job specs in this directory.
#
# The cluster's Nomad does not support HCL2 variables, and the self-hosted
# runner that used to substitute a placeholder at deploy time was
# decommissioned, so each spec carries the image tag literally. Doing both at
# once is the point: stage and live drifting apart is not obvious from either
# file on its own.
#
#   ./operations/stamp-sha.sh                      # tip of origin/master
#   ./operations/stamp-sha.sh <full-40-char-sha>   # a specific build
#
# This repository's CI publishes a bare commit sha, with no `sha-` prefix. That
# differs from the wuzzy monorepo, so the two stamp scripts are not
# interchangeable even though they read alike.
set -euo pipefail

cd "$(dirname "$0")/.."

sha="${1:-$(git rev-parse origin/master)}"

if ! [[ "$sha" =~ ^[0-9a-f]{40}$ ]]; then
  echo "not a full 40-character sha: $sha" >&2
  echo "CI tags images by full sha, so an abbreviated one selects no image." >&2
  exit 1
fi

sed -i -E \
  -e "s|(ghcr\.io/memetic-block/wuzzy-docs:)[0-9a-f]{40}|\1${sha}|g" \
  operations/*.hcl

echo "stamped ${sha}"
git --no-pager diff --stat -- operations/
