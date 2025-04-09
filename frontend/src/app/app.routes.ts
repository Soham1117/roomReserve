import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { SearchFormComponent } from './search/search-form/search-form.component';
import { HotelDetailComponent } from './hotel/hotel-detail/hotel-detail.component';
import { BookingFormComponent } from './booking/booking-form/booking-form.component';
import { PaymentComponent } from './booking/payment/payment.component';
import { ConfirmationComponent } from './booking/confirmation/confirmation.component';
import { ProfileComponent } from './user/profile/profile.component';
import { BookingsListComponent } from './user/bookings-list/bookings-list.component';
import { HomeComponent } from './home/home.component';
import { HotelResultsComponent } from './hotel-results/hotel-results.component';
import { adminGuard } from './auth/admin.guard';
import { BookingPageComponent } from './booking/booking-page/booking-page.component'; // Import new component

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'search', component: SearchFormComponent },
  { path: 'hotel-results', component: HotelResultsComponent },
  { path: 'hotels/hotels/:id', component: HotelDetailComponent }, // Consider renaming route to 'hotel/:id'
  { path: 'booking', component: BookingFormComponent }, // Might be deprecated
  { path: 'booking/create/:hotelId', component: BookingPageComponent }, // New booking page route
  { path: 'booking/payment/:id', component: PaymentComponent }, // Keep for payment simulation step
  { path: 'booking/confirmation/:id', component: ConfirmationComponent },
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
