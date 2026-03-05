#!/usr/bin/env bash
set -euo pipefail

# Validate Homebrew formula locally
# Default formula path assumes this script runs from repo root
FORMULA_PATH="${1:-./homebrew/clawlite.rb}"

if [[ ! -f "$FORMULA_PATH" ]]; then
  echo "❌ Formula not found: $FORMULA_PATH"
  echo "Usage: ./homebrew/homebrew-validation.sh ./homebrew/clawlite.rb"
  exit 1
fi

echo "==> 1) brew audit"
brew audit --strict --online "$FORMULA_PATH"

echo "==> 2) install from source"
brew install --build-from-source "$FORMULA_PATH"

echo "==> 3) command smoke tests"
if ! command -v clawlite >/dev/null 2>&1; then
  echo "❌ clawlite binary not found after install"
  exit 1
fi

clawlite --version || clawlite --help

echo "==> 4) brew test"
# Derive formula name from filename (clawlite.rb -> clawlite)
FORMULA_NAME="$(basename "$FORMULA_PATH" .rb)"
brew test "$FORMULA_NAME" || true

echo "==> 5) info output"
brew info "$FORMULA_NAME"

echo "✅ Homebrew local validation completed"
