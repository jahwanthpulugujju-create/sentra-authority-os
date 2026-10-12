# Gateway and Adapter Developer Guide

## Gateway contract

The gateway is the independent enforcement point. Agents never invoke a protected SaaS API or internal tool directly. They submit a canonical action plus a capability to the gateway, and the gateway invokes the adapter only after successful verification and atomic consumption.

```json
{
  "request": {
    "request_id": "req_...",
    "tenant_id": "tenant_acme",
    "tool": "workspace.vendor.approve",
    "resource": "workspace/vendor-intake/contoso",
    "action": "approve_vendor",
    "desired_state": "APPROVED"
  },
  "capability": "signed-authority-artifact",
  "idempotency_key": "client-uuid"
}
```

## Required verification sequence

1. Authenticate caller and isolate tenant.
2. Canonicalize the submitted action and recompute request hash.
3. Verify issuer, key state, signature, audience, expiry, tenant, policy version, workflow, limit, tool, resource, action, nonce, and idempotency binding.
4. Atomically claim single use of the capability.
5. Invoke the adapter with a generated idempotency/receipt key.
6. Persist the gateway verdict and adapter receipt.
7. Return a material result; uncertain side effects become `UNKNOWN_EXECUTION_STATE`, not automatic retry.

## Adapter conformance tests

Every adapter must prove: request-tamper rejection; expired-capability rejection; signature/key revocation rejection; replay rejection; duplicate network retry idempotency; tenant isolation; correct receipt persistence; gateway outage fail-closed behavior; and reconciliation of adapter timeout or unknown state.

## SDK promise

SDKs should make the safe path the easiest path: typed canonical request builders, local contract validation, idempotency helpers, structured error codes, test fixtures, and a gateway simulator. SDKs must never expose signing keys or include a bypass function for protected execution.
