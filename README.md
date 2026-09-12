# Mobile Bank

Modern mobile banking backend designed around the problems real banking users face: clear balances, safe transfers, transaction states, security, traceability and recovery.

## Backend structure

```text
mobile-bank/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Account.js
│   │   ├── Transaction.js
│   │   └── Beneficiary.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── account.routes.js
│   │   └── transfer.routes.js
│   └── server.js
├── .env.example
├── package.json
└── README.md
```

## Core API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/account/me`
- `GET /api/account/transactions`
- `POST /api/transfers`
- `GET /api/transfers/beneficiaries`
- `POST /api/transfers/beneficiaries`
- `GET /api/health`

## Important design decisions

- Passwords are hashed with bcrypt.
- JWT access tokens are short-lived.
- Authenticated endpoints require Bearer tokens.
- Transfers require an idempotency key to reduce duplicate payments.
- Transactions have explicit states: pending, processing, successful, failed, reversed and disputed.
- Account balances separate available, ledger and pending values.
- Security middleware includes Helmet, CORS and rate limiting.
- Money operations should eventually be moved to a production double-entry ledger before handling real funds.
- Real bank/payment-provider integrations, KYC/AML, OTP delivery, card processing, reconciliation and fraud scoring must be added before production use.

## Local setup

1. Copy `.env.example` to `.env`.
2. Start MongoDB.
3. Run `npm install`.
4. Run `npm run dev`.
5. API starts on port 5000 by default.

This repository is a development foundation, not a production banking core. Never store real banking credentials or secrets in GitHub.
