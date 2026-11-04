# EV Charging Platform
# Software Requirements Specification (SRS)

**Document:** `REQUIREMENTS.md`  
**Project Type:** Mobile-first responsive web application  
**Initial Market:** Pakistan  
**Primary Users:** Charging Suppliers and EV Customers  
**Technology Stack:** MERN  
**Document Status:** Initial baseline for development

---

## 1. Project Overview

The platform connects electric vehicle owners with charging terminal providers across Pakistan.

Customers can register their vehicles, search for compatible charging terminals, compare available charging options, view routes, and request charging bookings.

Suppliers can register their businesses, add charging stations and individual charging terminals, manage availability, receive booking requests, accept or reject requests, and receive payments for completed customer transactions.

The platform will provide a shared website with two separate user journeys:

1. **Supplier Journey:** Register → Register Station → Manage Terminals → Receive Booking Request → Accept or Reject → Provide Charging Service → Receive Payment
2. **Customer Journey:** Register → Register Vehicle → Search Terminals → Select Terminal → View Route → Request Booking → Supplier Accepts → Pay → Charge Vehicle

A platform administrator will oversee users, suppliers, stations, bookings, payments, and platform operations.

The initial product will be a responsive web application. It will not require separate native Android, iOS, or desktop applications.

---

## 2. Project Objectives

The platform must:

- Make EV charging terminals easier to discover across Pakistan.
- Allow customers to find charging terminals compatible with their vehicles.
- Help customers identify nearby terminals and calculate road routes.
- Allow suppliers to register and manage charging stations.
- Support booking requests and supplier acceptance or rejection.
- Support customer payments and supplier payment settlement.
- Provide a reliable booking system that prevents conflicting reservations.
- Provide separate experiences for customers, suppliers, and administrators.
- Work effectively on mobile phones, tablets, and desktop browsers.
- Support future expansion to more cities, charging providers, and charging technologies.

---

## 3. Project Scope

### 3.1 Included in the Initial Version

- Public landing page.
- Customer and supplier registration.
- Authentication and role-based access.
- Customer vehicle registration and management.
- Supplier business profile.
- Supplier station registration.
- Charging terminal management.
- Terminal availability and pricing management.
- Map-based terminal discovery.
- Search and filtering.
- Vehicle-terminal compatibility checks.
- Road-distance and route calculation.
- Booking requests.
- Supplier acceptance and rejection.
- Booking status management.
- Customer payment workflow.
- Supplier payment records.
- Notifications.
- Customer booking history.
- Supplier booking management.
- Platform administration.
- Responsive mobile-first interface.

### 3.2 Future Scope

The following features may be considered after the initial version:

- Native Android and iOS applications.
- Real-time charger hardware integration.
- Automatic charging-session start and end detection.
- Live charger telemetry.
- EV battery range prediction.
- Route planning based on battery range and charging stops.
- Battery swapping services.
- AI-based terminal recommendations.
- Loyalty points and promotional campaigns.
- Subscription plans.
- Advanced supplier analytics.
- Multi-stop route optimization.
- Fleet and corporate accounts.

These features are not required for the initial release unless explicitly added to the project scope.

---

## 4. User Roles

The system will have three primary roles.

### 4.1 Customer

A customer is an EV owner who uses the platform to find and book charging services.

A customer can:

- Register and log in.
- Manage a personal profile.
- Register one or more vehicles.
- Search for charging terminals.
- View terminal details.
- Check vehicle compatibility.
- View terminal distance and route.
- Request a booking.
- View booking status.
- Pay for an accepted booking.
- Receive notifications.
- View booking and payment history.
- Cancel a booking when permitted.
- Submit feedback after a charging session.

### 4.2 Supplier

A supplier is a business or individual that provides EV charging services.

A supplier can:

- Register and log in.
- Create a supplier profile.
- Register one or more stations.
- Add charging terminals to stations.
- Configure terminal specifications.
- Configure prices and availability.
- Receive booking requests.
- Accept or reject requests.
- View upcoming and previous bookings.
- Manage terminal availability.
- View payment and earnings records.
- Receive notifications.
- Update station and business information.

### 4.3 Super Admin

The super admin manages and monitors the platform.

A super admin can:

- View platform statistics.
- Manage customer accounts.
- Manage supplier accounts.
- Review supplier and station information.
- Approve, reject, suspend, or deactivate suppliers when required.
- Manage charging stations and terminals.
- View and manage bookings.
- View payment records.
- Investigate reported issues.
- Manage platform-wide configuration.
- View system activity and audit logs.

Admin actions must be protected by authorization checks.

---

## 5. Website Structure

### 5.1 Public Website

The public website will contain:

- Landing page.
- How It Works page or section.
- Customer benefits.
- Supplier benefits.
- Search or discovery entry point.
- Registration panel.
- Login panel.
- Contact information.
- Terms and conditions.
- Privacy policy.
- Help or support information.

### 5.2 Registration Panel

The registration panel must provide two distinct paths:

**Path A: Supplier Registration**

For businesses or individuals providing charging services.

**Path B: Customer Registration**

For EV owners looking to find and book charging services.

The selected path determines the account role and the initial onboarding flow.

### 5.3 Customer Interface

The customer interface should prioritize mobile usability.

Primary sections:

- Home or Search.
- Map and terminal results.
- Vehicle Management.
- Booking Requests.
- Current Booking.
- Booking History.
- Notifications.
- Profile and Settings.

### 5.4 Supplier Interface

The supplier interface must work on mobile and desktop browsers.

Primary sections:

- Supplier Dashboard.
- Business Profile.
- Stations.
- Charging Terminals.
- Booking Requests.
- Upcoming Bookings.
- Booking History.
- Availability and Pricing.
- Payments and Earnings.
- Notifications.
- Settings.

### 5.5 Admin Interface

The admin interface will be designed primarily for desktop browsers, while remaining responsive.

Primary sections:

- Admin Dashboard.
- Customers.
- Suppliers.
- Stations.
- Charging Terminals.
- Bookings.
- Payments.
- Reports and Complaints.
- Platform Settings.
- Audit Logs.

---

## 6. Customer Requirements

### 6.1 Customer Registration

The system shall allow a customer to create an account.

Registration fields:

- Full name.
- Email address.
- Phone number.
- Password.
- Password confirmation.
- Acceptance of terms and conditions.

Requirements:

- Email addresses must be unique.
- Phone numbers must be validated.
- Passwords must meet the platform's security requirements.
- The system must not store passwords as plain text.
- The customer must be able to log in after successful registration.
- The system should support email or phone verification.
- The customer account must be assigned the `CUSTOMER` role.

Verification method and provider will be selected during implementation.

### 6.2 Customer Login

The customer shall be able to log in using the configured credentials.

The system must:

- Validate credentials.
- Reject invalid credentials.
- Provide a secure authenticated session.
- Prevent customers from accessing supplier or admin-only resources.
- Support logout.
- Support password reset.

### 6.3 Customer Profile

The customer shall be able to view and update:

- Name.
- Email address.
- Phone number.
- Profile image, if supported.
- Account preferences.

Sensitive account changes may require re-authentication or verification.

### 6.4 Vehicle Registration

A customer must register at least one vehicle before making a booking.

Vehicle information may include:

- Vehicle name.
- Manufacturer.
- Model.
- Vehicle category.
- Model year, if known.
- Battery capacity, if known.
- Charging connector or charging method.
- Maximum supported charging power, if known.
- Additional compatibility information.

Vehicle categories may include:

- Electric car.
- Electric motorcycle.
- Electric scooter.
- Electric bicycle.
- Other supported electric vehicle.

Requirements:

- A customer may register multiple vehicles.
- A customer may edit or remove a vehicle.
- A vehicle must belong to its registered customer.
- The system must not assume all EVs use the same connector.
- Compatibility data must support proprietary charging methods where necessary.
- If compatibility information is incomplete, the system must clearly indicate that compatibility cannot be confirmed.

### 6.5 Vehicle Selection

When requesting a booking, the customer must select the vehicle that will use the charging terminal.

The system shall use the selected vehicle to evaluate compatibility with the terminal.

The customer must be informed if:

- The terminal is compatible.
- The terminal is incompatible.
- Compatibility cannot be confirmed.

The system must not label a terminal as compatible without sufficient compatibility data.

---

## 7. Supplier Requirements

### 7.1 Supplier Registration

The system shall allow a supplier to register an account.

Supplier registration fields:

- Owner or representative name.
- Business or supplier name.
- Email address.
- Phone number.
- Password.
- Business type.
- Business address or operating area.
- Acceptance of terms and conditions.

Optional or verification-related information may include:

- Business registration information.
- Identity verification information.
- Tax information.
- Payment settlement information.

The supplier account must be assigned the `SUPPLIER` role.

Supplier verification requirements and the approval process must be finalized before production deployment.

### 7.2 Supplier Profile

The supplier shall be able to manage:

- Supplier name.
- Business description.
- Contact details.
- Business address.
- Business logo or profile image.
- Operating hours.
- Verification status.

The supplier must only be able to manage records belonging to their own supplier account.

### 7.3 Station Registration

A supplier may register one or more charging stations.

A station represents a physical location where charging services are offered.

Station information shall include:

- Station name.
- Station address.
- City.
- Province or region.
- Country.
- Latitude.
- Longitude.
- Station description.
- Operating hours.
- Contact information.
- Station images, if supported.
- Station status.

The initial target market is Pakistan.

The system must store location coordinates to support map display and routing.

A station must belong to a supplier.

### 7.4 Charging Terminal Registration

A station may contain one or more charging terminals.

A charging terminal represents an individual charging resource that customers can reserve.

Terminal information shall include:

- Terminal name or identifier.
- Parent station.
- Charging method.
- Connector type.
- Supported vehicle categories.
- Supported charging power.
- Charging capacity.
- Pricing.
- Availability schedule.
- Operational status.
- Compatibility information.

The platform must distinguish between a station and its terminals.

For example:

- Supplier: ABC Charging Services
- Station: ABC Charging Station, Karachi
- Terminal 1: 22 kW AC
- Terminal 2: 50 kW DC
- Terminal 3: Motorcycle charging point

Each terminal must have its own availability and booking records.

### 7.5 Terminal Availability

A supplier must be able to configure:

- Operating days.
- Opening and closing times.
- Available booking time slots.
- Temporary unavailability.
- Maintenance status.
- Terminal capacity.

The system must not allow customers to book a terminal during a blocked or unavailable period.

The system must prevent conflicting bookings for a terminal with a capacity of one.

If a terminal supports multiple simultaneous charging connections, the system must account for its configured capacity.

### 7.6 Terminal Pricing

The supplier must be able to configure a charging price.

The pricing model may include:

- Price per kWh.
- Price per minute.
- Price per charging session.
- Fixed booking or service fee.

The initial supported pricing model must be confirmed before implementation.

The system must:

- Display the applicable price before the customer submits a booking.
- Store a pricing snapshot with the booking.
- Preserve the booking's original price if the supplier later changes the terminal's price.
- Clearly show any platform fee or additional charge, if applicable.

### 7.7 Supplier Booking Management

The supplier shall receive booking requests for their terminals.

The supplier can:

- View request details.
- View the selected vehicle.
- View requested date and time.
- View expected payment amount.
- Accept a request.
- Reject a request.
- View accepted bookings.
- View completed bookings.
- View cancelled or expired bookings.

The supplier must not be able to accept a booking if the terminal is no longer available for the requested time.

The backend must revalidate availability when the supplier accepts a booking.

### 7.8 Supplier Earnings

The supplier shall be able to view payment and earnings records.

The supplier interface may display:

- Booking reference.
- Customer payment amount.
- Platform fee.
- Supplier net amount.
- Payment status.
- Settlement status.
- Transaction date.

The system must distinguish between customer payment and supplier settlement.

A successful customer payment does not necessarily mean that the supplier has already received a bank transfer or payout.

The payout mechanism and settlement schedule are pending confirmation.

---

## 8. Terminal Discovery and Search

### 8.1 Search Entry Point

Customers must be able to access terminal search from the landing page or customer dashboard.

Search may use:

- Current location, with permission.
- Manually entered location.
- City or area.
- Map selection.
- Destination or address.

The platform must not require location permission if the customer chooses to enter a location manually.

### 8.2 Search Results

Search results shall display relevant charging terminals.

Each result should include:

- Terminal name.
- Station name.
- Location.
- Distance from the selected starting point.
- Price.
- Charging power.
- Connector or charging method.
- Availability.
- Compatibility status.
- Route or directions entry point.

The customer must be able to switch between:

- Map view.
- List view.

### 8.3 Search Filters

Customers may filter results by:

- Vehicle compatibility.
- Distance.
- Availability.
- Price.
- Charging power.
- Connector type.
- Station operating hours.
- Station or terminal rating, if ratings are implemented.

The system must apply filters consistently to map markers and list results.

### 8.4 Sorting

Customers may sort results by:

- Shortest road distance.
- Lowest price.
- Highest charging power.
- Earliest available time.

The platform must clearly identify which sorting method is currently applied.

### 8.5 Location Permission

If the customer grants location permission, the system may use the current location as the search origin.

If permission is denied:

- The customer must still be able to search.
- The customer may enter an address or select a map location.
- The system must not block the core discovery flow.

---

## 9. Shortest-Path and Routing Requirements

### 9.1 Routing Objective

The platform shall help customers identify a suitable charging terminal and calculate a route from the customer's selected starting point to that terminal.

The route must be based on road-network distance rather than only straight-line geographic distance.

### 9.2 Dijkstra's Algorithm

Dijkstra's algorithm may be used to calculate the shortest path through a weighted graph.

The routing graph represents a road network:

- Nodes represent road intersections or routing points.
- Edges represent road segments.
- Edge weights represent road distance or another selected routing cost.

The algorithm shall calculate the minimum total weight from the origin to a destination.

### 9.3 Routing Data

The system requires a road-network graph or routing service.

A map display alone does not provide the data needed to calculate a road route.

The implementation must select an appropriate routing data source and determine whether routing will be calculated:

- Directly by the application using a road graph.
- Through a routing service that calculates routes.
- Through a hybrid approach.

This implementation decision is pending technical validation.

### 9.4 Route Results

For a selected terminal, the customer should be able to view:

- Route on the map.
- Estimated road distance.
- Estimated travel time, if supported by the routing source.
- Starting point.
- Destination terminal.
- Directions or navigation handoff, if supported.

The platform must not present straight-line distance as road distance.

If the route cannot be calculated, the system must display a clear error and may still show the terminal's location.

### 9.5 Important Routing Constraint

Dijkstra's algorithm calculates the shortest path for a graph with non-negative edge weights. It does not independently provide:

- Road-network data.
- Live traffic data.
- EV battery consumption.
- Charging-stop optimization.
- Vehicle-specific range prediction.

These capabilities require additional data and logic.

---

## 10. Booking Requirements

### 10.1 Booking Workflow

The standard booking workflow is:

1. Customer searches for terminals.
2. Customer selects a terminal.
3. Customer selects a registered vehicle.
4. System validates vehicle-terminal compatibility.
5. Customer selects a date and time.
6. System checks terminal availability.
7. System displays pricing and booking details.
8. Customer submits a booking request.
9. Supplier receives a notification.
10. Supplier accepts or rejects the request.
11. Customer receives the decision.
12. Customer pays for an accepted booking.
13. Booking becomes confirmed after successful payment, if payment is required before service.
14. Customer arrives at the terminal.
15. Charging service is provided.
16. Booking and charging session are completed.
17. Payment and settlement records are updated.

The exact point at which payment is required must be finalized. The initial flow assumes payment after supplier acceptance.

### 10.2 Booking Request Information

A booking request shall contain:

- Customer.
- Selected vehicle.
- Supplier.
- Station.
- Charging terminal.
- Requested date.
- Requested start time.
- Requested duration or end time.
- Price snapshot.
- Booking reference.
- Booking status.
- Payment status.
- Creation timestamp.

### 10.3 Availability Validation

The system must check availability:

- When the customer selects a time.
- When the customer submits a booking request.
- When the supplier accepts the request.
- When payment is completed, where necessary.

Availability must be validated on the backend.

Frontend validation alone is insufficient.

### 10.4 Booking Conflicts

The system must prevent two customers from reserving the same single-capacity terminal for overlapping time periods.

The backend must use an appropriate atomic operation, transaction, or locking strategy to avoid race conditions.

The system must not rely only on checking availability before inserting a booking.

### 10.5 Booking Cancellation

The system shall support booking cancellation according to the platform's cancellation policy.

The policy must define:

- Who can cancel.
- When cancellation is permitted.
- Whether cancellation fees apply.
- Whether a refund is required.
- Whether supplier approval is required.

Cancellation policy details are pending confirmation.

### 10.6 Booking Expiration

A pending request may expire if the supplier does not respond within a configured time.

The expiration duration must be configurable.

When a request expires:

- The booking status must update.
- The customer must be notified.
- The terminal's requested time must become available again, unless another booking blocks it.

---

## 11. Booking, Payment, and Session Statuses

Booking, payment, and charging-session statuses must be stored separately.

### 11.1 Booking Status

| Status | Meaning |
|---|---|
| `PENDING` | Customer has submitted a request and supplier decision is pending |
| `ACCEPTED` | Supplier accepted the request |
| `REJECTED` | Supplier rejected the request |
| `CONFIRMED` | Booking is confirmed under the platform's payment rules |
| `CANCELLED` | Booking was cancelled |
| `EXPIRED` | Request expired without completion |
| `COMPLETED` | Charging service has been completed |

### 11.2 Payment Status

| Status | Meaning |
|---|---|
| `UNPAID` | Payment has not been initiated |
| `PROCESSING` | Payment is being processed |
| `PAID` | Payment provider confirmed payment |
| `FAILED` | Payment attempt failed |
| `REFUNDED` | Payment was refunded |
| `PARTIALLY_REFUNDED` | Part of the payment was refunded |

### 11.3 Charging Session Status

| Status | Meaning |
|---|---|
| `NOT_STARTED` | Charging service has not started |
| `IN_PROGRESS` | Charging service is underway |
| `COMPLETED` | Charging service has ended |
| `INTERRUPTED` | Charging service ended unexpectedly |

### 11.4 Supplier Settlement Status

| Status | Meaning |
|---|---|
| `NOT_ELIGIBLE` | Supplier settlement is not yet eligible |
| `PENDING` | Settlement is pending |
| `PROCESSING` | Settlement is being processed |
| `PAID_OUT` | Supplier payout has been completed |
| `FAILED` | Supplier payout failed |

The system must not treat these statuses as interchangeable.

---

## 12. Payment Requirements

### 12.1 Customer Payment

The customer shall be able to pay for an accepted booking using a supported payment method.

The payment system must:

- Display the amount before payment.
- Associate the payment with a booking.
- Record the payment provider reference.
- Record payment status.
- Handle successful and failed payments.
- Prevent duplicate payment processing.
- Notify the customer of payment results.

The selected payment gateway is pending confirmation.

### 12.2 Payment Security

The platform must not store raw payment card details.

Payment processing must be performed through a suitable payment provider.

Payment confirmation must be verified server-side.

The platform must not mark a booking as paid based solely on a frontend success page or query parameter.

### 12.3 Supplier Payment

The platform must record the supplier's expected earnings from each completed and paid booking.

The supplier settlement workflow must account for:

- Customer payment.
- Platform commission, if applicable.
- Refunds.
- Chargebacks or disputes, if supported.
- Supplier net earnings.
- Payout status.

The exact commission and payout model are pending confirmation.

---

## 13. Notifications

The platform shall provide notifications for important events.

### 13.1 Customer Notifications

Customers should receive notifications when:

- A booking request is submitted.
- A supplier accepts a request.
- A supplier rejects a request.
- A booking is confirmed.
- Payment succeeds.
- Payment fails.
- A booking is cancelled.
- A booking is about to begin.
- A charging session is completed.

### 13.2 Supplier Notifications

Suppliers should receive notifications when:

- A new booking request is submitted.
- A booking is cancelled.
- A payment is completed.
- A settlement is processed.
- A station or terminal requires attention.
- An important account or verification action is required.

### 13.3 Notification Channels

The initial notification channel may include in-app notifications.

Real-time notifications may be implemented using Socket.IO.

Email, SMS, and push notifications may be added depending on the selected providers and deployment requirements.

The system must preserve important notification records even if the recipient is offline.

---

## 14. Station and Terminal Management

The supplier must be able to manage stations and terminals independently.

### 14.1 Station Operations

A supplier may:

- Create a station.
- Edit station details.
- Update location.
- Update operating hours.
- Activate or deactivate a station.
- View the station's terminals.
- View bookings associated with the station.

### 14.2 Terminal Operations

A supplier may:

- Create a terminal.
- Edit terminal specifications.
- Set charging compatibility.
- Configure charging capacity.
- Set pricing.
- Configure availability.
- Mark a terminal as operational.
- Mark a terminal as unavailable.
- Mark a terminal as under maintenance.

A terminal under maintenance must not accept new bookings during its blocked period.

### 14.3 Ownership

Every station must belong to a supplier.

Every terminal must belong to a station.

The backend must verify ownership before allowing supplier changes.

---

## 15. Admin Requirements

### 15.1 Admin Dashboard

The admin dashboard should display:

- Total customers.
- Total suppliers.
- Total stations.
- Total terminals.
- Total bookings.
- Pending bookings.
- Completed bookings.
- Payment volume.
- Supplier verification status.
- Reported issues.

### 15.2 User Management

The admin shall be able to:

- View customers.
- View suppliers.
- Search accounts.
- Suspend accounts.
- Reactivate accounts.
- Review account information.
- Investigate reported accounts.

### 15.3 Supplier and Station Management

The admin shall be able to:

- Review supplier information.
- Review station information.
- Approve or reject suppliers when verification is enabled.
- Suspend suppliers.
- Deactivate stations or terminals.
- Investigate inaccurate or reported listings.

### 15.4 Booking and Payment Management

The admin shall be able to:

- View bookings.
- Filter bookings by status.
- View payment records.
- Review failed payments.
- Review refunds.
- Investigate booking disputes.
- View supplier settlement records.

Admin actions that affect bookings or payments must be recorded in an audit log.

---

## 16. Data Model Requirements

The database will use MongoDB.

The following entities represent the initial logical data model. Final schemas may change during implementation.

### 16.1 User

Fields may include:

- `_id`
- `name`
- `email`
- `phone`
- `passwordHash`
- `role`
- `accountStatus`
- `verificationStatus`
- `createdAt`
- `updatedAt`

### 16.2 Customer Profile

Fields may include:

- `_id`
- `userId`
- `profileImage`
- `preferences`

### 16.3 Supplier Profile

Fields may include:

- `_id`
- `userId`
- `businessName`
- `businessDescription`
- `businessAddress`
- `verificationStatus`
- `paymentSettlementProfile`
- `createdAt`
- `updatedAt`

### 16.4 Vehicle

Fields may include:

- `_id`
- `customerId`
- `manufacturer`
- `model`
- `vehicleCategory`
- `modelYear`
- `batteryCapacity`
- `chargingMethods`
- `connectorTypes`
- `maximumChargingPower`
- `createdAt`
- `updatedAt`

### 16.5 Station

Fields may include:

- `_id`
- `supplierId`
- `name`
- `description`
- `address`
- `city`
- `province`
- `country`
- `location`
- `operatingHours`
- `stationStatus`
- `createdAt`
- `updatedAt`

### 16.6 Charging Terminal

Fields may include:

- `_id`
- `stationId`
- `supplierId`
- `name`
- `chargingMethod`
- `connectorTypes`
- `supportedVehicleCategories`
- `maximumPower`
- `capacity`
- `pricing`
- `availability`
- `operationalStatus`
- `createdAt`
- `updatedAt`

### 16.7 Booking

Fields may include:

- `_id`
- `bookingReference`
- `customerId`
- `supplierId`
- `vehicleId`
- `stationId`
- `terminalId`
- `requestedStartTime`
- `requestedEndTime`
- `priceSnapshot`
- `bookingStatus`
- `paymentStatus`
- `sessionStatus`
- `createdAt`
- `updatedAt`

### 16.8 Payment

Fields may include:

- `_id`
- `bookingId`
- `customerId`
- `supplierId`
- `provider`
- `providerReference`
- `amount`
- `currency`
- `paymentStatus`
- `refundAmount`
- `createdAt`
- `updatedAt`

### 16.9 Supplier Settlement

Fields may include:

- `_id`
- `supplierId`
- `bookingId`
- `grossAmount`
- `platformFee`
- `netAmount`
- `settlementStatus`
- `providerReference`
- `createdAt`
- `updatedAt`

### 16.10 Notification

Fields may include:

- `_id`
- `recipientId`
- `type`
- `title`
- `message`
- `relatedEntityType`
- `relatedEntityId`
- `readAt`
- `createdAt`

### 16.11 Audit Log

Fields may include:

- `_id`
- `actorId`
- `actorRole`
- `action`
- `targetEntityType`
- `targetEntityId`
- `metadata`
- `createdAt`

---

## 17. Data Integrity and Database Requirements

The system must enforce data integrity through backend validation and database design.

Requirements:

- Email addresses must be unique.
- Booking references must be unique.
- Every vehicle must belong to a customer.
- Every station must belong to a supplier.
- Every terminal must belong to a station and supplier.
- Every booking must reference valid customer, vehicle, station, supplier, and terminal records.
- Every payment must reference a valid booking.
- Every settlement must reference a valid supplier and associated transaction.
- Deleted or deactivated entities must not cause historical booking records to become unreadable.
- Historical bookings must preserve relevant snapshots such as price and terminal details.

MongoDB indexes must be created for frequently queried fields.

Potential indexes include:

- User email.
- User phone.
- Supplier ownership.
- Station location.
- Terminal station reference.
- Terminal status.
- Booking customer.
- Booking supplier.
- Booking terminal and requested time.
- Payment booking reference.
- Notification recipient and creation date.

Geospatial queries should use an appropriate MongoDB geospatial index where supported by the chosen location representation.

---

## 18. Functional Requirements Summary

| ID | Requirement |
|---|---|
| FR-001 | The system shall provide a public landing page |
| FR-002 | The system shall provide separate customer and supplier registration paths |
| FR-003 | The system shall authenticate registered users |
| FR-004 | The system shall enforce role-based access |
| FR-005 | Customers shall be able to register and manage vehicles |
| FR-006 | Suppliers shall be able to register and manage stations |
| FR-007 | Suppliers shall be able to add and manage charging terminals |
| FR-008 | Suppliers shall be able to configure pricing and availability |
| FR-009 | Customers shall be able to search charging terminals |
| FR-010 | Customers shall be able to filter and sort search results |
| FR-011 | The system shall evaluate vehicle-terminal compatibility |
| FR-012 | The system shall display terminals on a map |
| FR-013 | The system shall calculate road routes using a routing solution |
| FR-014 | Customers shall be able to submit booking requests |
| FR-015 | Suppliers shall be able to accept or reject booking requests |
| FR-016 | The system shall prevent conflicting bookings |
| FR-017 | Customers shall be able to pay for accepted bookings |
| FR-018 | The system shall record payment results |
| FR-019 | The system shall record supplier earnings and settlement status |
| FR-020 | The system shall provide in-app notifications |
| FR-021 | Customers shall be able to view booking history |
| FR-022 | Suppliers shall be able to view booking and earnings history |
| FR-023 | Admins shall be able to manage users, suppliers, stations, bookings, and payments |
| FR-024 | The system shall record important administrative actions |
| FR-025 | The system shall support mobile, tablet, and desktop browser layouts |

---

## 19. Non-Functional Requirements

### 19.1 Usability

- The website must be responsive.
- Customer workflows must be optimized for mobile devices.
- Important actions must be clearly visible.
- Booking status must be easy to understand.
- Errors must explain what happened and what the user can do next.
- Forms must provide clear validation messages.
- Map and list search must remain usable on small screens.

### 19.2 Performance

- Common pages should load efficiently on typical mobile internet connections.
- Search results should be paginated or loaded incrementally when appropriate.
- Database queries must use suitable indexes.
- The application must avoid unnecessary repeated API requests.
- Map markers and routing requests must be handled efficiently.
- Performance targets must be defined and measured during testing.

### 19.3 Reliability

- Booking operations must be validated server-side.
- Booking conflicts must be prevented.
- Payment callbacks must be processed safely.
- Duplicate payment events must not create duplicate transactions.
- The system must preserve booking and payment history.
- Critical operations must provide clear success or failure outcomes.

### 19.4 Security

- Passwords must be hashed using a secure password-hashing algorithm.
- Authentication credentials must be handled securely.
- Role-based authorization must be enforced on the backend.
- Users must not access another user's private data.
- Suppliers must not modify another supplier's stations or terminals.
- Admin endpoints must require admin authorization.
- Input must be validated and sanitized.
- Secrets must be stored in environment variables or an appropriate secret manager.
- Sensitive information must not be exposed in client-side code.
- Payment processing must use a trusted payment provider.
- Important administrative actions must be logged.
- Rate limiting must be applied to sensitive endpoints.
- Production traffic must use HTTPS.

### 19.5 Privacy

- The system must collect only the personal information required for its operation.
- Location access must be permission-based.
- Customers must be able to search using a manually entered location.
- Private customer information must not be exposed to unrelated users.
- Data retention and deletion policies must be defined before production release.

### 19.6 Maintainability

- Frontend and backend code must be organized into clear modules.
- Business logic must not be placed entirely inside UI components.
- API routes, controllers, services, models, and middleware should have clear responsibilities.
- Common validation rules should be reusable.
- Environment-specific configuration must be separated from source code.
- The project must use version control.
- Critical business logic must have automated tests.

---

## 20. Technology Stack

The confirmed application stack is MERN.

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Language | JavaScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Backend Runtime | Node.js |
| Backend Framework | Express.js |
| Database | MongoDB |
| Database ODM | Mongoose |
| Authentication | JWT-based authentication |
| Maps | Leaflet |
| Map Data | OpenStreetMap |
| Routing | Dijkstra's algorithm with a suitable road-network data source or routing service |
| Real-Time Notifications | Socket.IO |
| Payment Integration | Payment gateway to be selected |
| Frontend Hosting | Vercel |
| Backend Hosting | Render or Railway |
| Version Control | Git and GitHub |

### 20.1 Technology Responsibilities

**React.js**

Provides the client-side user interface for customers, suppliers, and administrators.

**Node.js**

Runs the backend application and server-side JavaScript.

**Express.js**

Provides API routing, middleware, request handling, and backend application structure.

**MongoDB**

Stores user accounts, vehicles, suppliers, stations, terminals, bookings, payments, notifications, and other platform data.

**Mongoose**

Defines MongoDB schemas, validation, relationships by reference, and database access logic.

**Leaflet**

Displays interactive maps and location markers.

**OpenStreetMap**

Provides map data, subject to the selected tile and data-provider terms.

**Dijkstra's Algorithm**

Calculates a minimum-weight route through a road-network graph. A road graph or routing service is required for practical route calculation.

**Socket.IO**

Supports real-time in-app notifications and relevant live updates.

---

## 21. API Requirements

The backend shall expose APIs for the frontend.

API groups may include:

### Authentication

- Register.
- Login.
- Logout.
- Refresh or validate session.
- Reset password.
- Verify account.

### Customer

- Get profile.
- Update profile.
- Create vehicle.
- List vehicles.
- Update vehicle.
- Delete vehicle.

### Supplier

- Get supplier profile.
- Update supplier profile.
- Create station.
- List supplier stations.
- Update station.
- Create terminal.
- Update terminal.
- Update terminal availability.
- Update terminal pricing.

### Discovery

- Search terminals.
- Filter terminals.
- Get terminal details.
- Check compatibility.
- Get route or distance.

### Booking

- Create booking request.
- List customer bookings.
- List supplier bookings.
- Accept booking.
- Reject booking.
- Cancel booking.
- Confirm booking.
- Complete booking.

### Payment

- Initiate payment.
- Verify payment.
- Process payment callback.
- Get payment history.
- Get supplier earnings.
- Get settlement records.

### Notifications

- List notifications.
- Mark notification as read.
- Receive real-time notification events.

### Admin

- List users.
- Manage users.
- Review suppliers.
- Manage stations.
- Manage terminals.
- View bookings.
- View payments.
- View audit logs.

All protected API endpoints must enforce authorization and ownership validation.

---

## 22. Error Handling Requirements

The system must handle:

- Invalid registration details.
- Duplicate email or phone number.
- Incorrect login credentials.
- Expired authentication.
- Unauthorized access.
- Missing or invalid vehicle data.
- Incompatible vehicle and terminal.
- Unavailable terminal.
- Conflicting booking.
- Supplier rejection.
- Expired booking request.
- Payment failure.
- Payment verification failure.
- Routing failure.
- Missing map data.
- Network failure.
- Server error.

Error messages must not expose internal stack traces, database details, secret values, or sensitive system information.

---

## 23. Testing Requirements

### 23.1 Authentication Testing

Verify:

- Customer registration.
- Supplier registration.
- Login and logout.
- Password reset.
- Role restrictions.
- Unauthorized API access.

### 23.2 Vehicle Testing

Verify:

- Vehicle creation.
- Vehicle editing.
- Vehicle deletion.
- Multiple vehicles per customer.
- Vehicle ownership validation.
- Compatibility checks.

### 23.3 Supplier Testing

Verify:

- Supplier registration.
- Station creation.
- Terminal creation.
- Station and terminal ownership.
- Pricing changes.
- Availability changes.
- Maintenance status.

### 23.4 Booking Testing

Verify:

- Booking request creation.
- Supplier acceptance.
- Supplier rejection.
- Customer cancellation.
- Booking expiration.
- Conflicting booking prevention.
- Terminal availability revalidation.
- Price snapshot preservation.

### 23.5 Payment Testing

Verify:

- Successful payment.
- Failed payment.
- Duplicate payment callback.
- Invalid payment callback.
- Payment status update.
- Refund workflow, if supported.
- Supplier settlement status.

### 23.6 Routing Testing

Verify:

- Route calculation from a valid origin.
- Route calculation to a valid terminal.
- Shortest-path calculation.
- Missing road-network data.
- Unreachable destination.
- Incorrect or missing coordinates.
- Route display on mobile and desktop.

### 23.7 Responsive Testing

Test the website on:

- Small mobile screens.
- Large mobile screens.
- Tablets.
- Laptop browsers.
- Desktop browsers.

---

## 24. Acceptance Criteria

The initial release will be considered functionally complete when:

1. A visitor can access the landing page.
2. A visitor can choose the supplier or customer registration path.
3. A customer can register, log in, and add a vehicle.
4. A supplier can register, log in, and create a station.
5. A supplier can add charging terminals to a station.
6. A supplier can configure terminal pricing and availability.
7. A customer can search for charging terminals.
8. A customer can view terminal information and compatibility.
9. A customer can view terminal locations on a map.
10. The system can calculate a road route using the selected routing implementation.
11. A customer can submit a booking request.
12. The supplier can receive and respond to the request.
13. The customer can see the supplier's decision.
14. The customer can pay using the selected payment integration.
15. The system can record payment results.
16. The platform prevents conflicting bookings.
17. Customers and suppliers can view their booking history.
18. Suppliers can view earnings and settlement records.
19. Admins can manage platform records.
20. Core workflows work on mobile and desktop browsers.
21. Protected operations enforce role and ownership checks.
22. Critical booking and payment operations are tested.

---

## 25. Decisions Still to Be Finalized

These decisions affect implementation and must be resolved before the relevant feature is built.

| Decision | Current Status |
|---|---|
| Payment gateway available for the Pakistan market | Pending |
| Customer payment timing | Assumed after supplier acceptance |
| Supplier payout method and schedule | Pending |
| Platform commission | Pending |
| Pricing model | Pending |
| Booking duration rules | Pending |
| Booking request expiration duration | Pending |
| Cancellation and refund policy | Pending |
| Supplier verification requirements | Pending |
| Map tile provider | OpenStreetMap-based option identified |
| Road-routing data source or service | Pending technical validation |
| Exact vehicle compatibility dataset | Pending |
| Email or SMS notification provider | Pending |
| Rating and review feature | Optional for initial release |
| PWA installation support | Future enhancement |

---

## 26. Core Product Rules

The following rules must be followed throughout development:

1. The platform is a responsive web application, not a native mobile application.
2. The platform has two main registration paths: supplier and customer.
3. A supplier can manage multiple stations.
4. A station can contain multiple charging terminals.
5. A customer can register multiple vehicles.
6. A booking must reference a specific vehicle and charging terminal.
7. Vehicle compatibility must be evaluated before booking.
8. A station's location and a terminal's availability are separate concepts.
9. Booking, payment, charging-session, and supplier-settlement statuses must remain separate.
10. Booking availability must be validated on the backend.
11. The system must prevent conflicting reservations.
12. Booking price must be preserved as a snapshot.
13. Payment confirmation must be verified server-side.
14. Supplier ownership must be validated for every station and terminal operation.
15. Dijkstra's algorithm requires a road-network graph and must not be treated as a standalone map service.
16. The platform must not assume that all EVs use the same charging connector or method.
17. The initial target market is Pakistan.
18. Unconfirmed business rules must remain explicitly pending rather than being silently assumed.

---

## 27. Final Product Definition

The product is a Pakistan-focused EV charging discovery and booking platform.

It provides:

- A public landing page.
- Customer registration and vehicle management.
- Supplier registration and charging station management.
- Charging terminal discovery.
- Vehicle compatibility checking.
- Map-based search and road routing.
- Booking requests and supplier decisions.
- Customer payment processing.   
- Supplier earnings and settlement records.
- Notifications.
- Admin management.

The core objective is to connect EV customers with available, compatible charging terminals while giving suppliers a structured way to manage their charging services and bookings.
