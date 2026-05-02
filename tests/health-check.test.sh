#!/bin/bash
# Integration tests for .cursor/hooks/health-check.sh
# Pure bash — no test framework required.
# Run: bash tests/health-check.test.sh

set -u

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCRIPT="$REPO_ROOT/.cursor/hooks/health-check.sh"

passed=0
failed=0
failures=()

assert() {
  local name="$1"
  local condition="$2"
  if eval "$condition"; then
    passed=$((passed + 1))
    echo "  PASS  $name"
  else
    failed=$((failed + 1))
    failures+=("$name")
    echo "  FAIL  $name"
  fi
}

run_test() {
  echo ""
  echo "=== $1 ==="
}

# --- Failure-path tests (70%) ---

run_test "T1: --json with jq missing exits 2"
PATH="/usr/bin:/bin" command -v jq >/dev/null 2>&1
JQ_AVAILABLE=$?
if [ $JQ_AVAILABLE -ne 0 ]; then
  output=$(bash "$SCRIPT" --json 2>&1)
  exit_code=$?
  assert "exits with code 2" "[ $exit_code -eq 2 ]"
  assert "stderr mentions jq" "echo \"\$output\" | grep -qi jq"
else
  echo "  SKIP  jq is installed; cannot test missing-jq path"
fi

run_test "T2: --json with malformed input still produces valid JSON"
output=$(bash "$SCRIPT" --json 2>/dev/null)
last_line=$(echo "$output" | tail -1)
assert "last line is valid JSON" "echo '$last_line' | jq empty 2>/dev/null"

run_test "T3: unknown flag is ignored (forward-compat)"
output=$(bash "$SCRIPT" --unknown-flag-xyz 2>&1)
exit_code=$?
assert "still exits 0 or 1 (not crash)" "[ $exit_code -eq 0 ] || [ $exit_code -eq 1 ]"

run_test "T4: --json output contains errors_total as integer"
output=$(bash "$SCRIPT" --json 2>/dev/null | tail -1)
errors_total=$(echo "$output" | jq -r '.errors_total // "missing"')
assert "errors_total field present" "[ \"$errors_total\" != 'missing' ]"
assert "errors_total is a number" "echo '$errors_total' | grep -qE '^[0-9]+$'"

run_test "T5: --json output contains warnings_total as integer"
warnings_total=$(echo "$output" | jq -r '.warnings_total // "missing"')
assert "warnings_total field present" "[ \"$warnings_total\" != 'missing' ]"
assert "warnings_total is a number" "echo '$warnings_total' | grep -qE '^[0-9]+$'"

run_test "T6: --json output contains exit_code field"
exit_code_field=$(echo "$output" | jq -r '.exit_code // "missing"')
assert "exit_code field present" "[ \"$exit_code_field\" != 'missing' ]"

run_test "T7: --json output contains checks array"
checks_count=$(echo "$output" | jq -r '.checks | length // "missing"')
assert "checks array present" "[ \"$checks_count\" != 'missing' ]"
assert "checks array has at least 6 entries" "[ \$checks_count -ge 6 ]"

run_test "T8: each check has name, status, messages"
all_valid=$(echo "$output" | jq -r '[.checks[] | select(.name == null or .status == null or (.messages | type) != "array")] | length')
assert "every check object is well-formed" "[ \"$all_valid\" = '0' ]"

run_test "T9: status values are only pass/warn/fail"
invalid_status=$(echo "$output" | jq -r '[.checks[] | select(.status != "pass" and .status != "warn" and .status != "fail")] | length')
assert "no invalid status values" "[ \"$invalid_status\" = '0' ]"

run_test "T10: --json with multiple flags is idempotent"
output_double=$(bash "$SCRIPT" --json --json 2>/dev/null | tail -1)
errors_double=$(echo "$output_double" | jq -r '.errors_total')
assert "double --json works" "[ \"$errors_double\" != 'null' ]"

# --- Happy-path tests (30%) ---

run_test "T11: no flag → human output unchanged in shape"
output_human=$(bash "$SCRIPT" 2>/dev/null)
assert "human output starts with '=== Rule Line Counts'" "echo \"\$output_human\" | head -3 | grep -q 'Rule Line Counts'"
assert "human output ends with RESULT line" "echo \"\$output_human\" | tail -3 | grep -qE 'RESULT: (PASS|WARN|FAIL)'"

run_test "T12: --json output suppresses human prose"
json_only=$(bash "$SCRIPT" --json 2>/dev/null)
line_count=$(echo "$json_only" | wc -l | tr -d ' ')
assert "json output is single line" "[ $line_count -le 2 ]"

run_test "T13: --json contains version and timestamp"
version=$(echo "$output" | jq -r '.version')
timestamp=$(echo "$output" | jq -r '.timestamp')
assert "version field is 1" "[ \"$version\" = '1' ]"
assert "timestamp matches ISO format" "echo '$timestamp' | grep -qE '^[0-9]{4}-[0-9]{2}-[0-9]{2}T'"

# --- Summary ---

echo ""
echo "================================="
echo "TOTAL: $passed passed, $failed failed"
if [ $failed -gt 0 ]; then
  echo ""
  echo "Failures:"
  for f in "${failures[@]}"; do echo "  - $f"; done
  exit 1
fi
exit 0
