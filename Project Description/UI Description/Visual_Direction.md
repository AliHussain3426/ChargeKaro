# USERFLOW.md
# EV Charging Platform

**Document Type:** User Flow and Workflow Specification  
**Application Type:** Mobile-First Responsive Web Application  
**Target Market:** Pakistan  
**Primary Roles:** Customer, Supplier, Super Admin  
**Architecture:** MERN Stack  
**Status:** Initial User Flow Baseline

---

# 1. Introduction

## 1.1 Purpose

This document defines how users interact with the EV Charging Platform, from their first visit to the website through registration, onboarding, charging terminal discovery, booking, payment, and charging service completion.

It describes:

- Website navigation.
- Registration and login journeys.
- Customer onboarding.
- Supplier onboarding.
- Vehicle registration.
- Station and terminal registration.
- Charging terminal discovery.
- Location and route calculation.
- Booking request handling.
- Supplier acceptance and rejection.
- Customer payment.
- Supplier earnings and settlement.
- Notifications.
- Super admin workflows.
- Error conditions and alternative user journeys.

The purpose is to establish a consistent product flow before frontend and backend implementation begins.

## 1.2 Core Platform Concept

The platform connects EV customers with charging terminal suppliers across Pakistan.

There are two primary user journeys:

**Customer Journey**

Register → Register Vehicle → Search Charging Terminals → Find Suitable Terminal → View Route → Request Booking → Supplier Accepts → Make Payment → Charge Vehicle → Complete Booking.

**Supplier Journey**

Register → Complete Supplier Profile → Register Station → Register Charging Terminals → Configure Availability and Pricing → Receive Booking Request → Accept or Reject → Provide Charging Service → Receive Payment Settlement.

A third role, Super Admin, manages and monitors the overall platform.

---

# 2. Platform Structure

## 2.1 Main Website Entry

Every user initially accesses the same public website.

The website begins with a landing page.

The landing page introduces the platform and provides the main actions:

- Find Charging Terminals.
- Register as a Customer.
- Register as a Supplier.
- Log In.
- Learn How It Works.

The primary registration action takes the visitor to the registration selection panel.

## 2.2 Registration Selection

The registration panel provides two options.

### Option A: Customer

For EV owners who want to find and book charging terminals.

Selecting this option opens the customer registration form.

### Option B: Supplier

For businesses or individuals who want to list and manage charging terminals.

Selecting this option opens the supplier registration form.

The platform assigns the correct account role based on the selected registration path.

A user must not be able to select an administrative role through public registration.

## 2.3 Main Application Navigation

After successful authentication, users are redirected to their respective interfaces.

| Role | Default Destination |
|---|---|
| Customer | Customer Dashboard |
| Supplier | Supplier Dashboard |
| Super Admin | Admin Dashboard |

Each role has its own navigation and permissions.

The platform remains a single web application with a shared design system and separate role-specific experiences.

---

# 3. High-Level Platform Flow

```text
                         VISITOR
                            |
                            v
                       LANDING PAGE
                            |
                            v
                    REGISTRATION PANEL
                            |
                  +---------+---------+
                  |                   |
                  v                   v
             CUSTOMER              SUPPLIER
             REGISTER              REGISTER
                  |                   |
                  v                   v
           CUSTOMER LOGIN       SUPPLIER LOGIN
                  |                   |
                  v                   v
          CUSTOMER DASHBOARD   SUPPLIER DASHBOARD
                  |                   |
                  v                   v
           REGISTER VEHICLE     REGISTER STATION
                  |                   |
                  v                   v
          SEARCH TERMINALS     ADD CHARGING TERMINALS
                  |                   |
                  v                   v
           SELECT TERMINAL     CONFIGURE AVAILABILITY
                  |             AND PRICING
                  v                   |
            VIEW ROUTE                |
                  |                   |
                  v                   |
           REQUEST BOOKING             |
                  |                   |
                  +---------+---------+
                            |
                            v
                    SUPPLIER RECEIVES
                    BOOKING REQUEST
                            |
                            v
                  SUPPLIER DECISION
                     /          \
                    /            \
                   v              v
               REJECTED        ACCEPTED
                   |              |
                   v              v
             CUSTOMER      CUSTOMER NOTIFIED
              NOTIFIED            |
                                  v
                           MAKE PAYMENT
                                  |
                                  v
                         PAYMENT VERIFICATION
                            /          \
                           /            \
                          v              v
                       FAILED         SUCCESS
                          |              |
                          v              v
                    RETRY PAYMENT    CONFIRMED
                                         |
                                         v
                                  CHARGING SERVICE
                                         |
                                         v
                                  COMPLETE BOOKING
                                         |
                                         v
                               SUPPLIER SETTLEMENT
```

---

# 4. Visitor User Flow

## 4.1 Landing Page

**Entry Point:** User visits the website URL.

The visitor sees the public landing page.

The landing page should communicate:

- What the platform does.
- How customers can find charging terminals.
- How suppliers can list charging services.
- How the booking process works.
- Why the platform is useful.

### Available Actions

| Action | Result |
|---|---|
| Find Charging | Opens the customer discovery entry point or customer registration flow |
| Register | Opens registration selection |
| Become a Supplier | Opens supplier registration |
| Login | Opens login page |
| How It Works | Opens platform explanation |
| Contact | Opens contact information |

### Guest Search

The platform may allow a visitor to explore charging terminal locations without creating an account.

However, requesting a booking requires an authenticated customer account and a registered vehicle.

Guest search should not expose private customer or supplier information.

## 4.2 Registration Selection Flow

```text
LANDING PAGE
     |
     v
REGISTER
     |
     v
REGISTRATION PANEL
     |
     +----------------------+
     |                      |
     v                      v
CUSTOMER                 SUPPLIER
REGISTRATION             REGISTRATION
```

The selected path must determine which registration form and onboarding workflow the user receives.

## 4.3 Login Flow

```text
LANDING PAGE
     |
     v
LOGIN
     |
     v
ENTER EMAIL / PASSWORD
     |
     v
BACKEND AUTHENTICATION
     |
     +-------------------------+
     |                         |
     v                         v
INVALID CREDENTIALS       SUCCESSFUL LOGIN
     |                         |
     v                         v
SHOW ERROR MESSAGE       IDENTIFY USER ROLE
                               |
                   +-----------+-----------+
                   |           |           |
                   v           v           v
                CUSTOMER   SUPPLIER      ADMIN
                   |           |           |
                   v           v           v
               CUSTOMER    SUPPLIER       ADMIN
              DASHBOARD   DASHBOARD     DASHBOARD
```

Requirements:

- The backend validates credentials.
- The system identifies the authenticated user's role.
- The user is redirected to the correct dashboard.
- A user must not gain access to another role's protected routes by manually entering a URL.
- Invalid credentials must result in an appropriate error message.

---

# 5. Customer User Flow

## 5.1 Customer Journey Overview

The customer's main objective is to locate a suitable charging terminal, request a booking, pay for the service, and charge their vehicle.

The complete flow is:

```text
CUSTOMER REGISTRATION
         |
         v
CUSTOMER LOGIN
         |
         v
CUSTOMER ONBOARDING
         |
         v
REGISTER VEHICLE
         |
         v
CUSTOMER DASHBOARD
         |
         v
SELECT LOCATION
         |
         v
SEARCH TERMINALS
         |
         v
FILTER AND SORT RESULTS
         |
         v
SELECT TERMINAL
         |
         v
CHECK COMPATIBILITY
         |
         v
VIEW TERMINAL DETAILS
         |
         v
VIEW SHORTEST ROAD ROUTE
         |
         v
SELECT DATE AND TIME
         |
         v
CHECK AVAILABILITY
         |
         v
SUBMIT BOOKING REQUEST
         |
         v
WAIT FOR SUPPLIER RESPONSE
         |
         v
SUPPLIER ACCEPTS
         |
         v
MAKE PAYMENT
         |
         v
PAYMENT CONFIRMED
         |
         v
CHARGING SERVICE
         |
         v
COMPLETE BOOKING
         |
         v
BOOKING HISTORY / FEEDBACK
```

## 5.2 Customer Registration

**Entry Point:** Registration Panel → Customer.

### Registration Form

The customer provides:

- Full name.
- Email address.
- Phone number.
- Password.
- Confirm password.
- Acceptance of terms and conditions.

### System Processing

1. Customer submits the registration form.
2. Frontend validates required fields.
3. Backend validates the submitted information.
4. Backend checks whether the email or phone number is already registered.
5. Backend securely hashes the password.
6. Backend creates the user account with the `CUSTOMER` role.
7. Verification is initiated if required.
8. Customer receives registration success feedback.

### Expected Result

The customer account is created.

The customer proceeds to login or is authenticated and redirected to onboarding, depending on the authentication implementation.

### Alternative Paths

| Condition | System Response |
|---|---|
| Email already exists | Display duplicate account error |
| Phone number already exists | Display duplicate phone error |
| Invalid email | Display validation error |
| Weak password | Request a stronger password |
| Password mismatch | Display mismatch error |
| Verification required | Ask the customer to verify their account |
| Server error | Display a general error and allow retry |

## 5.3 Customer Onboarding

After registration, the customer enters the onboarding flow.

The first important task is registering an electric vehicle.

### Onboarding Steps

1. Welcome the customer.
2. Explain that a vehicle is needed for compatibility checking and booking.
3. Open the vehicle registration form.
4. Collect vehicle specifications.
5. Validate the submitted information.
6. Save the vehicle.
7. Redirect the customer to the dashboard.

The user should be able to skip optional information if the platform allows it, but vehicle information required for compatibility must be collected before booking.

## 5.4 Vehicle Registration

### Vehicle Registration Form

The customer provides:

- Manufacturer.
- Model.
- Vehicle category.
- Model year, if known.
- Battery capacity, if known.
- Charging method.
- Connector type.
- Maximum supported charging power, if known.

### Vehicle Categories

- Electric Car.
- Electric Motorcycle.
- Electric Scooter.
- Electric Bicycle.
- Other supported electric vehicle.

### System Processing

1. Customer opens Add Vehicle.
2. Customer selects the vehicle category.
3. Customer enters vehicle specifications.
4. Frontend validates required information.
5. Backend validates the information.
6. Backend associates the vehicle with the authenticated customer.
7. Vehicle is saved in MongoDB.
8. Vehicle appears in the customer's vehicle list.

### Vehicle Management

The customer can:

- Add another vehicle.
- Edit an existing vehicle.
- Delete a vehicle.
- Select a default vehicle, if supported.
- Select a vehicle before each booking.

### Important Rule

Vehicle information belongs to the authenticated customer.

Customers must not be able to view or modify vehicles belonging to other users.

## 5.5 Customer Dashboard

After successful onboarding, the customer reaches the customer dashboard.

The dashboard should provide quick access to:

- Search Charging Terminals.
- Nearby Terminals.
- Registered Vehicles.
- Active Booking.
- Upcoming Bookings.
- Booking History.
- Notifications.
- Profile.

The most prominent action should be searching for a charging terminal.

## 5.6 Location Selection

Before searching, the customer must select the origin from which distance and routing will be calculated.

The origin may come from:

1. Current device location.
2. Manually entered address.
3. Selected map location.
4. City or area search.

### Current Location Flow

```text
CUSTOMER SELECTS USE MY LOCATION
             |
             v
BROWSER REQUESTS LOCATION PERMISSION
             |
          +--+--+
          |     |
          v     v
       ALLOW   DENY
          |     |
          v     v
   GET COORDINATES   ASK CUSTOMER TO
          |          ENTER LOCATION
          v               |
   SET SEARCH ORIGIN      v
          |          SET SEARCH ORIGIN
          +------+--------+
                 |
                 v
           SEARCH READY
```

If the customer denies location access, the platform must still permit manual location selection.

The platform must not block terminal discovery because location permission was denied.

## 5.7 Charging Terminal Search

After selecting an origin, the customer can search for charging terminals.

### Search Process

1. Customer opens terminal search.
2. Customer selects a registered vehicle.
3. Customer sets a location.
4. Customer optionally selects filters.
5. Customer submits the search.
6. Frontend sends the search request to the backend.
7. Backend retrieves relevant terminal records.
8. Backend checks the requested criteria.
9. Backend evaluates compatibility.
10. Backend checks relevant availability information.
11. Backend returns matching results.
12. Frontend displays results in map and list views.

### Search Filters

The customer may filter results by:

- Vehicle compatibility.
- Distance.
- Availability.
- Price.
- Charging power.
- Connector type.
- Station operating hours.

### Search Sorting

Results may be sorted by:

- Shortest road distance.
- Lowest price.
- Highest charging power.
- Earliest availability.

### Search Result Information

Each result should display:

- Terminal name.
- Station name.
- Address or area.
- Road distance, when calculated.
- Price.
- Charging power.
- Charging method.
- Availability.
- Compatibility status.

### Search Result States

| State | Behavior |
|---|---|
| Results Found | Display matching terminals |
| No Results | Display a no-results message |
| Loading | Display a loading state |
| Location Missing | Ask for an origin |
| Routing Unavailable | Allow results to display without route information |
| Incompatible Results | Hide them when compatibility filtering is applied, or clearly label them otherwise |

The system must not confuse a terminal being geographically nearby with it being compatible or available.

## 5.8 Shortest Route Selection

After identifying a suitable terminal, the customer selects it to view its details and route.

### Route Flow

1. Customer selects a terminal.
2. Frontend requests route information.
3. Backend or routing integration receives origin and destination coordinates.
4. Routing system calculates a road route.
5. Route distance and geometry are returned.
6. Frontend displays the route using Leaflet.
7. Customer reviews the route.
8. Customer proceeds to booking.

### Dijkstra's Algorithm

If the application implements Dijkstra's algorithm directly, the process is:

```text
CUSTOMER ORIGIN
       |
       v
CONVERT ORIGIN TO GRAPH NODE
       |
       v
LOAD ROAD-NETWORK GRAPH
       |
       v
CONVERT TERMINAL LOCATION
TO DESTINATION GRAPH NODE
       |
       v
RUN DIJKSTRA'S ALGORITHM
       |
       v
GET SHORTEST PATH
       |
       v
CALCULATE TOTAL DISTANCE
       |
       v
RETURN ROUTE GEOMETRY
AND ROUTE INFORMATION
       |
       v
DISPLAY ROUTE ON LEAFLET
```

The road-network graph must contain the road connections and edge weights.

The system cannot calculate an accurate road route using only the origin and destination coordinates.

### Route Results

The customer should see:

- Starting point.
- Destination terminal.
- Route on the map.
- Road distance.
- Estimated travel time, if available.

If route calculation fails, the customer should still be able to view the terminal's location and details.

## 5.9 Terminal Details

When a customer selects a terminal, the platform opens its detail page.

Information should include:

- Terminal name.
- Station name.
- Supplier information.
- Terminal location.
- Road distance.
- Charging method.
- Connector type.
- Charging power.
- Supported vehicle categories.
- Compatibility with the selected vehicle.
- Pricing.
- Operating hours.
- Availability.
- Station images, if available.

The customer can proceed only when the terminal is eligible for the requested booking.

If compatibility is unknown, the system must clearly inform the customer rather than claiming that the terminal supports the vehicle.

## 5.10 Booking Request Creation

After choosing a terminal, the customer starts the booking process.

### Booking Form

The customer selects:

- Vehicle.
- Date.
- Available start time.
- Booking duration or end time.

The system then calculates or retrieves the applicable price.

### Booking Process

1. Customer selects Book Now.
2. Customer selects a vehicle.
3. Backend validates vehicle ownership.
4. System verifies terminal compatibility.
5. Customer selects a date and time.
6. Backend checks current availability.
7. System displays booking details and price.
8. Customer confirms the request.
9. Backend validates all relevant information again.
10. Backend creates the booking with `PENDING` status.
11. Backend creates the relevant notification.
12. Supplier receives the booking request.

### Booking Summary

Before submission, the customer must see:

- Selected station.
- Selected terminal.
- Selected vehicle.
- Booking date.
- Start time.
- Duration or end time.
- Applicable price.
- Any additional fees.

### Booking Creation Failure

| Condition | System Response |
|---|---|
| Vehicle is incompatible | Prevent booking |
| Availability changed | Ask customer to select another time |
| Terminal is inactive | Prevent booking |
| Station is closed | Prevent or restrict booking |
| Invalid time | Display validation message |
| User is not authenticated | Redirect to login |
| Server error | Display failure message |

The backend must always perform the final availability check.

## 5.11 Waiting for Supplier Response

After submitting a request, the customer's booking status becomes:

`PENDING`

The customer sees a booking details page containing:

- Booking reference.
- Station and terminal.
- Selected vehicle.
- Requested time.
- Price.
- Current booking status.
- Supplier response status.

The customer can leave the page and return later.

The system must preserve the request and provide notifications when the supplier responds.

## 5.12 Supplier Decision

The supplier may accept or reject the request.

### When Supplier Accepts

1. Backend verifies the supplier's authorization.
2. Backend verifies that the request is still pending.
3. Backend revalidates terminal availability.
4. Backend checks for overlapping bookings.
5. Booking status becomes `ACCEPTED`.
6. Customer receives a notification.
7. Customer receives access to the payment action.

### When Supplier Rejects

1. Supplier selects Reject.
2. Supplier may provide a rejection reason.
3. Backend validates the request.
4. Booking status becomes `REJECTED`.
5. Customer receives a notification.
6. The requested reservation is released.
7. Customer may search for another terminal.

## 5.13 Customer Payment

Payment occurs after supplier acceptance under the initial assumed workflow.

### Payment Flow

```text
BOOKING ACCEPTED
       |
       v
CUSTOMER NOTIFIED
       |
       v
CUSTOMER OPENS BOOKING
       |
       v
REVIEW BOOKING AND PRICE
       |
       v
SELECT PAY NOW
       |
       v
BACKEND PREPARES PAYMENT
       |
       v
PAYMENT PROVIDER
       |
       +---------------------+
       |                     |
       v                     v
    SUCCESS                FAILURE
       |                     |
       v                     v
SERVER-SIDE             PAYMENT FAILED
VERIFICATION                |
       |                    v
       v                 RETRY OR
PAYMENT CONFIRMED       CONTACT SUPPORT
       |
       v
BOOKING CONFIRMED
       |
       v
CUSTOMER AND SUPPLIER
NOTIFIED
```

### Payment Requirements

- The customer must see the final amount before paying.
- The backend creates the payment record.
- The payment provider processes the payment.
- The backend verifies the payment result.
- The payment status is updated only after verification.
- The booking becomes `CONFIRMED` according to the payment policy.
- The supplier receives a payment confirmation notification.

### Payment Failure

If payment fails:

- Payment status becomes `FAILED`.
- Booking is not treated as paid.
- Customer receives an error notification.
- Customer may retry according to the payment policy.
- The booking must remain within its valid payment window.

If the payment window expires, the system may expire or release the accepted reservation according to the final booking rules.

## 5.14 Charging Service

After successful payment and booking confirmation, the customer can use the charging terminal.

The initial version may use a manually managed charging-session workflow.

### Charging Workflow

1. Customer arrives at the station.
2. Customer identifies the booking.
3. Supplier verifies the booking.
4. Supplier starts the charging session.
5. Session status becomes `IN_PROGRESS`.
6. Customer receives the charging service.
7. Supplier ends the charging session.
8. Session status becomes `COMPLETED`.
9. Booking status becomes `COMPLETED`.
10. Relevant records are updated.
11. Customer and supplier receive completion notifications.

Hardware-based automatic start and end detection is outside the initial scope.

## 5.15 Booking History

The customer can access:

- Pending bookings.
- Accepted bookings.
- Confirmed bookings.
- Completed bookings.
- Cancelled bookings.
- Rejected bookings.
- Expired bookings.

Each booking detail page should display:

- Booking reference.
- Station.
- Terminal.
- Vehicle.
- Requested time.
- Price.
- Booking status.
- Payment status.
- Charging-session status.

## 5.16 Customer Feedback

After a completed booking, the platform may allow the customer to:

- Rate the charging service.
- Write a review.
- Report a problem.

The review feature is optional for the initial release.

Only customers with eligible completed bookings should be able to submit a review for the corresponding service.

---

# 6. Supplier User Flow

## 6.1 Supplier Journey Overview

The supplier's main objective is to list charging services, manage their terminals, receive booking requests, serve customers, and receive payment settlements.

The complete supplier flow is:

```text
SUPPLIER REGISTRATION
         |
         v
SUPPLIER LOGIN
         |
         v
COMPLETE BUSINESS PROFILE
         |
         v
SUPPLIER ONBOARDING
         |
         v
REGISTER CHARGING STATION
         |
         v
ADD CHARGING TERMINALS
         |
         v
CONFIGURE TERMINAL DETAILS
         |
         v
SET PRICING
         |
         v
SET AVAILABILITY
         |
         v
SUBMIT / ACTIVATE LISTING
         |
         v
SUPPLIER DASHBOARD
         |
         v
RECEIVE BOOKING REQUEST
         |
         v
REVIEW CUSTOMER AND BOOKING DETAILS
         |
         v
ACCEPT OR REJECT
         |
         v
CUSTOMER PAYMENT
         |
         v
PAYMENT CONFIRMATION
         |
         v
PROVIDE CHARGING SERVICE
         |
         v
COMPLETE BOOKING
         |
         v
SUPPLIER EARNINGS / SETTLEMENT
```

## 6.2 Supplier Registration

**Entry Point:** Landing Page → Register → Supplier.

### Registration Form

The supplier provides:

- Owner or representative name.
- Business name.
- Email address.
- Phone number.
- Password.
- Business type.
- Business address or operating area.
- Acceptance of terms and conditions.

Additional verification information may be requested depending on the platform's supplier verification policy.

### System Processing

1. Supplier selects Become a Supplier.
2. Supplier enters registration details.
3. Frontend validates required fields.
4. Backend validates the request.
5. Backend checks duplicate email and phone information.
6. Backend securely hashes the password.
7. Backend creates a supplier user account.
8. Supplier role is assigned.
9. Verification begins if required.
10. Supplier proceeds to onboarding.

### Registration Outcomes

| Condition | Result |
|---|---|
| Valid information | Account created |
| Duplicate account | Display error |
| Invalid phone/email | Request correction |
| Verification required | Supplier must complete verification |
| Server error | Allow retry |

## 6.3 Supplier Onboarding

After registration, the supplier is directed to the supplier onboarding process.

The supplier must complete the business profile before registering charging stations.

### Onboarding Steps

1. Welcome the supplier.
2. Collect business information.
3. Collect business contact details.
4. Collect business address.
5. Collect any required verification information.
6. Save the supplier profile.
7. Proceed to station registration.

If verification is required, the supplier may have to wait for admin approval before the listing becomes publicly discoverable.

## 6.4 Supplier Dashboard

The supplier dashboard provides access to:

- Business Profile.
- Stations.
- Charging Terminals.
- Booking Requests.
- Upcoming Bookings.
- Booking History.
- Availability.
- Pricing.
- Earnings.
- Notifications.

The most prominent actions should be:

- Register Station.
- Add Charging Terminal.
- View Booking Requests.

## 6.5 Station Registration

A supplier can register one or more charging stations.

A station represents a physical location where charging services are provided.

### Station Registration Form

The supplier enters:

- Station name.
- Station description.
- Full address.
- City.
- Province.
- Country.
- Location coordinates.
- Operating hours.
- Contact information.
- Station image, if supported.

### Location Selection

The supplier may:

- Enter an address.
- Select a location on the map.
- Use current location, if available.

The platform should store both address information and geographic coordinates.

### Station Creation Flow

```text
SUPPLIER DASHBOARD
        |
        v
REGISTER STATION
        |
        v
ENTER STATION DETAILS
        |
        v
SET STATION LOCATION
        |
        v
SET OPERATING HOURS
        |
        v
VALIDATE INFORMATION
        |
        v
SAVE STATION
        |
        v
STATION CREATED
        |
        v
ADD CHARGING TERMINALS
```

### Station Creation Result

The system creates a station linked to the authenticated supplier.

The station must appear in the supplier's station list.

## 6.6 Charging Terminal Registration

After creating a station, the supplier adds individual charging terminals.

A station can contain multiple terminals.

Each terminal is managed independently.

### Terminal Registration Form

The supplier provides:

- Terminal name or identifier.
- Parent station.
- Charging method.
- Connector type.
- Supported vehicle categories.
- Charging power.
- Charging capacity.
- Pricing model.
- Availability schedule.
- Operational status.

### Terminal Creation Flow

1. Supplier selects a station.
2. Supplier selects Add Terminal.
3. Supplier enters terminal details.
4. Supplier selects charging method.
5. Supplier configures supported connectors.
6. Supplier specifies compatible vehicle categories.
7. Supplier enters power specifications.
8. Supplier configures terminal capacity.
9. Supplier sets pricing.
10. Supplier configures availability.
11. Frontend validates the form.
12. Backend validates ownership and terminal information.
13. Terminal is saved.
14. Terminal appears under its parent station.

### Important Hierarchy

```text
SUPPLIER
   |
   +----------------------+
   |                      |
   v                      v
STATION 1               STATION 2
   |                      |
   +----------+           +----------+
   |          |           |          |
   v          v           v          v
TERMINAL 1 TERMINAL 2  TERMINAL 3 TERMINAL 4
```

A supplier may manage several stations, and each station may contain several terminals.

The platform must not treat the entire station as one bookable charging resource when individual terminals have separate availability.

## 6.7 Terminal Pricing

The supplier configures the price for each terminal.

The supported pricing model will be finalized separately.

Possible models:

- Price per kWh.
- Price per minute.
- Fixed charging-session price.
- Fixed service or booking fee.

### Pricing Flow

1. Supplier opens terminal settings.
2. Supplier selects Pricing.
3. Supplier enters the applicable price.
4. Backend validates the price.
5. New pricing is saved.
6. Customer discovery results use the updated price for future bookings.

A price change must not alter the price snapshot stored in an existing booking.

## 6.8 Availability Management

The supplier can configure terminal availability.

### Availability Options

- Operating days.
- Opening time.
- Closing time.
- Available time slots.
- Temporary blocked periods.
- Maintenance periods.
- Terminal capacity.

### Availability Flow

1. Supplier opens a terminal.
2. Supplier selects Availability.
3. Supplier configures the schedule.
4. Supplier blocks maintenance time if necessary.
5. Backend validates the changes against existing reservations.
6. Availability is updated.

The system must not allow the supplier to block a period in a way that silently invalidates a confirmed booking.

If an existing booking conflicts with an attempted change, the system must warn the supplier and require the appropriate resolution.

## 6.9 Listing Activation

After station and terminal details are completed, the supplier can activate the listing where permitted.

Before activation, the system checks:

- Station information is valid.
- Station location is available.
- At least one terminal is registered.
- Terminal information is complete.
- Pricing is configured.
- Availability is configured.
- Supplier verification requirements are satisfied, if applicable.

The listing may have the following statuses:

```text
DRAFT
PENDING_APPROVAL
ACTIVE
INACTIVE
SUSPENDED
```

Only eligible active terminals should appear in customer discovery results.

## 6.10 Receiving Booking Requests

When a customer submits a booking request for the supplier's terminal, the supplier receives a notification.

### Notification Flow

```text
CUSTOMER SUBMITS REQUEST
          |
          v
BACKEND CREATES BOOKING
          |
          v
BOOKING STATUS: PENDING
          |
          v
FIND RESPONSIBLE SUPPLIER
          |
          v
CREATE NOTIFICATION
          |
          v
SOCKET.IO EVENT, IF ONLINE
          |
          v
SUPPLIER RECEIVES NOTIFICATION
          |
          v
SUPPLIER OPENS BOOKING REQUEST
```

Notifications must remain stored even if the supplier is offline.

## 6.11 Reviewing Booking Requests

The supplier opens the booking request and reviews:

- Customer name or permitted customer information.
- Selected vehicle.
- Vehicle category.
- Relevant compatibility details.
- Station.
- Terminal.
- Requested date.
- Requested time.
- Requested duration.
- Booking price.
- Booking reference.

The supplier must receive enough information to decide whether to accept the request without exposing unnecessary private customer information.

## 6.12 Accepting a Booking

When the supplier accepts a booking:

1. Supplier selects Accept.
2. Frontend sends the acceptance request.
3. Backend verifies that the supplier owns the relevant station and terminal.
4. Backend confirms that the booking is still pending.
5. Backend revalidates availability.
6. Backend checks booking conflicts.
7. Backend updates the booking status to `ACCEPTED`.
8. Customer receives a notification.
9. Customer receives the payment action.

The backend must not accept a booking based solely on an earlier availability check.

## 6.13 Rejecting a Booking

When the supplier rejects a booking:

1. Supplier selects Reject.
2. Supplier may enter a reason.
3. Backend validates supplier ownership.
4. Backend verifies that the request is still pending.
5. Booking status becomes `REJECTED`.
6. Requested reservation is released.
7. Customer receives a notification.
8. Supplier can view the rejected request in booking history.

## 6.14 Managing Confirmed Bookings

Once payment is verified and the booking is confirmed, the supplier sees it in upcoming bookings.

The supplier can:

- View booking details.
- View customer and vehicle information permitted for the service.
- View the scheduled charging time.
- Verify customer arrival.
- Start the charging session.
- End the charging session.

The supplier must not be able to modify the customer's payment record manually.

## 6.15 Starting and Completing a Charging Session

The initial version will support a manually managed session.

### Session Start

1. Customer arrives.
2. Supplier verifies the booking.
3. Supplier selects Start Session.
4. Backend checks booking confirmation.
5. Session status becomes `IN_PROGRESS`.
6. Customer and supplier interfaces reflect the new status.

### Session Completion

1. Supplier selects End Session.
2. Backend validates the session.
3. Session status becomes `COMPLETED`.
4. Booking status becomes `COMPLETED`.
5. Relevant records are saved.
6. Customer receives a completion notification.
7. Supplier earnings records are updated according to payment and settlement rules.

If hardware integration is introduced later, the system can automate these actions using charger events.

## 6.16 Supplier Earnings and Payment Settlement

The supplier must be able to view earnings from completed and eligible bookings.

### Earnings Flow

```text
CUSTOMER PAYS
      |
      v
PAYMENT PROVIDER CONFIRMS
      |
      v
BACKEND VERIFIES PAYMENT
      |
      v
PAYMENT STATUS: PAID
      |
      v
BOOKING COMPLETED
      |
      v
CALCULATE SUPPLIER NET EARNINGS
      |
      v
CREATE / UPDATE SETTLEMENT RECORD
      |
      v
SETTLEMENT PROCESSING
      |
      v
SUPPLIER RECEIVES PAYOUT
      |
      v
SETTLEMENT STATUS: PAID_OUT
```

The supplier dashboard should distinguish between:

- Total customer payments.
- Platform fees.
- Refunds.
- Supplier net earnings.
- Pending settlements.
- Completed payouts.

**Important:** Customer payment and supplier payout are two separate financial events. The platform must not indicate that the supplier has received money merely because the customer successfully paid.

The final payout mechanism and settlement schedule remain pending confirmation.

---

# 7. Super Admin User Flow

## 7.1 Admin Login

The admin enters the platform through the login page.

Admin accounts must be created or authorized through a protected administrative process.

Public registration must never create an admin account.

### Admin Login Flow

```text
ADMIN OPENS LOGIN
        |
        v
ENTERS CREDENTIALS
        |
        v
BACKEND AUTHENTICATION
        |
        v
CHECK ADMIN ROLE
        |
        +------------------+
        |                  |
        v                  v
   AUTHORIZED          UNAUTHORIZED
        |                  |
        v                  v
 ADMIN DASHBOARD       ACCESS DENIED
```

## 7.2 Admin Dashboard

The admin dashboard should display:

- Total customers.
- Total suppliers.
- Total stations.
- Total terminals.
- Active terminals.
- Total bookings.
- Pending bookings.
- Completed bookings.
- Payment volume.
- Pending settlements.
- Supplier verification requests.
- Reported issues.

## 7.3 Customer Management

Admin can:

1. Open customer management.
2. Search for a customer.
3. View customer profile.
4. Review account status.
5. Suspend or reactivate the account where justified.
6. Review relevant account activity.

Admin actions must be recorded.

## 7.4 Supplier Management

Admin can:

1. Open supplier management.
2. View supplier applications.
3. Review business information.
4. Review verification documents, if required.
5. Approve or reject a supplier.
6. Suspend or reactivate a supplier.
7. Review supplier stations and terminals.

If approval is required, the supplier's listing must not become publicly active before approval.

## 7.5 Station and Terminal Management

Admin can:

- Search stations.
- View station details.
- View station ownership.
- View charging terminals.
- Deactivate inaccurate listings.
- Suspend terminal listings.
- Investigate reported information.

## 7.6 Booking Management

Admin can:

- View all bookings.
- Filter by status.
- Search by booking reference.
- Review booking details.
- Investigate booking problems.
- Review cancellation or rejection cases.

Admin intervention must follow platform policy and must not silently alter historical records.

## 7.7 Payment Management

Admin can:

- View payment records.
- Review failed payments.
- Review refunds.
- View supplier settlements.
- Investigate payment discrepancies.
- Review payment provider references.

Sensitive payment actions must be restricted to authorized administrative permissions.

## 7.8 Audit Logs

The system must maintain records of important administrative actions.

Examples:

- Supplier approved.
- Supplier suspended.
- Customer suspended.
- Station deactivated.
- Terminal deactivated.
- Booking manually reviewed.
- Payment issue investigated.

Audit records should identify the actor, action, affected entity, and timestamp.

---

# 8. Detailed Booking State Flow

The platform must distinguish between booking, payment, charging-session, and settlement state.

## 8.1 Booking State Diagram

```text
             BOOKING CREATED
                    |
                    v
                  PENDING
                    |
           +--------+--------+
           |                 |
           v                 v
        ACCEPTED           REJECTED
           |
           v
      PAYMENT PENDING
           |
      +----+-----+
      |          |
      v          v
    PAID       FAILED
      |          |
      v          v
  CONFIRMED   RETRY / EXPIRE
      |
      v
   SESSION
   IN_PROGRESS
      |
      v
   COMPLETED
```

Additional transitions:

- `PENDING` → `CANCELLED`
- `PENDING` → `EXPIRED`
- `ACCEPTED` → `CANCELLED`, when cancellation policy permits
- `CONFIRMED` → `CANCELLED`, when cancellation policy permits
- `CONFIRMED` → `COMPLETED`

`REJECTED`, `EXPIRED`, and `COMPLETED` should be treated as terminal states for ordinary user actions, subject to authorized administrative correction procedures.

## 8.2 Payment State Flow

```text
UNPAID
   |
   v
PROCESSING
   |
   +----------------+
   |                |
   v                v
 PAID             FAILED
   |                |
   v                v
 REFUND          RETRY
   |
   v
REFUNDED
```

A payment retry may create a new payment attempt or update an eligible payment workflow while preserving transaction history.

A failed payment must not be treated as a successful payment.

## 8.3 Charging Session State Flow

```text
NOT_STARTED
     |
     v
IN_PROGRESS
     |
     +----------------+
     |                |
     v                v
 COMPLETED        INTERRUPTED
```

A booking may only be completed when the charging service is completed or an authorized exception process is applied.

## 8.4 Settlement State Flow

```text
NOT_ELIGIBLE
      |
      v
PENDING
      |
      v
PROCESSING
      |
      +----------------+
      |                |
      v                v
   PAID_OUT           FAILED
```

The settlement process is separate from the customer's payment process.

---

# 9. Alternative and Exceptional User Flows

## 9.1 Customer Has No Registered Vehicle

```text
CUSTOMER OPENS SEARCH
         |
         v
NO VEHICLE REGISTERED
         |
         v
PROMPT TO ADD VEHICLE
         |
         v
REGISTER VEHICLE
         |
         v
RETURN TO SEARCH
```

The customer may browse public terminal information without a vehicle if guest or account search is enabled, but vehicle compatibility must be confirmed before booking.

## 9.2 No Charging Terminals Found

```text
CUSTOMER SEARCHES
        |
        v
NO MATCHING RESULTS
        |
        v
DISPLAY NO RESULTS
        |
        v
CUSTOMER CAN:
  - Change location
  - Remove filters
  - Select another vehicle
  - Expand search area
```

The system should not display unrelated terminals as compatible results merely to fill the result list.

## 9.3 Selected Terminal Is Incompatible

```text
CUSTOMER SELECTS TERMINAL
          |
          v
COMPATIBILITY CHECK
          |
          v
INCOMPATIBLE
          |
          v
DISPLAY EXPLANATION
          |
          v
BLOCK BOOKING
          |
          v
RETURN TO SEARCH
```

If compatibility is unknown, display the uncertainty and follow the platform's configured booking policy.

## 9.4 Selected Terminal Becomes Unavailable

A terminal may become unavailable after search results are displayed.

```text
CUSTOMER SUBMITS BOOKING
          |
          v
BACKEND CHECKS AVAILABILITY
          |
          v
TERMINAL UNAVAILABLE
          |
          v
REJECT BOOKING REQUEST
          |
          v
SHOW UPDATED AVAILABILITY
          |
          v
CUSTOMER SELECTS ANOTHER TIME
OR TERMINAL
```

This is why availability must be checked again when a booking is submitted.

## 9.5 Supplier Does Not Respond

If a supplier does not respond within the configured request period:

1. The request remains pending until the expiration threshold.
2. Backend expiration logic marks the request `EXPIRED`.
3. The customer receives a notification.
4. The supplier receives an expiration notification, where configured.
5. The requested reservation is released.
6. The customer may search again.

The expiration duration is configurable and must be finalized.

## 9.6 Supplier Rejects the Request

1. Supplier rejects the request.
2. Booking becomes `REJECTED`.
3. Customer receives the decision.
4. No customer payment should be captured for the rejected booking.
5. Customer returns to search.

If payment was already initiated under an exceptional workflow, the payment must be reconciled and refunded or voided according to the payment provider's capabilities.

## 9.7 Customer Payment Fails

1. Customer attempts payment.
2. Provider reports failure.
3. Backend verifies the result.
4. Payment status becomes `FAILED`.
5. Customer receives a failure notification.
6. Customer may retry within the valid payment window.
7. If the payment window expires, the booking is handled according to expiration policy.

## 9.8 Customer Cancels a Booking

1. Customer opens booking details.
2. Customer selects Cancel Booking.
3. Backend checks cancellation eligibility.
4. System displays applicable cancellation or refund information.
5. Customer confirms cancellation.
6. Backend updates booking status.
7. Refund process begins if required.
8. Customer and supplier are notified.

A confirmed booking must not be cancelled without considering the charging schedule, payment status, and refund rules.

## 9.9 Supplier Marks a Terminal Under Maintenance

1. Supplier opens terminal management.
2. Supplier selects Maintenance.
3. Supplier selects the maintenance period.
4. Backend checks existing reservations.
5. If no conflict exists, maintenance period is saved.
6. Terminal is unavailable for new bookings during that period.

If confirmed reservations conflict with the maintenance period, the platform must require a resolution process rather than silently removing the bookings.

## 9.10 Routing Service Failure

1. Customer selects a terminal.
2. The platform requests route calculation.
3. Routing service or graph calculation fails.
4. The system reports route unavailability.
5. Terminal location remains visible.
6. Customer may try again or use an external navigation option if supported.

A routing failure must not automatically make the terminal unavailable for booking.

## 9.11 Customer Is Offline

If the customer loses connectivity:

- Pending booking details remain stored on the backend.
- The customer can retrieve the latest status after reconnecting.
- The customer must not be shown a successful payment unless the backend has verified it.
- Important notifications must remain stored.
- Duplicate booking submissions must be prevented through appropriate request handling.

## 9.12 Supplier Is Offline

If the supplier is offline:

- New booking requests must still be stored.
- Notifications must remain available.
- The supplier sees pending requests upon returning.
- Requests may expire according to the configured expiration policy.

---

# 10. Notification Flow

Notifications are triggered by platform events.

## 10.1 Customer Notifications

| Event | Customer Notification |
|---|---|
| Registration complete | Account created successfully |
| Booking submitted | Booking request submitted |
| Supplier accepts | Booking accepted |
| Supplier rejects | Booking rejected |
| Booking expires | Booking request expired |
| Payment succeeds | Payment confirmed |
| Payment fails | Payment failed |
| Booking cancelled | Booking cancelled |
| Charging starts | Charging session started |
| Charging completes | Charging session completed |
| Refund processed | Refund status updated |

## 10.2 Supplier Notifications

| Event | Supplier Notification |
|---|---|
| Station created | Station saved |
| Terminal created | Terminal saved |
| New booking request | New booking received |
| Customer cancels | Booking cancelled |
| Customer payment succeeds | Payment received |
| Settlement starts | Settlement processing |
| Settlement completes | Payout completed |
| Verification required | Action required |
| Listing suspended | Listing status changed |

## 10.3 Admin Notifications

Admin notifications may include:

- New supplier verification requests.
- Reported stations.
- Reported terminals.
- Payment issues.
- Booking disputes.
- Critical platform errors.

## 10.4 Notification Delivery

The backend creates and stores notification records.

Socket.IO delivers real-time events when recipients are online.

When a user is offline, the notification remains stored for later retrieval.

---

# 11. Navigation and Page Flow

## 11.1 Public Pages

```text
/
├── Landing Page
├── How It Works
├── About
├── Contact
├── Register
│   ├── Customer Registration
│   └── Supplier Registration
├── Login
├── Terms and Conditions
└── Privacy Policy
```

## 11.2 Customer Pages

```text
/customer
├── Dashboard
├── Search
│   ├── Map View
│   ├── List View
│   └── Terminal Details
├── Vehicles
│   ├── Vehicle List
│   ├── Add Vehicle
│   └── Edit Vehicle
├── Bookings
│   ├── Pending
│   ├── Upcoming
│   ├── Completed
│   └── Booking Details
├── Payments
├── Notifications
└── Profile
```

## 11.3 Supplier Pages

```text
/supplier
├── Dashboard
├── Business Profile
├── Stations
│   ├── Station List
│   ├── Add Station
│   ├── Station Details
│   └── Edit Station
├── Terminals
│   ├── Terminal List
│   ├── Add Terminal
│   ├── Terminal Details
│   ├── Pricing
│   └── Availability
├── Bookings
│   ├── Booking Requests
│   ├── Upcoming
│   ├── Completed
│   └── Booking Details
├── Earnings
├── Settlements
├── Notifications
└── Profile
```

## 11.4 Admin Pages

```text
/admin
├── Dashboard
├── Customers
├── Suppliers
│   ├── Supplier List
│   └── Verification Requests
├── Stations
├── Terminals
├── Bookings
├── Payments
├── Settlements
├── Reports and Complaints
├── Audit Logs
└── Settings
```

---

# 12. Access Control in User Flows

The platform must enforce permissions for every protected operation.

| Operation | Customer | Supplier | Admin |
|---|---:|---:|---:|
| Manage own profile | Yes | Yes | Authorized |
| Register vehicle | Yes | No | Authorized |
| Search terminals | Yes | Optional | Authorized |
| Create station | No | Yes | Authorized |
| Manage own stations | No | Yes | Authorized |
| Create terminal | No | Yes | Authorized |
| Receive booking request | No | Yes | View all |
| Create booking | Yes | No | Authorized intervention |
| Accept or reject own booking requests | No | Yes | Authorized intervention |
| Pay for booking | Yes | No | Restricted |
| View own bookings | Yes | Yes | View all |
| View own earnings | No | Yes | View all |
| Manage users | No | No | Yes |
| Manage suppliers | No | Own profile only | Yes |
| Manage platform records | No | Own records only | Yes |
| View audit logs | No | No | Yes |

Frontend navigation must reflect these permissions, but backend authorization is mandatory.

---

# 13. Core Business Rules Affecting User Flows

1. The landing page is the entry point for visitors.
2. Public registration has two paths: Customer and Supplier.
3. Admin accounts are not created through public registration.
4. Customers must register a vehicle before booking.
5. Customers may manage multiple vehicles.
6. Suppliers may register multiple stations.
7. Stations may contain multiple charging terminals.
8. Every terminal has its own pricing, availability, and operational status.
9. Vehicle compatibility must be evaluated before booking.
10. The customer selects an origin before road-distance routing.
11. Dijkstra's algorithm requires a road-network graph and appropriate location-to-node mapping.
12. Search results must distinguish between geographical proximity and road distance.
13. A booking request begins in `PENDING`.
14. Suppliers can accept or reject pending requests assigned to them.
15. A supplier's acceptance must trigger another availability validation.
16. A successful payment must be verified by the backend.
17. A booking becomes confirmed according to the payment policy.
18. Charging sessions have separate statuses from bookings.
19. Supplier settlement is separate from customer payment.
20. Important notifications must be persisted.
21. All supplier operations must enforce resource ownership.
22. Every important booking and payment transition must be recorded.

---

# 14. End-to-End Example

This example demonstrates one complete customer-to-supplier transaction.

### Scenario

A customer owns an electric motorcycle in Karachi and wants to find a compatible charging terminal.

### Step 1: Customer

The customer opens the website.

They select **Register as Customer**, create an account, and register their electric motorcycle.

### Step 2: Location

The customer selects their current location or enters an address manually.

The platform uses that location as the search origin.

### Step 3: Search

The customer searches for charging terminals compatible with their motorcycle.

The platform retrieves suitable terminals and displays them on a map and in a list.

### Step 4: Route

The customer selects a terminal.

The platform calculates its road route and displays the distance and route on the map.

### Step 5: Booking

The customer selects a date, time, and duration.

The backend validates compatibility and availability.

The customer submits the request.

Booking status becomes `PENDING`.

### Step 6: Supplier

The supplier receives a notification.

They open the booking request and review the customer's vehicle, terminal, and requested time.

The supplier accepts the request.

Booking status becomes `ACCEPTED`.

### Step 7: Payment

The customer receives a notification.

They open the booking and make payment.

The backend verifies payment with the payment provider.

Payment status becomes `PAID`.

Booking status becomes `CONFIRMED`.

### Step 8: Charging

The customer arrives at the station.

The supplier verifies the booking and starts the charging session.

Session status becomes `IN_PROGRESS`.

When charging is completed, the supplier ends the session.

Session status becomes `COMPLETED`.

Booking status becomes `COMPLETED`.

### Step 9: Settlement

The platform records the supplier's net earnings.

The settlement is processed according to the platform's payout rules.

When the supplier receives the payout, settlement status becomes `PAID_OUT`.

### Final Result

- Customer successfully finds a compatible terminal.
- Customer receives the requested charging service.
- Supplier successfully provides the service.
- Customer payment is recorded.
- Supplier earnings and payout are tracked.
- Booking history is updated for both parties.

---

# 15. Final User Flow Definition

The platform has three primary user journeys.

**Customer:**

Register → Register Vehicle → Select Location → Search → Filter → Check Compatibility → View Route → Select Terminal → Request Booking → Supplier Acceptance → Payment → Charging Service → Completion.

**Supplier:**

Register → Complete Business Profile → Register Station → Add Terminals → Configure Pricing → Configure Availability → Activate Listing → Receive Booking Request → Accept or Reject → Provide Charging Service → Receive Settlement.

**Super Admin:**

Login → Dashboard → Manage Customers → Manage Suppliers → Review Stations and Terminals → Monitor Bookings → Monitor Payments → Manage Issues → Review Audit Logs.

All three journeys operate within one shared web platform, with separate role-based interfaces, protected backend operations, and shared data.

This document serves as the baseline user-flow specification for frontend page development, backend API design, database workflows, and integration testing.