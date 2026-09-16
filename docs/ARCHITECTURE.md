# Architecture

Browser (static HTML/CSS/JS) -> REST API -> MongoDB.

Authentication uses JWT with role-based middleware. Controllers call model/service logic. Procurement centre and staff management is Admin-only. Centre operators are restricted by `centreId` on the backend; the frontend cannot choose another centre for privileged actions.

The OTP provider is intentionally abstracted as a demo flow. Government identity, bank, land-record and CFPP integrations should be implemented only through authorised provider adapters.
