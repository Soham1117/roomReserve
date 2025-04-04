# Project Planning

## Phase 1: Initial Setup & Hero Section

- [x] Setup Angular project structure.
- [x] Create HomeComponent.
- [x] Implement basic hero section layout with text and scattered images.
- [x] Implement mouse parallax effect for images.
- [x] Remove scroll zoom effect.
- [x] Add "Explore Map" button with hover effect (extracted to HoverButtonComponent).
- [x] Add elegant search bar structure to HomeComponent.
- [x] Implement guest selection pop-up toggle and basic adult count logic.
- [x] Fix search bar options visibility and guest pop-up interaction.
- [x] Adjust search bar layout (options below input).

## Phase 2: Continent List Component

- [x] Generate ContinentListComponent.
- [x] Implement basic layout (list, background image slots).
- [x] Implement hover effects (text highlight, SVG display, image change).
- [x] Implement fixed background effect using IntersectionObserver.
- [x] Optimize images used.
- [x] Implement character-by-character text reveal on scroll.

## Phase 3: Search Bar Functionality

- [x] **Date Selection (Switched to PrimeNG):**
  - [x] Remove custom date picker component and `date-fns` dependency.
  - [x] Install `primeng` and `primeicons`.
  - [x] Configure PrimeNG `CalendarModule` and theme (`lara-dark-indigo`).
  - [x] Implement `<p-calendar>` in `home.component.html` for range selection.
  - [x] Bind `[(ngModel)]` to `rangeDates` property in `home.component.ts`.
  - [x] Add custom dark theme styling overrides for `p-calendar`.
  - [x] Implement logic to prevent calendar and guest pop-ups opening simultaneously.
- [x] **Guest Selection Refinement:**
  - [x] Add "Children" counter to the guest pop-up.
  - [x] Update `totalGuests` getter to include children.
- [x] **Search Action:**
  - [x] Implement `searchHotels()` method in `HomeComponent`.
  - [x] Gather search parameters (destination, dates from `rangeDates`, guests).
  - [x] Implement navigation to `/search` with query parameters.
  - [x] Add `(click)` binding to the search arrow button.

## Phase 4: Entrance Animations

- [x] Implement Header slide-down animation.
- [x] Implement Home component text/image entrance animations.
- [ ] Refine Continent List entrance animation (currently tied to background observer, might need separate trigger for list content if desired).

## Phase 5: Backend Integration & Other Features

- [ ] Connect search bar to backend API.
- [ ] Implement actual hotel search results page.
- [ ] Integrate other components (Map, Series, Housewives, About, Contact).
- [ ] Implement authentication.
- [ ] Implement booking flow.
