# Mobile Bank Backend

Node.js + Express + MongoDB backend foundation for the Mobile Bank frontend.

## Structure

```text
back end/
├── package.json
├── .env.example
├── README.md
└── src/
    ├── config/
    │   └── db.js
    ├── middleware/
    │   └── auth.js
    ├── models/
    │   ├── User.js
    │   ├── Account.js
    │   ├── Transaction.js
    │   └── Beneficiary.js
    ├── routes/
    │   ├── auth.routes.js
    │   ├── account.routes.js
    │   └── transfer.routes.js
    └── server.js
```

## Run locally

```bash
cd "back end"
npm install
```

Copy `.env.example` to `.env` and set a strong `JWT_SECRET`.

Start MongoDB, then run:

```bash
npm run dev
```

The API runs on `http://localhost:5000` by default.

## Main API

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/account/me`
- `GET /api/account/transactions`
- `POST /api/transfers`
- `GET /api/transfers/beneficiaries`
- `POST /api/transfers/beneficiaries`

Protected routes require:

```text
Authorization: Bearer <JWT>
```

## Important

This is a development foundation for the frontend. It is not a production banking core. A real financial deployment needs a proper double-entry ledger, immutable transaction records, reconciliation, KYC/AML controls, MFA/OTP, device/session management, fraud/risk controls, audit logs, disputes, notifications, payment/bank integrations, stronger transaction-state handling, tests, monitoring, and production secrets/infrastructure.
