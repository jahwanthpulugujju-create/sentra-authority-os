#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${SENTRA_BASE_URL:-http://localhost:3000}"
RUN_URL="$BASE_URL/api/trpc/authority.runScenario?batch=1"
RESET_URL="$BASE_URL/api/trpc/authority.resetDemo?batch=1"
DASHBOARD_URL="$BASE_URL/api/trpc/authority.dashboard"
EXPORT_URL="$BASE_URL/api/trpc/authority.proofExport"

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

run_idempotency_probe() {
  local first second first_event second_event
  first=$(post "$RUN_URL" '{"0":{"json":{"scenario":"Valid Action","idempotencyKey":"verify-idempotency-key-001"}}}')
  second=$(post "$RUN_URL" '{"0":{"json":{"scenario":"Valid Action","idempotencyKey":"verify-idempotency-key-001"}}}')
  first_event=$(sed -nE 's/.*"eventId":"([^"]+)".*/\1/p' <<< "$first" | head -n1)
  second_event=$(sed -nE 's/.*"eventId":"([^"]+)".*/\1/p' <<< "$second" | head -n1)
  [[ -n "$first_event" && "$first_event" == "$second_event" ]]
  grep -q '"executionChanged":1' <<< "$first"
  grep -q '"executionChanged":1' <<< "$second"
  local idempotency_dashboard
  idempotency_dashboard=$(curl -fsS -G --data-urlencode 'input={"json":null}' "$DASHBOARD_URL")
  grep -q '"totalEvents":1' <<< "$idempotency_dashboard"
  printf 'PASS  idempotency replay reused one authority event and one protected execution\n'
}

printf 'Checking idempotent authority replay before baseline...\n'
post "$RESET_URL" '{"0":{"json":null}}' >/dev/null
run_idempotency_probe

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
grep -q '"approvalId":"apr-' <<< "$dashboard"
printf 'PASS  proof chain verified across 6 persisted events\n'

proof_export=$(curl -fsS -G --data-urlencode 'input={"json":null}' "$EXPORT_URL")
grep -q '"format":"sentra-local-proof-package/v1"' <<< "$proof_export"
grep -q '"checkedEvents":6' <<< "$proof_export"
grep -q '"eventsChronological"' <<< "$proof_export"
printf 'PASS  local proof export package includes verified chronological evidence\n'
printf 'Sentra demo verification completed successfully.\n'
