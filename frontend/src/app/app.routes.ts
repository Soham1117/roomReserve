import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { SearchFormComponent } from './search/search-form/search-form.component'; // Import SearchFormComponent
import { SearchResultsComponent } from './search/search-results/search-results.component'; // Import SearchResultsComponent
import { HotelDetailComponent } from './hotel/hotel-detail/hotel-detail.component'; // Import HotelDetailComponent
import { BookingFormComponent } from './booking/booking-form/booking-form.component'; // Import BookingFormComponent
import { PaymentComponent } from './booking/payment/payment.component'; // Import PaymentComponent
import { ConfirmationComponent } from './booking/confirmation/confirmation.component'; // Import ConfirmationComponent
import { ProfileComponent } from './user/profile/profile.component'; // Import ProfileComponent
import { BookingsListComponent } from './user/bookings-list/bookings-list.component';
import { HomeComponent } from './home/home.component';
import { adminGuard } from './auth/admin.guard'; // Import the admin guard

export const routes: Routes = [
  { path: '', component: HomeComponent }, // Default route for homepage
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'search', component: SearchFormComponent }, // Search form page
  { path: 'search/results', component: SearchResultsComponent }, // Search results page
  { path: 'hotel/:id', component: HotelDetailComponent }, // Hotel details page with ID parameter
  { path: 'booking', component: BookingFormComponent }, // Booking form page
  { path: 'booking/payment', component: PaymentComponent }, // Payment simulation page
  { path: 'booking/confirmation', component: ConfirmationComponent }, // Booking confirmation page
  { path: 'account/profile', component: ProfileComponent },
  { path: 'account/bookings', component: BookingsListComponent },
  // Admin Route
  {
    path: 'admin',
    loadComponent: () =>
      import('./admin/admin-dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent
      ),
    canActivate: [adminGuard], // Protect this route
  },
  // Explore Map Route
  {
    path: 'explore-map',
    loadComponent: () =>
      import('./explore-map/explore-map.component').then(
        (m) => m.ExploreMapComponent
      ),
    // Add guards if needed, e.g., canActivate: [AuthGuard]
  },
  // Add other routes here later, e.g., a default route
  // { path: '', redirectTo: '/home', pathMatch: 'full' },
  // { path: '**', component: PageNotFoundComponent } // Wildcard route
];
