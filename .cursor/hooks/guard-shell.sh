#!/bin/bash
# Blocks L4-dangerous shell commands (see operating model autonomy levels).
# Force push, destructive rm, DB drops → denied.
# Everything else → allowed.

input=$(cat)
command=$(echo "$input" | jq -r '.command // empty')

BLOCKED_PATTERNS=(
  "git push --force"
  "git push -f"
  "rm -rf /"
  "drop database"
  "DROP DATABASE"
  "git reset --hard.*origin"
  "force push"
)

for pattern in "${BLOCKED_PATTERNS[@]}"; do
  if echo "$command" | grep -qiE "$pattern"; then
    cat <<EOF
{
  "permission": "deny",
  "user_message": "Blocked: L4-dangerous command requires human approval.",
  "agent_message": "This command is classified L4-dangerous per the operating model. Ask the human to run it manually."
}
EOF
    exit 0
  fi
done

cat <<EOF
{
  "permission": "allow"
}
EOF
