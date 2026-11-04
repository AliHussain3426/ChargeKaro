# 02. Design System and Application Layouts

## 1. Purpose of This Document

This document defines the visual design system, shared interface architecture, and application layouts for the EV Charging Platform.

It establishes how the platform should look, how its interfaces should be organized, how different user roles should navigate the application, and how new pages must follow the existing design.

This is a foundational UI document. It should be consulted before implementing any major page, dashboard, navigation structure, or reusable interface component.

The platform has three primary user roles:

1. **Customer:** Discovers charging stations, checks availability, plans routes, registers vehicles, requests bookings, and manages payments.
2. **Supplier:** Registers and manages charging stations and terminals, handles booking requests, manages availability, and monitors earnings.
3. **Super Admin:** Manages users, suppliers, charging infrastructure, bookings, payments, and overall platform operations.

All three roles belong to the same product and must share one consistent visual identity. However, their application layouts and navigation must reflect their different responsibilities.

### Scope

This document covers:

- Color system and design tokens.
- Typography, spacing, sizing, and visual hierarchy.
- Reusable UI components.
- Public website layout.
- Authentication layout.
- Customer application layout.
- Supplier application layout.
- Super Admin application layout.
- Navigation and page organization.
- Shared component architecture.
- Consistency and implementation rules.

It focuses on the frontend experience and UI architecture. Backend architecture, database schemas, API contracts, and business logic are defined in their respective technical documents.

---

# 2. Core Design Philosophy

The platform should feel like a professional EV infrastructure service rather than a generic startup dashboard.

The interface must communicate:

- Reliability and trust.
- Modern technology.
- Ease of use.
- Energy and sustainability.
- Operational clarity.
- Efficiency and convenience.

The design should be clean, structured, and practical.

The platform will not rely on decorative complexity to appear modern. Its quality should come from good spacing, clear information hierarchy, consistent components, carefully selected colors, and predictable interaction patterns.

### Design principles

**Consistency over experimentation**

Once a design pattern has been established, new pages should reuse it unless there is a genuine functional reason to introduce a different pattern.

**Clarity over decoration**

Important information such as charging availability, booking status, station details, terminal status, and payment amounts must be immediately understandable.

**Functionality over excessive visual effects**

Components should exist to support a user task. Decorative elements must never compete with important information.

**Role-specific functionality with a shared identity**

Customer, Supplier, and Admin interfaces should have different layouts where their workflows require it, but they must still look like parts of the same platform.

**Responsive by default**

Every interface must be designed for mobile screens first and expanded intelligently for tablet and desktop screens.

---

# 3. Official Color System

The following three colors are the foundation of the platform's visual identity. These values are the confirmed project choices and should not be replaced without an explicit design decision.

## 3.1 Primary Colors

| Token | HEX | Purpose |
|---|---|---|
| Primary Brand | `#0B7D68` | Primary actions, active navigation, brand elements |
| Page Background | `#E4F0F0` | Main page and application background |
| Card Surface | `#CCCECF` | Cards, content panels, and dashboard surfaces |

### Primary Brand: `#0B7D68`

This is the main brand color.

Use it for:

- Primary action buttons.
- Active navigation indicators.
- Selected interactive elements.
- Important links.
- Key interface icons.
- Progress indicators where appropriate.
- Map route highlights.
- Brand identity elements.

Use white text or icons on the primary brand color where contrast is sufficient.

The primary color should be visually meaningful. Do not apply it to every icon, heading, border, or decorative element.

Suggested interaction variations:

- Default: `#0B7D68`
- Hover: `#096856`
- Pressed: `#075847`

These are derived interaction shades, not replacements for the official brand color.

### Page Background: `#E4F0F0`

This is the primary application canvas.

Use it for:

- Dashboard page backgrounds.
- Main application content areas.
- Backgrounds behind cards and panels.
- General content sections where separation is needed.

The page background should remain visually calm and should not compete with the content.

### Card Surface: `#CCCECF`

This is the selected replacement for conventional white card surfaces.

Use it for:

- Dashboard cards.
- Information panels.
- Station information containers.
- Booking details.
- Supplier management sections.
- Data presentation panels.
- Modal content surfaces where appropriate.

Do not automatically replace this color with pure white when creating new cards.

Because the card surface and page background have relatively subtle visual separation, use restrained borders and subtle shadows to establish card boundaries. Avoid making cards appear flat or visually merged into the page.

Pure white may still be used selectively for text on primary buttons, icons, or other situations where it has a clear purpose. It is not the default card background.

## 3.2 Supporting Interface Colors

The three official colors establish the identity. The following supporting colors complete the interface system.

These supporting values should be used carefully and consistently.

| Token | Suggested HEX | Usage |
|---|---|---|
| Primary Text | `#18332F` | Headings and important text |
| Secondary Text | `#52635F` | Descriptions and secondary information |
| Muted Text | `#74827F` | Metadata and less prominent labels |
| Border | `#B8C5C2` | Card boundaries, dividers, and field outlines |
| Success | `#25865B` | Successful operations and completed actions |
| Warning | `#B7791F` | Pending actions and attention-required states |
| Danger | `#C44D4D` | Errors, rejected requests, and destructive actions |
| Information | `#3977A3` | Informational messages and neutral notices |

Supporting colors must never compete with the brand color.

In particular, status colors communicate the state of an operation, while the primary brand color communicates the platform's identity and interactive emphasis.

## 3.3 Status Colors

The platform contains operational statuses that users must distinguish quickly.

Use consistent colors and labels throughout all interfaces.

| Status | Color category | Example |
|---|---|---|
| Available | Success | Terminal available for booking |
| Confirmed | Success | Booking accepted |
| Completed | Success | Charging session completed |
| Pending | Warning | Booking awaiting supplier response |
| In Progress | Information | Charging session underway |
| Rejected | Danger | Supplier rejected a request |
| Cancelled | Muted or danger | Booking cancelled |
| Unavailable | Muted or danger | Terminal unavailable |
| Payment Failed | Danger | Transaction unsuccessful |

Never communicate status through color alone.

Every status indicator must include a readable label. An icon may be added when it improves recognition.

---

# 4. Typography System

Typography must prioritize readability, especially for operational information such as charging rates, distances, terminal availability, transaction amounts, and booking details.

## 4.1 Font Family

Recommended primary font:

**Inter**

Use a sensible system-font fallback:

`Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

The font should be loaded consistently throughout the application. Avoid introducing separate fonts for individual dashboards or sections.

## 4.2 Font Weights

| Weight | Usage |
|---|---|
| 400 | Body text and descriptions |
| 500 | Labels, navigation, and secondary emphasis |
| 600 | Section headings and important labels |
| 700 | Main page headings and prominent figures |

Avoid using bold typography everywhere. Font weight should establish hierarchy.

## 4.3 Type Scale

| Element | Suggested size |
|---|---:|
| Main page heading | 28–32px |
| Major section heading | 22–24px |
| Card heading | 18–20px |
| Subsection heading | 16–18px |
| Standard body text | 14–16px |
| Form labels | 14px |
| Metadata and helper text | 12–13px |

The scale may adapt to screen size, but the visual hierarchy must remain consistent.

## 4.4 Typography Rules

- Avoid excessively large dashboard headings.
- Do not use oversized text to fill empty space.
- Maintain sufficient contrast between primary and secondary text.
- Use tabular numerals for values such as prices, distances, counts, and transaction amounts where useful.
- Keep line lengths readable.
- Avoid using multiple font families without a specific reason.

---

# 5. Spacing and Layout System

All pages should follow a shared spacing system.

Do not assign arbitrary margins and padding to every component.

## 5.1 Spacing Scale

Use a consistent base spacing scale:

| Token | Value |
|---|---:|
| XS | 4px |
| SM | 8px |
| MD | 12px |
| BASE | 16px |
| LG | 20px |
| XL | 24px |
| 2XL | 32px |
| 3XL | 40px |
| 4XL | 48px |
| 5XL | 64px |

Use these values as the primary spacing vocabulary.

Not every value must appear on every page. Choose spacing according to content hierarchy.

## 5.2 Application Content Width

The application content should use available screen space efficiently without becoming excessively wide.

Suggested desktop layout:

- Maximum main content width: approximately 1440px.
- Desktop content padding: 24–32px.
- Tablet content padding: 20–24px.
- Mobile content padding: 16px.
- Standard card padding: 20–24px.
- Compact card padding: 16px.

The main content area should not become unnecessarily narrow on desktop or cramped on mobile.

## 5.3 Grid System

Use a flexible grid rather than hardcoding every page layout.

Examples:

- Two-column layout for station discovery.
- Three-column layout for dashboard summaries when appropriate.
- Two-column forms on sufficiently wide screens.
- Full-width tables for administrative management.
- Single-column layouts for mobile screens.

Cards should not be forced into a uniform grid when the content requires a different structure.

---

# 6. Borders, Corners, and Elevation

The platform should use restrained shapes.

Avoid excessive rounded corners and heavy shadows.

## 6.1 Border Radius

| Component | Suggested radius |
|---|---:|
| Small controls | 6–8px |
| Inputs | 8px |
| Buttons | 8–10px |
| Cards | 10–12px |
| Larger panels | 12–14px |
| Dialogs | 12–16px |
| Status badges | Small rounded rectangle |

Pill-shaped elements should be reserved for compact status indicators or specific controls. Do not make every button, card, and container fully rounded.

## 6.2 Borders

Use thin, low-contrast borders to distinguish surfaces.

Borders should be particularly important for:

- Cards placed on the main page background.
- Form inputs.
- Table rows and separators.
- Navigation boundaries.
- Nested content sections.

Do not outline every element unnecessarily.

## 6.3 Shadows

Shadows should be subtle and functional.

Use them to establish elevation for:

- Dropdowns.
- Modals.
- Floating controls.
- Sticky navigation where appropriate.
- Cards that need more separation from the background.

Avoid:

- Large blurred shadows.
- Glowing effects.
- Strong colored shadows.
- Multiple shadow layers.
- Heavy glassmorphism.

---

# 7. Shared UI Component System

All application sections should reuse a common component foundation.

Components should have consistent appearance, behavior, and interaction states.

## 7.1 Buttons

The system should provide four main button variants.

### Primary Button

Used for the most important action on a page.

Examples:

- Find Charging Stations.
- Request Booking.
- Add Station.
- Accept Booking.
- Save Changes.

Appearance:

- Background: `#0B7D68`.
- Foreground: white.
- Clear hover and pressed states.
- Moderate corner radius.
- Consistent height and padding.

A page should generally have one visually dominant primary action in its main action area.

### Secondary Button

Used for important actions that are not the primary action.

Use a neutral surface or outlined appearance.

Examples:

- View Details.
- Edit Station.
- Manage Vehicle.

### Text or Ghost Button

Used for less prominent actions.

Examples:

- Cancel.
- View All.
- Back.
- Close.

### Destructive Button

Used for irreversible or potentially harmful actions.

Examples:

- Delete Station.
- Remove Vehicle.
- Cancel Booking.

Destructive actions must be clearly distinguishable and should require confirmation when appropriate.

## 7.2 Cards

Cards are the primary content containers across dashboards.

Common card types include:

- Summary cards.
- Station cards.
- Terminal cards.
- Booking cards.
- Vehicle cards.
- Earnings cards.
- Information panels.

All cards should follow the same fundamental structure:

1. Optional heading or label.
2. Main information.
3. Supporting information.
4. Optional action area.

Not every card needs all four sections.

Avoid creating large numbers of identical statistical cards just to make a dashboard look populated.

A card should present meaningful information or a useful action.

## 7.3 Forms and Inputs

Forms must follow consistent rules.

- Labels must be visible.
- Placeholders must not replace labels.
- Required fields must be identifiable.
- Validation messages should appear near the relevant input.
- Disabled and read-only states must be visually distinct.
- Inputs must have clear focus states.
- Buttons must communicate submission and loading states.

For long forms, divide fields into meaningful groups.

For example, Supplier Station Registration can contain:

- Station Information.
- Physical Location.
- Operating Information.
- Charging Terminal Information.

Do not put every field into one excessively long, unstructured form.

## 7.4 Tables

Tables should be used where users need to compare or manage structured records.

Typical examples:

- Booking management.
- User management.
- Supplier management.
- Station management.
- Payment records.
- Terminal management.

Tables should support:

- Clear column headings.
- Consistent row spacing.
- Search and filtering where useful.
- Pagination for large datasets.
- Readable status indicators.
- Row-level actions.

On smaller screens, use a responsive presentation such as structured record cards or a carefully designed horizontally scrollable table. Do not simply compress every desktop column until the text becomes unreadable.

## 7.5 Badges and Status Indicators

Badges should be used for meaningful status information.

Examples:

- Available.
- Pending.
- Confirmed.
- Rejected.
- Completed.
- Active.
- Suspended.

Avoid using badges as decoration or applying different colors to unrelated labels.

## 7.6 Icons

Use a single consistent icon library and visual style.

Icons should:

- Be recognizable.
- Have consistent dimensions.
- Use consistent stroke weights.
- Support navigation and interaction.
- Include accessible labels where necessary.

Avoid mixing outline icons, filled icons, emojis, and decorative illustrations randomly.

Text labels should accompany important navigation icons, particularly where icon meaning may be ambiguous.

---

# 8. Application Architecture and Layout Strategy

The platform should be organized into four major interface areas:

1. Public Website.
2. Authentication.
3. Customer Application.
4. Supplier Application.
5. Super Admin Application.

Customer, Supplier, and Admin interfaces should use separate application shells where their navigation and workflows differ.

They should still share the same design tokens, typography, spacing, buttons, inputs, cards, badges, and general visual language.

The same application codebase should support mobile, tablet, and desktop experiences. Different screen sizes must not be treated as separate products.

## 8.1 Public Website Layout

The public website introduces the platform to visitors before they authenticate.

It should have a lightweight navigation structure and a clear path to registration.

### Header

The public header should contain:

- Platform logo.
- Home.
- How It Works.
- Charging Network or Explore Stations.
- For Suppliers.
- Support or Contact.
- Sign In.
- Get Started.

The header should remain clean and should not contain unnecessary navigation links.

The mobile header should provide a compact navigation menu.

### Landing Page Sections

A sensible landing page structure is:

1. Hero section with the platform's core value proposition.
2. Primary entry point to discover charging stations.
3. Explanation of how the platform works.
4. Charging network or station discovery preview.
5. Benefits for customers.
6. Benefits for suppliers.
7. Platform process or service explanation.
8. Frequently asked questions.
9. Footer.

The landing page should not resemble an authenticated dashboard.

### Footer

Include:

- Platform identity.
- Important navigation.
- Customer support information.
- Supplier information.
- Terms and privacy links.
- Relevant contact information.

Keep the footer organized and compact.

---

## 8.2 Authentication Layout

Authentication must support both customers and suppliers.

The registration experience must clearly distinguish the two account types.

### Login

The login page should include:

- Email or supported login identifier.
- Password.
- Password visibility control.
- Forgot password.
- Login action.
- Registration link.

### Registration

The registration entry point should allow users to select:

- Customer Account.
- Supplier Account.

The selected account type determines the next registration flow.

A customer should not be presented with supplier station-management fields. Likewise, supplier-specific registration must not be mixed into the customer registration form.

### Supplier Registration

Supplier registration may require additional organization or service information.

The interface must clearly communicate when supplier verification or approval is required before a supplier can access operational functionality.

### Customer Registration

The customer flow should focus on account creation and basic personal information.

Vehicle registration should be presented as a clear next step in the customer onboarding process or an accessible feature after account creation.

### Authentication Design Rules

- Keep forms focused.
- Avoid unrelated promotional content beside critical forms.
- Show validation errors clearly.
- Indicate successful account creation.
- Provide clear recovery paths.
- Explain account approval or verification states where relevant.

---

# 9. Customer Application Layout

The Customer Application is designed around one primary objective:

**Find a suitable charging station, reach it, and complete a charging booking with minimal friction.**

The interface should prioritize discovery, location, availability, booking, and vehicle information.

## 9.1 Customer Desktop Shell

The desktop customer application should use:

- A persistent left sidebar.
- A main content area.
- A compact top utility area.

### Sidebar Navigation

Recommended structure:

1. Overview.
2. Find Charging Stations.
3. My Bookings.
4. My Vehicles.
5. Payments.
6. Notifications.
7. Profile and Settings.

The sidebar should visually identify the current active page.

The main page content should begin with a consistent page heading and relevant page actions.

### Top Utility Area

The top utility area may contain:

- Notification access.
- User profile menu.
- Account-related actions.

Avoid putting the same navigation options in both the sidebar and top bar without a functional reason.

## 9.2 Customer Mobile Shell

The mobile interface must prioritize the most frequently used actions.

Recommended bottom navigation:

1. Home.
2. Explore.
3. Bookings.
4. Profile.

Vehicles, payments, and additional settings can be accessed through the profile section or contextual navigation.

Do not attempt to fit the entire desktop sidebar into a mobile bottom navigation bar.

## 9.3 Customer Dashboard

The customer overview should provide useful information rather than a collection of decorative statistics.

Suggested sections:

- Welcome and account context.
- Quick action to find charging stations.
- Upcoming or active booking.
- Recent booking activity.
- Registered vehicles.
- Relevant charging recommendations or nearby station information.

The most important action, finding a charging station, should be visually easy to identify.

## 9.4 Charging Station Discovery

This is one of the most important parts of the entire application.

The discovery experience should combine:

- Search.
- Location selection.
- Station list.
- Map.
- Availability.
- Charging information.
- Distance and route information.

On desktop, a map-and-list layout is recommended.

A practical arrangement is:

- Station results on one side.
- Map on the other side.

Station selection should connect the list item and map marker. Selecting a station should reveal its relevant information.

On mobile, use a clear map/list switching pattern or a compact list with access to the map.

### Station Information

A station listing should prioritize:

- Station name.
- Location.
- Distance.
- Availability summary.
- Available terminals.
- Charging-related information.
- Relevant pricing.
- View Details action.

Do not overload each listing with every possible station attribute.

### Route Information

Route-related screens should clearly distinguish:

- Current or selected starting location.
- Destination station.
- Route distance.
- Estimated travel time when available.
- Route alternatives when available.
- Relevant station information.

The map is a functional interface component, not a decorative background.

Route computation should be handled by the routing and mapping logic. The presentation layer should consume the resulting route information rather than embedding graph algorithms inside UI components.

## 9.5 Booking Experience

The booking flow should be structured and easy to follow.

A typical experience:

1. Select a station.
2. Inspect available terminals.
3. Choose the appropriate terminal.
4. Select the requested booking information.
5. Review booking details.
6. Submit the booking request.
7. Receive the supplier's response.
8. Complete the payment process according to the platform's payment rules.

The interface must clearly communicate that a booking request may remain pending until the supplier accepts or rejects it.

### Booking Statuses

Customer-facing booking states should include:

- Pending.
- Confirmed.
- In Progress.
- Completed.
- Rejected.
- Cancelled.

The booking details page should provide the current status, relevant station and terminal information, booking details, and available next actions.

## 9.6 Customer Vehicles

The vehicle management area should allow users to:

- View registered vehicles.
- Add a vehicle.
- Edit vehicle information.
- Remove a vehicle.
- Identify a preferred vehicle where supported.

Vehicle information must be presented clearly because it may affect charging compatibility and the customer's booking experience.

## 9.7 Customer Payments

The payment interface should present:

- Payment amount.
- Relevant booking reference.
- Transaction status.
- Payment date.
- Available transaction details.

Payment status must be clearly differentiated from booking status. A confirmed booking and a successful payment are separate pieces of information.

---

# 10. Supplier Application Layout

The Supplier Application is an operational management interface.

Its main purpose is to help suppliers manage their charging infrastructure, respond to customer booking requests, and monitor business performance.

A supplier may manage multiple stations, and each station may contain multiple charging terminals.

This hierarchy must be reflected throughout the application:

**Supplier → Station → Charging Terminals**

A station and a terminal must never be treated as interchangeable entities in the interface.

## 10.1 Supplier Desktop Shell

The supplier desktop application should use a persistent sidebar and a structured main content area.

### Sidebar Navigation

Recommended structure:

1. Overview.
2. Booking Requests.
3. My Stations.
4. Charging Terminals.
5. Earnings and Payments.
6. Reports.
7. Notifications.
8. Profile and Settings.

Navigation should reflect supplier responsibilities rather than reusing the customer menu.

## 10.2 Supplier Mobile Shell

The supplier mobile experience should prioritize operational tasks.

Recommended bottom navigation:

1. Overview.
2. Bookings.
3. Stations.
4. More.

The More section can contain terminals, earnings, reports, notifications, and settings.

Suppliers must be able to respond to booking requests from a mobile device without navigating through multiple unrelated screens.

## 10.3 Supplier Dashboard

The overview should provide operational information.

Suggested sections:

- Total registered stations.
- Total registered terminals.
- Available terminals.
- Unavailable terminals.
- Pending booking requests.
- Recent booking activity.
- Earnings summary.
- Operational alerts.

Summary values should be meaningful and should link to the corresponding management sections where appropriate.

## 10.4 Station Management

The station management area should allow suppliers to:

- View all registered stations.
- Register a new station.
- Open station details.
- Edit station information.
- Update supported operational information.
- View terminals associated with each station.
- Manage station availability where supported.

### Station Listing

A station card or table entry should display:

- Station name.
- Address or location.
- Station status.
- Number of associated terminals.
- Availability summary.
- Relevant management actions.

The design must support suppliers with one station and suppliers with many stations.

## 10.5 Terminal Management

Terminals belong to individual stations.

The interface must make the station relationship clear when managing a terminal.

A terminal listing should include relevant information such as:

- Terminal identifier or name.
- Parent station.
- Availability.
- Operational status.
- Charging-related specifications.
- Relevant management actions.

The Add Terminal flow should make the supplier select or confirm the parent station.

Do not create a terminal management interface that loses the context of which station a terminal belongs to.

## 10.6 Booking Request Management

This is another critical supplier workflow.

The supplier should be able to:

- View incoming booking requests.
- Inspect booking details.
- Identify the associated customer and vehicle information where permitted.
- See the requested station and terminal.
- Accept a request.
- Reject a request.
- View the current booking status.

Pending requests must be easy to identify.

Accept and Reject actions must be clearly distinguished. Rejecting a request should require an intentional action and may require a reason where the platform's business rules specify one.

## 10.7 Earnings and Reports

The supplier should have access to relevant financial and operational information.

Possible sections:

- Total earnings.
- Completed charging activity.
- Payment history.
- Pending settlements, where supported.
- Relevant reporting periods.
- Station-level performance.

Use tables and structured financial summaries rather than decorative charts without useful context.

---

# 11. Super Admin Application Layout

The Super Admin interface is an internal management environment.

It requires a more information-dense layout than the customer-facing application.

However, it must still use the same platform identity, colors, typography, and shared components.

## 11.1 Admin Desktop Shell

Recommended structure:

- Persistent left sidebar.
- Main content area.
- Compact top utility bar.
- Page heading and action area.
- Structured management content.

### Admin Navigation

1. Overview.
2. Users.
3. Suppliers.
4. Stations.
5. Charging Terminals.
6. Bookings.
7. Payments.
8. Reports and Analytics.
9. Audit Logs.
10. System Settings.

Navigation must reflect actual administrative permissions. A visible link does not automatically grant authorization.

## 11.2 Admin Mobile Shell

The admin interface should remain responsive.

A compact top bar and collapsible navigation drawer are suitable for mobile.

Data-heavy management tasks may use horizontally scrollable tables or structured record views.

Mobile support should not remove essential administrative functionality.

## 11.3 Admin Dashboard

The admin overview should provide a high-level view of platform operations.

Possible sections include:

- Total customers.
- Total suppliers.
- Registered stations.
- Registered terminals.
- Active bookings.
- Pending booking requests.
- Transaction overview.
- Recent operational activity.
- Alerts requiring attention.

Use charts only when they help administrators understand meaningful patterns.

## 11.4 Management Interfaces

The admin should have structured management screens for:

- Customer accounts.
- Supplier accounts.
- Station records.
- Terminal records.
- Booking records.
- Payment records.

Typical capabilities may include searching, filtering, inspecting records, changing supported account or operational states, and viewing relevant history.

Destructive actions must be deliberate and clearly explained.

## 11.5 Audit and Administrative Actions

Administrative operations should be presented carefully.

Where audit logging is supported, relevant records should expose:

- Action performed.
- Actor.
- Affected entity.
- Timestamp.
- Relevant outcome.

Sensitive administrative actions should not be hidden behind ambiguous buttons or poorly explained menus.

---

# 12. Page Structure Standard

Every authenticated application page should follow a recognizable structure.

Recommended pattern:

1. Application shell.
2. Breadcrumbs where useful.
3. Page header.
4. Main page action.
5. Filters or search controls where needed.
6. Primary content.
7. Supporting information.
8. Pagination or additional actions where necessary.

### Page Header

A standard page header should contain:

- Page title.
- Short description where useful.
- Primary page action where relevant.

Example:

**My Stations**

Manage your registered charging locations and their associated terminals.

[Add Station]

The exact arrangement may change depending on screen size, but the same hierarchy should be preserved.

### Content Organization

Content should be grouped by task and meaning.

Avoid:

- Unrelated cards placed together.
- Repeated page headings.
- Excessive empty space.
- Unnecessary nested panels.
- Multiple competing primary actions.
- Repeated information across several sections.

### Detail Pages

Detail pages should present the selected entity clearly.

For example, a station details page should organize:

- Station overview.
- Location information.
- Associated terminals.
- Availability.
- Relevant bookings.
- Management actions.

Use tabs only when multiple substantial categories justify them. Do not create tabs simply to divide a short page into smaller pieces.

---

# 13. Shared Frontend Component Architecture

The UI code should separate shared design components from role-specific features.

The exact folder names may adapt to the selected frontend framework, but the architectural separation should remain.

A conceptual structure:

```text
src/
│
├── components/
│   ├── ui/
│   │   ├── Button
│   │   ├── Input
│   │   ├── Select
│   │   ├── Dialog
│   │   ├── Badge
│   │   ├── Card
│   │   ├── Table
│   │   └── ...
│   │
│   ├── shared/
│   │   ├── PageHeader
│   │   ├── SearchBar
│   │   ├── EmptyState
│   │   ├── LoadingState
│   │   ├── StatusIndicator
│   │   └── ...
│   │
│   └── layout/
│       ├── PublicLayout
│       ├── CustomerLayout
│       ├── SupplierLayout
│       └── AdminLayout
│
├── features/
│   ├── authentication/
│   ├── customers/
│   ├── suppliers/
│   ├── stations/
│   ├── terminals/
│   ├── bookings/
│   ├── vehicles/
│   ├── payments/
│   └── administration/
│
├── pages-or-app-routes/
│   ├── public/
│   ├── customer/
│   ├── supplier/
│   └── admin/
│
├── hooks/
├── services/
├── styles/
│   ├── tokens
│   └── global
│
└── assets/
```

This is a conceptual frontend organization, not a requirement to use these exact folder names.

### Component Separation Rules

**UI components**

Reusable visual building blocks. They should not contain unrelated business logic.

**Shared components**

Common patterns used by multiple features, such as search bars, page headers, empty states, and status indicators.

**Layout components**

Application shells and navigation structures.

**Feature components**

Components that belong to a specific domain, such as booking management, station discovery, or terminal registration.

**Pages**

Compose the relevant layouts and components into complete user-facing screens.

Do not place the entire application inside one large component or duplicate the same button, modal, or status design across different roles.

---

# 14. Shared Data and Visual States

Every important page should account for more than its ideal successful state.

The interface must define consistent behavior for:

## Loading State

Show a suitable loading indicator or skeleton where content is being retrieved.

Avoid leaving an unexplained blank page.

## Empty State

Explain when no records are available and provide a relevant next action.

Examples:

- No vehicles registered yet.
- No charging stations found.
- No pending booking requests.
- No terminals associated with this station.

Where appropriate, provide a useful action such as Add Vehicle, Find Stations, or Add Terminal.

## Error State

Explain that something went wrong and provide a reasonable recovery action.

Do not expose internal exceptions, raw API responses, or technical stack traces to users.

## Disabled State

Disabled actions must have a clear visual state.

The interface should not make an unavailable action appear clickable.

## Success State

Confirm important completed operations.

Examples:

- Station registered successfully.
- Booking request submitted.
- Changes saved.
- Terminal information updated.

## Permission State

Role-specific functionality must be protected.

The frontend should show only the actions relevant to the user's permissions, but frontend visibility is not a security boundary. Backend authorization must independently validate every protected operation.

---

# 15. Maps and Location Components

Maps are central to this product and need their own consistent visual treatment.

The map should integrate naturally into the light interface.

### Map Interface Requirements

- Keep map controls recognizable.
- Avoid excessive custom map decoration.
- Use clear charging station markers.
- Distinguish selected stations from ordinary markers.
- Distinguish the user's starting location from a charging destination.
- Make route information readable.
- Connect map selection with the corresponding station information.
- Provide accessible alternatives to map-only interactions.

### Station Markers

Marker appearance should communicate a meaningful state.

Examples:

- Available charging station.
- Selected charging station.
- Unavailable station.
- Destination marker.
- User location.

Do not rely only on subtle color differences. Use marker shape, icons, labels, or selection outlines where appropriate.

### Map and List Consistency

Selecting a station in the list should highlight the corresponding map marker.

Selecting a marker should expose or highlight the matching station information.

The list and map must remain synchronized.

Map functionality should remain understandable even when the interface changes from desktop to mobile.

---

# 16. Responsive Layout Principles

The platform uses one responsive application, not separate mobile and desktop products.

The following breakpoints are initial implementation guidelines:

| Screen category | Width |
|---|---|
| Small mobile | Below 480px |
| Mobile | 480–639px |
| Tablet | 640–1023px |
| Desktop | 1024–1279px |
| Wide desktop | 1280px and above |

These breakpoints may be refined during implementation according to actual component behavior.

### Desktop

- Persistent side navigation for authenticated applications.
- Multi-column content where useful.
- Larger map-and-list layouts.
- Data tables.
- Wider forms and management panels.

### Tablet

- More compact navigation.
- Reduced grid columns.
- Flexible content widths.
- Carefully adapted map and table layouts.

### Mobile

- Mobile-first navigation patterns.
- Single-column content where appropriate.
- Full-width form controls.
- Readable buttons and touch targets.
- Compact but understandable cards.
- Contextual access to secondary navigation.

Do not simply scale the desktop interface down.

Mobile layouts should reorganize content based on task priority.

Detailed PWA behavior, installation, responsive interaction rules, and device-specific implementation belong in the dedicated responsive design and PWA document.

---

# 17. Navigation and Route Organization

Each authenticated role should have its own route group and application shell.

The exact URLs may change during implementation, but role boundaries must remain explicit.

Suggested conceptual routes:

## Public

```text
/
 /how-it-works
 /charging-network
 /for-suppliers
 /contact
 /login
 /register
 /forgot-password
```

## Customer

```text
/customer/overview
/customer/stations
/customer/stations/:stationId
/customer/bookings
/customer/bookings/:bookingId
/customer/vehicles
/customer/payments
/customer/notifications
/customer/profile
/customer/settings
```

## Supplier

```text
/supplier/overview
/supplier/bookings
/supplier/bookings/:bookingId
/supplier/stations
/supplier/stations/new
/supplier/stations/:stationId
/supplier/terminals
/supplier/terminals/:terminalId
/supplier/earnings
/supplier/reports
/supplier/notifications
/supplier/profile
/supplier/settings
```

## Super Admin

```text
/admin/overview
/admin/users
/admin/suppliers
/admin/stations
/admin/terminals
/admin/bookings
/admin/payments
/admin/reports
/admin/audit-logs
/admin/settings
```

These routes are an organizational proposal. Route naming can be adjusted, but public, customer, supplier, and administrative concerns must remain separated.

### Navigation Rules

- Every authenticated page must use the correct role layout.
- Active navigation must be visually identifiable.
- Navigation labels must describe their destination.
- Avoid duplicate menu items.
- Do not expose role-specific actions to unrelated roles.
- Direct URL access must be protected by authorization.
- Deep links must preserve the correct application shell.

---

# 18. Accessibility and Usability

The interface should be usable by people with different devices, abilities, and levels of technical familiarity.

Minimum expectations:

- Readable text sizes.
- Sufficient text and control contrast.
- Visible keyboard focus.
- Proper input labels.
- Descriptive button names.
- Accessible modal behavior.
- Meaningful alternative text for informative images.
- Status communication that does not depend on color alone.
- Clear validation and error messages.
- Touch-friendly interactive elements.

The official color palette should be used with appropriate foreground combinations.

In particular, white text on the primary brand color has sufficient contrast for normal text under the standard WCAG contrast calculation. The card and page surfaces have more subtle separation, so borders and surface treatment are important.

---

# 19. UI Development and Consistency Rules

These rules are mandatory for future page development.

## Rule 1: Inspect Before Creating

Before developing a new page, inspect the existing application.

Review:

- The current application shell.
- Navigation structure.
- Existing page headers.
- Existing components.
- Spacing and typography.
- Color usage.
- Card and table patterns.
- Responsive behavior.

Do not design a new page in isolation.

## Rule 2: Reuse Established Patterns

Before creating a new component, check whether an existing shared component already performs the required function.

Extend an existing component when appropriate instead of creating a visually different duplicate.

## Rule 3: Preserve the Official Palette

Use the approved brand, background, and card colors.

Do not introduce an entirely new color scheme for a single page.

New semantic colors must be added to the design token system before they become recurring interface elements.

## Rule 4: Preserve Role Separation

Customer, Supplier, and Admin pages must use their correct application shells.

Do not reuse customer navigation in supplier or admin pages simply for implementation convenience.

## Rule 5: Preserve Established Layouts

Every new page must follow the shared page structure and spacing system.

A genuinely different layout is acceptable when the functionality requires it, such as the map-based station discovery experience.

It should still follow the same overall design language.

## Rule 6: Avoid Generic Dashboard Patterns

Do not fill every dashboard with identical statistical cards.

Do not add charts, activity feeds, gradients, illustrations, or panels without a clear functional purpose.

Each section must support a real task or provide useful information.

## Rule 7: Implement Complete UI States

Do not implement only the successful state.

Consider loading, empty, error, disabled, success, and permission states wherever relevant.

## Rule 8: Validate Responsive Behavior

Test new pages on mobile, tablet, and desktop.

Do not consider a page complete merely because it looks correct at one desktop resolution.

## Rule 9: Do Not Introduce Unapproved Design Decisions

Avoid independently changing:

- Primary colors.
- Typography.
- Navigation conventions.
- Application shell structure.
- Standard component shapes.
- Shared spacing values.

Propose significant changes to the design system rather than silently introducing them.

## Rule 10: Do Not Break Existing Pages

When improving a shared component, inspect the pages that already use it.

A visual change to a shared component must not unexpectedly break the layout or behavior of other pages.

---

# 20. Page Completion Checklist

Before considering any new page complete, verify the following.

### Visual consistency

- [ ] Uses the official color palette.
- [ ] Uses the established typography.
- [ ] Follows the spacing system.
- [ ] Uses consistent borders and corner radii.
- [ ] Reuses shared components where possible.
- [ ] Follows the correct role layout.

### Functionality

- [ ] Page content supports the intended user task.
- [ ] Buttons perform their advertised actions.
- [ ] Forms include validation.
- [ ] Relevant loading and empty states exist.
- [ ] Error and success states are handled.
- [ ] Role permissions are respected.

### Responsive behavior

- [ ] Mobile layout is usable.
- [ ] Tablet layout is usable.
- [ ] Desktop layout is usable.
- [ ] Navigation adapts correctly.
- [ ] No unintended horizontal overflow exists.
- [ ] Important actions remain accessible.

### Consistency

- [ ] Existing pages were inspected before implementation.
- [ ] Existing design patterns were preserved.
- [ ] No unnecessary duplicate components were created.
- [ ] No unapproved colors or visual effects were introduced.

---

# 21. Final Design-System Direction

The EV Charging Platform must maintain one coherent design identity across its public website, customer application, supplier application, and Super Admin interface.

The foundational visual direction is:

- Primary brand: `#0B7D68`
- Main background: `#E4F0F0`
- Card and panel surfaces: `#CCCECF`
- Typography: Inter
- Visual style: clean, light, modern, and professional
- Component style: restrained borders, moderate corner radii, subtle elevation
- Application architecture: separate role-specific shells with shared UI components
- Device strategy: one responsive application for mobile, tablet, and desktop

The customer experience must prioritize charging discovery and booking.

The supplier experience must prioritize station management, terminal management, and booking operations.

The Super Admin experience must prioritize platform oversight and operational management.

Every page should feel like a natural part of the same platform.

**The most important implementation principle is consistency: future pages must extend the established design system rather than independently inventing a new one.**