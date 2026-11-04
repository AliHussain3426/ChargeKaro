# USER FLOWS
## EV Charging Marketplace

**Document Type:** User Flow Specification  
**Project:** EV Charging Marketplace  
**Platform:** Mobile-First Responsive Web Application  
**Primary User Roles:** Receiver, Supplier, Super Admin

---

# 1. Introduction

## 1.1 Purpose

This document defines the complete interaction flows of the EV Charging Marketplace.

It describes how different users access the platform, navigate its features, perform actions, and interact with other users through the marketplace.

The purpose is to establish clear and consistent user journeys before the interface and navigation structure are finalized.

This document covers:

- Account registration and authentication.
- Role-based access.
- Receiver journeys.
- Supplier journeys.
- Super Admin journeys.
- Charging station discovery.
- Vehicle management.
- Station and charging point management.
- Booking and reservation workflows.
- Payment workflows.
- Charging session workflows.
- Notifications.
- Cancellations and exceptional scenarios.
- Cross-role interactions.

## 1.2 Primary User Roles

The platform has three primary roles.

| Role | Primary Objective |
|---|---|
| Receiver | Find and reserve compatible charging services. |
| Supplier | Provide and manage charging services. |
| Super Admin | Manage and supervise marketplace operations. |

Each role has its own navigation and authorized functionality.

## 1.3 General User Journey

The overall marketplace interaction can be represented as:

```text
                 USER
                   |
                   v
             OPEN PLATFORM
                   |
                   v
          REGISTER / SIGN IN
                   |
                   v
          AUTHENTICATION CHECK
                   |
                   v
             IDENTIFY ROLE
                   |
          +--------+--------+
          |        |        |
          v        v        v
       RECEIVER SUPPLIER SUPER ADMIN
          |        |        |
          v        v        v
       DISCOVER  MANAGE   ADMINISTER
       CHARGING  STATIONS PLATFORM
       SERVICES
          |        |        |
          v        v        v
       RESERVE   PROCESS  OVERSEE
       CHARGING  BOOKINGS OPERATIONS
          |        |        |
          +--------+--------+
                   |
                   v
             PLATFORM DATA
              AND RECORDS
```

---

# 2. Common Entry and Authentication Flow

This flow applies to all user categories.

## 2.1 First-Time Access

**Flow:**

1. User opens the platform.
2. Platform displays the welcome or entry screen.
3. User chooses between signing in and creating an account.
4. User selects the appropriate account registration option.
5. User provides the required information.
6. Platform validates the submitted information.
7. Account is created.
8. Required contact verification is performed.
9. User receives confirmation of successful registration.
10. User enters the appropriate account experience.

### Registration Decision

The platform should distinguish between Receiver and Supplier registration.

```text
                 REGISTRATION
                      |
                      v
               SELECT ACCOUNT TYPE
                      |
             +--------+--------+
             |                 |
             v                 v
          RECEIVER          SUPPLIER
             |                 |
             v                 v
       PERSONAL DETAILS   SUPPLIER DETAILS
             |                 |
             v                 v
       CREATE ACCOUNT     CREATE ACCOUNT
             |                 |
             v                 v
       RECEIVER HOME      VERIFICATION FLOW
```

Super Admin accounts are not created through ordinary public registration. They are provisioned through an authorized administrative process.

## 2.2 Receiver Registration

1. User selects Receiver registration.
2. User enters their name.
3. User enters their email address.
4. User enters their phone number.
5. User provides the required authentication credentials.
6. Platform validates the information.
7. Platform creates the Receiver account.
8. Required verification is completed.
9. User is directed to the Receiver experience.
10. User may proceed with vehicle registration or station discovery.

**Expected Result:** An active Receiver account with access to Receiver functionality.

## 2.3 Supplier Registration

1. User selects Supplier registration.
2. User selects the appropriate supplier category, where required.
3. User provides their name or business name.
4. User provides contact details.
5. User provides relevant business information.
6. User submits required verification information.
7. Platform creates the Supplier account.
8. Supplier verification status becomes Pending Review.
9. Supplier enters the Supplier experience with restricted functionality according to account status.
10. Supplier receives notification when verification status changes.

**Expected Result:** A registered Supplier account awaiting the required verification decision.

## 2.4 Login Flow

1. User opens the sign-in screen.
2. User enters their registered email or supported login identifier.
3. User enters their password.
4. Platform validates the credentials.
5. Platform identifies the account and role.
6. Platform checks account status and access permissions.
7. User is redirected to the appropriate dashboard.

### Login Routing

```text
                  LOGIN
                    |
                    v
             VALIDATE CREDENTIALS
                    |
                    v
               ACCOUNT FOUND?
                /       \
              NO         YES
              |           |
              v           v
         SHOW ERROR   CHECK STATUS
                          |
                          v
                    ACCESS ALLOWED?
                      /       \
                    NO         YES
                    |            |
                    v            v
                RESTRICTED   IDENTIFY ROLE
                                  |
                       +----------+----------+
                       |          |          |
                       v          v          v
                    RECEIVER   SUPPLIER   ADMIN
                       |          |          |
                       v          v          v
                    RECEIVER   SUPPLIER   ADMIN
                     HOME       DASHBOARD  DASHBOARD
```

## 2.5 Password Recovery

1. User selects Forgot Password.
2. User enters their registered email address.
3. Platform checks the account.
4. Platform sends a password recovery mechanism to the registered contact.
5. User completes the required verification.
6. User creates a new password.
7. Platform validates and updates the credentials.
8. User receives confirmation.
9. User returns to login.

## 2.6 Logout

1. User opens the account menu or profile settings.
2. User selects Logout.
3. Platform terminates the authenticated session.
4. User is redirected to the public entry or login screen.

---

# 3. Receiver User Flow

## 3.1 Receiver Journey Overview

The Receiver's primary goal is to discover a suitable charging facility and reserve it.

The overall journey is:

```text
              RECEIVER LOGIN
                    |
                    v
              RECEIVER HOME
                    |
                    v
            DISCOVER STATIONS
                    |
                    v
            SEARCH / FILTER
                    |
                    v
             SELECT STATION
                    |
                    v
          VIEW STATION DETAILS
                    |
                    v
       SELECT CHARGING POINT
                    |
                    v
           SELECT VEHICLE
                    |
                    v
        SELECT DATE AND TIME
                    |
                    v
        VALIDATE AVAILABILITY
                    |
                    v
         REVIEW BOOKING DETAILS
                    |
                    v
          SUBMIT BOOKING REQUEST
                    |
                    v
          SUPPLIER REVIEW PROCESS
                    |
                    v
          ACCEPTED / REJECTED
                    |
                    v
             PAYMENT PROCESS
                    |
                    v
           BOOKING CONFIRMED
                    |
                    v
         ARRIVE AT CHARGING STATION
                    |
                    v
         CHARGING SESSION STARTS
                    |
                    v
         CHARGING SESSION ENDS
                    |
                    v
          BOOKING COMPLETED
                    |
                    v
         REVIEW / VIEW HISTORY
```

---

## 3.2 Receiver Home Flow

After successful authentication:

1. Receiver enters the home screen.
2. Platform displays the main charging discovery interface.
3. Platform may request location permission.
4. If permission is granted, nearby charging facilities can be displayed.
5. If permission is denied, Receiver can manually select a location.
6. Platform displays relevant nearby stations.
7. Receiver can search, filter, or open station details.

### Home Screen Actions

The Receiver should be able to access:

- Explore Stations.
- Search.
- Map View.
- Upcoming Bookings.
- Saved Vehicles.
- Notifications.
- Profile.

---

## 3.3 Vehicle Registration Flow

A Receiver must be able to register vehicles before making vehicle-specific reservations.

**Flow:**

1. Receiver opens Vehicles.
2. Platform displays previously registered vehicles.
3. Receiver selects Add Vehicle.
4. Platform displays the vehicle information form.
5. Receiver enters the manufacturer.
6. Receiver enters the model.
7. Receiver selects the vehicle category.
8. Receiver enters battery capacity, if known.
9. Receiver selects or enters supported charging information.
10. Receiver provides maximum supported charging power, if known.
11. Receiver submits the information.
12. Platform validates the submitted information.
13. Vehicle is saved to the Receiver's account.
14. Platform displays the updated vehicle list.

### Vehicle Management

Receiver can subsequently:

- View vehicle information.
- Edit vehicle information.
- Remove a vehicle.
- Select a default vehicle, where supported.
- Use saved vehicles during station discovery and booking.

### Compatibility Consideration

If charging compatibility information is incomplete, the platform should clearly identify the missing information.

It must not automatically classify unknown compatibility as confirmed compatibility.

---

## 3.4 Station Discovery Flow

**Flow:**

1. Receiver opens Explore Stations.
2. Platform identifies the selected search location.
3. Platform retrieves eligible charging stations.
4. Platform presents stations through a map or list.
5. Receiver browses available results.
6. Receiver selects a station.
7. Platform opens the station details.

### Discovery Options

Receiver can:

- Use current location.
- Search a city or area.
- Enter a station name.
- Switch between map and list views.
- View nearby facilities.
- Open a station marker.
- View approximate distance.

### Search and Filter Flow

1. Receiver opens the search or filter controls.
2. Receiver enters a location or station name.
3. Receiver selects relevant filters.
4. Platform applies the selected criteria.
5. Platform displays matching results.
6. Receiver can modify or clear the filters.

### Available Filters

- Vehicle category.
- Charging connector.
- Charging method.
- Charging power.
- Availability.
- Price range.
- Distance.
- Amenities.

Only relevant and accurately supported filters should be available.

---

## 3.5 Station Details Flow

1. Receiver selects a station.
2. Platform displays its detailed information.
3. Receiver reviews the address and location.
4. Receiver checks operating hours.
5. Receiver reviews available amenities.
6. Receiver reviews supplier information.
7. Receiver views the charging points associated with the station.
8. Receiver checks compatibility.
9. Receiver checks charging point availability.
10. Receiver selects a suitable charging point.

### Charging Point Selection

If a station contains multiple charging points, they should be displayed separately.

Each point should communicate:

- Charging point identifier.
- Supported vehicle categories.
- Charging method.
- Connector information.
- Charging power.
- Pricing.
- Operational status.
- Reservation availability.

A Receiver should not be forced to select an unavailable or incompatible charging point.

---

## 3.6 Booking Flow

This is the primary Receiver transaction.

### Step 1: Select Charging Point

Receiver selects a charging point from the station details.

### Step 2: Select Vehicle

1. Platform displays registered vehicles.
2. Receiver selects the intended vehicle.
3. Platform evaluates known compatibility information.
4. If compatible, the process continues.
5. If incompatible, the Receiver is informed and cannot proceed with an ordinary compatible reservation.
6. If compatibility is unknown, the platform communicates the limitation and follows the applicable policy.

### Step 3: Select Reservation Period

1. Receiver selects a date.
2. Platform displays relevant available time slots.
3. Receiver selects a start time.
4. Receiver selects an end time or expected duration.
5. Platform checks station operating hours.
6. Platform checks charging point availability.

### Step 4: Availability Validation

The platform validates:

- Station approval and publication status.
- Station operating hours.
- Charging point operational status.
- Vehicle compatibility.
- Existing reservations.
- Active charging sessions.
- Maintenance periods.
- Charging point capacity.

If unavailable, the Receiver is asked to select another time or charging point.

### Step 5: Review Booking

Platform displays:

- Station.
- Charging point.
- Vehicle.
- Date.
- Start time.
- End time or expected duration.
- Charging method.
- Pricing.
- Additional fees, where applicable.
- Cancellation policy.
- Total payable amount or applicable payment terms.

### Step 6: Submit Booking Request

1. Receiver reviews the information.
2. Receiver confirms the reservation request.
3. Platform validates the request again.
4. Platform creates a booking.
5. Booking status becomes Pending.
6. Supplier receives the booking request.
7. Receiver receives a submission confirmation.

**Important:** Submission of a request does not automatically mean the charging service is confirmed.

---

## 3.7 Supplier Approval and Booking Confirmation Flow

After submission, the Supplier reviews the booking.

```text
             BOOKING SUBMITTED
                    |
                    v
              STATUS: PENDING
                    |
                    v
             SUPPLIER RECEIVES
                 REQUEST
                    |
                    v
             SUPPLIER REVIEWS
                 REQUEST
                    |
             +------+------+
             |             |
             v             v
          ACCEPT          REJECT
             |             |
             v             v
       STATUS: ACCEPTED  STATUS: REJECTED
             |             |
             v             v
       PAYMENT REQUIRED?  NOTIFY RECEIVER
          /       \
        YES        NO
        |           |
        v           v
   PAYMENT FLOW   CONFIRMATION
        |           |
        v           |
   PAYMENT SUCCESS? |
      /      \      |
    YES      NO     |
     |        |     |
     v        v     |
  CONFIRM  HANDLE    |
  BOOKING   FAILURE  |
     |        |      |
     +--------+------+
              |
              v
        BOOKING STATUS:
          CONFIRMED
              |
              v
        NOTIFY RECEIVER
```

### Acceptance Rules

- An accepted booking may require payment before it becomes confirmed.
- The applicable payment requirement must be clearly communicated.
- A booking that does not require advance payment may follow the platform's confirmation policy.
- A booking should not be considered confirmed merely because the Supplier accepted it if mandatory payment remains incomplete.

---

## 3.8 Payment Flow

1. Receiver opens the accepted booking.
2. Platform displays payment details.
3. Receiver reviews the payable amount.
4. Receiver selects an available payment method.
5. Receiver proceeds with payment.
6. Payment provider processes the transaction.
7. Backend verifies the payment result.
8. Payment record is updated.
9. If payment succeeds, booking confirmation proceeds.
10. If payment fails, the Receiver is informed.
11. Receiver may retry according to the applicable policy.

The platform must preserve separate payment and booking statuses.

---

## 3.9 Upcoming Booking Flow

1. Receiver opens Bookings.
2. Platform displays categorized reservations.
3. Receiver selects Upcoming.
4. Platform displays upcoming bookings.
5. Receiver selects a reservation.
6. Platform displays its details.
7. Receiver can view the station location.
8. Receiver can review reservation instructions.
9. Receiver can cancel the booking if cancellation is permitted.

---

## 3.10 Active Charging Flow

1. Receiver arrives at the station.
2. Receiver identifies the reserved charging point.
3. Supplier or authorized operator verifies the reservation.
4. Supplier initiates or records the charging session.
5. Charging session status becomes In Progress.
6. Platform records the session start time.
7. Receiver can view relevant session information.
8. Charging service is completed or interrupted.
9. Supplier records the session outcome.
10. Platform stores the session information.
11. Booking completion conditions are evaluated.

Automated charger integration may replace manual steps in a future release.

---

## 3.11 Completed Booking Flow

1. Charging session ends.
2. Session details are recorded.
3. Platform processes the completion state.
4. Booking is marked Completed when its required conditions are satisfied.
5. Receiver receives a completion notification.
6. Booking appears under Completed.
7. Receiver can access transaction and session details.
8. Receiver may submit an eligible review.

---

## 3.12 Receiver Cancellation Flow

1. Receiver opens Bookings.
2. Receiver selects the relevant reservation.
3. Receiver selects Cancel Booking.
4. Platform checks whether cancellation is permitted.
5. Platform displays applicable cancellation conditions.
6. Receiver confirms cancellation.
7. Platform changes the booking status to Cancelled.
8. Relevant charging capacity is released.
9. Supplier receives a cancellation notification.
10. Refund handling begins if applicable.
11. Receiver receives the cancellation result.

A cancellation must not automatically imply that a refund has been completed.

---

# 4. Supplier User Flow

## 4.1 Supplier Journey Overview

The Supplier's primary goal is to register charging infrastructure, make eligible facilities available on the marketplace, and manage incoming reservations.

```text
              SUPPLIER REGISTRATION
                       |
                       v
              SUBMIT VERIFICATION
                       |
                       v
               ADMINISTRATIVE REVIEW
                       |
                 +-----+-----+
                 |           |
                 v           v
              APPROVED    REJECTED
                 |           |
                 v           v
           SUPPLIER ACCESS  REVIEW /
                            RESUBMISSION
                 |
                 v
           SUPPLIER DASHBOARD
                 |
                 v
             ADD STATION
                 |
                 v
          ADD STATION DETAILS
                 |
                 v
        CONFIGURE CHARGING POINTS
                 |
                 v
           SET PRICING AND
             AVAILABILITY
                 |
                 v
           SUBMIT FOR APPROVAL
                 |
                 v
          ADMINISTRATIVE REVIEW
                 |
             +---+---+
             |       |
             v       v
          APPROVED REJECTED
             |       |
             v       v
         PUBLISH   MODIFY AND
          STATION  RESUBMIT
             |
             v
          RECEIVE BOOKINGS
             |
             v
         MANAGE RESERVATIONS
             |
             v
        MANAGE CHARGING SESSIONS
             |
             v
       VIEW EARNINGS AND RECORDS
```

---

## 4.2 Supplier Dashboard Flow

1. Supplier signs in.
2. Platform identifies the Supplier account.
3. Platform checks verification status.
4. Platform checks account permissions.
5. Supplier enters the appropriate dashboard.
6. Platform displays supplier-specific information.

### Dashboard Information

- Total stations.
- Published stations.
- Pending station approvals.
- Total charging points.
- Available charging points.
- Occupied charging points.
- Unavailable charging points.
- Pending booking requests.
- Confirmed bookings.
- Active charging sessions.
- Completed sessions.
- Earnings.
- Recent activity.

If verification is incomplete, restricted functionality should remain unavailable.

---

## 4.3 Supplier Profile Management

1. Supplier opens Settings or Business Profile.
2. Platform displays saved supplier information.
3. Supplier selects Edit.
4. Supplier updates permitted fields.
5. Supplier submits changes.
6. Platform validates the information.
7. Updated information is saved.
8. Platform displays confirmation.

Changes to important verification details may require another administrative review.

---

## 4.4 Supplier Verification Flow

1. Supplier opens Verification.
2. Platform displays current verification status.
3. Supplier enters or confirms required information.
4. Supplier uploads required documents.
5. Supplier reviews the submission.
6. Supplier submits verification.
7. Platform records the submission.
8. Verification status becomes Pending Review.
9. Super Admin receives a review item.
10. Super Admin reviews the submission.

### Administrative Decision

- Approved: Supplier is granted the relevant verified status.
- Rejected: Supplier receives the rejection reason.
- Additional Information Required: Supplier receives a request for further information.

If more information is requested:

1. Supplier opens the verification request.
2. Supplier reviews the reason.
3. Supplier provides the missing information.
4. Supplier resubmits.
5. Verification returns to the review process.

---

## 4.5 Add Charging Station Flow

1. Supplier opens My Stations.
2. Platform displays existing stations.
3. Supplier selects Add Station.
4. Platform displays the station information form.
5. Supplier enters station name.
6. Supplier enters station description.
7. Supplier adds address.
8. Supplier selects the station location on the map.
9. Supplier uploads station photographs.
10. Supplier specifies operating hours.
11. Supplier adds amenities.
12. Supplier reviews the information.
13. Supplier saves the station.

The initial station may be stored as Draft until the Supplier submits it.

---

## 4.6 Charging Point Creation Flow

After creating a station:

1. Supplier opens the station details.
2. Supplier selects Manage Charging Points.
3. Platform displays existing charging points.
4. Supplier selects Add Charging Point.
5. Supplier provides its identifier.
6. Supplier selects the charging method.
7. Supplier specifies supported connectors or charging arrangements.
8. Supplier selects compatible vehicle categories.
9. Supplier enters supported power information.
10. Supplier defines simultaneous charging capacity where applicable.
11. Supplier configures pricing.
12. Supplier defines initial availability.
13. Supplier saves the charging point.
14. The point appears in the station's charging point list.

The Supplier repeats this process for every charging point.

### Important

A Supplier must be able to configure different charging points independently.

A charging station may offer multiple charging methods and compatibility arrangements.

---

## 4.7 Pricing Configuration Flow

1. Supplier opens a charging point.
2. Supplier selects Pricing.
3. Platform displays existing pricing information.
4. Supplier selects the supported pricing model.
5. Supplier enters the amount.
6. Supplier defines the applicable pricing unit.
7. Supplier reviews applicable conditions.
8. Supplier saves the configuration.
9. Platform updates the charging point's future pricing.

Existing confirmed bookings must retain their original agreed price.

---

## 4.8 Availability Configuration Flow

1. Supplier opens Availability.
2. Supplier selects the relevant station.
3. Supplier selects a charging point.
4. Platform displays its availability schedule.
5. Supplier defines available operating periods.
6. Supplier adds blocked periods where necessary.
7. Supplier schedules maintenance if required.
8. Supplier saves changes.
9. Platform recalculates eligible availability.

### Availability Restrictions

The Supplier must not be able to make an already reserved or occupied resource available through an ordinary schedule change that conflicts with an active reservation.

Existing bookings and active charging sessions must be respected.

---

## 4.9 Submit Station for Approval

1. Supplier opens the station.
2. Platform checks required station information.
3. Platform checks associated charging points.
4. Platform identifies incomplete required information.
5. Supplier corrects missing information.
6. Supplier submits the station for approval.
7. Platform records the submission.
8. Station approval status becomes Pending Approval.
9. Super Admin receives the station submission.

The Supplier can view the station's approval status.

---

## 4.10 Booking Request Management Flow

1. Supplier receives a booking notification.
2. Supplier opens Bookings.
3. Platform displays pending booking requests.
4. Supplier opens a request.
5. Platform displays booking details.
6. Supplier reviews the requested charging point.
7. Supplier reviews the requested time.
8. Supplier checks relevant reservation information.
9. Supplier chooses Accept or Reject.

### Accept Flow

1. Supplier selects Accept.
2. Platform validates the booking and resource availability.
3. If the resource remains available, the booking becomes Accepted.
4. Receiver is notified.
5. Applicable payment and confirmation rules are processed.
6. Supplier can view the resulting booking status.

### Reject Flow

1. Supplier selects Reject.
2. Supplier may provide a rejection reason.
3. Platform updates the booking to Rejected.
4. Receiver receives a notification.
5. The rejected reservation is removed from active booking consideration.
6. Any associated payment handling follows the applicable policy.

---

## 4.11 Confirmed Booking Management

1. Supplier opens Confirmed Bookings.
2. Platform displays confirmed reservations.
3. Supplier selects a booking.
4. Platform displays the reservation details.
5. Supplier can review the date and time.
6. Supplier can review the assigned charging point.
7. Supplier can review relevant Receiver information.
8. Supplier manages the reservation according to its status and applicable policy.

---

## 4.12 Charging Session Management Flow

1. Supplier opens Sessions.
2. Platform displays relevant upcoming and active reservations.
3. Supplier identifies the Receiver's reservation.
4. Supplier verifies the charging point and reservation.
5. Supplier initiates the session manually.
6. Platform creates or updates the session record.
7. Session status becomes In Progress.
8. Platform records the start timestamp.
9. Supplier monitors the session.
10. Supplier ends the session when charging is completed.
11. Platform records the end timestamp and relevant information.
12. Session status becomes Completed.
13. Booking completion conditions are evaluated.
14. Receiver receives an update.

### Interrupted Session

If a session is interrupted:

1. Supplier records the interruption.
2. Supplier provides relevant information where applicable.
3. Session status becomes Interrupted.
4. Platform preserves session records.
5. Associated booking and payment handling follow the applicable policy.
6. Relevant parties receive an update.

---

## 4.13 Earnings and Transaction Flow

1. Supplier opens Earnings.
2. Platform displays financial summaries.
3. Supplier selects a relevant time period.
4. Platform displays applicable transaction records.
5. Supplier selects a transaction.
6. Platform displays transaction details.
7. Supplier reviews payment and payout status.
8. Supplier can view relevant refund or settlement information where available.

---

# 5. Super Admin User Flow

## 5.1 Super Admin Journey Overview

The Super Admin's objective is to maintain the integrity and operational health of the marketplace.

```text
              ADMIN AUTHENTICATION
                       |
                       v
               ADMIN DASHBOARD
                       |
          +------------+-------------+
          |            |             |
          v            v             v
        USERS       SUPPLIERS      STATIONS
          |            |             |
          v            v             v
        REVIEW      VERIFY         APPROVE
          |            |             |
          +------------+-------------+
                       |
                       v
               MARKETPLACE OVERSIGHT
                       |
          +------------+-------------+
          |            |             |
          v            v             v
       BOOKINGS     PAYMENTS      COMPLAINTS
          |            |             |
          +------------+-------------+
                       |
                       v
                REPORTS AND
              ADMINISTRATION
```

---

## 5.2 Admin Dashboard Flow

1. Super Admin signs in using authorized credentials.
2. Platform verifies administrator permissions.
3. Super Admin enters the administrative dashboard.
4. Platform displays marketplace-wide statistics.
5. Super Admin reviews recent activity.
6. Super Admin accesses the required management section.

### Dashboard Information

- Total users.
- Total Receivers.
- Total Suppliers.
- Pending supplier verifications.
- Approved Suppliers.
- Total charging stations.
- Pending station approvals.
- Published stations.
- Total charging points.
- Booking statistics.
- Payment statistics.
- Complaint statistics.
- Recent administrative activity.

---

## 5.3 Receiver Management Flow

1. Super Admin opens Receivers.
2. Platform displays registered Receiver accounts.
3. Super Admin searches or filters accounts.
4. Super Admin selects an account.
5. Platform displays relevant account details.
6. Super Admin reviews account status.
7. Super Admin chooses an appropriate administrative action.

Possible actions:

- View account.
- Review relevant activity.
- Suspend account.
- Reactivate account, where permitted.

Administrative changes must be recorded.

---

## 5.4 Supplier Management Flow

1. Super Admin opens Suppliers.
2. Platform displays Supplier accounts.
3. Super Admin searches or filters suppliers.
4. Super Admin selects a Supplier.
5. Platform displays supplier information.
6. Super Admin reviews verification status.
7. Super Admin reviews associated stations.
8. Super Admin selects an authorized administrative action.

Possible actions:

- View Supplier.
- Approve Supplier.
- Reject Supplier.
- Request additional information.
- Suspend Supplier.
- Reactivate Supplier, where permitted.

---

## 5.5 Supplier Verification Review Flow

1. Super Admin opens Verification Requests.
2. Platform displays pending applications.
3. Super Admin selects an application.
4. Platform displays submitted information and documents.
5. Super Admin reviews the information.
6. Super Admin makes a decision.

### Decision Paths

**Approved**

1. Super Admin selects Approve.
2. Platform records the decision.
3. Supplier verification status becomes Approved.
4. Supplier receives a notification.
5. Relevant Supplier permissions are updated.

**Rejected**

1. Super Admin selects Reject.
2. Super Admin provides a reason.
3. Platform records the decision.
4. Supplier verification status becomes Rejected.
5. Supplier receives the rejection notification and reason.

**Additional Information Required**

1. Super Admin selects Request Information.
2. Super Admin provides the required details.
3. Platform records the request.
4. Supplier receives a notification.
5. Supplier submits the required information.
6. Application returns to the review process.

---

## 5.6 Station Approval Flow

1. Super Admin opens Station Approvals.
2. Platform displays pending station submissions.
3. Super Admin selects a station.
4. Platform displays station details.
5. Super Admin reviews its location.
6. Super Admin reviews photographs.
7. Super Admin reviews supplier information.
8. Super Admin reviews charging point configurations.
9. Super Admin selects an administrative decision.

### Approval Decision

**Approve**

1. Platform records the approval.
2. Station approval status becomes Approved.
3. Supplier receives a notification.
4. Station can become publicly visible according to its publication status.

**Reject**

1. Super Admin provides a rejection reason.
2. Platform records the rejection.
3. Supplier receives a notification.
4. Supplier may modify and resubmit the station.

**Request Changes**

1. Super Admin identifies the required changes.
2. Platform records the request.
3. Supplier receives the requested changes.
4. Supplier updates the station.
5. Station is resubmitted for review.

---

## 5.7 Booking Oversight Flow

1. Super Admin opens Bookings.
2. Platform displays marketplace booking records.
3. Super Admin searches or filters bookings.
4. Super Admin selects a booking.
5. Platform displays its details.
6. Super Admin reviews its Receiver, Supplier, station, charging point, and status.
7. Super Admin investigates the booking if necessary.
8. Super Admin takes an authorized action where appropriate.
9. Platform records relevant administrative activity.

The Super Admin should not need to intervene in ordinary booking operations.

---

## 5.8 Payment Oversight Flow

1. Super Admin opens Transactions.
2. Platform displays payment records.
3. Super Admin searches or filters transactions.
4. Super Admin selects a transaction.
5. Platform displays associated booking and payment details.
6. Super Admin reviews the payment status.
7. Super Admin investigates failures or disputes.
8. Super Admin performs permitted actions.
9. Platform records administrative intervention.

Refund actions must follow payment-provider and marketplace policies.

---

## 5.9 Complaint Management Flow

1. Super Admin opens Complaints.
2. Platform displays submitted complaints.
3. Super Admin selects a complaint.
4. Platform displays the complaint description.
5. Platform displays associated booking or transaction information, where available.
6. Super Admin reviews the issue.
7. Super Admin communicates with the relevant parties if required.
8. Super Admin records the decision.
9. Complaint status is updated.
10. Relevant users receive an update.

### Complaint Statuses

- Open.
- Under Review.
- Awaiting Information.
- Resolved.
- Closed.

---

## 5.10 Platform Configuration Flow

1. Super Admin opens Platform Settings.
2. Platform displays permitted configuration categories.
3. Super Admin selects a category.
4. Platform displays current settings.
5. Super Admin modifies an authorized setting.
6. Platform validates the change.
7. Super Admin confirms the update.
8. Platform saves the configuration.
9. Relevant audit records are created.

---

# 6. Cross-Role Workflows

These workflows involve interactions between multiple user categories.

## 6.1 Complete Supplier-to-Receiver Marketplace Flow

This is the central business workflow.

```text
                 SUPPLIER
                     |
                     v
              REGISTER ACCOUNT
                     |
                     v
              SUBMIT VERIFICATION
                     |
                     v
                 SUPER ADMIN
                     |
                     v
            APPROVE SUPPLIER
                     |
                     v
                 SUPPLIER
                     |
                     v
               ADD STATION
                     |
                     v
          CONFIGURE CHARGING POINTS
                     |
                     v
            SUBMIT STATION
                     |
                     v
                SUPER ADMIN
                     |
                     v
             APPROVE STATION
                     |
                     v
                 SUPPLIER
                     |
                     v
             PUBLISH STATION
                     |
                     v
                 RECEIVER
                     |
                     v
             DISCOVER STATION
                     |
                     v
             SELECT CHARGER
                     |
                     v
              SUBMIT BOOKING
                     |
                     v
                 SUPPLIER
                     |
                     v
            ACCEPT BOOKING
                     |
                     v
                 RECEIVER
                     |
                     v
              COMPLETE PAYMENT
                     |
                     v
            BOOKING CONFIRMED
                     |
                     v
             CHARGING SESSION
                     |
                     v
             SESSION COMPLETED
                     |
                     v
             BOOKING COMPLETED
                     |
                     v
            TRANSACTION HISTORY
```

---

# 7. Booking State and Payment State Flows

Booking and payment must be independent state-management processes.

## 7.1 Booking State Flow

```text
              PENDING
                 |
          +------+------+
          |             |
          v             v
       ACCEPTED       REJECTED
          |
          v
     CONFIRMATION
      CONDITIONS
          |
          +----------------+
          |                |
          v                v
      CONFIRMED        EXPIRED
          |
     +----+--------+
     |             |
     v             v
  CANCELLED      ACTIVE
                   |
                   v
               COMPLETED
```

The actual transition rules must account for payment requirements and charging-session completion.

## 7.2 Payment State Flow

```text
               UNPAID
                  |
                  v
              PROCESSING
                  |
             +----+----+
             |         |
             v         v
            PAID      FAILED
             |         |
             v         v
          BOOKING   RETRY OR
        CONFIRMATION OTHER ACTION
             |
             v
         REFUND PROCESS
             |
        +----+-----+
        |          |
        v          v
     REFUNDED   PARTIALLY
                REFUNDED
```

A payment failure does not automatically imply booking cancellation unless the applicable booking policy requires it.

---

# 8. Charging Session Flow

The charging session must be tracked independently of the booking.

```text
             BOOKING CONFIRMED
                    |
                    v
             SESSION NOT STARTED
                    |
                    v
              SESSION STARTS
                    |
                    v
              SESSION ACTIVE
                    |
             +------+------+
             |             |
             v             v
          COMPLETED     INTERRUPTED
             |             |
             v             v
        SAVE SESSION   SAVE SESSION
           RECORD         RECORD
             |             |
             v             v
       UPDATE BOOKING  HANDLE EXCEPTION
          STATUS       ACCORDING TO POLICY
```

The session start must be recorded only when charging actually begins.

A confirmed reservation must not automatically create an active charging session.

---

# 9. Cancellation and Exception Workflows

## 9.1 Receiver Cancels Before Supplier Acceptance

1. Receiver opens a Pending booking.
2. Receiver selects Cancel.
3. Platform verifies cancellation eligibility.
4. Receiver confirms.
5. Booking becomes Cancelled.
6. Supplier receives a notification.
7. Reserved capacity is released where applicable.

## 9.2 Receiver Cancels After Confirmation

1. Receiver opens the Confirmed booking.
2. Receiver selects Cancel.
3. Platform checks cancellation rules.
4. Platform calculates any applicable cancellation conditions.
5. Receiver confirms.
6. Booking becomes Cancelled.
7. Supplier receives a notification.
8. Refund process starts if applicable.
9. Payment status is updated independently.

## 9.3 Supplier Cancels a Confirmed Booking

1. Supplier opens the confirmed booking.
2. Supplier selects Cancel.
3. Platform checks whether cancellation is permitted.
4. Supplier provides a reason.
5. Platform records the cancellation.
6. Receiver receives a notification.
7. Charging resource capacity is released.
8. Payment and refund handling begins if applicable.

## 9.4 Supplier Does Not Respond

1. Receiver submits a booking request.
2. Booking remains Pending.
3. Supplier does not respond within the allowed period.
4. Platform reaches the configured expiration condition.
5. Booking becomes Expired.
6. Receiver is notified.
7. Charging resource capacity is released where applicable.

## 9.5 Charging Point Becomes Unavailable

If a charging point becomes unavailable before a confirmed reservation:

1. Platform identifies the operational status change.
2. Existing affected reservations are identified.
3. Supplier is notified.
4. Receiver receives an appropriate update.
5. An alternative charging point or reservation may be offered.
6. Cancellation and refund rules apply if the booking cannot be fulfilled.

The platform must not silently invalidate confirmed reservations.

## 9.6 Payment Failure

1. Receiver initiates payment.
2. Payment provider reports an unsuccessful transaction.
3. Backend verifies the result.
4. Payment status becomes Failed.
5. Receiver is informed.
6. Receiver may retry if permitted.
7. Booking remains in its appropriate state until confirmation or expiration conditions are satisfied.

## 9.7 Session Interruption

1. Charging session is active.
2. Charging activity stops unexpectedly.
3. Supplier records the interruption or receives an eligible hardware update in the future.
4. Session status becomes Interrupted.
5. Platform preserves the session record.
6. Receiver and Supplier receive relevant updates.
7. Refund or booking resolution follows applicable policy.

---

# 10. Notification Flow

Notifications should be triggered by meaningful platform events.

| Event | Recipient |
|---|---|
| Registration completed | Receiver / Supplier |
| Verification submitted | Super Admin |
| Supplier approved | Supplier |
| Supplier rejected | Supplier |
| Station submitted for approval | Super Admin |
| Station approved | Supplier |
| Station rejected | Supplier |
| New booking request | Supplier |
| Booking accepted | Receiver |
| Booking rejected | Receiver |
| Booking confirmed | Receiver / Supplier |
| Payment completed | Receiver |
| Payment failed | Receiver |
| Booking cancelled | Receiver / Supplier |
| Upcoming reservation | Receiver / Supplier |
| Charging session started | Receiver / Supplier |
| Charging session completed | Receiver / Supplier |
| Complaint submitted | Super Admin |
| Complaint status updated | Relevant user |

Notifications should contain enough information for the recipient to understand the event and navigate to the related record.

---

# 11. Navigation Entry Points by Role

This section defines the primary navigation destinations rather than detailed visual layouts.

## 11.1 Receiver

| Navigation Item | Main Destination |
|---|---|
| Explore | Station discovery and map |
| Bookings | Reservation management |
| Vehicles | Saved vehicle management |
| Profile | Account and settings |
| Notifications | User notifications |

## 11.2 Supplier

| Navigation Item | Main Destination |
|---|---|
| Overview | Supplier dashboard |
| Stations | Station management |
| Charging Points | Charging resource management |
| Bookings | Booking request and reservation management |
| Availability | Operating schedules and blocked periods |
| Sessions | Charging session management |
| Earnings | Transactions and financial records |
| Settings | Supplier profile and account settings |

## 11.3 Super Admin

| Navigation Item | Main Destination |
|---|---|
| Dashboard | Platform-wide overview |
| Receivers | Receiver account management |
| Suppliers | Supplier account management |
| Verification | Supplier verification |
| Stations | Station approval and oversight |
| Charging Points | Charging infrastructure oversight |
| Bookings | Marketplace booking oversight |
| Transactions | Payment and financial oversight |
| Complaints | Support and dispute management |
| Reports | Platform analytics |
| Settings | Platform configuration |

---

# 12. Role and Permission Flow

Every protected user action must follow role-based access rules.

```text
                  USER ACTION
                       |
                       v
               AUTHENTICATE USER
                       |
                       v
               IDENTIFY USER ROLE
                       |
                       v
              CHECK ACCOUNT STATUS
                       |
                       v
              CHECK PERMISSIONS
                       |
                 +-----+-----+
                 |           |
                 v           v
              ALLOWED     NOT ALLOWED
                 |           |
                 v           v
           PROCESS ACTION  DENY ACCESS
                 |
                 v
          VALIDATE BUSINESS RULES
                 |
                 v
            SAVE CHANGES
                 |
                 v
           RECORD RELEVANT
               ACTIVITY
```

The backend must enforce these checks for every protected operation.

Hiding a navigation item in the frontend is not sufficient authorization.

---

# 13. Important Flow Rules

The following rules apply to all user journeys.

## 13.1 Account Rules

- Every user must be authenticated before accessing protected features.
- Account type determines the available experience.
- Super Admin accounts must use an authorized provisioning process.
- Suspended or restricted accounts must follow the appropriate access restrictions.

## 13.2 Supplier and Station Rules

- Supplier verification and station approval are separate processes.
- Station submission does not automatically mean station approval.
- Only eligible stations should become publicly discoverable.
- Suppliers may only manage their authorized infrastructure.

## 13.3 Charging Point Rules

- Charging points must be managed independently.
- Charging compatibility must be evaluated using available information.
- Station availability must not replace charging point availability.
- Capacity must account for simultaneous charging connections.

## 13.4 Booking Rules

- A booking must reference a valid Receiver, vehicle, station, and charging point.
- Compatibility must be checked before accepting an ordinary reservation.
- Availability must be validated before creating a booking and again where needed during confirmation.
- Conflicting reservations must be prevented.
- Supplier acceptance and booking confirmation must remain distinguishable.
- Every booking must preserve its agreed price and conditions.

## 13.5 Payment Rules

- Payment status and booking status must remain separate.
- Payment success must be verified by the backend.
- A booking requiring payment must not become confirmed before the required payment condition is satisfied.
- Refunds must be associated with their original transactions.

## 13.6 Charging Session Rules

- A confirmed booking is not an active charging session.
- Session start and end must be recorded.
- Active sessions occupy charging capacity.
- Interrupted sessions must retain their records.
- Booking completion must follow the defined service-completion conditions.

## 13.7 Administrative Rules

- Administrative actions must require appropriate authorization.
- Important administrative decisions must be recorded.
- Rejections should include reasons where appropriate.
- Historical booking, payment, and session records should not be silently deleted.

---

# 14. End-to-End Success Scenarios

The following scenarios represent the most important successful user journeys.

## Scenario A: New Receiver Successfully Books a Charging Point

**Initial Conditions:**

- Receiver has an active account.
- Receiver has registered a vehicle.
- An approved station is publicly available.
- A compatible charging point has an available reservation period.

**Expected Flow:**

1. Receiver logs in.
2. Receiver searches for charging stations.
3. Receiver selects a suitable station.
4. Receiver selects a compatible charging point.
5. Receiver selects a vehicle.
6. Receiver chooses a reservation period.
7. Platform validates availability.
8. Receiver submits a booking request.
9. Supplier accepts the request.
10. Receiver completes any required payment.
11. Booking becomes Confirmed.
12. Receiver arrives at the station.
13. Supplier starts the charging session.
14. Charging session completes.
15. Booking becomes Completed.
16. Receiver can review the transaction and charging history.

**Success Result:** The Receiver successfully discovers, reserves, and uses a charging service.

## Scenario B: New Supplier Successfully Publishes a Charging Station

**Initial Conditions:**

- Supplier does not have an existing approved account.
- Supplier has the necessary registration and verification information.

**Expected Flow:**

1. Supplier registers.
2. Supplier submits verification information.
3. Super Admin approves the Supplier.
4. Supplier creates a station.
5. Supplier adds charging points.
6. Supplier configures compatibility.
7. Supplier configures pricing.
8. Supplier defines availability.
9. Supplier submits the station for approval.
10. Super Admin reviews the station.
11. Super Admin approves the station.
12. Supplier publishes the station according to platform rules.
13. The station becomes discoverable to eligible Receivers.

**Success Result:** The Supplier successfully lists charging infrastructure on the marketplace.

## Scenario C: Super Admin Successfully Manages a Supplier Application

**Initial Conditions:**

- A Supplier has submitted a verification application.
- The application is awaiting administrative review.

**Expected Flow:**

1. Super Admin signs in.
2. Super Admin opens Verification.
3. Super Admin selects the pending application.
4. Super Admin reviews supplier details.
5. Super Admin reviews submitted documents.
6. Super Admin approves or rejects the application.
7. Platform records the decision.
8. Supplier receives a notification.
9. Supplier permissions are updated according to the result.

**Success Result:** Supplier verification is completed and its decision is traceable.

---

# 15. Final User Flow Definition

The EV Charging Marketplace operates through three role-specific user journeys connected by common marketplace processes.

The Receiver journey focuses on vehicle registration, station discovery, charging compatibility, reservation, payment, and charging activity.

The Supplier journey focuses on registration, verification, station creation, charging point configuration, pricing, availability, booking management, charging sessions, and financial records.

The Super Admin journey focuses on user management, Supplier verification, station approval, marketplace oversight, payment monitoring, and dispute resolution.

All three journeys interact through a shared marketplace process in which approved charging infrastructure is made discoverable, compatible charging points are reserved, Suppliers process requests, payments are recorded, and actual charging sessions are managed.

**The central user journey is:**

**Supplier lists charging infrastructure → Super Admin approves it → Receiver discovers a compatible charging point → Receiver submits a reservation → Supplier processes the request → Payment and confirmation are completed → Charging session takes place → Booking and transaction records are finalized.**