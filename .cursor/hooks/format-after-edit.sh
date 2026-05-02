#!/bin/bash
# Runs a project formatter on the edited file if one is available.
# Fails open — if no formatter found, does nothing.

input=$(cat)
file_path=$(echo "$input" | jq -r '.file_path // empty')

if [ -z "$file_path" ]; then
  exit 0
fi

ext="${file_path##*.}"

if command -v npx &>/dev/null && [ -f "node_modules/.bin/prettier" ]; then
  npx prettier --write "$file_path" 2>/dev/null
elif command -v biome &>/dev/null; then
  biome format --write "$file_path" 2>/dev/null
fi

exit 0
