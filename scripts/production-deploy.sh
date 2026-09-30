#!/usr/bin/env bash
# Convenience wrapper from repo root.
exec bash "$(CDPATH= cd -- "$(dirname "$0")/../infra/veriforge/scripts" && pwd)/production-deploy.sh" "$@"
