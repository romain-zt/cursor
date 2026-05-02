#!/bin/bash
# Logs agent stop events. Optionally auto-retries on error (up to loop_limit).

input=$(cat)
status=$(echo "$input" | jq -r '.status // "unknown"')
loop_count=$(echo "$input" | jq -r '.loop_count // 0')

timestamp=$(date '+%Y-%m-%d %H:%M:%S')
echo "[$timestamp] agent stopped — status=$status loop=$loop_count" >> /tmp/cursor-agent-stops.log

if [ "$status" = "error" ] && [ "$loop_count" -lt 2 ]; then
  cat <<EOF
{
  "followup_message": "The previous run errored. Review what failed, fix it, and continue."
}
EOF
else
  echo '{}'
fi
