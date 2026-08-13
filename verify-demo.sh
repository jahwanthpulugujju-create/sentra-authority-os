#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${SENTRA_BASE_URL:-http://localhost:3000}"
RUN_URL="$BASE_URL/api/trpc/authority.runScenario?batch=1"
RESET_URL="$BASE_URL/api/trpc/authority.resetDemo?batch=1"
DASHBOARD_URL="$BASE_URL/api/trpc/authority.dashboard"

post() {
  curl -fsS -X POST "$1" -H 'content-type: application/json' --data "$2"
}

run_case() {
  local scenario="$1"
  local expected_outcome="$2"
  local expected_change="$3"
  local body
  body=$(post "$RUN_URL" "{\"0\":{\"json\":{\"scenario\":\"$scenario\"}}}")
  grep -q "\"outcome\":\"$expected_outcome\"" <<< "$body"
  grep -q "\"executionChanged\":$expected_change" <<< "$body"
  printf 'PASS  %-20s %s / executionChanged=%s\n' "$scenario" "$expected_outcome" "$expected_change"
}

printf 'Resetting Sentra demo baseline...\n'
post "$RESET_URL" '{"0":{"json":null}}' >/dev/null

run_case "Valid Action" "ALLOW" "1"
run_case "Unauthorized Tool" "DENY" "0"
run_case "Prompt Injection" "ESCALATE" "0"
run_case "Changed Request" "DENY" "0"
run_case "Burst Anomaly" "FREEZE" "0"
run_case "Replay Attempt" "DENY" "0"

dashboard=$(curl -fsS -G --data-urlencode 'input={"json":null}' "$DASHBOARD_URL")
grep -q '"totalEvents":6' <<< "$dashboard"
grep -q '"blockedEvents":5' <<< "$dashboard"
grep -q '"valid":true' <<< "$dashboard"
grep -q '"checkedEvents":6' <<< "$dashboard"
printf 'PASS  proof chain verified across 6 persisted events\n'
printf 'Sentra demo verification completed successfully.\n'
