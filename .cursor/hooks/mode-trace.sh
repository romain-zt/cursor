#!/bin/bash
# Logs the agent's mode + a snippet of its response to .cursor/log/agent-trace.jsonl.
# Useful to retrospect: "did the agent actually behave like the Reviewer?"
# Fails open — never blocks the agent if logging fails.

input=$(cat)

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
LOG_DIR="$REPO_ROOT/.cursor/log"
LOG_FILE="$LOG_DIR/agent-trace.jsonl"

mkdir -p "$LOG_DIR" 2>/dev/null || exit 0

if ! command -v jq &>/dev/null; then
  exit 0
fi

response=$(echo "$input" | jq -r '.response // .message // ""' 2>/dev/null | head -c 500)
timestamp=$(date -u '+%Y-%m-%dT%H:%M:%SZ')

mode="unknown"
case "$response" in
  *"Strategist"*|*"strategize"*|*"challenge me"*|*"don't build"*) mode="strategist" ;;
  *"[blocking]"*|*"[nit]"*|*"[question]"*) mode="reviewer" ;;
  *"failure path"*|*"edge case"*|*"it('returns"*) mode="tester" ;;
  *"specs/"*|*"features/"*|*"stories/"*|*"Open Questions"*) mode="planner" ;;
  *"DoD"*|*"lint passes"*|*"tests pass"*) mode="implementer" ;;
esac

jq -n \
  --arg ts "$timestamp" \
  --arg mode "$mode" \
  --arg snippet "$response" \
  '{timestamp: $ts, inferred_mode: $mode, response_snippet: $snippet}' \
  >> "$LOG_FILE" 2>/dev/null

exit 0
