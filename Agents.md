# AGENTS.md

# Project AI Development Guidelines

## 1. Purpose

This file provides shared instructions for AI coding agents working on this repository.

The project is developed collaboratively by multiple team members using different AI tools and development environments. Every AI agent must maintain enough shared context so that another developer or AI agent can continue the work without depending on previous conversations.

These instructions are intended to maintain project consistency, preserve important decisions, and keep development progress transparent.

## 2. Understand the Project Before Making Changes

Before starting a development task:

1. Read this file.
2. Read `Project Description/ProjectState.md` if it exists.
3. Read `Project Description/DevLog.md` if it exists.
4. Review the relevant documentation inside `Project Description/`.
5. Inspect the existing code before making changes.

Understand the existing implementation and the purpose of the feature you are modifying.

Do not assume that something is implemented simply because it is mentioned in the documentation. Verify it in the actual codebase.

If the implementation and documentation disagree, investigate the difference and document the verified situation.

## 3. Project Understanding

This project is an EV Charging Platform designed to help users discover charging stations, plan routes, request charging bookings, and manage EV charging infrastructure.

The platform has three primary user roles:

- **Customer:** Can register vehicles, discover charging stations, explore routes, request bookings, and make payments.
- **Supplier:** Can manage stations and charging terminals, receive booking requests, manage charging services, and track earnings.
- **Super Admin:** Can oversee and manage the overall platform through an administrative interface.

A supplier may manage multiple stations, and each station may contain multiple charging terminals.

The application is intended to be a mobile-first, responsive web application with potential Progressive Web App (PWA) capabilities.

The same application should adapt to different screen sizes and user roles:

- Customers will primarily access the platform through smartphones.
- Suppliers should have a responsive interface suitable for mobile and desktop.
- Super Admin will primarily use the platform through a desktop or laptop browser.

Do not treat the project as three completely separate applications. These are different role-based interfaces within the same overall platform unless the team explicitly changes this architectural decision.

## 4. Technology and Architecture Awareness

The currently selected technology direction is the MERN stack:

- MongoDB
- Express.js
- React
- Node.js

Additional technologies and libraries should follow the existing `Project Description/techStack.md` and actual repository implementation.

Do not introduce a new framework, library, database, service, or architectural pattern without first considering the existing stack and project requirements.

If a change in technology or architecture is genuinely beneficial, explain its purpose and implications so the team can make an informed decision.

Keep frontend, backend, database, authentication, and external service responsibilities organized consistently with the existing architecture.

## 5. UI/UX Consistency

Visual consistency is one of the most important requirements of this project.

Every new page, component, section, modal, form, dashboard, and interaction should feel like part of the same product.

Before designing or modifying any UI, review the relevant files inside:

`Project Description/UI Description/`

Pay particular attention to:

- `Visual_Direction.md`
- `UIConsistency.md`
- `SystemDesign&Layout.md`
- `ResponsiveDesign.md`

### Established Visual Direction

The project follows a clean, modern, professional, and elegant visual direction.

Current established colors:

- Primary: `#1E3A8A`
- Card surface: `#E2E8F0`
- Page background: `#F1F5F9`

Preserve these established design decisions unless the team explicitly approves a change.

### UI Consistency Principles

1. Maintain consistent typography, font weights, and text hierarchy.
2. Use consistent spacing, padding, margins, and alignment.
3. Maintain consistent button styles, input fields, borders, shadows, and interaction states.
4. Reuse existing components and design patterns whenever appropriate.
5. Keep navigation structures and sidebar behavior consistent within the same user role.
6. Maintain consistent icon styles and sizing.
7. Use consistent loading, empty, success, and error states.
8. Ensure that responsive layouts behave consistently across different screen sizes.
9. Maintain visual distinction between Customer, Supplier, and Super Admin interfaces while preserving the overall product identity.
10. Avoid introducing unnecessary design variations between pages.

Do not redesign an entire interface simply to implement a small feature.

Avoid generic dashboard designs, excessive cards, unnecessary gradients, neon colors, glowing effects, heavy glassmorphism, and inconsistent border radii.

The interface should remain clean, readable, practical, and professional.

### Responsive Design

Always consider mobile, tablet, and desktop layouts when developing or modifying UI components.

Do not simply shrink a desktop layout to fit a mobile screen.

Consider:

- Mobile navigation and touch interactions.
- Appropriate content hierarchy on smaller screens.
- Responsive tables and data-heavy sections.
- Form usability.
- Image and map responsiveness.
- Appropriate spacing and element sizing.

Customer-facing features should prioritize mobile usability.

Super Admin interfaces may prioritize desktop productivity while remaining responsive.

## 6. Shared Development History

All AI agents and developers must maintain the shared development records.

The primary files are:

- `Project Description/ProjectState.md`
- `Project Description/DevLog.md`

### ProjectState.md

This file represents the current verified state of the project.

Update it whenever meaningful implementation changes affect the project's current state.

Include relevant information such as:

- Implemented features.
- Existing frontend and backend functionality.
- Current architecture and important technical decisions.
- Database models and relationships.
- Authentication and authorization status.
- Completed integrations.
- Known bugs and limitations.
- Incomplete features.
- Current blockers.
- Recommended next development tasks.

Keep it concise, organized, and up to date.

Do not mark a feature as completed unless its implementation has been verified.

### DevLog.md

This file maintains the chronological development history.

After completing a meaningful task or development attempt, append a new entry.

Each entry should contain the following information where applicable:

- Date.
- Developer or AI agent name.
- AI tool/model used, if known.
- Task or objective.
- Summary of work performed.
- Files created, modified, or deleted.
- Important implementation details.
- Technical decisions and reasoning.
- Tests performed and their results.
- Errors, failed approaches, or unresolved issues.
- Git branch and commit reference, if available.
- Suggested next steps.

Use clear headings and chronological entries.

Do not overwrite previous entries. Append new entries so the development history remains intact.

Record meaningful failed attempts too, particularly when they reveal an issue or prevent another developer from repeating an unsuccessful approach.

Avoid logging every trivial action. Focus on changes that another team member or AI agent would need to understand.

## 7. Documentation Maintenance

Documentation should evolve alongside the implementation.

When a development task changes an existing requirement, architecture, workflow, UI decision, or technical choice, update the corresponding documentation.

Keep documentation consistent with the actual implementation.

Do not create duplicate documentation unnecessarily.

If an important decision is changed, document:

- What changed.
- Why it changed.
- Which existing decision it replaces.
- What parts of the project are affected.

Preserve previous development history rather than silently removing important decisions.

## 8. Development Workflow

For each assigned task:

1. Understand the task and inspect relevant existing code.
2. Review the relevant project documentation.
3. Identify how the requested change fits into the existing implementation.
4. Implement the task using the established architecture and conventions.
5. Maintain existing UI and code consistency.
6. Test the relevant functionality.
7. Fix issues introduced by the changes.
8. Update the relevant documentation.
9. Update `ProjectState.md` and append to `DevLog.md` when meaningful progress has occurred.
10. Provide a clear development summary.

Agents are free to choose appropriate implementation approaches as long as they respect the project's established requirements, architecture, and consistency.

## 9. Collaboration and GitHub Synchronization

This repository is shared among multiple developers and AI coding agents.

Therefore:

- Check the current Git status before modifying files.
- Avoid overwriting changes made by another developer.
- Do not discard uncommitted work that does not belong to the current task.
- Keep changes focused and avoid unrelated modifications.
- Use meaningful commit messages when committing.
- Do not claim changes have been pushed unless the push actually succeeded.
- Ensure shared documentation changes are included in the appropriate commits.

Before starting work on another machine, synchronize with the latest repository changes.

Remember that local changes are not visible to teammates until they are committed and pushed to GitHub.

## 10. Final Development Handoff

After completing a task, provide a clear summary containing:

**What was done**
- Explain the implemented functionality or attempted changes.

**Files affected**
- Mention the important files created, modified, or deleted.

**Verification**
- Explain which tests, builds, or checks were performed and their results.

**Current status**
- Mention anything incomplete, broken, or requiring further attention.

**Next steps**
- Suggest the most relevant continuation task.

Ensure the shared project records have been updated before considering the handoff complete.

If work is interrupted, leave the repository and its documentation in the clearest possible state. Record only what was actually completed and verified.

---

## Final Principle

Every developer and AI agent should be able to open this repository, understand what the team is building, identify what has already happened, recognize the current implementation state, and continue development without relying on private conversations or undocumented assumptions.

**The codebase, project documentation, and shared development history should remain the single source of truth for the team's work.**