# WEBSITE_STRUCTURE.md
# EV Charging Platform

**Document Type:** Website Structure, Navigation and Interaction Specification  
**Application Type:** Mobile-First Responsive Web Application  
**Target Market:** Pakistan  
**Primary Roles:** Customer, Supplier, Super Admin  
**Architecture:** MERN Stack  
**Status:** Proposed Website Structure

---

# 1. Purpose of This Document

This document defines the complete structure and navigation of the EV Charging Platform website.

It explains:

- How visitors navigate the public website.
- How the registration panel works.
- How customer and supplier registration differ.
- How the login process works.
- Which dashboard each authenticated user enters.
- How the customer panel is structured.
- How the supplier panel is structured.
- How the admin panel is structured.
- What each page contains.
- What each button does.
- Where each button navigates.
- Which actions open a new page, modal, dropdown, or confirmation dialog.
- How users move between different stages of the platform.
- How the interface behaves on mobile and desktop.
- What happens when a user is unauthorized, logged out, or missing required information.

This is a functional website specification, not a UI design document. It defines what the website must do, while the visual appearance, layout styling, and page designs will be decided separately.

---

# 2. Overall Website Structure

The platform will be one website with different interfaces based on the user's role.

There are three main sections:

1. Public Website
2. Customer Application
3. Supplier Application
4. Super Admin Application

The customer, supplier, and admin applications must have different navigation structures because their responsibilities are different.

## 2.1 High-Level Website Flow

```text
                         WEBSITE
                            |
                            v
                       LANDING PAGE
                            |
             +--------------+--------------+
             |              |              |
             v              v              v
        FIND CHARGING     REGISTER        LOGIN
             |              |              |
             |              v              |
             |       REGISTRATION PANEL    |
             |              |              |
             |        +-----+-----+        |
             |        |           |        |
             |        v           v        |
             |     CUSTOMER    SUPPLIER    |
             |     REGISTER    REGISTER    |
             |        |           |        |
             |        v           v        |
             |     CUSTOMER    SUPPLIER    |
             |     ONBOARDING   ONBOARDING |
             |        |           |        |
             v        v           v        |
          CUSTOMER CUSTOMER    SUPPLIER    |
          DISCOVERY DASHBOARD  DASHBOARD   |
             |                              |
             +------------------------------+
                            |
                            v
                     ROLE IDENTIFICATION
                            |
                 +----------+----------+
                 |          |          |
                 v          v          v
              CUSTOMER  SUPPLIER     ADMIN
                 |          |          |
                 v          v          v
             CUSTOMER   SUPPLIER    ADMIN
             DASHBOARD  DASHBOARD   DASHBOARD
```

## 2.2 Role-Based Application Separation

| Property | Customer Panel | Supplier Panel | Admin Panel |
|---|---|---|---|
| Main Purpose | Find and book charging | Manage charging services | Manage platform |
| Main Activity | Search and booking | Stations and bookings | Monitoring and administration |
| Primary Interface | Mobile-first | Desktop-friendly, responsive | Desktop-first, responsive |
| Main Navigation | Search, Vehicles, Bookings | Dashboard, Stations, Terminals, Bookings | Dashboard, Users, Suppliers, Bookings |
| Map Usage | Frequent | Station location management | Location and listing review |
| Payment Usage | Customer payments | Earnings and settlements | Payment monitoring |
| Booking Permission | Create and cancel eligible bookings | Accept and reject assigned requests | View and authorized intervention |

The customer and supplier must not be forced to use the same dashboard structure.

---

# 3. Public Website

The public website is the first part of the platform that visitors see.

It introduces the service and directs users toward either customer registration, supplier registration, or login.

## 3.1 Public Website Navigation

The main navigation should contain:

| Navigation Item | Destination | Purpose |
|---|---|---|
| Logo | `/` | Return to landing page |
| Home | `/` | Open landing page |
| How It Works | `/how-it-works` | Explain the platform |
| For Customers | `/for-customers` | Explain customer benefits |
| For Suppliers | `/for-suppliers` | Explain supplier benefits |
| Find Charging | `/search` | Open terminal discovery |
| Login | `/login` | Open login panel |
| Register | `/register` | Open registration selection |

The navigation must be responsive.

On mobile, the navigation items may be placed inside a menu opened through a menu button.

## 3.2 Landing Page

**Route:** `/`

**Purpose:** Introduce the platform and provide entry points for customers and suppliers.

### Main Sections

The landing page should contain:

1. Navigation bar.
2. Hero section.
3. Main platform introduction.
4. How it works.
5. Customer benefits.
6. Supplier benefits.
7. Charging discovery introduction.
8. Call-to-action section.
9. Footer.

### 3.2.1 Navigation Bar Buttons

| Button | Action |
|---|---|
| Logo | Navigate to `/` |
| Home | Navigate to `/` |
| How It Works | Navigate to `/how-it-works` |
| For Customers | Navigate to `/for-customers` |
| For Suppliers | Navigate to `/for-suppliers` |
| Find Charging | Navigate to `/search` |
| Login | Navigate to `/login` |
| Register | Navigate to `/register` |
| Mobile Menu | Open or close mobile navigation |

### 3.2.2 Hero Section

The hero section introduces the platform's main purpose.

Suggested actions:

| Button | Action |
|---|---|
| Find Charging | Open terminal discovery at `/search` |
| Become a Supplier | Open `/register/supplier` |
| Create Account | Open `/register` |

**Find Charging behavior:**

A visitor may explore public charging terminal information without an account if guest discovery is enabled.

When a visitor attempts to make a booking, the system redirects them to login or registration.

After authentication, the visitor should return to the terminal or booking action they originally selected.

Guest discovery is a proposed behavior and must be confirmed before implementation.

### 3.2.3 How It Works Section

This section explains the two user journeys.

Customer explanation:

1. Register.
2. Add vehicle.
3. Find compatible charging terminals.
4. Choose a route.
5. Request a booking.
6. Pay and charge.

Supplier explanation:

1. Register.
2. Add charging station.
3. Add charging terminals.
4. Receive booking requests.
5. Provide charging services.
6. Receive earnings.

**Buttons:**

| Button | Action |
|---|---|
| Explore Customer Process | Navigate to `/for-customers` |
| Explore Supplier Process | Navigate to `/for-suppliers` |

### 3.2.4 Customer Benefits Section

Explains how customers can:

- Find charging terminals.
- Check vehicle compatibility.
- Compare prices.
- View locations and routes.
- Request charging bookings.

**Button:** `Find Charging` → `/search`

### 3.2.5 Supplier Benefits Section

Explains how suppliers can:

- List charging stations.
- Manage charging terminals.
- Set prices.
- Manage availability.
- Receive booking requests.
- Track earnings.

**Button:** `Become a Supplier` → `/register/supplier`

### 3.2.6 Footer

The footer should contain:

| Link | Destination |
|---|---|
| Home | `/` |
| How It Works | `/how-it-works` |
| For Customers | `/for-customers` |
| For Suppliers | `/for-suppliers` |
| Find Charging | `/search` |
| Login | `/login` |
| Register | `/register` |
| Contact Us | `/contact` |
| Privacy Policy | `/privacy` |
| Terms and Conditions | `/terms` |

External social media links may be added when official platform accounts exist.

---

## 3.3 How It Works Page

**Route:** `/how-it-works`

**Purpose:** Explain the complete platform process.

### Sections

- Introduction.
- How customers use the platform.
- How suppliers use the platform.
- Booking process.
- Payment process.
- Frequently asked questions.

### Buttons

| Button | Action |
|---|---|
| Register as Customer | Navigate to `/register/customer` |
| Register as Supplier | Navigate to `/register/supplier` |
| Find Charging | Navigate to `/search` |
| Back to Home | Navigate to `/` |

---

## 3.4 For Customers Page

**Route:** `/for-customers`

**Purpose:** Explain the customer experience before registration.

### Sections

- Finding charging terminals.
- Registering electric vehicles.
- Checking compatibility.
- Viewing routes.
- Booking charging services.
- Payment and booking history.

### Buttons

| Button | Action |
|---|---|
| Register as Customer | Navigate to `/register/customer` |
| Find Charging | Navigate to `/search` |
| Login | Navigate to `/login` |

---

## 3.5 For Suppliers Page

**Route:** `/for-suppliers`

**Purpose:** Explain the benefits and process of listing charging services.

### Sections

- Supplier registration.
- Business profile.
- Station registration.
- Terminal registration.
- Pricing and availability.
- Booking management.
- Payments and earnings.

### Buttons

| Button | Action |
|---|---|
| Become a Supplier | Navigate to `/register/supplier` |
| Supplier Login | Navigate to `/login` |
| Back to Home | Navigate to `/` |

---

# 4. Registration System

## 4.1 Registration Selection Panel

**Route:** `/register`

**Purpose:** Allow a visitor to select which type of account they want to create.

This page must clearly distinguish between the two registration paths.

### Option 1: Customer Registration

For people who own or use electric vehicles and want to find charging terminals.

**Button:** `Register as Customer`

Action:

1. Navigate to `/register/customer`.
2. Display the customer registration form.
3. After successful registration, begin customer onboarding.

### Option 2: Supplier Registration

For businesses or individuals providing charging services.

**Button:** `Register as Supplier`

Action:

1. Navigate to `/register/supplier`.
2. Display the supplier registration form.
3. After successful registration, begin supplier onboarding.

### Additional Buttons

| Button | Action |
|---|---|
| Already have an account? Login | Navigate to `/login` |
| Back to Home | Navigate to `/` |

The registration page must not offer an option to register as an admin.

---

# 5. Customer Registration Pages

## 5.1 Customer Registration Form

**Route:** `/register/customer`

**Purpose:** Create a customer account.

### Form Fields

- Full Name.
- Email Address.
- Phone Number.
- Password.
- Confirm Password.
- Terms and Conditions checkbox.

### Buttons

| Button | Action |
|---|---|
| Create Account | Validate form and submit registration |
| Show/Hide Password | Toggle password visibility |
| Terms and Conditions | Navigate to `/terms` |
| Privacy Policy | Navigate to `/privacy` |
| Already Registered? Login | Navigate to `/login` |
| Back | Navigate to `/register` |

### Create Account Action

When the user selects Create Account:

1. Validate all required fields.
2. Check email and phone formats.
3. Validate password requirements.
4. Check password confirmation.
5. Check acceptance of terms.
6. Send registration data to the backend.
7. Create the account with the `CUSTOMER` role.
8. Display the appropriate result.

### Registration Outcomes

| Outcome | Action |
|---|---|
| Success | Redirect to customer onboarding |
| Duplicate email | Display error |
| Duplicate phone | Display error |
| Invalid data | Highlight invalid fields |
| Verification required | Redirect to account verification |
| Server error | Show error and allow retry |

---

## 5.2 Customer Account Verification

**Route:** `/verify-account`

**Purpose:** Verify the customer account if the chosen authentication process requires it.

### Buttons

| Button | Action |
|---|---|
| Verify Account | Submit verification code or token |
| Resend Code | Request another verification code |
| Back to Login | Navigate to `/login` |

Verification may use email or phone depending on the selected provider.

---

## 5.3 Customer Onboarding

**Route:** `/customer/onboarding`

**Purpose:** Introduce the customer dashboard and collect required initial information.

The central onboarding task is registering a vehicle.

### Onboarding Steps

1. Welcome the customer.
2. Explain why vehicle information is needed.
3. Open vehicle registration.
4. Save the first vehicle.
5. Continue to the customer dashboard.

### Buttons

| Button | Action |
|---|---|
| Add My Vehicle | Navigate to `/customer/vehicles/new` |
| Skip for Now | Navigate to `/customer/dashboard`, if skipping is permitted |
| Continue | Save valid onboarding details and proceed |
| Back | Return to the previous onboarding step |

A customer who skips vehicle registration cannot complete a booking until a suitable vehicle is registered.

---

# 6. Login System

## 6.1 Shared Login Page

**Route:** `/login`

**Purpose:** Authenticate customers, suppliers, and administrators.

The same login interface may be used for all roles.

The backend identifies the role associated with the account and redirects the user to the appropriate dashboard.

### Form Fields

- Email or phone number, according to the final authentication policy.
- Password.

### Buttons

| Button | Action |
|---|---|
| Login | Submit credentials for authentication |
| Show/Hide Password | Toggle password visibility |
| Forgot Password? | Navigate to `/forgot-password` |
| Create an Account | Navigate to `/register` |
| Register as Customer | Navigate to `/register/customer` |
| Register as Supplier | Navigate to `/register/supplier` |
| Back to Home | Navigate to `/` |

### Login Processing

1. User enters credentials.
2. Frontend performs basic validation.
3. Backend verifies credentials.
4. Backend creates or establishes the authenticated session.
5. Backend returns the authenticated account and role information.
6. Frontend redirects the user according to their role.

### Role-Based Redirect

| Authenticated Role | Redirect |
|---|---|
| `CUSTOMER` | `/customer/dashboard` |
| `SUPPLIER` | `/supplier/dashboard` |
| `ADMIN` | `/admin/dashboard` |

If the user originally attempted to open a protected page, the system may redirect them back to that page after successful authentication, provided the requested page is authorized for their role.

### Login Errors

- Invalid credentials.
- Account not verified.
- Account suspended.
- Too many login attempts.
- Server or network error.

The system must display appropriate feedback without revealing sensitive account information.

---

## 6.2 Forgot Password

**Route:** `/forgot-password`

**Purpose:** Allow users to recover access to their account.

### Fields

- Email address or phone number, depending on the recovery method.

### Buttons

| Button | Action |
|---|---|
| Send Recovery Link/Code | Initiate password recovery |
| Back to Login | Navigate to `/login` |

## 6.3 Reset Password

**Route:** `/reset-password`

**Purpose:** Allow the user to set a new password through a valid recovery token or code.

### Buttons

| Button | Action |
|---|---|
| Reset Password | Validate and save the new password |
| Show/Hide Password | Toggle visibility |
| Back to Login | Navigate to `/login` |

After successful password reset, the user is redirected to `/login`.

---

# 7. Customer Application

The customer application is separate from the supplier application.

Its central purpose is to help an EV owner find a suitable charging terminal and manage charging bookings.

The customer interface should be optimized for mobile devices because customers are likely to use it while travelling.

## 7.1 Customer Navigation Structure

### Desktop Navigation

The desktop navigation may contain:

- Dashboard.
- Find Charging.
- My Vehicles.
- My Bookings.
- Payments.
- Notifications.
- Profile.

### Mobile Navigation

The mobile customer interface should use a compact navigation system.

Recommended primary mobile navigation:

| Item | Destination |
|---|---|
| Home | `/customer/dashboard` |
| Search | `/customer/search` |
| Bookings | `/customer/bookings` |
| Vehicles | `/customer/vehicles` |
| Profile | `/customer/profile` |

Notifications should remain accessible through a notification icon in the top area.

Payments can be accessed through the profile menu and booking details.

The exact mobile navigation presentation will be finalized during UI design.

## 7.2 Customer Dashboard

**Route:** `/customer/dashboard`

**Purpose:** Main customer landing page after login.

### Dashboard Content

The dashboard should display:

1. Welcome message.
2. Search charging section.
3. Current or upcoming booking.
4. Nearby terminal suggestions, when location is available.
5. Registered vehicles summary.
6. Recent bookings.
7. Notification indicator.

### Dashboard Buttons

| Button | Action |
|---|---|
| Find Charging | Navigate to `/customer/search` |
| Add Vehicle | Navigate to `/customer/vehicles/new` |
| My Vehicles | Navigate to `/customer/vehicles` |
| My Bookings | Navigate to `/customer/bookings` |
| View Active Booking | Navigate to the active booking's detail page |
| View All Bookings | Navigate to `/customer/bookings` |
| View All Vehicles | Navigate to `/customer/vehicles` |
| Notifications | Navigate to `/customer/notifications` |
| Profile | Navigate to `/customer/profile` |

### Dashboard Card Behavior

**Active Booking Card**

Displays the most relevant current or upcoming booking.

Selecting the card opens its booking details.

**Nearby Terminal Card**

Selecting a terminal opens its detail page.

**Vehicle Card**

Selecting a vehicle opens its details or edit page.

The dashboard must not show an active booking card when the user has no active or upcoming booking.

---

# 8. Customer Search and Discovery

## 8.1 Search Page

**Route:** `/customer/search`

**Purpose:** Allow customers to locate compatible charging terminals.

This is one of the most important pages of the customer application.

### Page Components

The page should contain:

- Location search field.
- Current location action.
- Vehicle selector.
- Search and filter controls.
- Map view.
- List view.
- Search results.
- Sorting controls.

### Search Controls

| Control | Action |
|---|---|
| Location Input | Enter an address, area, or city |
| Use My Location | Request browser location permission |
| Vehicle Selector | Select a registered vehicle |
| Search Button | Submit search parameters |
| Filter Button | Open search filters |
| Sort Button | Open sorting options |
| Map View | Display results on a map |
| List View | Display results in a list |
| Clear Filters | Reset selected filters |
| Current Location Marker | Center map around selected/current location |

### Search Button Behavior

When selected:

1. Validate the origin.
2. Validate vehicle selection, if required for compatibility search.
3. Submit the search parameters.
4. Retrieve matching terminals.
5. Display the search results.

If the customer has no vehicle, provide an Add Vehicle action.

### Filter Panel

The filter panel should provide:

- Compatibility.
- Maximum distance.
- Price range.
- Charging power.
- Connector type.
- Availability.
- Operating hours.

Buttons:

| Button | Action |
|---|---|
| Apply Filters | Apply selected filters |
| Clear All | Reset all filters |
| Close | Close filter panel |
| Cancel | Close without applying changes, where applicable |

### Sorting Options

- Shortest Road Distance.
- Lowest Price.
- Highest Charging Power.
- Earliest Availability.

Selecting a sorting option refreshes the result order.

If road distance is unavailable for a result, the interface must not silently treat straight-line distance as road distance.

## 8.2 Search Results

**Route:** `/customer/search/results`

**Purpose:** Display terminals matching the selected search criteria.

Each result card should display:

- Terminal name.
- Station name.
- Area or address.
- Price.
- Charging power.
- Compatibility.
- Availability.
- Road distance, where available.

### Result Card Buttons

| Button | Action |
|---|---|
| View Details | Navigate to the terminal details page |
| View Route | Request route information and open route display |
| Book Now | Begin booking for the selected terminal |
| Favorite | Add or remove the terminal from saved terminals, if favorites are implemented |

If results are empty, provide:

- Change Location.
- Clear Filters.
- Change Vehicle.
- Search Again.

Favorites are optional and not required for the first release.

## 8.3 Terminal Details

**Route:** `/customer/terminals/:terminalId`

**Purpose:** Display complete information about a selected charging terminal.

### Page Information

- Terminal name.
- Station name.
- Supplier information.
- Station address.
- Map location.
- Charging method.
- Connector type.
- Power.
- Supported vehicle types.
- Selected vehicle compatibility.
- Pricing.
- Availability.
- Operating hours.
- Station images, if available.

### Buttons

| Button | Action |
|---|---|
| Back to Results | Return to previous search results |
| View Route | Request and display road route |
| Change Vehicle | Open vehicle selector |
| Book Now | Begin booking request |
| Contact Supplier | Use the approved supplier contact method, if enabled |
| Report Listing | Open a report form, if enabled |

### Book Now Rules

The Book Now action must check:

- User is authenticated.
- A vehicle is selected.
- Vehicle compatibility is valid.
- Terminal is active.
- Terminal is eligible for booking.

If the customer is not authenticated, redirect to `/login` and preserve the intended terminal.

If the customer has not registered a vehicle, redirect to `/customer/vehicles/new`.

If the terminal is incompatible, prevent booking and explain why.

If compatibility is unknown, show a warning and follow the configured booking policy.

## 8.4 Route View

**Possible Route:** `/customer/terminals/:terminalId/route`

**Purpose:** Display the route from the selected origin to the selected terminal.

### Page Components

- Map.
- Origin marker.
- Destination marker.
- Route line.
- Distance.
- Estimated travel time, if available.
- Destination information.

### Buttons

| Button | Action |
|---|---|
| Back | Return to terminal details |
| Change Origin | Open location selector |
| Recalculate Route | Request a new route |
| Book This Terminal | Continue to booking |
| Open Navigation | Open supported external navigation, if implemented |

The backend or routing service calculates the route. Leaflet displays the result.

Dijkstra's algorithm requires a road graph and cannot produce a road route from coordinates alone.

---

# 9. Customer Booking Pages

## 9.1 Create Booking Page

**Route:** `/customer/bookings/new`

**Purpose:** Collect booking details before submitting the request.

### Page Information

- Selected station.
- Selected terminal.
- Selected vehicle.
- Booking date.
- Available time slots.
- Start time.
- Duration or end time.
- Price summary.

### Buttons

| Button | Action |
|---|---|
| Select Vehicle | Open registered vehicle selector |
| Change Terminal | Return to search results |
| Select Date | Open date picker |
| Select Time | Display available time slots |
| Check Availability | Request latest availability |
| Continue | Validate booking details |
| Cancel | Return to terminal details |

### Continue Action

The system must:

1. Validate vehicle ownership.
2. Validate compatibility.
3. Validate booking date and time.
4. Check availability.
5. Calculate the applicable amount.
6. Open the booking confirmation step.

## 9.2 Booking Confirmation

**Route:** `/customer/bookings/confirm`

This may be a separate page or a confirmation step within the booking flow.

### Information

- Station.
- Terminal.
- Vehicle.
- Date.
- Time.
- Duration.
- Price.
- Terms or cancellation information, when available.

### Buttons

| Button | Action |
|---|---|
| Confirm Request | Submit the booking request |
| Edit Details | Return to booking form |
| Cancel | Leave the booking flow |

When the customer confirms:

1. The backend validates the request again.
2. Booking is created.
3. Booking status becomes `PENDING`.
4. Supplier notification is generated.
5. Customer is redirected to the booking details page.

## 9.3 Booking Request Submitted

**Route:** `/customer/bookings/:bookingId`

**Purpose:** Display the newly submitted booking and its current status.

### Page Information

- Booking reference.
- Station.
- Terminal.
- Vehicle.
- Requested date and time.
- Price.
- Booking status.
- Payment status.
- Supplier response.

### Buttons

| Button | Action |
|---|---|
| View Booking | Stay on booking detail |
| My Bookings | Navigate to `/customer/bookings` |
| Find Another Terminal | Navigate to `/customer/search` |
| Cancel Request | Start cancellation flow, if eligible |

The page should automatically reflect status changes when notifications or updated booking data are received.

## 9.4 My Bookings

**Route:** `/customer/bookings`

**Purpose:** Display all bookings belonging to the customer.

### Booking Categories

- Pending.
- Accepted.
- Confirmed.
- Upcoming.
- Completed.
- Cancelled.
- Rejected.
- Expired.

### Buttons

| Button | Action |
|---|---|
| View Details | Navigate to `/customer/bookings/:bookingId` |
| Pay Now | Open payment flow for an eligible accepted booking |
| Cancel Booking | Start cancellation flow, if allowed |
| Find Charging | Navigate to `/customer/search` |
| Filter Bookings | Filter by booking status |
| Clear Filters | Reset filters |

Only eligible bookings should display Pay Now.

A completed, rejected, expired, or cancelled booking must not show an ordinary payment action.

## 9.5 Booking Details

**Route:** `/customer/bookings/:bookingId`

**Purpose:** Show all relevant information for one booking.

### Booking Details

- Booking reference.
- Supplier.
- Station.
- Terminal.
- Customer vehicle.
- Booking date.
- Start time.
- End time or duration.
- Booking status.
- Payment status.
- Charging-session status.
- Price details.
- Relevant notifications or status timeline.

### Status-Based Buttons

| Booking State | Available Actions |
|---|---|
| Pending | View Details, Cancel Request if permitted |
| Accepted | Pay Now, View Details, Cancel if permitted |
| Confirmed | View Route, View Payment, Cancel if permitted |
| In Progress | View Session Details |
| Completed | View Receipt, Submit Review if enabled |
| Rejected | Find Another Terminal |
| Expired | Find Another Terminal |
| Cancelled | View Details |

The interface must show only actions valid for the current booking state.

## 9.6 Cancellation Confirmation

**Purpose:** Confirm that the customer wants to cancel an eligible booking.

### Buttons

| Button | Action |
|---|---|
| Confirm Cancellation | Submit cancellation request |
| Keep Booking | Close confirmation and return to booking |
| View Policy | Display applicable cancellation policy |

The backend validates cancellation eligibility.

Refund handling depends on the payment and cancellation policies.

---

# 10. Customer Payment Pages

## 10.1 Payment Page

**Route:** `/customer/payments/:paymentId`

**Purpose:** Handle an eligible booking payment.

### Page Information

- Booking reference.
- Amount.
- Applicable platform fee.
- Payment method options supported by the selected gateway.
- Payment status.

### Buttons

| Button | Action |
|---|---|
| Pay Now | Initiate payment |
| Return to Booking | Return to booking details |
| Retry Payment | Retry an eligible failed payment |
| Refresh Status | Retrieve the latest payment status |

The final payment provider will determine the actual payment method interface.

## 10.2 Payment Result

**Possible Route:** `/customer/payments/:paymentId/result`

The page must display the verified payment result.

### Successful Payment

- Display payment confirmation.
- Display transaction reference.
- Display the updated booking status.
- Provide View Booking.

### Failed Payment

- Display payment failure.
- Provide Retry Payment, when permitted.
- Provide Back to Booking.

**Important:** The backend must verify the payment before the frontend displays it as successful.

## 10.3 Payment History

**Route:** `/customer/payments`

**Purpose:** Display payments made by the customer.

### Buttons

| Button | Action |
|---|---|
| View Payment | Open the payment details |
| View Booking | Open the associated booking |
| Filter | Filter payment records |
| Back to Dashboard | Navigate to customer dashboard |

---

# 11. Customer Vehicle Management

## 11.1 Vehicle List

**Route:** `/customer/vehicles`

**Purpose:** Display all vehicles registered by the customer.

Each vehicle card should show:

- Manufacturer.
- Model.
- Vehicle category.
- Charging method.
- Connector type.
- Compatibility information, where available.

### Buttons

| Button | Action |
|---|---|
| Add Vehicle | Navigate to `/customer/vehicles/new` |
| Edit Vehicle | Navigate to `/customer/vehicles/:vehicleId/edit` |
| Delete Vehicle | Open deletion confirmation |
| View Details | Open vehicle details |
| Set Default | Set the vehicle as default, if implemented |

## 11.2 Add Vehicle

**Route:** `/customer/vehicles/new`

### Form Fields

- Manufacturer.
- Model.
- Vehicle category.
- Model year.
- Battery capacity.
- Charging method.
- Connector type.
- Maximum supported power.

### Buttons

| Button | Action |
|---|---|
| Save Vehicle | Validate and create vehicle |
| Cancel | Return to vehicle list |
| Back | Return to previous page |

After successful creation, return to `/customer/vehicles` and display the new vehicle.

## 11.3 Edit Vehicle

**Route:** `/customer/vehicles/:vehicleId/edit`

### Buttons

| Button | Action |
|---|---|
| Save Changes | Validate and update vehicle |
| Cancel | Return to vehicle details |
| Delete Vehicle | Open deletion confirmation |

The system must prevent the customer from editing another customer's vehicle.

## 11.4 Delete Vehicle

A confirmation dialog must explain the consequences.

Buttons:

- Confirm Delete.
- Keep Vehicle.

The system must consider existing bookings before allowing deletion.

A vehicle referenced by historical bookings should not cause historical records to become unreadable.

---

# 12. Customer Notifications and Profile

## 12.1 Notifications

**Route:** `/customer/notifications`

**Purpose:** Display customer notifications.

### Notification Categories

- Booking Updates.
- Payment Updates.
- Charging Session Updates.
- Account Updates.

### Buttons

| Button | Action |
|---|---|
| Open Notification | Navigate to the relevant booking or payment |
| Mark as Read | Mark one notification as read |
| Mark All as Read | Mark all notifications as read |
| Delete | Delete or dismiss a notification if supported |

Selecting a booking-related notification should open the relevant booking.

Selecting a payment-related notification should open the relevant payment or booking.

## 12.2 Customer Profile

**Route:** `/customer/profile`

**Purpose:** Display and manage customer account information.

### Sections

- Personal Information.
- Email.
- Phone.
- Account Information.
- Security.
- Settings.

### Buttons

| Button | Action |
|---|---|
| Edit Profile | Enable profile editing |
| Save Changes | Save valid profile updates |
| Change Password | Open password change flow |
| Manage Vehicles | Navigate to `/customer/vehicles` |
| Privacy Settings | Open privacy options, if supported |
| Logout | End the current session |

## 12.3 Customer Logout

When Logout is selected:

1. The authentication session is terminated.
2. Protected customer data is no longer accessible.
3. The user is redirected to `/`.

---

# 13. Supplier Application

The supplier application must have its own layout, navigation, and dashboard.

Unlike the customer application, the supplier is not primarily searching for charging terminals.

The supplier is managing business operations.

The supplier interface should prioritize:

- Station management.
- Terminal management.
- Booking request management.
- Availability.
- Pricing.
- Earnings and settlements.

The supplier dashboard should be desktop-friendly and responsive for mobile use.

## 13.1 Supplier Navigation Structure

### Desktop Sidebar

Recommended navigation:

| Navigation Item | Destination |
|---|---|
| Dashboard | `/supplier/dashboard` |
| Business Profile | `/supplier/profile` |
| Stations | `/supplier/stations` |
| Charging Terminals | `/supplier/terminals` |
| Booking Requests | `/supplier/bookings?status=PENDING` |
| Upcoming Bookings | `/supplier/bookings?status=CONFIRMED` |
| Booking History | `/supplier/bookings/history` |
| Earnings | `/supplier/earnings` |
| Settlements | `/supplier/settlements` |
| Notifications | `/supplier/notifications` |
| Settings | `/supplier/settings` |

The sidebar must remain visually and functionally distinct from customer navigation.

On mobile, the sidebar may be presented as a drawer opened through a menu button.

## 13.2 Supplier Dashboard

**Route:** `/supplier/dashboard`

**Purpose:** Provide an overview of supplier business activity.

### Dashboard Content

The dashboard should display:

- Total stations.
- Total charging terminals.
- Active terminals.
- Inactive terminals.
- Pending booking requests.
- Upcoming confirmed bookings.
- Completed bookings.
- Earnings overview.
- Pending settlements.
- Recent notifications.

### Dashboard Buttons

| Button | Action |
|---|---|
| Add Station | Navigate to `/supplier/stations/new` |
| Add Terminal | Navigate to `/supplier/terminals/new` or require station selection |
| View All Stations | Navigate to `/supplier/stations` |
| View All Terminals | Navigate to `/supplier/terminals` |
| View Booking Requests | Navigate to pending bookings |
| View Upcoming Bookings | Navigate to confirmed/upcoming bookings |
| View Earnings | Navigate to `/supplier/earnings` |
| View Settlements | Navigate to `/supplier/settlements` |
| Notifications | Navigate to `/supplier/notifications` |
| Business Profile | Navigate to `/supplier/profile` |

### Dashboard Cards

**Pending Requests**

Selecting the card opens pending booking requests.

**Active Terminals**

Selecting the card opens the terminal list filtered to active terminals.

**Earnings**

Selecting the card opens the earnings page.

**Upcoming Bookings**

Selecting the card opens the upcoming booking list.

---

# 14. Supplier Business Profile

## 14.1 Business Profile Page

**Route:** `/supplier/profile`

**Purpose:** Allow the supplier to manage business information.

### Information

- Business name.
- Representative name.
- Email.
- Phone.
- Business address.
- Description.
- Business logo.
- Verification status.

### Buttons

| Button | Action |
|---|---|
| Edit Profile | Enable editing |
| Save Changes | Validate and save updates |
| Upload Logo | Open file selector |
| View Verification Status | Open verification information |
| Submit Verification | Submit required verification information |
| Cancel | Discard unsaved changes |

## 14.2 Supplier Verification

**Route:** `/supplier/verification`

If verification is required, the supplier can view the requirements and submit the required information.

Possible statuses:

- Not Submitted.
- Pending Review.
- Approved.
- Rejected.
- Additional Information Required.

Buttons:

| Button | Action |
|---|---|
| Submit Documents | Upload verification documents |
| Resubmit | Submit corrected information |
| View Status | Show current review status |
| Contact Support | Open support channel, if implemented |

A supplier whose listing requires approval must not be shown as an active public supplier before approval.

---

# 15. Supplier Station Management

## 15.1 Station List

**Route:** `/supplier/stations`

**Purpose:** Display all stations belonging to the supplier.

Each station card or row should display:

- Station name.
- Address.
- City.
- Total terminals.
- Active terminals.
- Station status.
- Operating hours.

### Buttons

| Button | Action |
|---|---|
| Add Station | Navigate to `/supplier/stations/new` |
| View Station | Navigate to `/supplier/stations/:stationId` |
| Edit Station | Navigate to `/supplier/stations/:stationId/edit` |
| Manage Terminals | Open terminals belonging to that station |
| Deactivate Station | Open confirmation and deactivate if permitted |
| Search Stations | Filter supplier's stations |
| Filter | Filter by status or city |

## 15.2 Add Station

**Route:** `/supplier/stations/new`

**Purpose:** Register a physical charging station.

### Form Fields

- Station name.
- Description.
- Address.
- City.
- Province.
- Country.
- Location coordinates.
- Operating days.
- Opening time.
- Closing time.
- Contact details.
- Station images, if supported.

### Buttons

| Button | Action |
|---|---|
| Select Location | Open map location selector |
| Use Current Location | Request browser location permission |
| Upload Image | Open file selector |
| Save Station | Validate and create station |
| Save Draft | Save incomplete station details, if drafts are supported |
| Cancel | Return to station list |

After successful creation:

1. The backend creates the station under the authenticated supplier.
2. The station is displayed in the station list.
3. The supplier is directed to station details.
4. The supplier is prompted to add charging terminals.

## 15.3 Station Details

**Route:** `/supplier/stations/:stationId`

**Purpose:** Display one station and the terminals associated with it.

### Sections

- Station Information.
- Location.
- Operating Hours.
- Charging Terminals.
- Station Status.
- Booking Overview.

### Buttons

| Button | Action |
|---|---|
| Edit Station | Navigate to station editing |
| Add Terminal | Open terminal creation with this station selected |
| Manage Terminals | Display terminals belonging to this station |
| View Map | Open station location |
| Deactivate Station | Open confirmation |
| Back to Stations | Return to `/supplier/stations` |

## 15.4 Edit Station

**Route:** `/supplier/stations/:stationId/edit`

Buttons:

| Button | Action |
|---|---|
| Save Changes | Validate and update station |
| Cancel | Return to station details |
| Change Location | Open map location selector |
| Deactivate Station | Open confirmation |

A supplier may only edit stations belonging to their account.

A station location or operating-hours change must not silently invalidate confirmed bookings.

---

# 16. Supplier Charging Terminal Management

## 16.1 Terminal List

**Route:** `/supplier/terminals`

**Purpose:** Display all charging terminals managed by the supplier.

Each terminal should display:

- Terminal name.
- Parent station.
- Charging method.
- Power.
- Connector.
- Pricing.
- Availability.
- Operational status.

### Buttons

| Button | Action |
|---|---|
| Add Terminal | Navigate to terminal creation |
| View Terminal | Navigate to `/supplier/terminals/:terminalId` |
| Edit Terminal | Navigate to terminal editing |
| Manage Pricing | Open terminal pricing |
| Manage Availability | Open terminal availability |
| Change Status | Open status action |
| Filter by Station | Filter terminals by parent station |
| Search | Search terminal names |

## 16.2 Add Terminal

**Route:** `/supplier/terminals/new`

**Purpose:** Register a charging terminal under one of the supplier's stations.

### Form Fields

- Parent station.
- Terminal name or identifier.
- Charging method.
- Connector type.
- Supported vehicle categories.
- Maximum power.
- Charging capacity.
- Pricing configuration.
- Availability.
- Operational status.

### Buttons

| Button | Action |
|---|---|
| Select Station | Open the supplier's station list |
| Save Terminal | Validate and create terminal |
| Save Draft | Save incomplete terminal information, if drafts are supported |
| Cancel | Return to terminal list |

The station selector must only display stations owned by the authenticated supplier.

After creation, navigate to the terminal detail page.

## 16.3 Terminal Details

**Route:** `/supplier/terminals/:terminalId`

**Purpose:** Display and manage a specific charging terminal.

### Sections

- Terminal Information.
- Parent Station.
- Charging Specifications.
- Compatibility.
- Pricing.
- Availability.
- Operational Status.
- Related Bookings.

### Buttons

| Button | Action |
|---|---|
| Edit Terminal | Navigate to terminal editing |
| Manage Pricing | Navigate to pricing |
| Manage Availability | Navigate to availability |
| View Bookings | Open bookings filtered to this terminal |
| Mark Unavailable | Change operational status |
| Mark Under Maintenance | Set maintenance status and period |
| Activate Terminal | Activate if all requirements are satisfied |
| Back to Terminals | Return to terminal list |

## 16.4 Edit Terminal

**Route:** `/supplier/terminals/:terminalId/edit`

Buttons:

| Button | Action |
|---|---|
| Save Changes | Validate and update terminal information |
| Cancel | Return to terminal details |
| Manage Pricing | Open pricing page |
| Manage Availability | Open availability page |
| Deactivate Terminal | Open confirmation |

Changes must be validated against existing bookings.

## 16.5 Terminal Pricing

**Route:** `/supplier/terminals/:terminalId/pricing`

Purpose: Configure the terminal's charging prices.

Buttons:

| Button | Action |
|---|---|
| Save Pricing | Validate and save pricing |
| Cancel | Return to terminal details |
| Reset | Restore the last saved values |

The selected pricing model will determine the form fields.

Possible pricing structures:

- Per kWh.
- Per minute.
- Per session.
- Additional service fee.

The final pricing model remains pending confirmation.

Existing booking price snapshots must not be changed by later pricing updates.

## 16.6 Terminal Availability

**Route:** `/supplier/terminals/:terminalId/availability`

Purpose: Configure terminal availability and blocked periods.

Buttons:

| Button | Action |
|---|---|
| Add Availability | Create an availability period |
| Edit Schedule | Modify working hours |
| Block Time | Mark a period unavailable |
| Set Maintenance | Create a maintenance period |
| Save Changes | Validate and save availability |
| Cancel | Return to terminal details |

If a change conflicts with an existing confirmed booking, the supplier must be shown the conflict and required resolution options.

---

# 17. Supplier Booking Management

## 17.1 Bookings Page

**Route:** `/supplier/bookings`

**Purpose:** Display booking requests and bookings associated with the supplier's terminals.

### Booking Categories

- Pending Requests.
- Accepted.
- Confirmed.
- Upcoming.
- In Progress.
- Completed.
- Rejected.
- Cancelled.
- Expired.

### Buttons

| Button | Action |
|---|---|
| Pending | Filter pending requests |
| Upcoming | Filter future confirmed bookings |
| In Progress | Filter active charging sessions |
| Completed | Filter completed bookings |
| History | Open past booking records |
| View Details | Open the relevant booking |
| Filter | Filter by station, terminal, or status |
| Search | Search by booking reference |

## 17.2 Booking Request Details

**Route:** `/supplier/bookings/:bookingId`

**Purpose:** Allow the supplier to review and manage one booking.

### Booking Information

- Booking reference.
- Customer information permitted for the supplier.
- Selected vehicle.
- Vehicle category.
- Compatibility details.
- Station.
- Terminal.
- Requested date.
- Requested time.
- Duration.
- Price.
- Booking status.

### Buttons for Pending Requests

| Button | Action |
|---|---|
| Accept Request | Submit supplier acceptance |
| Reject Request | Open rejection confirmation or reason form |
| Back to Requests | Return to pending booking list |

### Accept Request Behavior

1. Submit acceptance request.
2. Validate supplier authorization.
3. Validate current booking status.
4. Recheck availability.
5. Check booking conflicts.
6. Update booking to `ACCEPTED`.
7. Notify customer.
8. Enable payment for the customer.

If the terminal is no longer available, acceptance must fail and the supplier must receive an explanation.

### Reject Request Behavior

1. Open rejection dialog.
2. Supplier may enter a reason.
3. Confirm rejection.
4. Backend validates the operation.
5. Booking becomes `REJECTED`.
6. Customer is notified.

## 17.3 Confirmed Booking Details

For an eligible confirmed booking, the supplier may see:

| Button | Action |
|---|---|
| View Customer Details | Display permitted customer information |
| View Vehicle | Display vehicle information |
| View Location | Open station location |
| Start Session | Start the charging session |
| Cancel Booking | Open cancellation process, if permitted |
| Back to Bookings | Return to booking list |

## 17.4 Charging Session Management

When the supplier selects Start Session:

1. The backend verifies booking confirmation.
2. The backend verifies session eligibility.
3. Session status becomes `IN_PROGRESS`.
4. The customer receives a notification.

When the supplier selects End Session:

1. Backend verifies that the session is in progress.
2. Session status becomes `COMPLETED`.
3. Booking becomes `COMPLETED`.
4. Customer receives a notification.
5. Supplier earnings records are updated.

Hardware-based automatic charging-session management is future scope.

## 17.5 Booking History

**Route:** `/supplier/bookings/history`

Purpose: Display previous supplier bookings.

Buttons:

| Button | Action |
|---|---|
| View Details | Open booking detail |
| Filter | Filter by date, terminal, or status |
| Export | Export records, if implemented |
| Back to Dashboard | Return to supplier dashboard |

---

# 18. Supplier Earnings and Settlements

## 18.1 Earnings Page

**Route:** `/supplier/earnings`

**Purpose:** Display supplier revenue and earnings.

### Information

- Total customer payments.
- Completed booking revenue.
- Platform fees.
- Refund deductions.
- Net earnings.
- Pending settlements.
- Paid-out settlements.

### Buttons

| Button | Action |
|---|---|
| View Settlement History | Navigate to `/supplier/settlements` |
| View Booking | Open the associated booking |
| Filter by Date | Filter earnings |
| Export Report | Export records, if implemented |

## 18.2 Settlements Page

**Route:** `/supplier/settlements`

**Purpose:** Display payout records.

### Settlement Information

- Settlement reference.
- Amount.
- Related bookings.
- Platform fee.
- Settlement status.
- Date.
- Payment reference.

### Buttons

| Button | Action |
|---|---|
| View Settlement | Open settlement details |
| View Related Booking | Open linked booking |
| Refresh Status | Retrieve latest settlement status |
| Contact Support | Open support channel, if available |

The supplier must not be able to mark their own settlement as paid.

Only verified payment or payout results may update settlement status.

---

# 19. Supplier Notifications, Settings and Logout

## 19.1 Notifications

**Route:** `/supplier/notifications`

The supplier receives notifications about:

- New booking requests.
- Accepted or rejected requests.
- Customer cancellations.
- Successful payments.
- Settlement updates.
- Supplier verification.
- Station and terminal issues.

Buttons:

| Button | Action |
|---|---|
| Open Notification | Navigate to the related station, booking, or payment |
| Mark as Read | Mark one notification as read |
| Mark All as Read | Mark all notifications as read |
| Clear | Dismiss notifications where permitted |

## 19.2 Supplier Settings

**Route:** `/supplier/settings`

Possible sections:

- Account Security.
- Password.
- Notifications.
- Business Preferences.
- Contact Details.
- Account Status.

Buttons:

| Button | Action |
|---|---|
| Change Password | Open password change form |
| Save Settings | Save changed preferences |
| Notification Preferences | Manage notification options |
| Logout | End session |

## 19.3 Supplier Logout

When the supplier selects Logout:

1. The session is terminated.
2. Protected supplier pages become inaccessible.
3. The user is redirected to `/`.

---

# 20. Super Admin Application

The admin panel is a separate management interface.

It should be accessible only to authorized admin accounts.

It is primarily intended for desktop use.

## 20.1 Admin Navigation

Recommended sidebar:

| Item | Destination |
|---|---|
| Dashboard | `/admin/dashboard` |
| Customers | `/admin/customers` |
| Suppliers | `/admin/suppliers` |
| Stations | `/admin/stations` |
| Terminals | `/admin/terminals` |
| Bookings | `/admin/bookings` |
| Payments | `/admin/payments` |
| Settlements | `/admin/settlements` |
| Reports and Complaints | `/admin/reports` |
| Audit Logs | `/admin/audit-logs` |
| Settings | `/admin/settings` |

## 20.2 Admin Dashboard

**Route:** `/admin/dashboard`

Displays:

- Total customers.
- Total suppliers.
- Total stations.
- Total terminals.
- Active listings.
- Pending supplier approvals.
- Booking totals.
- Payment totals.
- Settlement totals.
- Reported issues.

Buttons:

| Button | Action |
|---|---|
| View Customers | Navigate to customer management |
| View Suppliers | Navigate to supplier management |
| Review Pending Suppliers | Open pending supplier applications |
| View Stations | Navigate to station management |
| View Bookings | Navigate to booking management |
| View Payments | Navigate to payment management |
| View Reports | Navigate to reports |

## 20.3 Customer Management

**Route:** `/admin/customers`

Buttons:

| Button | Action |
|---|---|
| Search | Search customer records |
| View Customer | Open customer details |
| Suspend | Open suspension confirmation |
| Reactivate | Reactivate an eligible account |
| Filter | Filter customer records |

## 20.4 Supplier Management

**Route:** `/admin/suppliers`

Buttons:

| Button | Action |
|---|---|
| View Supplier | Open supplier details |
| Review Application | Open supplier verification details |
| Approve | Approve eligible supplier |
| Reject | Reject application with reason |
| Suspend | Suspend supplier account |
| Reactivate | Reactivate eligible supplier |
| Filter | Filter by approval or account status |

Approval and rejection actions must be recorded in the audit log.

## 20.5 Station Management

**Route:** `/admin/stations`

Buttons:

| Button | Action |
|---|---|
| View Station | Open station details |
| View Supplier | Open supplier profile |
| Review Listing | Inspect station information |
| Deactivate | Deactivate an eligible listing |
| Filter | Filter stations |

## 20.6 Terminal Management

**Route:** `/admin/terminals`

Buttons:

| Button | Action |
|---|---|
| View Terminal | Open terminal details |
| View Station | Open parent station |
| View Supplier | Open supplier |
| Deactivate | Deactivate terminal when justified |
| Filter | Filter terminals |

## 20.7 Booking Management

**Route:** `/admin/bookings`

Buttons:

| Button | Action |
|---|---|
| View Booking | Open booking details |
| Search | Search by booking reference |
| Filter | Filter by status, date, supplier, or customer |
| Investigate | Open issue investigation workflow |

Administrative booking changes must be restricted and auditable.

## 20.8 Payment Management

**Route:** `/admin/payments`

Buttons:

| Button | Action |
|---|---|
| View Payment | Open payment details |
| View Booking | Open related booking |
| View Provider Reference | Inspect transaction reference |
| Investigate | Open payment investigation |
| Filter | Filter payment records |

Refunds or other financial actions must use the authorized payment workflow.

## 20.9 Settlement Management

**Route:** `/admin/settlements`

Buttons:

| Button | Action |
|---|---|
| View Settlement | Open settlement details |
| View Supplier | Open supplier profile |
| View Related Booking | Open booking |
| Investigate | Open settlement issue |
| Filter | Filter settlement records |

## 20.10 Reports and Complaints

**Route:** `/admin/reports`

Buttons:

| Button | Action |
|---|---|
| View Report | Open report details |
| Mark Under Review | Change report status |
| Resolve | Record resolution |
| Escalate | Escalate an issue, if supported |
| Filter | Filter reports |

## 20.11 Audit Logs

**Route:** `/admin/audit-logs`

Displays:

- Actor.
- Role.
- Action.
- Affected record.
- Timestamp.
- Relevant metadata.

Buttons:

| Button | Action |
|---|---|
| Search | Search audit records |
| Filter | Filter by user, action, or date |
| View Details | Inspect a log record |
| Export | Export logs, if implemented |

Audit records should not be editable through ordinary admin operations.

---

# 21. Global Navigation and Interaction Rules

These rules apply across the entire website.

## 21.1 Logo Behavior

Selecting the platform logo should navigate to:

- `/` for public visitors.
- The role's dashboard for authenticated users, if the logo is used inside the private application.

## 21.2 Back Buttons

Back buttons should return users to the meaningful previous page.

For example:

- Terminal details → Search results.
- Booking details → Booking list.
- Station details → Station list.
- Terminal details (supplier) → Terminal list.

The application should preserve relevant filters and search parameters when navigating back.

## 21.3 Form Buttons

Forms should use consistent actions:

| Button | Standard Behavior |
|---|---|
| Save | Validate and persist the changes |
| Save Changes | Update existing record |
| Cancel | Leave without saving unsaved changes |
| Submit | Validate and send the form |
| Reset | Restore the form's initial values |
| Back | Return to the previous step |
| Continue | Validate the current step and proceed |

If unsaved changes exist, navigation away from the form should display a confirmation when appropriate.

## 21.4 Destructive Actions

Actions such as:

- Delete Vehicle.
- Deactivate Station.
- Deactivate Terminal.
- Suspend Supplier.
- Cancel Booking.

Must require confirmation.

The confirmation must explain the action and its relevant consequences.

## 21.5 Loading States

Buttons that submit requests must show an appropriate loading state.

During a critical request:

- Prevent accidental duplicate submissions.
- Prevent repeated booking creation.
- Prevent repeated payment initiation.
- Display clear feedback when the request completes.

## 21.6 Error States

The application must provide meaningful error messages.

Examples:

- Invalid form information.
- Session expired.
- No charging terminals found.
- Terminal unavailable.
- Booking conflict.
- Payment failed.
- Routing unavailable.
- Unauthorized access.
- Server error.

The application must not expose internal database errors or stack traces.

## 21.7 Notification Navigation

Every notification related to a platform record should link to the relevant destination.

Examples:

- Booking notification → Booking details.
- Payment notification → Payment details.
- Supplier verification notification → Verification page.
- Station notification → Station details.

---

# 22. Access and Route Protection

Every application route must be protected according to role and resource ownership.

## 22.1 Public Routes

The following routes are accessible without authentication:

```text
/
 /how-it-works
 /for-customers
 /for-suppliers
 /search
 /register
 /register/customer
 /register/supplier
 /login
 /forgot-password
 /reset-password
 /terms
 /privacy
 /contact
```

Guest access to `/search` is subject to enabling public discovery.

## 22.2 Customer Routes

```text
/customer/*
```

Only authenticated customers may access these routes.

Additional ownership validation is required for vehicles, bookings, payments, and personal information.

## 22.3 Supplier Routes

```text
/supplier/*
```

Only authenticated suppliers may access these routes.

The backend must additionally verify that every station, terminal, booking, and settlement belongs to or is associated with the supplier.

## 22.4 Admin Routes

```text
/admin/*
```

Only authorized administrators may access these routes.

Admin access must not be granted merely because a user manually enters an admin URL.

## 22.5 Unauthorized Access Flow

```text
USER OPENS PROTECTED PAGE
           |
           v
CHECK AUTHENTICATION
           |
      +----+----+
      |         |
      v         v
  LOGGED IN   LOGGED OUT
      |         |
      v         v
CHECK ROLE    REDIRECT TO LOGIN
      |
  +---+---+
  |       |
  v       v
ALLOWED  NOT ALLOWED
  |       |
  v       v
OPEN    ACCESS DENIED
PAGE
```

The frontend route guard provides navigation control.

The backend must independently validate every protected operation.

---

# 23. Route Registry

The following is the proposed complete route registry.

| Area | Route | Page |
|---|---|---|
| Public | `/` | Landing |
| Public | `/how-it-works` | How It Works |
| Public | `/for-customers` | Customer Information |
| Public | `/for-suppliers` | Supplier Information |
| Public | `/contact` | Contact |
| Public | `/search` | Public Terminal Discovery |
| Public | `/register` | Registration Selection |
| Public | `/register/customer` | Customer Registration |
| Public | `/register/supplier` | Supplier Registration |
| Public | `/login` | Shared Login |
| Public | `/forgot-password` | Password Recovery |
| Public | `/reset-password` | Password Reset |
| Public | `/verify-account` | Account Verification |
| Public | `/terms` | Terms |
| Public | `/privacy` | Privacy |
| Customer | `/customer/onboarding` | Customer Onboarding |
| Customer | `/customer/dashboard` | Customer Dashboard |
| Customer | `/customer/search` | Terminal Search |
| Customer | `/customer/search/results` | Search Results |
| Customer | `/customer/terminals/:terminalId` | Terminal Details |
| Customer | `/customer/terminals/:terminalId/route` | Route View |
| Customer | `/customer/vehicles` | Vehicle List |
| Customer | `/customer/vehicles/new` | Add Vehicle |
| Customer | `/customer/vehicles/:vehicleId/edit` | Edit Vehicle |
| Customer | `/customer/bookings` | Booking List |
| Customer | `/customer/bookings/new` | Create Booking |
| Customer | `/customer/bookings/confirm` | Booking Confirmation |
| Customer | `/customer/bookings/:bookingId` | Booking Details |
| Customer | `/customer/payments` | Payment History |
| Customer | `/customer/payments/:paymentId` | Payment |
| Customer | `/customer/payments/:paymentId/result` | Payment Result |
| Customer | `/customer/notifications` | Notifications |
| Customer | `/customer/profile` | Customer Profile |
| Supplier | `/supplier/onboarding` | Supplier Onboarding |
| Supplier | `/supplier/dashboard` | Supplier Dashboard |
| Supplier | `/supplier/profile` | Business Profile |
| Supplier | `/supplier/verification` | Supplier Verification |
| Supplier | `/supplier/stations` | Station List |
| Supplier | `/supplier/stations/new` | Add Station |
| Supplier | `/supplier/stations/:stationId` | Station Details |
| Supplier | `/supplier/stations/:stationId/edit` | Edit Station |
| Supplier | `/supplier/terminals` | Terminal List |
| Supplier | `/supplier/terminals/new` | Add Terminal |
| Supplier | `/supplier/terminals/:terminalId` | Terminal Details |
| Supplier | `/supplier/terminals/:terminalId/edit` | Edit Terminal |
| Supplier | `/supplier/terminals/:terminalId/pricing` | Terminal Pricing |
| Supplier | `/supplier/terminals/:terminalId/availability` | Terminal Availability |
| Supplier | `/supplier/bookings` | Booking Management |
| Supplier | `/supplier/bookings/history` | Booking History |
| Supplier | `/supplier/bookings/:bookingId` | Booking Details |
| Supplier | `/supplier/earnings` | Earnings |
| Supplier | `/supplier/settlements` | Settlements |
| Supplier | `/supplier/notifications` | Notifications |
| Supplier | `/supplier/settings` | Settings |
| Admin | `/admin/dashboard` | Admin Dashboard |
| Admin | `/admin/customers` | Customer Management |
| Admin | `/admin/suppliers` | Supplier Management |
| Admin | `/admin/stations` | Station Management |
| Admin | `/admin/terminals` | Terminal Management |
| Admin | `/admin/bookings` | Booking Management |
| Admin | `/admin/payments` | Payment Management |
| Admin | `/admin/settlements` | Settlement Management |
| Admin | `/admin/reports` | Reports and Complaints |
| Admin | `/admin/audit-logs` | Audit Logs |
| Admin | `/admin/settings` | Admin Settings |

Dynamic route parameters such as `:terminalId`, `:bookingId`, and `:stationId` represent actual database record identifiers.

The exact routes may be adjusted during implementation, but the navigation behavior and role separation must remain consistent.

---

# 24. Important Navigation Scenarios

## Scenario A: New Customer

```text
Landing
  → Register
  → Register as Customer
  → Customer Registration
  → Account Created
  → Customer Onboarding
  → Add Vehicle
  → Customer Dashboard
  → Find Charging
```

## Scenario B: New Supplier

```text
Landing
  → Register
  → Register as Supplier
  → Supplier Registration
  → Account Created
  → Supplier Onboarding
  → Complete Business Profile
  → Register Station
  → Add Terminal
  → Configure Pricing
  → Configure Availability
  → Activate Listing
  → Supplier Dashboard
```

## Scenario C: Returning Customer

```text
Landing
  → Login
  → Customer Authentication
  → Customer Dashboard
  → Search
  → Select Terminal
  → View Route
  → Request Booking
```

## Scenario D: Returning Supplier

```text
Landing
  → Login
  → Supplier Authentication
  → Supplier Dashboard
  → Booking Requests
  → Review Request
  → Accept or Reject
```

## Scenario E: Customer Booking

```text
Customer Dashboard
  → Search
  → Select Vehicle
  → Select Location
  → View Results
  → Select Terminal
  → View Route
  → Book Now
  → Select Date and Time
  → Confirm Request
  → Pending Booking
  → Supplier Accepts
  → Customer Pays
  → Payment Verified
  → Booking Confirmed
  → Charging Completed
```

## Scenario F: Supplier Receives a Booking

```text
Supplier Dashboard
  → New Booking Notification
  → Booking Requests
  → Open Request
  → Review Details
  → Accept or Reject
  → Customer Notified
  → Booking Confirmed After Payment
  → Start Charging Session
  → End Charging Session
  → Earnings Updated
```

---

# 25. Features That Are Not Yet Finalized

The website structure identifies some actions that depend on business decisions still pending.

| Feature | Current Status |
|---|---|
| Guest terminal search | Proposed, requires confirmation |
| Favorites | Optional |
| Reviews and ratings | Optional |
| Customer-supplier direct messaging | Not confirmed |
| Supplier contact action | Not confirmed |
| Supplier verification | Process to be finalized |
| Booking cancellation rules | Pending |
| Booking expiration time | Pending |
| Payment provider | Pending |
| Supplier payout workflow | Pending |
| Exact pricing model | Pending |
| External navigation integration | Optional |
| PWA installation | Future enhancement |

These pending features must not be treated as mandatory implementation requirements until approved.

---

# 26. Final Website Structure

The website will be structured as one public platform with two distinct primary applications and one administrative application.

**Public Website**

Provides the landing page, platform information, terminal discovery entry point, registration, and login.

**Customer Application**

Provides vehicle management, charging terminal discovery, compatibility checking, road routing, bookings, payments, and notifications.

**Supplier Application**

Provides business management, station registration, terminal management, pricing, availability, booking requests, charging-session management, earnings, and settlements.

**Admin Application**

Provides user management, supplier verification, station and terminal oversight, booking monitoring, payment monitoring, reports, and audit logs.

The customer and supplier applications must maintain separate navigation systems and role-specific dashboards. A customer should never be presented with supplier management tools, and a supplier should never be presented with customer vehicle and discovery navigation as their primary interface.

All buttons and navigation actions must follow the defined routes and business rules. The backend must enforce authentication, authorization, ownership, booking availability, and payment verification independently of the frontend.

This document serves as the baseline for building the website's routing system, page hierarchy, navigation components, dashboard layouts, and page-level interactions.