# 03. Responsive Design and PWA Strategy

## 1. Purpose of This Document

This document defines the responsive design strategy and Progressive Web App (PWA) behavior for the EV Charging Platform.

The platform will be developed as **one responsive web application** that works across mobile phones, tablets, laptops, and desktop computers.

It must not be developed as separate mobile and desktop applications.

The same application, frontend architecture, backend services, authentication system, and business logic should serve all supported screen sizes. The interface should reorganize itself according to the device and available screen space.

The PWA layer will provide supported app-like capabilities, such as installation, standalone launching, application icons, and selected offline functionality.

This document defines:

- Responsive design principles.
- Screen sizes and layout behavior.
- Desktop, tablet, and mobile adaptation.
- Navigation adaptation.
- Role-specific responsive behavior.
- Map and location responsiveness.
- Forms, tables, cards, and dialogs on small screens.
- PWA architecture and installation.
- Service worker responsibilities.
- Offline behavior.
- Connectivity and synchronization.
- Notifications and permissions.
- Performance and testing requirements.

The visual identity and shared components are established in `01_VISUAL_DIRECTION.md` and `02_DESIGN_SYSTEM_AND_APPLICATION_LAYOUTS.md`. This document builds upon those foundations.

---

# 2. Core Architecture Decision

## 2.1 One Application, Multiple Screen Experiences

The platform will use one responsive application.

The interface will adapt to the available viewport rather than redirecting users to a separate mobile application.

For example:

- A customer using a desktop computer will see a sidebar and a wider station discovery layout.
- The same customer using a phone will see compact navigation and a mobile-oriented station discovery experience.
- A supplier using a tablet will see a compact operational interface.
- An administrator using a desktop will see a more information-dense management interface.

These are different responsive presentations of the same application.

### What remains shared?

The following should remain consistent across device sizes:

- Application identity.
- Brand colors.
- Typography.
- Authentication.
- User roles and permissions.
- Business rules.
- Database records.
- API communication.
- Core feature functionality.
- Shared UI component library.

### What may change?

The following may change according to available space:

- Navigation arrangement.
- Number of columns.
- Sidebar visibility.
- Card arrangement.
- Table presentation.
- Map and list arrangement.
- Form layout.
- Dialog presentation.
- Placement of secondary actions.
- Amount of information displayed simultaneously.

The mobile interface should not be treated as a compressed desktop interface. It should be deliberately reorganized for smaller screens.

---

# 3. Responsive Design Philosophy

The responsive experience must be practical and task-oriented.

The objective is not simply to make every page fit a smaller screen. It is to preserve the important functionality and make it comfortable to use on different devices.

## 3.1 Mobile-First Development

Every page should be designed with mobile constraints in mind.

Start by identifying:

1. The primary task of the page.
2. The information a user needs immediately.
3. The most important action.
4. The secondary information.
5. The functionality that requires a larger screen.

Once the mobile experience is clear, expand the layout for tablet and desktop.

This approach prevents desktop assumptions from dominating the interface.

## 3.2 Content Priority

Not every piece of information has equal importance.

On smaller devices:

- Display primary information first.
- Keep essential actions accessible.
- Move secondary information into expandable sections where appropriate.
- Avoid unnecessary decorative elements.
- Preserve meaningful labels.
- Avoid hiding critical functionality simply because the screen is small.

For example, a station listing on mobile should prioritize its name, distance, availability, and a way to inspect its details. Less important metadata can appear on the details screen.

## 3.3 Touch-Friendly Interaction

The application must be comfortable to operate with touch input.

Interactive elements should have appropriately sized touch targets.

Guidelines:

- Aim for approximately 44–48px minimum control dimensions where practical.
- Provide spacing between neighboring buttons.
- Avoid tightly packed icon-only controls.
- Do not rely on hover interactions.
- Provide clear pressed and focus states.
- Keep important mobile actions within comfortable reach.

Hover states may enhance desktop interaction, but must never be the only way to access information or perform an action.

---

# 4. Responsive Breakpoints

The initial responsive breakpoint system follows the design-system document.

| Screen category | Width |
|---|---|
| Small mobile | Below 480px |
| Mobile | 480–639px |
| Tablet | 640–1023px |
| Desktop | 1024–1279px |
| Wide desktop | 1280px and above |

These are initial design breakpoints, not rigid device categories.

A device's available viewport may differ from its physical display dimensions. Layout decisions must respond to the actual available content width.

Use responsive layout techniques such as:

- CSS Grid.
- Flexbox.
- Fluid widths.
- Maximum content widths.
- Responsive padding.
- Flexible columns.
- Appropriate media queries.
- Component-level adaptation where necessary.

Avoid designing around specific phone models or individual resolutions.

## 4.1 Small Mobile: Below 480px

This category includes narrow phone screens.

Design expectations:

- Single-column content.
- Compact top navigation.
- Mobile bottom navigation where appropriate.
- Full-width primary actions when useful.
- Compact but readable cards.
- Minimal horizontal padding.
- Forms organized vertically.
- No unnecessary side-by-side content.
- Avoid horizontal page overflow.

The most important task should be immediately accessible.

## 4.2 Mobile: 480–639px

This category provides slightly more horizontal space.

Design expectations:

- Maintain mobile navigation.
- Use flexible card layouts.
- Allow limited two-column arrangements only when content remains readable.
- Keep forms primarily single-column.
- Maintain touch-friendly controls.
- Use compact map and list interactions.

## 4.3 Tablet: 640–1023px

Tablet layouts should sit between mobile simplicity and desktop information density.

Design expectations:

- Sidebar may become a collapsible drawer.
- Bottom navigation may be replaced by a more suitable compact navigation arrangement.
- Use two-column layouts where they genuinely improve usability.
- Allow wider forms.
- Adapt map and list views to the available width.
- Keep operational information easy to inspect.

Do not simply display the full desktop sidebar at a width where it leaves insufficient content space.

## 4.4 Desktop: 1024–1279px

Design expectations:

- Persistent sidebar where appropriate.
- Main content area with flexible width.
- Multi-column dashboard sections.
- Wider data tables.
- Map and station-list layouts.
- Side-by-side form sections where appropriate.

The sidebar should not consume excessive horizontal space.

## 4.5 Wide Desktop: 1280px and Above

Design expectations:

- Use the available space efficiently.
- Maintain a maximum content width where appropriate.
- Support wider map and list layouts.
- Use richer administrative tables.
- Allow structured multi-column content.
- Avoid stretching text and form fields excessively.

Large displays should improve information visibility, not simply increase empty space.

---

# 5. Responsive Application Shells

The platform has separate application shells for public visitors, customers, suppliers, and administrators.

Each shell must adapt according to screen size.

## 5.1 Public Website

### Desktop

Use a conventional horizontal header with:

- Logo.
- Main navigation.
- Supplier entry point.
- Login.
- Registration or primary call to action.

The public landing page may use larger content sections and multi-column layouts.

### Mobile

Use:

- Compact header.
- Menu trigger for secondary navigation.
- Clearly visible sign-in or registration access.
- Single-column content sections.
- Readable hero content.
- Responsive illustrations and images.
- Full-width or prominent calls to action where appropriate.

The mobile landing page must not force visitors to scroll through unnecessarily large decorative sections before reaching useful information.

---

## 5.2 Authentication

Authentication must remain straightforward on every screen.

### Desktop

A centered form or a balanced split layout may be used.

### Mobile

Use a focused single-column form.

Rules:

- Inputs should use available width.
- Labels must remain visible.
- Buttons should be comfortably touchable.
- Avoid unnecessary side panels.
- Keep error messages near the relevant field.
- Ensure the form remains usable when the software keyboard opens.
- Do not allow fixed elements to cover the submit button or active input.

Account-type selection must remain clear on mobile.

Customer and Supplier registration should continue to use their separate workflows.

---

# 6. Customer Application Responsiveness

The customer experience must prioritize station discovery, bookings, and vehicle access.

## 6.1 Customer Desktop

Recommended layout:

- Persistent left sidebar.
- Compact top utility area.
- Main content area.
- Multi-column dashboard sections where useful.

Navigation:

1. Overview.
2. Find Charging Stations.
3. My Bookings.
4. My Vehicles.
5. Payments.
6. Notifications.
7. Profile and Settings.

The station discovery experience should have enough room for a map and a list of station results.

## 6.2 Customer Tablet

Recommended adaptation:

- Sidebar becomes collapsible or drawer-based where space is limited.
- Station list and map use flexible proportions.
- Dashboard grids reduce their column count.
- Information panels may stack.
- Booking details remain readable.

The map must not become so small that users cannot inspect station locations or route information properly.

## 6.3 Customer Mobile

Recommended bottom navigation:

1. Home.
2. Explore.
3. Bookings.
4. Profile.

Additional features, including vehicles and payments, can remain within the profile area or an appropriate secondary navigation structure.

Do not place every customer feature inside the bottom navigation.

### Mobile Customer Dashboard

Prioritize:

1. Welcome information.
2. Find Charging Stations action.
3. Upcoming or active booking.
4. Recent activity.
5. Registered vehicle information.

Avoid a large collection of low-priority summary cards.

### Mobile Station Discovery

The station discovery page is one of the most important responsive experiences.

A mobile user must be able to:

- Search for a location.
- View nearby charging stations.
- Inspect station availability.
- Open station details.
- View relevant terminal information.
- Inspect route information.
- Start a booking.

Recommended interface:

- Compact search area.
- Map/list switching control or an equivalent mobile map-and-list interaction.
- Station result cards.
- Accessible selected-station details.
- Clearly visible booking action.

A full-width map may occupy most of the screen when the user is exploring locations. However, station details and actions must remain accessible.

A practical mobile pattern is to show the map with a compact, expandable station result panel.

The panel should not permanently obstruct important map controls.

### Mobile Booking

Booking should use a focused, sequential interface.

Avoid placing the entire booking process inside a cramped multi-column layout.

Recommended experience:

1. Station confirmation.
2. Terminal selection.
3. Booking information.
4. Review.
5. Submit request.
6. Confirmation and booking status.

Each step should show enough context that users know what they are booking.

### Mobile Vehicle Management

Vehicle cards should display essential vehicle information.

Actions such as editing and removal should remain accessible through a clear action menu or details page.

### Mobile Payments

Display important transaction details in a vertical layout.

A transaction card should include:

- Booking reference.
- Amount.
- Transaction status.
- Date.
- Details action where available.

Do not compress a desktop payment table into tiny unreadable columns.

---

# 7. Supplier Application Responsiveness

Supplier operations must remain accessible on smaller devices because booking requests and terminal availability may require timely attention.

## 7.1 Supplier Desktop

Recommended sidebar:

1. Overview.
2. Booking Requests.
3. My Stations.
4. Charging Terminals.
5. Earnings and Payments.
6. Reports.
7. Notifications.
8. Profile and Settings.

The supplier dashboard should support structured operational information and station management.

## 7.2 Supplier Tablet

Adapt the interface using:

- Collapsible navigation.
- Reduced grid columns.
- Responsive station listings.
- Flexible booking detail layouts.
- More compact management tables.

The station-to-terminal relationship must remain clear.

Do not remove the parent station context when viewing a terminal on a tablet.

## 7.3 Supplier Mobile

Recommended bottom navigation:

1. Overview.
2. Bookings.
3. Stations.
4. More.

The More section may contain:

- Terminals.
- Earnings.
- Reports.
- Notifications.
- Profile and Settings.

### Mobile Supplier Dashboard

Prioritize:

- Pending booking requests.
- Station availability summary.
- Important operational alerts.
- Recent activity.
- Earnings summary.

Pending booking requests should be easy to find.

### Mobile Booking Requests

This is an operationally critical mobile workflow.

A request card should display:

- Booking reference.
- Relevant customer information.
- Requested station.
- Terminal.
- Requested booking details.
- Current status.
- Available actions.

Accept and Reject actions must be clear and sufficiently separated to reduce accidental interaction.

For complex booking details, open a dedicated details screen or a well-structured full-screen panel rather than compressing everything into the card.

### Mobile Station Management

A supplier must be able to:

- View registered stations.
- Inspect a station.
- Register a station.
- Edit station information.
- View associated terminals.

The station details screen should clearly indicate how many terminals belong to the station.

### Mobile Terminal Management

Terminal management should retain the parent station context.

When registering or editing a terminal, the selected station must be visible.

Do not make terminal registration confusing by using an isolated form without explaining which station the terminal belongs to.

### Mobile Earnings and Reports

Prioritize important financial values and recent transaction history.

Detailed analytics may use a simplified mobile presentation.

Do not hide essential payment information simply because a user is on a smaller screen.

---

# 8. Super Admin Responsiveness

The Super Admin interface can be more information-dense than the customer and supplier interfaces, but it must remain usable across devices.

## 8.1 Desktop

Recommended:

- Persistent admin sidebar.
- Compact top bar.
- Data tables.
- Search and filter controls.
- Structured detail pages.
- Charts where useful.

Desktop is the primary environment for complex management and oversight tasks.

## 8.2 Tablet

Recommended:

- Collapsible sidebar.
- Reduced table columns where appropriate.
- Filters placed in a compact control area.
- Responsive record details.
- Structured content panels.

## 8.3 Mobile

Recommended:

- Compact header.
- Navigation drawer.
- Priority-based record presentation.
- Search and filters that are easy to access.
- Structured record cards when tables become impractical.

Essential administrative operations should not disappear on mobile.

However, particularly sensitive or complex administrative actions may require additional confirmation or a more deliberate interface.

---

# 9. Responsive Component Standards

All shared components must behave appropriately across screen sizes.

## 9.1 Cards

Desktop:

- Cards may appear in flexible multi-column grids.
- Content may use side-by-side sections.

Mobile:

- Cards should generally stack vertically.
- Important information must remain prominent.
- Actions should be easy to reach.
- Avoid excessively tall cards caused by unnecessary padding.

## 9.2 Buttons

Desktop:

- Buttons can appear beside page headings or within action groups.

Mobile:

- Use full-width buttons when they improve usability.
- Keep primary actions visible.
- Avoid overly narrow action buttons.
- Separate destructive actions from primary actions.

Do not make every mobile button full width automatically. Context should determine the layout.

## 9.3 Forms

Desktop:

- Related inputs may be placed side by side.
- Longer forms may use logical columns.

Mobile:

- Use one column for most forms.
- Maintain visible labels.
- Ensure dropdowns are usable.
- Keep validation messages visible.
- Place the main submit action where it remains accessible.

## 9.4 Tables

Tables are particularly challenging on mobile.

Do not allow important data to become unreadable through aggressive column compression.

Use one of three approaches according to the data:

**Responsive record cards**

Convert records into structured cards when users primarily need to inspect individual entries.

**Horizontal scrolling**

Use when comparing structured columns is important and preserving the table layout is valuable.

**Priority columns**

Display the most important columns and provide access to secondary details on a record screen.

The correct presentation depends on the data and user task.

## 9.5 Dialogs and Drawers

Desktop:

- Use appropriately sized dialogs for focused interactions.

Mobile:

- Use full-screen dialogs or bottom sheets where they provide a better experience.
- Avoid small centered dialogs with cramped forms.
- Ensure close and submit controls remain accessible.
- Prevent background content from interfering with interaction.

## 9.6 Dropdowns and Menus

Menus must not extend beyond the viewport.

Their placement must adapt to available space.

Ensure touch users can select options easily.

Do not make essential application navigation available only through a hover-triggered dropdown.

---

# 10. Responsive Maps and Location Experience

Location discovery is a major part of the platform, so map responsiveness must be designed deliberately.

## 10.1 Desktop Map

Use a side-by-side map and station listing arrangement.

The map should have enough space for:

- Station markers.
- Route visualization.
- Zoom and location controls.
- Selected station information.

The station list should remain independently usable.

## 10.2 Tablet Map

Use flexible dimensions.

Depending on available width, the list and map may remain side by side or transition to separate views.

Do not force the desktop layout into a narrow tablet screen.

## 10.3 Mobile Map

Recommended controls:

- Search location.
- Current location where permission is granted.
- Map/list switching.
- Station markers.
- Selected station information.
- Route visibility.
- Access to booking details.

The map should support touch interaction.

Do not rely on hover for station information.

The map must not prevent users from reaching station results or booking actions.

## 10.4 Location Permissions

Location access must be requested only when relevant to the user's task.

For example, a customer opening station discovery may be offered the option to use their current location.

The interface must explain why location permission is useful.

Users must still be able to search by manually selecting or entering a location if they decline permission.

Do not assume that location access will always be available.

---

# 11. PWA Strategy

## 11.1 What the PWA Provides

A Progressive Web App allows the responsive web application to provide selected app-like capabilities through supported browsers and operating systems.

For this platform, the PWA layer should provide:

- Installability where supported.
- Application icon.
- Standalone launch mode.
- Application name and theme metadata.
- Service worker functionality.
- Selected offline support.
- Cached static assets.
- Controlled update behavior.

The PWA must use the same frontend application and backend services as the browser version.

It is not a separate mobile application.

## 11.2 PWA Installation

Users should be able to install the platform from supported browsers.

Installation presentation depends on the browser and operating system.

Where a native installation prompt is not available, the platform may provide contextual instructions explaining how to add the application to the home screen.

Do not show an install prompt repeatedly or interrupt users while they are performing important tasks.

The application should remain fully accessible through the browser even when the user does not install it.

## 11.3 Standalone Mode

When launched in installed standalone mode and supported by the platform:

- The application opens in its own application window.
- Normal browser navigation controls may not be visible.
- The application should provide its own navigation.
- Page transitions should remain predictable.
- The interface should respect mobile safe areas.
- Dialogs and navigation must account for the standalone viewport.

Standalone mode should not create a different application layout from the responsive browser experience.

## 11.4 PWA Manifest

The application should define a web app manifest containing appropriate metadata.

Conceptual example:

```json
{
  "name": "EV Charging Platform",
  "short_name": "EV Platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#E4F0F0",
  "theme_color": "#0B7D68",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

The actual application name, icon assets, and routing strategy must be finalized during implementation.

The theme and background colors should remain consistent with the approved design system.

The manifest is configuration metadata. It does not independently implement offline support.

---

# 12. Service Worker Strategy

A service worker provides a controlled mechanism for caching selected resources and supporting certain offline experiences.

It must be implemented carefully because the platform handles dynamic operational data.

## 12.1 Static Asset Caching

Appropriate static resources may include:

- Application shell assets.
- Compiled JavaScript and CSS.
- Fonts where licensing permits local caching.
- Application icons.
- Static illustrations.
- Other versioned assets.

These resources may be cached to improve application loading and provide a basic offline shell.

## 12.2 Dynamic Data Caching

Dynamic information requires more caution.

Examples:

- Station availability.
- Booking records.
- Terminal status.
- Payment information.
- Supplier earnings.
- User account details.

Do not treat cached operational data as automatically current.

If cached information is displayed, it must be clearly identifiable as potentially outdated.

Sensitive information must not be indiscriminately stored in browser caches.

## 12.3 Cache Strategy

Choose caching behavior according to the type of resource.

| Resource | Suggested strategy |
|---|---|
| Versioned static assets | Cache-first |
| Application shell | Cache-first with controlled updates |
| Public informational content | Network-first or stale-while-revalidate |
| Station search results | Network-first with careful caching where useful |
| Station availability | Network-first |
| Booking operations | Network-only or explicitly controlled network interaction |
| Payment operations | Network-only |
| Authentication and sensitive data | Avoid generic caching |

These are design guidelines. The implementation must consider the actual API architecture and security requirements.

## 12.4 Service Worker Updates

When a new application version is available:

- Detect the update.
- Avoid interrupting an active critical operation.
- Inform the user when an update requires a reload.
- Activate the new version through a controlled update process.
- Prevent old application assets from being mixed with new application assets.

An update must not silently corrupt an active user workflow.

---

# 13. Offline Functionality

The platform must be honest about what can and cannot work without internet connectivity.

Charging station discovery, real-time availability, booking acceptance, and payment operations depend on backend services and current information.

They must not be presented as successful when the application is offline.

## 13.1 Features That May Work Offline

Depending on implementation and previously available data:

- Opening the cached application shell.
- Loading static pages.
- Viewing limited previously loaded information.
- Accessing cached help or support content.
- Viewing selected non-sensitive local preferences.

Cached records must be marked as potentially outdated.

## 13.2 Features That Require Connectivity

The following should require a working connection:

- Searching for live charging availability.
- Retrieving current station information.
- Submitting a booking request.
- Accepting or rejecting a booking.
- Confirming terminal availability.
- Processing a payment.
- Retrieving updated earnings.
- Performing administrative changes.
- Synchronizing account data.

A successful-looking UI must never substitute for an actual server-confirmed operation.

## 13.3 Offline User Experience

When connectivity is unavailable:

- Display a clear offline indicator.
- Explain which functionality is unavailable.
- Preserve appropriate form input where safe.
- Avoid claiming a booking was submitted.
- Avoid claiming payment was successful.
- Provide a retry action when connectivity returns.

For example:

**You're offline**

Some platform information may be outdated. Reconnect to view current station availability and perform booking operations.

The user should always understand whether information is live, cached, or unavailable.

---

# 14. Connectivity and Data Synchronization

The application should recover gracefully when connectivity changes.

## 14.1 Connection State

The interface should distinguish between:

- Online and operational.
- Offline.
- Reconnecting.
- Request in progress.
- Request failed.

Do not rely exclusively on the browser's online indicator to determine whether the backend is reachable. Actual API requests can still fail even when the browser reports network connectivity.

## 14.2 Failed Operations

When an operation fails:

- Show a clear error.
- Preserve form input where appropriate.
- Avoid duplicate submissions.
- Allow a controlled retry.
- Verify the server state before repeating an operation where duplicate processing is possible.

This is particularly important for bookings and payments.

## 14.3 Booking Requests

A booking should only be marked as submitted after the backend confirms that the request has been accepted for processing.

An offline attempt must remain an unsent or failed action, not a confirmed booking.

Do not automatically submit potentially outdated booking information without renewed user awareness and validation.

## 14.4 Payment Operations

Never queue payment requests for silent execution when connectivity returns.

Payment processing must follow the backend's transaction and verification workflow.

The frontend should display a confirmed payment result only after receiving authoritative confirmation from the server or payment integration.

---

# 15. Notifications and Permissions

Notifications can improve the user experience, particularly for suppliers who receive booking requests.

However, notification behavior varies by browser, operating system, permission settings, and installation method.

## 15.1 Notification Types

Potential notification events:

### Customer

- Booking accepted.
- Booking rejected.
- Booking status changed.
- Payment status changed.
- Relevant account notifications.

### Supplier

- New booking request.
- Booking cancelled.
- Important station or terminal issue.
- Relevant account or payment notifications.

### Admin

- Important operational alerts.
- Supplier verification requests.
- Relevant platform management notifications.

The actual notification events must correspond to backend business events.

## 15.2 Notification Permissions

Do not request notification permission immediately when the user visits the website.

Instead:

1. Explain the value of notifications.
2. Provide an appropriate opt-in action.
3. Request permission at a relevant point.
4. Respect a user's decision.

## 15.3 Push Notifications

Web Push may be implemented where supported.

The push architecture must include:

- User permission.
- Subscription registration.
- Secure server-side subscription handling.
- Notification event processing.
- Appropriate delivery handling.
- Subscription cleanup when invalid or removed.

Push notifications must not contain unnecessarily sensitive details.

## 15.4 In-App Notifications

The application should provide an in-app notification area regardless of whether browser push notifications are available.

This ensures users can inspect relevant updates even when push permissions are denied.

Notifications should link to their relevant application pages wherever possible.

---

# 16. Performance and Loading Strategy

The responsive application must load efficiently on mobile networks as well as desktop connections.

The platform may be used in areas with varying internet quality, so loading performance matters.

## 16.1 General Performance Rules

- Avoid unnecessarily large assets.
- Use optimized images.
- Lazy-load non-critical content where appropriate.
- Split large feature bundles where beneficial.
- Avoid loading every dashboard feature immediately.
- Reduce unnecessary component rendering.
- Keep map libraries and data requests appropriately scoped.
- Avoid excessive animations.
- Use caching selectively and safely.

## 16.2 Map Performance

Maps can be resource-intensive.

The application should:

- Load maps when the relevant feature is opened.
- Avoid initializing multiple unnecessary map instances.
- Limit unnecessary marker rendering.
- Request only relevant station information.
- Use clustering or other appropriate marker management for dense locations.
- Provide a usable station list independently of the map.

## 16.3 Loading Feedback

Users should receive useful feedback while data loads.

Use:

- Skeletons for structured content.
- Compact progress indicators for small operations.
- Clear loading states for submissions.
- Retry controls for failed data requests.

Do not use animations that make ordinary operations feel slower.

---

# 17. Mobile Device and Browser Considerations

The platform must account for differences in supported features across browsers and operating systems.

Test relevant behavior on:

- Android mobile browsers.
- iOS Safari.
- Desktop Chrome.
- Desktop Edge.
- Other browsers considered important for the project's users.

Do not assume every PWA feature behaves identically across these environments.

### Safe Areas

Account for safe-area insets when using fixed or sticky elements on mobile devices.

For example:

- Bottom navigation.
- Sticky action bars.
- Floating controls.
- Full-screen dialogs.

Important buttons must not be hidden behind device interface areas.

### Software Keyboard

Forms must respond appropriately when a mobile keyboard opens.

Avoid fixed-height form containers that make the active field or submit action inaccessible.

### Screen Rotation

The application should remain usable in both portrait and landscape orientations where appropriate.

The map experience may benefit from landscape orientation, but it must not require users to rotate their phones to complete essential tasks.

### Browser Differences

Gracefully handle unavailable APIs and features.

A missing push notification capability must not prevent users from receiving in-app notifications.

An unavailable installation prompt must not prevent users from accessing the application through their browser.

---

# 18. Security and Privacy Considerations

PWA capabilities must not weaken the platform's security.

Important rules:

- Use HTTPS in production.
- Apply secure authentication practices.
- Enforce backend authorization.
- Protect sensitive API operations.
- Avoid storing passwords or authentication secrets in inappropriate browser storage.
- Do not indiscriminately cache private responses.
- Review service worker caching rules.
- Validate user input on the server.
- Protect payment and booking operations against duplicate or unauthorized requests.
- Clear appropriate local user data on logout.

Service workers must be scoped carefully and must not intercept or cache sensitive operations unintentionally.

The fact that the application can run in standalone mode does not change the application's security requirements.

---

# 19. PWA Installation and User Experience

The platform should introduce installation as a convenience rather than a requirement.

### First-Time Visit

The user can access the platform normally through a browser.

### Installation Opportunity

At an appropriate moment, the platform may offer an installation suggestion.

For example, after a customer has successfully registered or used station discovery.

### Installed Experience

The application opens in standalone mode where supported.

It retains the same account, role, and core navigation structure.

### Returning User

The user can reopen the application through the installed icon or normal browser access.

The platform should provide a consistent experience across both launch methods.

### Important Rule

Never block access to an essential feature because the user has not installed the PWA.

Installation is optional.

---

# 20. Responsive Testing Strategy

Every major feature must be tested across the defined screen categories.

Testing should focus on actual task completion, not only appearance.

## 20.1 Screen Testing

Test at representative widths:

- 360px.
- 390px.
- 430px.
- 768px.
- 1024px.
- 1280px.
- 1440px and above.

These are representative viewport sizes, not exclusive supported resolutions.

## 20.2 Public Website Testing

Verify:

- Header navigation.
- Mobile menu.
- Landing page sections.
- Registration entry points.
- Footer organization.
- Form usability.

## 20.3 Customer Testing

Verify:

- Dashboard layout.
- Station search.
- Map and list interaction.
- Station details.
- Booking workflow.
- Vehicle management.
- Payment information.
- Notifications.

## 20.4 Supplier Testing

Verify:

- Booking request visibility.
- Accept and Reject actions.
- Station registration.
- Terminal management.
- Station-to-terminal relationships.
- Earnings information.
- Navigation across mobile and desktop.

## 20.5 Admin Testing

Verify:

- Management tables.
- Filtering and search.
- Record details.
- Administrative actions.
- Confirmation dialogs.
- Mobile record access.
- Navigation and authorization.

## 20.6 PWA Testing

Verify:

- Manifest configuration.
- Application icons.
- Installability where supported.
- Standalone launch.
- Service worker registration.
- Static asset caching.
- Application updates.
- Offline shell.
- Offline messaging.
- Network recovery.
- Data synchronization behavior.
- Notification permissions where supported.

---

# 21. Responsive and PWA Completion Checklist

A page or feature should not be considered complete until its relevant checks pass.

### Responsive Design

- [ ] Mobile layout is deliberately organized.
- [ ] Tablet layout is usable.
- [ ] Desktop layout is usable.
- [ ] Navigation adapts correctly.
- [ ] Content priority is appropriate.
- [ ] Buttons and controls are touch-friendly.
- [ ] Forms remain accessible when the mobile keyboard opens.
- [ ] Tables have an appropriate small-screen presentation.
- [ ] Dialogs adapt to small screens.
- [ ] There is no unintended horizontal overflow.
- [ ] Important actions remain accessible.

### Customer Experience

- [ ] Station discovery works on mobile.
- [ ] Map/list interaction remains usable.
- [ ] Booking actions are accessible.
- [ ] Booking states are clear.
- [ ] Vehicle and payment information remain readable.

### Supplier Experience

- [ ] Booking requests are accessible on mobile.
- [ ] Accept and Reject actions are clear.
- [ ] Station management remains usable.
- [ ] Terminal relationships remain visible.
- [ ] Important operational information is accessible.

### Admin Experience

- [ ] Management screens adapt appropriately.
- [ ] Records remain readable on smaller screens.
- [ ] Important administrative actions remain accessible.
- [ ] Sensitive operations require appropriate safeguards.

### PWA

- [ ] Manifest is configured.
- [ ] Application icons are provided.
- [ ] Installation works where supported.
- [ ] Standalone mode is usable.
- [ ] Service worker is registered correctly.
- [ ] Static asset caching is controlled.
- [ ] Sensitive dynamic information is not cached indiscriminately.
- [ ] Offline limitations are communicated.
- [ ] Booking and payment operations are never falsely presented as successful.
- [ ] Application updates are handled safely.

---

# 22. Final Responsive and PWA Direction

The EV Charging Platform will be a single responsive web application with optional PWA capabilities.

It will support desktop, tablet, and mobile interfaces through responsive layouts rather than separate applications.

The experience must preserve the approved design system:

- Primary brand: `#0B7D68`
- Page background: `#E4F0F0`
- Card surface: `#CCCECF`
- Consistent typography and component styles.
- Shared role-independent UI foundations.
- Separate customer, supplier, and admin application shells.

The mobile experience must prioritize essential workflows.

For customers, the focus is station discovery and booking.

For suppliers, the focus is booking requests, station management, and terminal operations.

For administrators, the focus is platform management and operational visibility.

The PWA layer should enhance accessibility and convenience through installation, standalone launching, selected caching, and supported notifications.

However, the platform must never compromise the accuracy of live operational information or the integrity of booking and payment operations in order to appear offline-capable.

**The central principle is that users should receive a consistent platform experience on every device, with the interface adapting to their screen and the application never pretending that an offline operation has succeeded.**