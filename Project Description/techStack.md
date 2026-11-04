# TECHSTACK.md
# EV Charging Platform

**Document Type:** Technical Stack and Implementation Architecture  
**Application Type:** Mobile-first responsive web application  
**Target Market:** Pakistan  
**Architecture:** MERN-based client-server architecture  
**Status:** Initial technical baseline

---

## 1. Technology Stack Overview

The platform will use the MERN stack.

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Frontend Language | JavaScript |
| Frontend Build Tool | Vite |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Routing | React Router |
| API Communication | Fetch API |
| Backend Runtime | Node.js |
| Backend Framework | Express.js |
| Backend Language | JavaScript |
| Database | MongoDB |
| Database ODM | Mongoose |
| Authentication | JWT-based authentication |
| Session Transport | Secure HttpOnly cookies |
| Maps | Leaflet |
| Map Data | OpenStreetMap-based provider |
| Shortest-Path Algorithm | Dijkstra's algorithm |
| Road Routing | Road-network graph or routing service, to be selected |
| Real-Time Communication | Socket.IO |
| Payment Integration | Pakistan-compatible payment gateway, TBD |
| File Storage | Cloudinary or another suitable provider, TBD |
| Frontend Hosting | Vercel |
| Backend Hosting | Render or Railway |
| Version Control | Git and GitHub |
| API Testing | Postman or an equivalent API client |
| Automated Testing | Vitest and Supertest, subject to project setup |

The core MERN technologies are:

- **MongoDB:** Database.
- **Express.js:** Backend web framework.
- **React.js:** Frontend UI library.
- **Node.js:** Backend JavaScript runtime.

The other technologies support the application around this core.

---

## 2. Application Architecture

The platform will use a client-server architecture.

The frontend and backend are separate application layers that communicate through HTTP APIs. Real-time updates will use Socket.IO where appropriate.

```text
                         EV Charging Platform
                                  |
                 +----------------+----------------+
                 |                                 |
          React Frontend                     Express Backend
                 |                                 |
        React Router / UI                  Node.js Runtime
                 |                                 |
          API Client Layer                 Express Middleware
                 |                                 |
                 +------------ HTTPS/API ---------+
                                                   |
                         +-------------------------+------------------+
                         |                         |                  |
                      MongoDB                 Map / Routing       External
                      Database                  Integration       Services
                         |                         |                  |
                    Mongoose                  Leaflet / Route    Payments,
                                              Calculation       Notifications,
                                                                File Storage
```

### 2.1 Frontend Responsibilities

The frontend is responsible for:

- Displaying the website and user interfaces.
- Handling user interaction.
- Displaying forms and validation messages.
- Showing maps and charging terminal locations.
- Displaying search results.
- Showing booking statuses.
- Sending API requests.
- Displaying notifications.
- Managing temporary UI state.
- Adapting the interface to mobile, tablet, and desktop screens.

The frontend must not be responsible for enforcing critical business rules.

For example, the frontend may display that a terminal appears available, but the backend must revalidate availability before creating or accepting a booking.

### 2.2 Backend Responsibilities

The backend is responsible for:

- Authentication.
- Authorization.
- User and supplier account management.
- Vehicle management.
- Station and terminal management.
- Search and filtering.
- Compatibility validation.
- Booking creation and status transitions.
- Availability validation.
- Payment initiation and verification.
- Supplier earnings and settlement records.
- Notifications.
- Database access.
- Input validation.
- Error handling.
- Security controls.
- Audit logging.

### 2.3 Database Responsibilities

MongoDB will store the application's persistent data, including:

- User accounts.
- Customer profiles.
- Supplier profiles.
- Vehicles.
- Stations.
- Charging terminals.
- Bookings.
- Payments.
- Supplier settlements.
- Notifications.
- Reviews, if implemented.
- Audit logs.

---

## 3. Frontend Technology

### 3.1 React.js

React.js will be used to build the website interface.

The application will have separate experiences for:

- Public visitors.
- Customers.
- Suppliers.
- Super Admin.

These interfaces will share reusable components and a consistent design system.

The application should not be built as four unrelated websites. It should be one platform with role-specific routes and navigation.

### 3.2 JavaScript

JavaScript will be used for frontend application logic.

The frontend should use consistent naming, modular components, and clear separation between:

- UI components.
- Pages.
- API communication.
- Authentication state.
- Form validation.
- Shared utilities.

### 3.3 Vite

Vite will be used as the frontend development and build tool.

Responsibilities include:

- Local development server.
- Fast frontend development.
- Production build generation.
- Environment configuration.

Vite is the frontend build tool. It is not the backend runtime.

### 3.4 React Router

React Router will manage client-side navigation.

Example route structure:

```text
/
├── /how-it-works
├── /register
│   ├── /customer
│   └── /supplier
├── /login
├── /customer
│   ├── /dashboard
│   ├── /vehicles
│   ├── /search
│   ├── /terminals/:terminalId
│   ├── /bookings
│   ├── /bookings/:bookingId
│   ├── /payments
│   └── /profile
├── /supplier
│   ├── /dashboard
│   ├── /stations
│   ├── /stations/:stationId
│   ├── /terminals
│   ├── /bookings
│   ├── /earnings
│   └── /profile
└── /admin
    ├── /dashboard
    ├── /users
    ├── /suppliers
    ├── /stations
    ├── /terminals
    ├── /bookings
    ├── /payments
    └── /settings
```

These routes are a proposed organization. Final page names may be adjusted during UI development.

### 3.5 Tailwind CSS

Tailwind CSS will be used for styling.

It will support:

- Responsive layouts.
- Mobile-first design.
- Consistent spacing.
- Typography.
- Color tokens.
- Layout grids.
- Responsive navigation.
- Form styling.
- Component-level styling.

The interface should use a clean, professional EV-related visual identity.

The design should avoid excessive visual effects that reduce usability, especially on mobile devices.

### 3.6 shadcn/ui

shadcn/ui will provide reusable UI components where suitable.

Possible components include:

- Buttons.
- Inputs.
- Selects.
- Dialogs.
- Dropdown menus.
- Tabs.
- Tables.
- Cards.
- Toasts.
- Form components.

Components may be customized to fit the platform's design system.

shadcn/ui is not the business logic layer. It is a UI component foundation.

### 3.7 Frontend API Communication

The frontend will communicate with the backend through HTTP APIs.

The API client should centralize:

- Backend base URL.
- Authentication credentials.
- Request headers.
- Response handling.
- Error handling.
- Loading states.
- Common API utilities.

The frontend must not directly connect to MongoDB.

Database access must occur through the backend.

### 3.8 Frontend State Management

The frontend will need state for:

- Current authenticated user.
- Selected vehicle.
- Search filters.
- Map location and zoom.
- Search results.
- Selected terminal.
- Booking form.
- Current booking status.
- Notification count.

For the initial implementation, React state and context may be sufficient.

A separate state-management library should only be introduced if application complexity justifies it.

---

## 4. Backend Technology

### 4.1 Node.js

Node.js will run the backend JavaScript application.

It will handle:

- API requests.
- Database communication.
- Authentication.
- Business logic.
- Booking workflows.
- Payment verification.
- Notifications.
- External service integrations.

### 4.2 Express.js

Express.js will provide the backend framework.

It will handle:

- API routing.
- Middleware.
- Request and response handling.
- Authentication middleware.
- Authorization middleware.
- Validation middleware.
- Error-handling middleware.

### 4.3 Backend Architecture

The backend should use a modular structure.

A recommended request flow is:

```text
HTTP Request
    |
    v
Express Route
    |
    v
Authentication Middleware
    |
    v
Authorization Middleware
    |
    v
Request Validation
    |
    v
Controller
    |
    v
Service Layer
    |
    v
Mongoose Model
    |
    v
MongoDB
    |
    v
HTTP Response
```

### 4.4 Route Layer

The route layer defines API endpoints.

Examples:

```text
/api/auth
/api/customers
/api/vehicles
/api/suppliers
/api/stations
/api/terminals
/api/search
/api/bookings
/api/payments
/api/notifications
/api/admin
```

Routes should not contain large amounts of business logic.

### 4.5 Controller Layer

Controllers should:

- Receive validated requests.
- Call the appropriate service.
- Return the correct HTTP response.
- Handle expected application outcomes.

Controllers should not directly implement complex booking or payment logic.

### 4.6 Service Layer

The service layer contains business logic.

Examples:

- `authService`
- `vehicleService`
- `stationService`
- `terminalService`
- `searchService`
- `compatibilityService`
- `bookingService`
- `paymentService`
- `notificationService`
- `settlementService`

The service layer is where important platform rules must be enforced.

For example, the booking service must verify availability before creating or accepting a booking.

### 4.7 Model Layer

Mongoose models will define:

- MongoDB document structure.
- Field types.
- Validation rules.
- References.
- Indexes.
- Schema-level behavior.

Mongoose models must not replace authorization checks.

The backend must still validate whether the current user is allowed to access or modify a record.

---

## 5. MongoDB and Mongoose

### 5.1 MongoDB

MongoDB will be the primary database.

It will store structured application documents in collections.

The database must support the platform's relationships between:

- Customers and vehicles.
- Suppliers and stations.
- Stations and terminals.
- Customers and bookings.
- Suppliers and bookings.
- Bookings and payments.
- Suppliers and settlements.

### 5.2 Mongoose

Mongoose will be used as the ODM.

It will provide:

- Schema definitions.
- Validation.
- Database operations.
- References between documents.
- Query utilities.
- Index definitions.

### 5.3 Data Relationships

The logical relationships will be:

```text
User
 ├── Customer Profile
 │     └── Vehicles
 │
 └── Supplier Profile
       └── Stations
             └── Charging Terminals

Customer
 └── Bookings
       ├── Vehicle
       ├── Station
       ├── Charging Terminal
       └── Payment

Supplier
 ├── Bookings
 └── Settlements
```

The database may use document references for records that need independent management and querying.

Historical booking records must preserve important snapshots, such as the price agreed at the time of booking.

### 5.4 Indexing

MongoDB indexes should support common queries.

Potential indexes include:

- Unique user email.
- Unique user phone, if required.
- Supplier ID.
- Station ID.
- Terminal ID.
- Station location.
- Terminal status.
- Booking customer ID.
- Booking supplier ID.
- Booking terminal ID.
- Booking start and end time.
- Payment booking ID.
- Notification recipient and creation time.

The exact indexes should be based on actual query patterns.

### 5.5 Geospatial Data

Station locations must be stored in a format suitable for geospatial queries.

A GeoJSON point is a suitable option:

```json
{
  "type": "Point",
  "coordinates": [longitude, latitude]
}
```

The coordinate order is longitude first, latitude second.

A MongoDB `2dsphere` index can support geospatial searches such as finding stations within a geographic area.

Geospatial database queries can help identify nearby candidates, but they do not automatically calculate the shortest road route.

---

## 6. Authentication and Authorization

### 6.1 Authentication

The platform will use JWT-based authentication.

The backend will issue authentication tokens after successful login.

Tokens must be handled securely.

The proposed approach is to use secure, HttpOnly cookies for authentication tokens rather than exposing tokens to ordinary frontend JavaScript.

The final implementation must account for:

- Cookie security.
- HTTPS.
- Token expiration.
- Logout behavior.
- Token renewal, if used.
- CSRF protection where required.
- Secure cookie configuration across frontend and backend domains.

### 6.2 Password Security

Passwords must be hashed using a secure password-hashing algorithm.

The backend must never store raw passwords.

Password hashing should use a suitable algorithm such as bcrypt or Argon2.

### 6.3 Role-Based Access Control

The system will support:

```text
CUSTOMER
SUPPLIER
ADMIN
```

Role-based access control must be enforced by the backend.

Frontend route guards improve navigation and user experience, but they are not a security boundary.

### 6.4 Ownership Validation

The backend must verify record ownership.

Examples:

- A customer can only manage their own vehicles.
- A customer can only access their own private bookings.
- A supplier can only manage their own stations.
- A supplier can only manage terminals belonging to their stations.
- A supplier can only respond to bookings assigned to that supplier.
- An admin can access authorized administrative resources.

---

## 7. Maps and Location Technology

### 7.1 Leaflet

Leaflet will be used to display interactive maps.

It will support:

- Map rendering.
- Station markers.
- Terminal markers.
- Origin markers.
- Destination markers.
- Map zoom and pan.
- Marker selection.
- Route display through a compatible route layer.

Leaflet is the map display library. It does not independently provide road-network routing.

### 7.2 OpenStreetMap

OpenStreetMap-based map data will be used as the initial map-data direction.

The implementation must select a suitable tile provider and follow that provider's usage policies.

The platform must not assume that the public OpenStreetMap tile servers can be used without limits for a production application.

### 7.3 Location Search

Customers may search using:

- Current location.
- Entered address.
- City.
- Area.
- Selected map point.

A geocoding service may be required to convert an address into coordinates.

The geocoding provider is pending selection.

### 7.4 Station Location

Every station must have geographic coordinates.

These coordinates will be used for:

- Map markers.
- Nearby station discovery.
- Distance calculations.
- Route destination selection.

The station address should also be stored for display and verification.

---

## 8. Shortest-Path Routing

### 8.1 Routing Objective

The platform should calculate a route from the customer's selected origin to a charging terminal.

The route must follow the road network.

Straight-line geographic distance is not sufficient for a road route.

### 8.2 Dijkstra's Algorithm

Dijkstra's algorithm is the intended shortest-path algorithm.

The road network can be represented as a weighted graph:

- Nodes represent intersections or routing points.
- Edges represent road segments.
- Edge weights represent distance or another non-negative routing cost.

Dijkstra's algorithm calculates the minimum total weight between a source node and destination node.

### 8.3 Required Routing Data

Dijkstra's algorithm requires a graph containing road-network information.

The application must have access to:

- Road-network nodes.
- Road-network edges.
- Segment distances or weights.
- Origin and destination coordinates.
- A method for mapping coordinates to graph nodes.

The algorithm cannot calculate a practical road route from latitude and longitude alone.

### 8.4 Routing Implementation Options

The project must select one of the following approaches:

**Option A: Routing Service**

Use a routing service to calculate road routes.

The application requests a route and receives route geometry, distance, and possibly estimated travel time.

**Option B: Application-Managed Road Graph**

Obtain road-network data, construct a graph, and implement Dijkstra's algorithm.

This requires additional work for:

- Road-data acquisition.
- Graph construction.
- Coordinate matching.
- Graph storage.
- Routing computation.
- Data updates.

**Option C: Hybrid Approach**

Use an external road-routing service for production routing while implementing Dijkstra's algorithm independently for educational demonstration, testing, or a controlled graph.

The final implementation approach must be selected after evaluating the available road-network data and project constraints.

### 8.5 Routing Output

The route result should contain:

- Origin.
- Destination.
- Route geometry.
- Road distance.
- Estimated travel time, if available.
- Routing status.

The frontend will display the route on the Leaflet map.

### 8.6 Routing Limitations

Dijkstra's algorithm does not independently provide:

- Live traffic information.
- EV battery consumption.
- Charging-stop optimization.
- Battery range prediction.
- Charger availability.
- Charging time estimation.

These require additional data and business logic.

---

## 9. Charging Terminal Search

### 9.1 Search Process

The search process will be:

1. Customer selects or enters an origin.
2. Customer selects a registered vehicle.
3. Frontend sends search parameters to the backend.
4. Backend retrieves relevant charging terminals.
5. Backend filters terminals by the requested criteria.
6. Backend evaluates compatibility.
7. Backend returns search results.
8. Frontend displays the results on a map and in a list.
9. Customer selects a terminal.
10. The platform requests route information.

### 9.2 Search Filters

Search may support:

- Vehicle compatibility.
- Distance.
- Price.
- Charging power.
- Connector type.
- Availability.
- Station operating hours.

### 9.3 Sorting

Search results may be sorted by:

- Shortest road distance.
- Lowest price.
- Highest charging power.
- Earliest available time.

If road distance is requested, the sorting implementation must use road-route distance when available, not straight-line distance.

### 9.4 Search Performance

The backend should avoid calculating full road routes to every terminal in a large result set.

A suitable search approach may be:

1. Use geographic queries to identify nearby candidate terminals.
2. Apply compatibility and availability filters.
3. Calculate road routes for a manageable candidate set.
4. Sort candidates by road distance.
5. Return the results.

The exact candidate limit and search strategy should be determined during implementation and performance testing.

---

## 10. Vehicle Compatibility

The platform must compare the customer's registered vehicle with a terminal's charging specifications.

Compatibility may consider:

- Vehicle category.
- Charging method.
- Connector type.
- Maximum supported power.
- Terminal power.
- Proprietary charging requirements.

The compatibility service should return a clear result:

```text
COMPATIBLE
INCOMPATIBLE
UNKNOWN
```

The system must not treat missing compatibility information as confirmed compatibility.

Compatibility rules must be centralized in the backend so that search, terminal details, and booking creation use consistent logic.

---

## 11. Booking Architecture

### 11.1 Booking Flow

The booking workflow will be controlled by the backend.

```text
Customer Searches
       |
       v
Customer Selects Terminal
       |
       v
Customer Selects Vehicle
       |
       v
Compatibility Validation
       |
       v
Availability Validation
       |
       v
Customer Submits Request
       |
       v
Booking Status: PENDING
       |
       v
Supplier Receives Notification
       |
       v
Supplier Accepts or Rejects
       |
       +-------------------+
       |                   |
       v                   v
    REJECTED             ACCEPTED
                           |
                           v
                    Customer Notified
                           |
                           v
                     Customer Pays
                           |
                           v
                    Payment Verified
                           |
                           v
                     CONFIRMED
                           |
                           v
                    Charging Session
                           |
                           v
                      COMPLETED
```

### 11.2 Booking Service

The booking service will be responsible for:

- Validating customer ownership of the vehicle.
- Validating terminal ownership and status.
- Checking compatibility.
- Checking availability.
- Calculating or retrieving the booking price.
- Creating the booking.
- Processing supplier decisions.
- Updating booking status.
- Preventing overlapping reservations.
- Managing cancellation and expiration.
- Triggering notifications.

### 11.3 Booking Status

The booking status must be separate from payment and charging-session status.

The primary booking statuses are:

```text
PENDING
ACCEPTED
REJECTED
CONFIRMED
CANCELLED
EXPIRED
COMPLETED
```

### 11.4 Availability and Race Conditions

Availability must be revalidated by the backend at critical points.

The system must prevent two requests from successfully reserving the same single-capacity terminal for overlapping periods.

MongoDB does not provide a simple relational exclusion constraint for time overlaps.

The implementation must therefore use an appropriate concurrency-control strategy, such as:

- Atomic reservation operations.
- A reservation/slot model.
- A transaction-based strategy where appropriate.
- A locking or conflict-detection mechanism.

A simple check followed by an insert is not sufficient because two requests may pass the check at the same time.

### 11.5 Price Snapshot

The booking must store the agreed price when the request is created or confirmed according to the final booking policy.

Later changes to terminal pricing must not alter an existing booking's price.

---

## 12. Payment Architecture

### 12.1 Payment Provider

A payment gateway suitable for the Pakistan market must be selected.

The provider is currently TBD.

The final provider must support the required payment flow and provide a secure method for server-side payment verification.

### 12.2 Payment Flow

The proposed flow is:

1. Supplier accepts a booking.
2. Backend creates or prepares a payment record.
3. Customer is directed to the payment process.
4. Payment provider processes the payment.
5. Provider returns a result or sends a callback.
6. Backend verifies the payment.
7. Backend updates payment status.
8. Booking is confirmed according to the payment policy.
9. Customer and supplier receive notifications.

### 12.3 Payment Status

Payment status must be stored separately:

```text
UNPAID
PROCESSING
PAID
FAILED
REFUNDED
PARTIALLY_REFUNDED
```

### 12.4 Payment Security

The backend must:

- Verify payment provider callbacks.
- Validate provider references.
- Prevent duplicate payment processing.
- Avoid trusting frontend payment results.
- Store transaction references.
- Record payment status changes.
- Avoid storing raw card details.

### 12.5 Supplier Settlement

Supplier earnings and settlement must be tracked separately from customer payment.

The system must record:

- Gross customer payment.
- Platform fee, if applicable.
- Refunds, if applicable.
- Supplier net amount.
- Settlement status.
- Settlement reference.

The exact commission and payout process remain pending confirmation.

---

## 13. Real-Time Notifications

### 13.1 Socket.IO

Socket.IO will be used for real-time notification delivery where needed.

It may support:

- New supplier booking requests.
- Booking acceptance.
- Booking rejection.
- Payment updates.
- Booking cancellation.
- Session completion.

### 13.2 Notification Persistence

Notifications must be stored in MongoDB.

Socket.IO provides real-time delivery, but it should not be the only record of a notification.

If a user is offline, the notification must remain available when they return.

### 13.3 Notification Authorization

The backend must ensure that:

- Customers receive their own notifications.
- Suppliers receive notifications related to their supplier account.
- Admin notifications are restricted to authorized administrators.

A user must not be able to subscribe to another user's private notification stream.

---

## 14. File Storage

The platform may need file storage for:

- Supplier logos.
- Station images.
- Terminal images.
- Profile images.
- Verification documents, if required.

Cloudinary is a candidate provider.

The final provider is TBD.

The application should not store large uploaded files directly inside ordinary MongoDB documents.

The database should store file references and metadata.

Uploads must be validated for:

- File type.
- File size.
- Access permissions.
- Ownership.
- Security requirements.

Sensitive verification documents must have restricted access.

---

## 15. API Design

The backend will expose REST-style APIs.

A proposed API structure is:

| API Group | Purpose |
|---|---|
| `/api/auth` | Registration, login, logout, verification |
| `/api/customers` | Customer profile |
| `/api/vehicles` | Vehicle management |
| `/api/suppliers` | Supplier profile |
| `/api/stations` | Station management |
| `/api/terminals` | Terminal management |
| `/api/search` | Terminal discovery |
| `/api/routes` | Route calculation |
| `/api/bookings` | Booking requests and status |
| `/api/payments` | Payment initiation and verification |
| `/api/settlements` | Supplier settlement records |
| `/api/notifications` | Notification management |
| `/api/admin` | Administrative operations |

### 15.1 API Rules

- APIs must validate incoming data.
- Protected endpoints must require authentication.
- Role-specific endpoints must enforce authorization.
- Supplier endpoints must validate ownership.
- Customer endpoints must validate customer ownership.
- Responses must use consistent structures.
- Errors must use appropriate HTTP status codes.
- Sensitive internal information must not be returned.
- API versioning may be introduced if the API evolves significantly.

---

## 16. Recommended Project Structure

The project may use a monorepo with separate frontend and backend applications.

```text
ev-charging-platform/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── public/
│   │   │   ├── customer/
│   │   │   ├── supplier/
│   │   │   └── admin/
│   │   ├── routes/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validations/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── vehicles/
│   │   │   ├── suppliers/
│   │   │   ├── stations/
│   │   │   ├── terminals/
│   │   │   ├── search/
│   │   │   ├── routing/
│   │   │   ├── bookings/
│   │   │   ├── payments/
│   │   │   ├── settlements/
│   │   │   └── notifications/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   └── package.json
│
├── docs/
├── .gitignore
├── README.md
└── package.json
```

This structure is a recommendation, not a mandatory final folder layout.

Each backend module may contain:

```text
module/
├── model.js
├── routes.js
├── controller.js
├── service.js
└── validation.js
```

The exact structure may be simplified for smaller modules.

---

## 17. Environment Configuration

Environment-specific values must not be hardcoded into the source code.

Example configuration values:

```text
NODE_ENV
PORT
MONGODB_URI
JWT_SECRET
JWT_EXPIRES_IN
CLIENT_URL
API_BASE_URL
MAP_TILE_PROVIDER_URL
ROUTING_PROVIDER_URL
PAYMENT_PROVIDER_KEY
PAYMENT_PROVIDER_SECRET
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

These are illustrative names. The final environment configuration will depend on the selected providers.

### 17.1 Environment Rules

- Local development must use a local environment file.
- Environment files containing secrets must not be committed to Git.
- Production secrets must be configured through the hosting provider's secret-management interface.
- Frontend variables must not contain backend secrets.
- Only explicitly public configuration may be exposed to the frontend.

---

## 18. Hosting and Deployment

### 18.1 Frontend Hosting

Vercel is the proposed frontend hosting platform.

It may host the React production build and provide:

- Build and deployment.
- HTTPS.
- Environment configuration.
- Preview deployments.

### 18.2 Backend Hosting

Render or Railway are candidates for backend hosting.

The backend hosting platform must support:

- Node.js.
- Express.js.
- Environment variables.
- HTTPS.
- Persistent network access to MongoDB.
- Socket.IO connections.
- Production logs.

The final provider is pending selection.

### 18.3 Database Hosting

MongoDB Atlas is a suitable candidate for managed MongoDB hosting.

The final deployment must configure:

- Database credentials.
- Network access.
- Backups.
- Database indexes.
- Production environment access.

### 18.4 Deployment Flow

A proposed deployment process is:

1. Developer commits code to Git.
2. Code is pushed to GitHub.
3. Tests and build checks run.
4. Frontend is deployed.
5. Backend is deployed.
6. Production environment variables are configured.
7. Backend connects to the production database.
8. Health checks are performed.
9. Core user flows are tested in the deployed environment.

---

## 19. Testing Stack

### 19.1 Frontend Testing

Vitest may be used for frontend unit testing.

Testing should cover:

- Utility functions.
- Form validation.
- Component behavior.
- Search filters.
- Booking UI state.
- Role-based navigation.

### 19.2 Backend Testing

Supertest may be used to test Express APIs.

Testing should cover:

- Registration.
- Login.
- Authorization.
- Vehicle ownership.
- Supplier ownership.
- Station and terminal operations.
- Booking creation.
- Booking conflicts.
- Payment callback handling.
- Notification access.

### 19.3 Manual API Testing

Postman or an equivalent API client may be used to test:

- API requests.
- Authentication.
- Request validation.
- Error responses.
- Booking workflows.
- Payment integration callbacks.

### 19.4 End-to-End Testing

End-to-end testing may be added to validate complete user journeys:

- Customer registration to booking.
- Supplier registration to station creation.
- Supplier booking acceptance.
- Customer payment.
- Admin management.

---

## 20. Security Requirements

The application must follow these security principles:

- Passwords must be securely hashed.
- Authentication tokens must be protected.
- Authorization must be enforced server-side.
- Users must not access other users' private records.
- Suppliers must not manage other suppliers' resources.
- Admin operations must require admin privileges.
- All inputs must be validated.
- Database queries must avoid unsafe user-controlled construction.
- Sensitive configuration must remain server-side.
- Payment callbacks must be verified.
- Duplicate payment events must be handled safely.
- HTTPS must be used in production.
- Rate limiting must protect sensitive endpoints.
- Audit logs must record important administrative operations.
- Errors must not reveal internal implementation details.

---

## 21. Important Technical Decisions

The following decisions are confirmed:

| Decision | Status |
|---|---|
| React.js frontend | Confirmed |
| Node.js backend runtime | Confirmed |
| Express.js backend framework | Confirmed |
| MongoDB database | Confirmed |
| Mongoose ODM | Confirmed |
| Leaflet map library | Confirmed |
| OpenStreetMap-based map direction | Confirmed |
| Dijkstra's algorithm as shortest-path algorithm | Confirmed |
| Socket.IO for real-time notifications | Confirmed |
| Responsive web application | Confirmed |

The following remain open:

| Decision | Status |
|---|---|
| Payment gateway | Pending |
| Supplier payout provider | Pending |
| Routing service or self-managed road graph | Pending technical validation |
| Map tile provider | Pending |
| Geocoding provider | Pending |
| File storage provider | Pending |
| Email and SMS providers | Pending |
| Exact booking duration rules | Pending |
| Platform commission | Pending |
| Supplier verification process | Pending |

---

## 22. Implementation Order

The recommended development order is:

### Phase 1: Project Foundation

- Initialize frontend.
- Initialize backend.
- Configure MongoDB.
- Configure environment variables.
- Establish API communication.
- Set up Git and GitHub.
- Create shared design tokens and base UI components.

### Phase 2: Authentication and Roles

- Customer registration.
- Supplier registration.
- Login and logout.
- Authentication middleware.
- Role-based authorization.
- Customer and supplier profile setup.

### Phase 3: Supplier Management

- Supplier profile.
- Station registration.
- Station location.
- Terminal registration.
- Terminal specifications.
- Pricing.
- Availability.

### Phase 4: Customer and Vehicle Management

- Customer profile.
- Vehicle registration.
- Vehicle editing.
- Vehicle compatibility data.
- Vehicle selection.

### Phase 5: Discovery and Maps

- Terminal search API.
- Search filters.
- Search result list.
- Leaflet map.
- Station markers.
- Location search.
- Routing integration.
- Dijkstra implementation or integration according to the selected routing design.

### Phase 6: Booking

- Booking request creation.
- Availability validation.
- Supplier booking dashboard.
- Accept and reject actions.
- Booking status management.
- Booking conflict prevention.
- Booking history.

### Phase 7: Payments

- Payment provider selection.
- Payment initiation.
- Server-side payment verification.
- Payment records.
- Booking confirmation.
- Supplier earnings records.
- Settlement workflow.

### Phase 8: Notifications

- Persistent notification records.
- Socket.IO connection.
- Booking notifications.
- Payment notifications.
- Notification read status.

### Phase 9: Administration

- Admin dashboard.
- User management.
- Supplier management.
- Station and terminal management.
- Booking management.
- Payment records.
- Audit logs.

### Phase 10: Testing and Deployment

- Unit testing.
- API testing.
- Booking conflict testing.
- Payment testing.
- Responsive testing.
- Security review.
- Production deployment.
- Post-deployment validation.

---

## 23. Final Technical Definition

The EV Charging Platform will be a mobile-first responsive web application built using the MERN stack.

React.js will provide the user interface. Node.js and Express.js will provide the backend API and business logic. MongoDB will store the platform's data, with Mongoose managing schemas and database access.

Leaflet and OpenStreetMap-based data will support map visualization. Dijkstra's algorithm is the intended shortest-path algorithm, but it requires a road-network graph or suitable routing data source to calculate practical road routes.

Socket.IO will support real-time notifications. A payment gateway suitable for the Pakistan market will be selected before payment implementation.

The platform will support customer, supplier, and super admin roles through a shared application with role-specific interfaces and backend authorization.

The architecture must prioritize secure authentication, accurate booking availability, reliable payment verification, clear data ownership, and maintainable separation between frontend, backend, and database responsibilities.
