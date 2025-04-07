import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { SearchFormComponent } from './search/search-form/search-form.component';
import { SearchResultsComponent } from './search/search-results/search-results.component';
import { HotelDetailComponent } from './hotel/hotel-detail/hotel-detail.component';
import { BookingFormComponent } from './booking/booking-form/booking-form.component';
import { PaymentComponent } from './booking/payment/payment.component';
import { ConfirmationComponent } from './booking/confirmation/confirmation.component';
import { ProfileComponent } from './user/profile/profile.component';
import { BookingsListComponent } from './user/bookings-list/bookings-list.component';
import { HomeComponent } from './home/home.component';
import { HotelResultsComponent } from './hotel-results/hotel-results.component';
import { adminGuard } from './auth/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'search', component: SearchFormComponent },
  { path: 'hotel-results', component: HotelResultsComponent },
  { path: 'hotels/hotels/:id', component: HotelDetailComponent }, // Consider renaming route to 'hotel/:id'
  { path: 'booking', component: BookingFormComponent }, // Might be deprecated if booking happens on detail page
  { path: 'booking/payment', component: PaymentComponent }, // Might be part of future flow
  { path: 'booking/confirmation/:id', component: ConfirmationComponent }, // Added :id parameter
  { path: 'account/profile', component: ProfileComponent },
  { path: 'account/bookings', component: BookingsListComponent },
  {
    path: 'admin',
    loadComponent: () =>
      import('./admin/admin-dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent
      ),
    canActivate: [adminGuard],
  },

  {
    path: 'explore-map',
    loadComponent: () =>
      import('./explore-map/explore-map.component').then((m) => m.ExploreMapComponent),
  },
];
