# 04. Page Creation and UI Consistency Standard

## 1. Purpose of This Document

This document defines the mandatory development standards for creating, modifying, and maintaining frontend pages in the EV Charging Platform.

It establishes how developers and AI coding agents must approach UI implementation.

The platform will contain multiple application areas:

1. Public Website.
2. Authentication.
3. Customer Application.
4. Supplier Application.
5. Super Admin Application.

Although these areas have different responsibilities and layouts, they must maintain one consistent visual identity and follow the same underlying design principles.

This document exists to prevent:

- Inconsistent page designs.
- Duplicate components.
- Unnecessary layout changes.
- Random color and typography choices.
- Different implementations of the same UI element.
- Poor mobile responsiveness.
- Unnecessary code duplication.
- Breaking existing functionality when creating new pages.
- AI-generated interfaces that do not match the established product.

The most important requirement is:

**Never create a new page without first understanding the existing application structure and inspecting the relevant UI patterns.**

A new page should extend the existing platform, not look like an independently designed product.

---

# 2. Mandatory UI Documentation

Before starting a significant frontend task, developers and AI coding agents must consult the relevant documents in the `UI/` directory.

The foundational documents are:

| Document | Responsibility |
|---|---|
| `01_VISUAL_DIRECTION.md` | Defines the overall visual identity and design philosophy |
| `02_DESIGN_SYSTEM_AND_APPLICATION_LAYOUTS.md` | Defines colors, typography, spacing, components, layouts, and role-specific application structures |
| `03_RESPONSIVE_DESIGN_AND_PWA.md` | Defines responsive behavior and PWA requirements |
| `04_PAGE_CREATION_AND_UI_CONSISTENCY_STANDARD.md` | Defines implementation and consistency rules |

These documents are complementary.

An agent must not treat one document as a replacement for the others.

### Documentation Priority

When implementing a page:

1. Follow the visual identity defined in `01_VISUAL_DIRECTION.md`.
2. Follow the approved design system and application layouts in `02_DESIGN_SYSTEM_AND_APPLICATION_LAYOUTS.md`.
3. Follow the responsive and PWA requirements in `03_RESPONSIVE_DESIGN_AND_PWA.md`.
4. Follow the implementation rules in this document.

If an existing implementation appears to contradict the approved design documents, do not automatically reproduce the inconsistency.

Inspect the relevant components and determine whether the existing implementation is intentional or needs correction.

If a significant design decision is unclear, identify the conflict rather than silently introducing another design convention.

---

# 3. The Inspect Before Building Rule

This is the most important implementation rule in this document.

**Before creating or significantly modifying any page, inspect the existing project and identify how similar pages are already implemented.**

AI agents must not immediately start writing components based only on a task description.

They must first understand the surrounding application.

## 3.1 What Must Be Inspected?

Depending on the requested task, inspect the following:

### Existing Application Structure

Understand:

- Frontend framework and project structure.
- Existing route organization.
- Relevant feature directories.
- Shared components.
- Existing layouts.
- Styling and design token implementation.
- State management conventions.
- Existing API integration patterns.

Do not create a new architectural structure without checking whether the project already has an established one.

### Existing Pages

Inspect pages that are:

- Part of the same application area.
- Functionally similar to the requested page.
- Using the same type of content.
- Using similar forms, tables, cards, or navigation.

For example, when creating a supplier station details page, inspect:

- Existing supplier pages.
- The supplier application layout.
- Existing station listing components.
- Existing terminal-related interfaces.
- Shared page headers and management components.

Do not use an unrelated page as the only reference simply because its layout is convenient.

### Existing Components

Identify whether the required components already exist.

Examples:

- PageHeader.
- Button.
- Input.
- Select.
- Card.
- Badge.
- Dialog.
- Table.
- SearchBar.
- Sidebar.
- Navigation menu.
- LoadingState.
- EmptyState.
- ErrorState.

Reuse established components whenever practical.

## 3.2 Inspection Before Implementation

The developer or AI agent should be able to answer these questions before beginning:

1. Which application area does this page belong to?
2. Which application layout should it use?
3. Which existing pages provide useful references?
4. Which shared components can be reused?
5. What design tokens already exist?
6. What responsive behavior is expected?
7. What existing functionality could be affected?
8. Are there existing feature or API conventions that must be followed?

If these questions have not been considered, implementation should not begin.

---

# 4. Existing UI Preservation Rule

Creating a new page must not unintentionally change the appearance or behavior of unrelated pages.

The platform should evolve incrementally.

### Required behavior

- Preserve existing application shells.
- Preserve established navigation structures.
- Reuse existing shared components.
- Maintain existing route conventions.
- Respect the current design tokens.
- Avoid unnecessary global CSS changes.
- Avoid modifying unrelated pages.
- Avoid replacing existing implementations without a valid reason.

### Shared Component Changes

A shared component may be improved when necessary.

However, before modifying it, inspect the pages that already depend on it.

For example, changing the standard Button component may affect:

- Customer booking actions.
- Supplier station management.
- Admin management actions.
- Authentication forms.

A change that improves one page but breaks another is not a successful implementation.

After modifying a shared component, verify its existing usage.

### Do Not Redesign the Entire Application for a Single Page

A request to create a new booking page does not authorize redesigning the customer dashboard.

A request to improve the supplier station screen does not authorize replacing the supplier navigation.

Changes must remain within the requested scope unless a broader change is genuinely required.

---

# 5. Page Creation Workflow

Every new page should follow a repeatable implementation workflow.

## Phase 1: Understand the Requirement

Before coding, identify:

- Page purpose.
- Intended user role.
- Primary user task.
- Required information.
- Required actions.
- Related application pages.
- Expected navigation behavior.
- Responsive requirements.

Do not add functionality that is unrelated to the page's purpose.

Example:

For a supplier booking requests page:

**Purpose:** Allow suppliers to inspect and respond to booking requests.

**Primary tasks:**

- View incoming requests.
- Inspect booking details.
- Accept requests.
- Reject requests.
- View booking statuses.

The design should prioritize these tasks rather than introducing unrelated dashboard metrics.

## Phase 2: Inspect the Existing Application

Inspect relevant files and existing implementations.

Determine:

- Existing layout.
- Available shared components.
- Relevant styles.
- Route structure.
- Existing API services.
- Data and loading patterns.
- Responsive behavior.

Reuse the established project conventions.

## Phase 3: Plan the Page Structure

Determine the logical page organization before implementation.

A standard authenticated page may contain:

1. Application shell.
2. Breadcrumbs, when useful.
3. Page heading.
4. Page description, when useful.
5. Primary action.
6. Search and filter controls, where required.
7. Main content.
8. Secondary content or supporting information.
9. Pagination or contextual actions.

Not every page requires all these sections.

The page structure should reflect the user's task.

## Phase 4: Reuse or Extend Components

Before creating components, identify whether existing shared components already solve the problem.

Choose one of the following:

- Reuse an existing component.
- Extend an existing component with a backward-compatible option.
- Create a feature-specific component.
- Create a new shared component when the functionality is genuinely reusable.

Do not create duplicate components merely to make a page easier to implement.

## Phase 5: Implement the Page

Follow the established design system and project architecture.

Keep responsibilities separated:

- Layout handles application structure.
- Shared UI components handle reusable visual elements.
- Feature components handle domain-specific UI.
- Pages compose the necessary components.
- Services handle API communication according to project conventions.

Do not place the entire page, data handling, and unrelated business logic into one unnecessarily large component.

## Phase 6: Implement All Relevant States

A page is not complete when its ideal data-loaded state looks correct.

Implement the relevant:

- Loading state.
- Empty state.
- Error state.
- Success state.
- Disabled state.
- Permission state.

For interactive operations, provide suitable feedback.

## Phase 7: Validate Responsiveness

Test the page at mobile, tablet, and desktop widths.

Do not assume that a desktop implementation will automatically work on mobile.

Check:

- Navigation.
- Content hierarchy.
- Forms.
- Tables.
- Dialogs.
- Cards.
- Buttons.
- Overflow.
- Touch interactions.

## Phase 8: Check Existing Functionality

Verify that the implementation has not broken:

- Shared layouts.
- Navigation.
- Related pages.
- Reused components.
- Existing user workflows.
- Authentication and role boundaries.

The final result must be integrated into the existing application, not simply work as an isolated visual prototype.

---

# 6. Official Design Tokens and Styling Rules

The platform must use a centralized design system.

Do not repeatedly introduce individual colors, dimensions, and styling values directly into unrelated components.

## 6.1 Official Brand Colors

The confirmed color palette is:

| Token | HEX |
|---|---|
| Primary Brand | `#0B7D68` |
| Page Background | `#E4F0F0` |
| Card Surface | `#CCCECF` |

Supporting colors:

| Token | HEX |
|---|---|
| Primary Text | `#18332F` |
| Secondary Text | `#52635F` |
| Muted Text | `#74827F` |
| Border | `#B8C5C2` |
| Success | `#25865B` |
| Warning | `#B7791F` |
| Danger | `#C44D4D` |
| Information | `#3977A3` |

Use the centralized tokens or shared theme configuration.

Never independently redefine the primary brand color on individual pages.

The card surface `#CCCECF` is intentional. Do not replace it with pure white simply because another dashboard uses white cards.

## 6.2 Typography

Use the established typography system.

Primary font:

**Inter**

Follow the existing font loading and typography configuration.

Do not introduce random fonts or use inconsistent heading sizes.

## 6.3 Spacing

Follow the shared spacing scale.

Use consistent values for:

- Page padding.
- Section spacing.
- Card padding.
- Form gaps.
- Button spacing.
- Navigation spacing.

Avoid arbitrary values when an established spacing token already works.

## 6.4 Borders and Shadows

Use restrained borders and shadows.

Cards must remain visually distinguishable from the background, particularly because the selected card and background colors have relatively subtle contrast.

Do not introduce:

- Glowing borders.
- Excessive shadows.
- Heavy glassmorphism.
- Decorative gradients without a functional purpose.
- Randomly different corner radii.

## 6.5 Centralized Styling

Prefer centralized design tokens through the project's styling system.

For example, a conceptual token configuration:

```css
:root {
  --color-primary: #0B7D68;
  --color-background: #E4F0F0;
  --color-surface: #CCCECF;

  --color-text-primary: #18332F;
  --color-text-secondary: #52635F;
  --color-border: #B8C5C2;

  --color-success: #25865B;
  --color-warning: #B7791F;
  --color-danger: #C44D4D;
  --color-information: #3977A3;
}
```

This is an example of the intended token structure. The actual implementation should follow the project's existing styling conventions.

If the project already uses a theme configuration or CSS variables, extend it rather than creating a competing styling system.

---

# 7. Application Layout Rules

Every authenticated page must use the correct role-specific application layout.

## 7.1 Public Pages

Use the public website layout.

Do not display authenticated dashboard navigation to visitors.

## 7.2 Authentication Pages

Use the established authentication layout.

Customer and supplier registration must remain separate where their requirements differ.

## 7.3 Customer Pages

Use the Customer Application shell.

Expected navigation:

- Overview.
- Find Charging Stations.
- My Bookings.
- My Vehicles.
- Payments.
- Notifications.
- Profile and Settings.

## 7.4 Supplier Pages

Use the Supplier Application shell.

Expected navigation:

- Overview.
- Booking Requests.
- My Stations.
- Charging Terminals.
- Earnings and Payments.
- Reports.
- Notifications.
- Profile and Settings.

## 7.5 Admin Pages

Use the Super Admin shell.

Expected navigation:

- Overview.
- Users.
- Suppliers.
- Stations.
- Charging Terminals.
- Bookings.
- Payments.
- Reports and Analytics.
- Audit Logs.
- System Settings.

### Layout Separation Rule

Do not create separate copies of an entire application shell for every page.

The same role should reuse its established shell throughout its application area.

If the customer application shell changes, the change should be reflected consistently across customer pages.

The same principle applies to supplier and admin interfaces.

---

# 8. Component Reuse Standard

Reusable components must have a consistent appearance and predictable behavior.

## 8.1 When to Reuse

Reuse existing components when:

- Their purpose matches the requested functionality.
- They already follow the design system.
- Their behavior is suitable for the new context.
- They can be extended without introducing unnecessary complexity.

## 8.2 When to Extend

Extend an existing component when a small, reusable variation is required.

Examples:

- A button with a loading state.
- A card with an optional action area.
- A table with selectable rows.
- A badge with an additional status variant.

Prefer explicit component properties over copied implementations.

## 8.3 When to Create a New Component

Create a new component when:

- It represents a genuinely distinct interface pattern.
- It contains reusable domain-specific functionality.
- Existing components cannot reasonably support the requirement.
- It would simplify the page structure.

Do not create a shared component solely because a piece of JSX appears more than once. Consider whether the abstraction makes the code clearer and easier to maintain.

## 8.4 Naming Conventions

Use clear and descriptive component names.

Examples:

- `PageHeader`
- `StationCard`
- `TerminalStatusBadge`
- `BookingRequestCard`
- `VehicleDetails`
- `EmptyState`
- `LoadingState`

Avoid vague names such as:

- `Box1`
- `Section2`
- `NewComponent`
- `CustomCard`
- `TempUI`

A component's name should communicate its purpose.

---

# 9. Role and Feature Boundaries

The application contains different user roles and domain entities.

Their responsibilities must not become mixed during UI development.

## 9.1 Customer

Customer-specific functionality includes:

- Vehicle registration.
- Station discovery.
- Route inspection.
- Booking requests.
- Booking history.
- Payments.
- Customer notifications.

Do not expose supplier operational management features inside the normal customer application.

## 9.2 Supplier

Supplier-specific functionality includes:

- Station registration.
- Station management.
- Terminal management.
- Booking request handling.
- Availability management.
- Earnings and reporting.

The station and terminal relationship must always remain clear.

A supplier may manage multiple stations, and each station may contain multiple charging terminals.

## 9.3 Super Admin

Administrative functionality includes:

- User management.
- Supplier management.
- Station oversight.
- Terminal oversight.
- Booking management.
- Payment oversight.
- Reporting.
- Administrative records and audit logs.

Do not automatically grant administrative actions to customer or supplier interfaces.

## 9.4 Authorization

Frontend role-based navigation is not a security boundary.

Hiding an action in the UI does not make its underlying operation secure.

Backend authorization must independently verify:

- The authenticated user.
- Their role.
- Their permissions.
- Ownership of relevant resources.
- Whether the requested operation is allowed.

The interface should communicate permission restrictions clearly, but the backend must enforce them.

---

# 10. Functional UI Rules

The frontend must represent actual application behavior.

A visually attractive button that does nothing is not a completed feature.

## 10.1 Buttons and Actions

Every interactive control must have a clearly defined behavior.

Examples:

| Action | Expected behavior |
|---|---|
| Add Station | Open the station registration flow |
| View Details | Open the relevant record details |
| Edit | Open an appropriate edit interface |
| Accept Booking | Submit the correct acceptance operation |
| Reject Booking | Submit the correct rejection operation |
| Delete | Execute a protected deletion workflow |
| Search | Perform the intended search |
| Cancel | Close or cancel the relevant operation |

Do not create buttons that imply an operation is available when it has not been implemented.

Where a feature is not yet connected to the backend, clearly distinguish a visual prototype from a functioning operation.

## 10.2 Forms

All forms must provide:

- Proper labels.
- Appropriate input types.
- Required field handling.
- Validation feedback.
- Loading state.
- Submission feedback.
- Error handling.

Validate relevant input on both the frontend and backend.

Frontend validation improves usability but does not replace server-side validation.

## 10.3 Booking Actions

Booking status must accurately reflect server-confirmed state.

For example, submitting a customer booking request does not automatically mean the booking has been accepted by a supplier.

The UI must distinguish:

- Request submitted.
- Pending supplier response.
- Confirmed.
- Rejected.
- Cancelled.
- Completed.

Never update the interface to a confirmed state merely because a user clicked a button.

## 10.4 Payment Actions

Payment status must be based on the authoritative result of the payment workflow.

Do not show a successful payment simply because the user selected a payment method or clicked Pay.

Prevent accidental duplicate submissions and communicate uncertain transaction states appropriately.

## 10.5 Confirmation for Destructive Actions

Actions such as deleting a station, removing a terminal, or cancelling a booking may require a confirmation step.

The confirmation must identify the action clearly.

Avoid generic confirmation messages that do not explain what the user is about to do.

---

# 11. Data Presentation Standards

The platform will handle operational records, financial information, and location data.

These must be presented clearly.

## 11.1 Dashboard Cards

Do not populate dashboards with arbitrary metrics.

A summary card should represent a meaningful value or operational condition.

Examples:

- Pending Booking Requests.
- Available Terminals.
- Registered Stations.
- Completed Bookings.
- Total Earnings.

Where practical, a summary card should provide a useful path to the relevant detailed screen.

## 11.2 Tables

Tables should have:

- Clear column labels.
- Readable row spacing.
- Consistent status presentation.
- Appropriate actions.
- Search and filtering where useful.
- Pagination when necessary.

Do not force tables into mobile screens when a record-card presentation is more appropriate.

## 11.3 Charts

Charts should communicate useful information.

Do not add charts solely to make an admin or supplier dashboard appear sophisticated.

A chart must have:

- A clear title.
- Meaningful labels.
- An understandable scale.
- Relevant data.
- Responsive behavior.
- Appropriate empty and loading states.

## 11.4 Financial Information

Display monetary values consistently.

Use clear labels and currency formatting.

Distinguish:

- Total amount.
- Paid amount.
- Pending amount.
- Refunded amount, where supported.
- Transaction status.

Never confuse booking status with payment status.

## 11.5 Location Information

Station addresses, coordinates, distance, and route information should be presented in a consistent format.

Do not assume that every location record has valid coordinates or that browser location permission is always available.

Provide suitable fallback behavior when map or location data is unavailable.

---

# 12. Responsive Implementation Rules

Every page must follow `03_RESPONSIVE_DESIGN_AND_PWA.md`.

A page is not complete just because it looks good at a desktop resolution.

## 12.1 Required Screen Categories

Test at least the following representative widths:

- 360px.
- 390px.
- 430px.
- 768px.
- 1024px.
- 1280px.
- 1440px and above.

## 12.2 Mobile Rules

- Prioritize the main task.
- Use appropriate mobile navigation.
- Stack content where necessary.
- Preserve readable text.
- Keep buttons touch-friendly.
- Adapt tables and dialogs.
- Avoid horizontal overflow.
- Keep primary actions accessible.

## 12.3 Desktop Rules

- Use available space efficiently.
- Follow the established application shell.
- Maintain appropriate content widths.
- Use multi-column layouts where useful.
- Avoid excessive empty space.
- Do not stretch content unnecessarily.

## 12.4 Tablet Rules

- Adapt navigation.
- Reduce grid columns.
- Reorganize content.
- Preserve important operations.
- Avoid displaying cramped desktop layouts.

## 12.5 Responsive Validation

Do not consider responsiveness complete by resizing the browser once.

Check actual interactions, content wrapping, navigation behavior, scrolling, dialogs, and forms.

---

# 13. UI States and User Feedback

Every significant page and interactive component must handle relevant interface states.

## 13.1 Loading

Display an appropriate loading state while data is being retrieved.

Do not show empty content without explaining that information is still loading.

## 13.2 Empty

When there are no records, explain why the section is empty and provide an appropriate next action.

Examples:

- No vehicles registered yet.
- No charging stations found.
- No booking requests available.
- No terminals registered for this station.

## 13.3 Error

Errors should be understandable and actionable.

Do not expose raw server responses, stack traces, credentials, or internal implementation details.

## 13.4 Success

Provide confirmation after important successful operations.

Examples:

- Station added successfully.
- Booking request submitted.
- Terminal updated.
- Profile saved.

Only display success when the operation has actually succeeded.

## 13.5 Disabled

Disabled controls must look different from interactive controls.

Where necessary, explain why the action is unavailable.

## 13.6 Offline

When connectivity is lost, distinguish cached information from live information.

Never represent an offline booking or payment attempt as successful.

---

# 14. Interaction and Accessibility Standard

The platform must remain understandable and usable without depending exclusively on color, hover, or visual appearance.

Required standards:

- Visible form labels.
- Appropriate text contrast.
- Keyboard focus indicators.
- Accessible button names.
- Descriptive link labels.
- Appropriate alternative text for informative images.
- Clear modal behavior.
- Readable status labels.
- Touch-friendly controls.
- Meaningful validation messages.

Use semantic HTML elements where appropriate.

Interactive controls must behave like the elements users expect them to be.

Do not use clickable generic containers when a proper button or link is more appropriate.

Avoid hover-only functionality.

---

# 15. Code Quality and Frontend Architecture

UI implementation must follow the existing project architecture and conventions.

The precise folder structure and framework APIs should follow the actual project configuration. Do not assume or introduce a new structure without inspection.

## 15.1 Separation of Responsibilities

Keep the following responsibilities organized:

**Pages**

Compose the interface for a route.

**Layouts**

Provide the correct application shell and navigation.

**UI Components**

Provide reusable visual elements.

**Feature Components**

Implement domain-specific interface patterns.

**Hooks and State Logic**

Manage reusable frontend behavior according to the project's conventions.

**Services**

Handle communication with backend APIs.

**Design Tokens**

Provide centralized styling values.

## 15.2 Avoid Oversized Components

Avoid implementing an entire complex page in one component when it can be divided into logical, meaningful units.

For example, a station management page may contain:

- `StationPageHeader`
- `StationFilters`
- `StationList`
- `StationCard`
- `StationEmptyState`

Component extraction should improve clarity, not produce unnecessary fragmentation.

## 15.3 Avoid Duplicate Styling

Do not write separate CSS for an existing shared pattern simply to reproduce it.

Prefer shared component styles and design tokens.

Do not introduce multiple competing styling approaches.

## 15.4 Avoid Unnecessary Dependencies

Before installing a new library, inspect the dependencies already available.

Use existing functionality when it meets the requirement.

Introduce a new dependency only when it provides meaningful value and is compatible with the project.

## 15.5 Maintainable Code

Use:

- Descriptive names.
- Clear component responsibilities.
- Consistent formatting.
- Appropriate error handling.
- Predictable state management.
- Reusable logic where justified.

Avoid:

- Unnecessary abstractions.
- Duplicated code.
- Unexplained hardcoded values.
- Dead code.
- Temporary debugging output.
- Unused dependencies.
- Unintended changes to unrelated features.

---

# 16. AI Coding Agent Instructions

This section is specifically intended for AI coding agents working on the project.

AI agents must treat the existing application as an established product, not an empty canvas.

## 16.1 Before Writing Code

The agent must:

1. Read the relevant UI documentation.
2. Inspect the existing frontend architecture.
3. Identify the requested page's application area.
4. Inspect the corresponding application layout.
5. Find similar existing pages.
6. Identify reusable components.
7. Inspect the existing styling system.
8. Understand the relevant data and API conventions.
9. Determine the required responsive behavior.
10. Identify possible side effects of the requested change.

Do not immediately generate a replacement page based only on the user prompt.

## 16.2 During Implementation

The agent must:

- Follow the official design tokens.
- Reuse existing components.
- Respect role-specific layouts.
- Maintain the existing project architecture.
- Keep page changes within the requested scope.
- Implement real interaction behavior where required.
- Include relevant UI states.
- Follow responsive requirements.
- Avoid unnecessary dependency installation.
- Avoid unrequested redesigns.

## 16.3 Existing UI Is the Reference

When the user requests a new page, inspect the existing pages first.

Use their established patterns as references.

However, do not blindly reproduce an existing mistake.

If a current page violates the approved design system, identify the inconsistency and correct it within the task's scope where appropriate.

## 16.4 Do Not Invent Features

An AI agent must not introduce additional functionality simply because it seems useful.

For example, creating a supplier station page does not automatically authorize:

- A new analytics dashboard.
- Additional supplier roles.
- Unrequested payment features.
- Unrequested station categories.
- New account settings.
- Additional backend entities.

Follow the actual requirements.

## 16.5 Do Not Pretend Functionality Exists

If a backend endpoint, API operation, or integration does not exist, do not create a misleading interface that pretends the operation works.

Clearly identify the missing dependency.

Where a visual prototype is requested, distinguish prototype behavior from production functionality.

## 16.6 Report Material Architectural Conflicts

If a request requires changing an existing application shell, shared design token, or foundational component, identify the impact.

Do not silently make broad architectural changes while implementing a page-specific task.

## 16.7 Completion Summary

After completing the task, provide a concise implementation summary containing:

- Pages or components created.
- Existing components reused.
- Relevant files modified.
- Functional behavior implemented.
- Responsive behavior addressed.
- Tests or validation performed.
- Known limitations or incomplete integrations.

Only claim that something was tested if it was actually tested.

---

# 17. Change Management and Design-System Updates

The design system may evolve as the application develops.

However, changes must be intentional.

## 17.1 Shared Design Changes

Changes to shared elements may affect multiple pages.

Examples:

- Primary color changes.
- Card surface changes.
- Typography changes.
- Sidebar changes.
- Global spacing changes.
- Shared button redesigns.

Review their impact across public, customer, supplier, and admin interfaces.

## 17.2 New Component Variants

When introducing a new shared component variant:

- Give it a meaningful name.
- Define its intended use.
- Follow the existing token system.
- Ensure it works across relevant screen sizes.
- Avoid duplicating an existing variant.
- Verify it does not break existing usage.

## 17.3 Design Documentation Updates

If the approved design direction changes:

1. Identify the affected document.
2. Update the relevant rule.
3. Ensure other UI documents do not contradict it.
4. Update the shared implementation.
5. Review affected pages.

Do not let the implementation and documentation gradually develop different design systems.

---

# 18. Testing and Validation Requirements

Every page implementation must be validated before it is considered complete.

## 18.1 Visual Validation

Verify:

- Correct brand colors.
- Correct page background.
- Correct card surface.
- Typography hierarchy.
- Spacing.
- Borders.
- Component consistency.
- Application layout.
- Responsive organization.

## 18.2 Functional Validation

Verify:

- Navigation works.
- Links open the correct pages.
- Buttons perform their intended actions.
- Forms validate correctly.
- Search works as intended.
- Filters work as intended.
- Dialogs open and close properly.
- Relevant state changes are displayed.
- Error and success feedback are appropriate.

## 18.3 Role Validation

Verify that:

- Customer pages use the customer layout.
- Supplier pages use the supplier layout.
- Admin pages use the admin layout.
- Role-specific navigation is correct.
- Unauthorized actions are not presented as valid operations.
- Backend authorization remains responsible for enforcing access.

## 18.4 Responsive Validation

Verify representative mobile, tablet, and desktop widths.

Check for:

- Horizontal overflow.
- Overlapping components.
- Misaligned content.
- Unusable navigation.
- Unreadable tables.
- Inaccessible buttons.
- Dialog overflow.
- Form usability.

## 18.5 Regression Validation

After modifying existing shared components, verify the relevant pages that depend on them.

At minimum, inspect the affected application area.

For broad shared changes, inspect all affected application areas.

---

# 19. Definition of Done

A new or modified page is considered complete only when all relevant requirements below have been satisfied.

### Documentation and Inspection

- [ ] Relevant UI documents were consulted.
- [ ] Existing application architecture was inspected.
- [ ] Similar pages were reviewed.
- [ ] Existing shared components were identified.
- [ ] The correct role and application layout were determined.

### Design Consistency

- [ ] Official colors were used.
- [ ] Typography follows the established system.
- [ ] Spacing follows the design tokens.
- [ ] Card surfaces and boundaries are consistent.
- [ ] Existing design patterns were preserved.
- [ ] No unnecessary decorative effects were introduced.

### Architecture

- [ ] Correct application shell is used.
- [ ] Existing shared components were reused where appropriate.
- [ ] Component responsibilities are clear.
- [ ] No unnecessary duplication was introduced.
- [ ] No unrelated features were changed.

### Functionality

- [ ] Required actions work.
- [ ] Forms have appropriate validation.
- [ ] API communication follows project conventions.
- [ ] Loading states are handled.
- [ ] Empty states are handled.
- [ ] Error and success feedback are correct.
- [ ] Permissions are respected.
- [ ] Booking and payment states are accurate.

### Responsiveness

- [ ] Mobile layout is usable.
- [ ] Tablet layout is usable.
- [ ] Desktop layout is usable.
- [ ] Navigation adapts correctly.
- [ ] No unintended horizontal overflow exists.
- [ ] Important actions remain accessible.

### Validation

- [ ] Relevant functionality was tested.
- [ ] Responsive behavior was checked.
- [ ] Shared component regressions were considered.
- [ ] Known limitations were documented.
- [ ] Completion summary accurately describes the work.

---

# 20. Final Implementation Principle

The EV Charging Platform should be developed as one coherent product.

Every page must follow the established visual identity, application architecture, and responsive design strategy.

Developers and AI coding agents must inspect existing implementations before creating new ones, reuse established patterns, preserve unrelated functionality, and validate the results across relevant devices and user roles.

The three most important rules are:

**1. Inspect before building.** Understand the existing application before making changes.

**2. Extend rather than duplicate.** Reuse the design system, layouts, and established components.

**3. Maintain consistency.** Every new page must feel like it belongs to the same platform.

These rules apply to every future page, feature, dashboard, and interface modification.