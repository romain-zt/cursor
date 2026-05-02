#!/bin/bash
# Real /health audit. Replaces the prompt-only command.
# Checks: rule line counts, broken cross-references, scope leaks, stale specs/tasks, hooks.json validity.
# Output: human-readable report by default. Use --json for structured CI output.

set -u

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT" || exit 1

# Parse flags.
JSON_MODE=0
for arg in "$@"; do
  case "$arg" in
    --json) JSON_MODE=1 ;;
    *) ;;  # Unknown flags ignored for forward-compat.
  esac
done

# Hard guard: --json requires jq.
if [ "$JSON_MODE" -eq 1 ] && ! command -v jq &>/dev/null; then
  echo "ERROR: --json requires 'jq' to be installed." >&2
  exit 2
fi

errors=0
warnings=0

# JSON state — accumulated as we run checks. Each check appends to these arrays.
JSON_TMP=""
if [ "$JSON_MODE" -eq 1 ]; then
  JSON_TMP=$(mktemp -t health-check.XXXXXX) || exit 1
  trap 'rm -f "$JSON_TMP"' EXIT
  echo "[]" > "$JSON_TMP"
fi

# Per-check state.
current_check_name=""
current_check_status="pass"
current_check_messages=()

start_check() {
  current_check_name="$1"
  current_check_status="pass"
  current_check_messages=()
  if [ "$JSON_MODE" -eq 0 ]; then
    echo ""
    echo "=== $2 ==="
  fi
}

end_check() {
  if [ "$JSON_MODE" -eq 1 ]; then
    local messages_json="[]"
    if [ "${#current_check_messages[@]}" -gt 0 ]; then
      messages_json=$(printf '%s\n' "${current_check_messages[@]}" | jq -R . | jq -s .)
    fi
    local updated
    updated=$(jq --arg name "$current_check_name" \
                 --arg status "$current_check_status" \
                 --argjson messages "$messages_json" \
                 '. + [{name: $name, status: $status, messages: $messages}]' \
                 "$JSON_TMP")
    echo "$updated" > "$JSON_TMP"
  fi
}

fail() {
  errors=$((errors + 1))
  current_check_status="fail"
  current_check_messages+=("$1")
  [ "$JSON_MODE" -eq 0 ] && echo "  FAIL  $1"
}

warn() {
  warnings=$((warnings + 1))
  [ "$current_check_status" != "fail" ] && current_check_status="warn"
  current_check_messages+=("$1")
  [ "$JSON_MODE" -eq 0 ] && echo "  WARN  $1"
}

pass() {
  [ "$JSON_MODE" -eq 0 ] && echo "  PASS  $1"
}

# --- 1. Rule line counts (max 60) ---
start_check "rule-line-counts" "Rule Line Counts (max 60)"
rule_errors_before=$errors
while IFS= read -r f; do
  lines=$(wc -l < "$f" | tr -d ' ')
  if [ "$lines" -gt 60 ]; then
    fail "$f → $lines lines (limit: 60). Split into rule + skill."
  fi
done < <(find .cursor/rules -name "*.mdc" -type f 2>/dev/null)
[ "$errors" -eq "$rule_errors_before" ] && pass "all rules under 60 lines"
end_check

# --- 2. Broken cross-references in rules ---
start_check "cross-references" "Cross-References"
broken=0
while IFS= read -r f; do
  while IFS= read -r ref; do
    target=$(echo "$ref" | grep -oE '[a-zA-Z0-9_/.-]+\.(mdc|md)' | head -1)
    [ -z "$target" ] && continue
    if [ ! -f "$target" ] && [ ! -f ".cursor/rules/$target" ] && [ ! -f ".cursor/$target" ]; then
      warn "$f references missing → $target"
      broken=$((broken + 1))
    fi
  done < <(grep -oE '[a-zA-Z0-9_/-]+\.(mdc|md)' "$f" 2>/dev/null | sort -u)
done < <(find .cursor/rules -name "*.mdc" -type f 2>/dev/null)
[ "$broken" -eq 0 ] && pass "no broken cross-references"
end_check

# --- 3. hooks.json validity ---
start_check "hooks-json" "hooks.json"
if [ -f ".cursor/hooks.json" ]; then
  if command -v jq &>/dev/null; then
    if jq empty .cursor/hooks.json 2>/dev/null; then
      pass "hooks.json is valid JSON"
      while IFS= read -r script; do
        if [ ! -f "$script" ]; then
          fail "hooks.json references missing script: $script"
        elif [ ! -x "$script" ]; then
          warn "hook script not executable: $script (chmod +x needed)"
        fi
      done < <(jq -r '.hooks | to_entries[] | .value[]?.command // empty' .cursor/hooks.json 2>/dev/null | grep -E '^\.cursor/')
    else
      fail "hooks.json is invalid JSON"
    fi
  else
    warn "jq not installed — skipping hooks.json validation"
  fi
else
  warn ".cursor/hooks.json not found"
fi
end_check

# --- 4. Spec hygiene ---
start_check "spec-hygiene" "Spec Hygiene"
spec_count=$(find specs -maxdepth 1 -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
if [ "$spec_count" -eq 0 ]; then
  warn "no specs found in specs/ — nothing has been planned"
else
  stale_drafts=0
  while IFS= read -r spec; do
    age_days=$(( ( $(date +%s) - $(stat -c %Y "$spec" 2>/dev/null || stat -f %m "$spec" 2>/dev/null || echo "$(date +%s)") ) / 86400 ))
    if grep -q "Status:.*Draft" "$spec" && [ "$age_days" -gt 14 ]; then
      warn "$spec stuck in Draft for ${age_days}d"
      stale_drafts=$((stale_drafts + 1))
    fi
  done < <(find specs -maxdepth 1 -name "*.md" -type f 2>/dev/null)
  [ "$stale_drafts" -eq 0 ] && pass "no specs stuck in Draft >14d"
fi
end_check

# --- 5. Task freshness ---
start_check "task-freshness" "Task Freshness"
task_count=$(find tasks -maxdepth 1 -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
if [ "$task_count" -gt 0 ]; then
  stale_tasks=0
  while IFS= read -r task; do
    age_days=$(( ( $(date +%s) - $(stat -c %Y "$task" 2>/dev/null || stat -f %m "$task" 2>/dev/null || echo "$(date +%s)") ) / 86400 ))
    if [ "$age_days" -gt 7 ]; then
      warn "$task untouched for ${age_days}d — abandoned?"
      stale_tasks=$((stale_tasks + 1))
    fi
  done < <(find tasks -maxdepth 1 -name "*.md" -type f 2>/dev/null)
  [ "$stale_tasks" -eq 0 ] && pass "no tasks stale >7d"
else
  pass "no active tasks"
fi
end_check

# --- 6. Orphan agents ---
start_check "agent-wiring" "Agent ↔ Command Wiring"
orphans=0
while IFS= read -r agent; do
  name=$(basename "$agent" .mdc)
  if ! grep -rq "agents/${name}.mdc" .cursor/commands/ 2>/dev/null; then
    warn "agent has no command pointing to it: $name"
    orphans=$((orphans + 1))
  fi
done < <(find .cursor/rules/agents -name "*.mdc" -type f 2>/dev/null)
[ "$orphans" -eq 0 ] && pass "every agent has a command"
end_check

# --- Summary ---
exit_code=0
[ "$errors" -gt 0 ] && exit_code=1

if [ "$JSON_MODE" -eq 1 ]; then
  recommendation="All checks pass."
  if [ "$errors" -gt 0 ]; then
    recommendation="Fix $errors error(s) before merging."
  elif [ "$warnings" -gt 0 ]; then
    recommendation="Fix $warnings warning(s) when convenient."
  fi
  jq -n \
    --argjson version 1 \
    --arg timestamp "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" \
    --slurpfile checks "$JSON_TMP" \
    --argjson errors_total "$errors" \
    --argjson warnings_total "$warnings" \
    --argjson exit_code "$exit_code" \
    --arg recommendation "$recommendation" \
    '{
      version: $version,
      timestamp: $timestamp,
      checks: $checks[0],
      errors_total: $errors_total,
      warnings_total: $warnings_total,
      exit_code: $exit_code,
      recommendation: $recommendation
    }' | jq -c .
else
  echo ""
  echo "=== Summary ==="
  echo "  Errors:   $errors"
  echo "  Warnings: $warnings"
  echo ""
  if [ "$errors" -gt 0 ]; then
    echo "RESULT: FAIL ($errors errors, $warnings warnings)"
  elif [ "$warnings" -gt 0 ]; then
    echo "RESULT: WARN ($warnings warnings)"
  else
    echo "RESULT: PASS"
  fi
fi

exit $exit_code
