# StartUp-Showdown-Project
A platform for discovering EV charging stations, checking routes, booking charging sessions, and managing charging infrastructure through dedicated customer, supplier, and admin interfaces. Built with the MERN stack.
# ChargeKaro Demo Credentials

This file lists **demo application accounts** seeded into the configured database (MongoDB Atlas / `ev-charging`) by `server/scripts/seed.ts`.

> **Local development/demo use only.** Change passwords before any real deployment.

## Application Login Accounts

| Role | Name | Email | Password | Notes |
|---|---|---|---|---|
| Admin | ChargeKaro Admin | `admin@chargekaro.pk` | `Admin@123` | Platform admin/super admin access |
| Supplier | Ayesha Khan | `supplier@chargekaro.pk` | `Supplier@123` | Station/supplier dashboard access |
| Customer (Driver/EV Owner) | Ali Raza | `customer@chargekaro.pk` | `Customer@123` | Customer/driver EV charging app access |

## Seeded Demo Data

The Atlas database was seeded with the same demo dataset defined in `server/scripts/seed.ts`, including:

- **Users/profiles**: Admin, Supplier profile, Customer profile
- **Stations**: 4 demo stations (Lahore, Karachi, Islamabad)
- **Terminals**: 7 demo terminals with mixed connector/power/status
- **Vehicles**: 2 customer vehicles (Tesla Model 3, BYD Atto 3)
- **Bookings**: 8 demo bookings across statuses (completed, confirmed, in-progress, awaiting payment, pending, rejected, cancelled)
- **Payments**: Demo payment records for applicable bookings
- **Notifications**: Demo notifications for customer/supplier
- **System settings**: Global platform settings (`ChargeKaro Pakistan`)

## How to Re-seed

From the `server` directory:

```bash
npm run seed
```

The seeder is idempotent: it upserts by stable keys and does not overwrite existing demo records (except enforcing admin role/status for the documented admin account).

## Important Security Notes

- Do **not** commit real production credentials or Atlas database passwords into this file.
- `server/.env` contains environment secrets and is gitignored.
- Rotate/change demo passwords before deployment.
