📘 Entity: Customer

| Field          | Type              | Description                        |
| -------------- | ----------------- | ---------------------------------- |
| `id`           | ObjectId / UUID   | Primary key                        |
| `fullName`     | String            | Customer’s legal name              |
| `email`        | String            | Unique email                       |
| `phone`        | String            | Mobile number                      |
| `kycVerified`  | Boolean           | KYC status                         |
| `creditScore`  | Number (nullable) | External score (used for Tier 2/3) |
| `tierEligible` | Array<Enum>       | Tiers approved for                 |
| `wallets`      | Embedded Object   | Fiat + Crypto balances             |
| `createdAt`    | Date              | Created timestamp                  |
| `updatedAt`    | Date              | Last modified timestamp            |
