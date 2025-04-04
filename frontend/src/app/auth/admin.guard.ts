import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { map, take } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export const adminGuard: CanActivateFn = (
  route,
  state
): Observable<boolean> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated and has the 'admin' role
  return authService.currentUser$.pipe(
    take(1), // Take the current value and complete
    map((user) => {
      // Check if user exists and roles array includes 'admin'
      // Note: This relies on the roles being correctly populated in the User object
      // by AuthService after login/profile fetch.
      const isAdmin =
        !!user && Array.isArray(user.roles) && user.roles.includes('admin');

      if (isAdmin) {
        console.log('AdminGuard: Access granted.');
        return true;
      } else {
        console.log(
          'AdminGuard: Access denied. User is not admin or roles missing.'
        );
        // Redirect to login or an unauthorized page
        router.navigate(['/login']); // Or navigate to an 'unauthorized' component
        return false;
      }
    })
  );
};
