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
  - [ ] **Modify `searchHotels()` method in `HomeComponent`:**
    - [ ] Add a check: Only proceed if the destination input field is not empty.
    - [ ] Gather search parameters (destination, dates from `rangeDates`, guests).
    - [ ] **Change navigation:** Navigate to `/hotel-results` (new route) with query parameters instead of `/search`.
  - [x] Add `(click)` binding to the search arrow button.

## Phase 4: Entrance Animations

- [x] Implement Header slide-down animation.
- [x] Implement Home component text/image entrance animations.
- [ ] Refine Continent List entrance animation (currently tied to background observer, might need separate trigger for list content if desired).

## Phase 5: Backend Integration & Other Features

- [ ] Connect search bar to backend API (in `HotelResultsComponent`).
- [ ] Integrate other components (Map, Series, Housewives, About, Contact).
- [ ] Implement authentication.
- [ ] Implement booking flow.

## Phase 6: Hotel Search Results Page

- [x] Generate `HotelResultsComponent`.
- [x] Define a new route `/hotel-results` in `app-routing.module.ts` pointing to `HotelResultsComponent`.
- [x] Implement the basic layout for `HotelResultsComponent`.
- [x] In `HotelResultsComponent`, retrieve search parameters (destination, dates, guests) from the activated route's query parameters.
- [ ] **Create/Update Angular Service:**
  - [ ] Create or locate an existing Angular service (e.g., `HotelService` in `frontend/src/app/services/`) to handle API requests.
  - [ ] Implement a method in the service (e.g., `searchHotels(destination: string)`) that makes a GET request to the backend endpoint `/api/hotels/` with the `?search=` query parameter.
- [ ] **Fetch and Display Data in `HotelResultsComponent`:**
  - [ ] Inject the `HotelService` into `HotelResultsComponent`.
  - [ ] Call the service method using the retrieved `destination` parameter in `ngOnInit`.
  - [ ] Store the returned hotel data in a component property.
  - [ ] Update the template (`hotel-results.component.html`) to display the fetched hotel data (initially simple list, creative display later).
- [ ] Design and implement a creative display for hotel results (e.g., grid, cards, map view).

## Phase 7: Hotel Images Integration

- [x] **Backend Implementation:**
  - [x] **Serializer:** Create `HotelImageSerializer` in `hotel_service/serializers.py`.
    - [x] Inherit from `serializers.ModelSerializer`.
    - [x] Set `model = HotelImage`.
    - [x] Include fields: `id`, `image_high_res`, `image_compressed`, `caption`, `is_primary`.
    - [x] Set `read_only=True`.
  - [x] **Serializer Update:** Modify `HotelSerializer` in `hotel_service/serializers.py`.
    - [x] Add `images = HotelImageSerializer(many=True, read_only=True)`.
    - [x] Add `'images'` to `Meta.fields`.
  - [x] **View Update:** Check `HotelViewSet` in `hotel_service/views.py` to ensure nested image data is included. (Confirmed OK due to DRF defaults/serializer update).
  - [x] **URL Configuration:**
    - [x] Verify `hotel_service/urls.py` (no changes needed).
    - [x] Ensure `roomReserveBackend/urls.py` includes `hotel_service` URLs and serves media files in development (`settings.MEDIA_URL`, `settings.MEDIA_ROOT`).
  - [x] **Settings:** Configure `MEDIA_URL` and `MEDIA_ROOT` in `roomReserveBackend/settings.py`.
  - [x] **Seeding:** Update `seed_data.py` command to create `HotelImage` instances and link image files. (Used separate dirs)
- [x] **Frontend Implementation:**
  - [x] **Model:** Update `hotel.model.ts` to include `images: HotelImage[]`. Define `HotelImage` interface (`image_high_res_url`, `image_compressed_url`, `caption`, `is_primary`).
  - [x] **Service:** Update `hotel.service.ts` to type responses including images and handle image base URLs.
  - [x] **Component Updates:** Modify components to display images:
    - [x] `home.component`: Display featured hotel images.
    - [x] `explore-map.component`: Show primary image in map popups & sidebar.
    - [ ] `continent-list.component`: Display hotel images. (Still uses hardcoded)
    - [x] `hotel-results.component`: Display compressed images in list/cards.
  - [x] **Environment:** Check `environment.ts` files (no changes needed).

## Phase 8: Shared Search Bar

- [x] **Refactor Search Bar into Shared Component:**
  - [x] Generate `shared/search-bar/search-bar.component`.
  - [x] Move search bar HTML from `home.component.html` to `search-bar.component.html`.
  - [x] Move search bar logic (properties, methods) from `home.component.ts` to `search-bar.component.ts`.
  - [x] Define `SearchCriteria` interface.
  - [x] Add `@Input()`s for initial values (destination, dates, guests).
  - [x] Add `@Output() onSearch = new EventEmitter<SearchCriteria>();`.
  - [x] Ensure necessary module imports (`CommonModule`, `FormsModule`, `CalendarModule`, `HoverButtonComponent`).
  - [x] Move relevant CSS from `home.component.css` to `search-bar.component.css`.
- [x] **Integrate Shared Search Bar:**
  - [x] **Home Component:**
    - [x] Replace old search bar HTML with `<app-search-bar (onSearch)="handleSearch($event)"></app-search-bar>`.
    - [x] Remove moved logic/properties from `home.component.ts`.
    - [x] Implement `handleSearch($event)` to navigate to `/hotel-results` with query params.
  - [x] **Hotel Results Component:**
    - [x] Add `<app-search-bar ... [initial...]="..." (onSearch)="handleSearch($event)"></app-search-bar>` to `hotel-results.component.html`.
    - [x] Import `SearchBarComponent` in `hotel-results.component.ts`.
    - [x] Pass current search params to the shared component via `@Input()`s.
    - [x] Implement `handleSearch($event)` to call `fetchHotels()` and update component state/URL params.

## Phase 9: Hotel Detail Page (Initial Implementation)

- [x] **Backend Check:** Ensure `/api/v1/hotels/{id}/` endpoint returns nested `images`, `room_types`, and `amenities`. Update `HotelSerializer` / `HotelViewSet` if necessary. (Serializer updated)
- [x] **Hero Section:**
  - [x] Implement full-width section with primary high-res image background.
  - [x] Display large hotel name and location.
  - [x] Add "Book Now" / "Read More" buttons.
- [x] **Description Section(s):**
  - [x] Implement layout similar to reference image (large quote/intro text).
  - [x] Add alternating text/image blocks using hotel description and non-primary images.
- [x] **Room Types Section:**
  - [x] Design creative layout (e.g., cards) to showcase 2-4 featured room types.
  - [x] Display room image (placeholder/generic for now), name, capacity, description snippet, price.
  - [x] Add "View Details" / "Check Availability" button per room.
  - [x] Include "View All Room Types" link/button.
- [x] **Amenities Section:**
  - [x] Design creative layout (e.g., icon grid, themed groups).
  - [x] Display key amenities with icons and names.
- [x] **Suggested Hotels Section:**
  - [x] Add section title "Other Hotels in [City Name]".
  - [x] Fetch hotels in the same city (using `HotelService.searchHotels`).
  - [x] Display suggestions using the same layout as the hotel results page.

## Phase 10: Room Images & Seeding Enhancements

- [x] **Room Images:**
  - [x] **Backend Model:** Create `RoomImage` model in `hotel_service/models.py` (ForeignKey to `RoomType`, `image_high_res`, `image_compressed`, `caption`, `is_primary`).
  - [x] **Migrations:** Run `makemigrations` and `migrate` for `hotel_service`.
  - [x] **Backend Serializer:** Create `RoomImageSerializer`, update `RoomTypeSerializer` to nest `images`, update `HotelSerializer`'s `get_room_types` method.
  - [x] **Frontend Model:** Update `Room` interface in `room.model.ts` to include `images?: RoomImage[]`, define `RoomImage` interface.
  - [x] **Frontend Detail Page:** Update Room Types section in `hotel-detail.component.html` to display primary room image.
- [x] **Seeding Enhancements (`seed_data.py`):**
  - [x] **Room Images:** Add logic to seed `RoomImage` instances using `seed_hotel_images/room_high_res/` and `seed_hotel_images/room_compressed/` directories.
  - [x] **Amenities:** Expand `amenity_names` list (~25 total), define ~5 essential amenities, update logic to assign 10-15 amenities per hotel (essentials + random).
  - [x] **Cities:** Add more cities (USA, India) to `cities_data` dictionary.

## Phase 11: Detail Page Enhancements & Auth

- [ ] **Hotel Detail Page UI:**
  - [ ] **Creative Amenities:** Redesign the amenities section layout (e.g., grouped lists, icons).
  - [ ] **Checkout Form:** (Moved to Booking Page in Phase 13)
    - [ ] Design and implement a checkout section (half-width alongside amenities?).
    - [ ] Include date range picker, guest selection, price display.
    - [ ] Implement frontend price calculation logic (fetch availability/overrides via `HotelService` if needed).
  - [ ] **Room Image Gallery:**
    - [ ] Generate `shared/image-gallery-overlay/image-gallery-overlay.component`.
    - [ ] Implement overlay display (large image, prev/next, close).
    - [ ] Add logic to `hotel-detail.component.ts` to manage overlay visibility and pass selected room images.
    - [ ] Add click handler to room type image/card in `hotel-detail.component.html` to open the overlay.
- [x] **Authentication:**
  - [x] **Backend Check:** Verify `auth_service` endpoints and data requirements (JWT confirmed).
  - [x] **Frontend Components:** Generate/Update `LoginComponent` and `RegisterComponent` with forms and styling.
  - [x] **Frontend Service:** Ensure `AuthService` has `login`, `register`, `logout`, `isAuthenticated`, etc., methods calling backend APIs (Refresh logic added).
  - [x] **Routing:** Add `/login`, `/register` routes.
  - [x] **Header Integration:** Update `HeaderComponent` to show Login/Register or Account/Logout links conditionally (Includes conditional styling).
  - [x] **Interceptor:** Update `AuthInterceptor` to handle 401s and token refresh.
  - [x] **Persistent Login:** Modify `AuthService.loadInitialAuthState` to attempt token refresh if access token is expired on load.

## Phase 12: Responsiveness

- [x] **Header Component:**
  - [x] Adjust padding (`p-4 md:p-6 lg:p-8`).
  - [x] Hide left branding text/line on small screens (`hidden sm:block`).
  - [x] Adjust center logo/title size and position (`text-3xl sm:text-4xl md:text-5xl`, `top-4 md:top-6 lg:top-8`).
  - [x] Adjust mobile menu overlay padding (`pt-24 sm:pt-28 md:pt-32`, `p-4 md:p-8`).
  - [x] Adjust mobile menu nav width (`sm:w-3/4 md:w-1/2`).
  - [x] Adjust mobile menu bottom-right section size/text (`w-20 sm:w-24 md:w-32`, `text-[10px] sm:text-xs`).
- [x] **Home Page:**
  - [x] Hero section text/image layout adjustments (including md/lg refinement).
  - [x] Search bar reflow (adjusted size, hid options on mobile).
  - [x] Continent list adjustments (adjusted text/SVG size, hid background images).
- [x] **Login/Register/Profile Pages:**
  - [x] Applied responsive text sizes and spacing.
  - [x] Verified centered forms with `max-w-md` (Login/Register) or adjusted layout (Profile).
- [x] **Hotel Results Page:**
  - [x] Adapted results display (stacked list on mobile, row on lg+).
  - [x] Ensured shared search bar is responsive.
- [x] **Hotel Detail Page:**
  - [x] Hero section adjustments (text size, button size, spacing).
  - [x] Image grid responsiveness (simplified on mobile).
  - [x] Room type cards stacking/resizing (already responsive grid, adjusted content).
  - [x] Amenities section layout changes (responsive grid, text size).
  - [x] Checkout form adjustments (responsive spacing).
  - [x] Suggested hotels layout changes (matched results page responsiveness).

## Phase 13: Multi-Room Booking Refactor & Enhancements

- [x] **Backend Refactor (Models & Migrations):**
  - [x] Modify `Booking` model: Remove `room_type` FK, add `special_requests` TextField.
  - [x] Create `BookedRoom` model: FKs to `Booking`, `RoomType`, add `quantity`, `price_at_booking`.
  - [x] Modify `BookingGuest` model: Confirm FK to `Booking` is sufficient.
  - [x] Generate & Apply Migrations.
- [x] **Backend Refactor (Serializers & Views):**
  - [x] Create `BookedRoomSerializer`.
  - [x] Rewrite `BookingSerializer`: Remove `room_type`, add nested `BookedRoomSerializer` (writeable), keep nested `guests` (writeable), add `special_requests`.
  - [x] Implement `BookingSerializer.create`: Handle nested `booked_rooms` & `guests`, perform availability checks (raise `ValidationError`), calculate final `total_price`, create `Booking`, `BookedRoom`, and `BookingGuest` instances.
  - [x] Update `BookingViewSet`: Use new serializer, simplify `perform_create`, implement `confirm_payment` action (POST `/bookings/{id}/confirm_payment/`).
  - [ ] (Optional) Add API endpoint for availability/price checking before booking submission.
- [x] **Frontend Refactor (Booking Page & Service):**
  - [x] Generate `BookingPageComponent` and add route (`/booking/create/:hotelId`).
  - [x] Update `HotelDetailComponent`: Remove checkout form, change room buttons to navigate to booking page.
  - [x] Implement `BookingPageComponent`: Fetch hotel data, build complex form (dates, guests, `FormArray` for rooms, `FormArray` for guest names, special requests), display summary, handle submission.
  - [x] Update `BookingService`: Update payload interface, update `createBooking`, add `getBookingById`, add `confirmPayment`.
- [x] **Frontend Refactor (Payment & Confirmation):**
  - [x] Generate/Update `PaymentComponent`: Add route (`/booking/payment/:id`), fetch booking details, display summary, add dummy form, implement "Confirm Payment" button calling `bookingService.confirmPayment`, navigate to confirmation on success.
  - [ ] Update `ConfirmationComponent`: Fetch confirmed booking details, display multi-room summary.
- [x] **Simulated Payment Flow:** Ensure the flow from booking -> payment page -> confirmation page works, updating booking status via the `confirm_payment` API call.
