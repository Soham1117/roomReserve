import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import {
  ReactiveFormsModule, // Import ReactiveFormsModule
  FormBuilder, // Import FormBuilder
  FormGroup, // Import FormGroup
  Validators, // Import Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.model';
import { PaymentMethod } from '../../models/payment-method.model';
import { UserService } from '../user.service';
import { NotificationService } from '../../services/notification.service'; // Import NotificationService
import { HttpErrorResponse } from '@angular/common/http';
import { HoverButtonComponent } from '../../shared/hover-button/hover-button.component'; // Import HoverButtonComponent

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HoverButtonComponent], // Add HoverButtonComponent
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  // Keep signals for loading/error/success states
  paymentMethods: WritableSignal<PaymentMethod[]> = signal([]);
  isLoadingProfile: WritableSignal<boolean> = signal(false);
  isLoadingPaymentMethods: WritableSignal<boolean> = signal(false);
  profileError: WritableSignal<string | null> = signal(null);
  paymentError: WritableSignal<string | null> = signal(null);
  profileSuccess: WritableSignal<string | null> = signal(null);

  // Reactive Form for Profile
  profileFormGroup: FormGroup;
  // Reactive Form for adding new payment method
  addPaymentMethodForm: FormGroup;

  // Store original user data for comparison/reset
  private originalUser: User | null = null;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private notificationService: NotificationService // Inject NotificationService
  ) {
    // Initialize Profile Form
    this.profileFormGroup = this.fb.group({
      // Define controls matching the editable fields
      // Note: We map backend snake_case to frontend camelCase here for consistency if desired,
      // but the User model uses camelCase, so we align with that.
      // The service layer handles mapping back to snake_case for the API.
      first_name: [''], // Add validators if needed
      last_name: [''],
      phone_number: [''],
      address_line1: [''],
      address_line2: [''], // Optional
      city: [''],
      state: [''],
      postal_code: [''],
      country: [''],
      email: [{ value: '', disabled: true }], // Email is read-only
    });

    // Initialize Add Payment Method Form
    this.addPaymentMethodForm = this.fb.group({
      type: ['Credit Card', Validators.required],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{15,16}$/)]],
      expiryMonth: ['', [Validators.required, Validators.min(1), Validators.max(12)]],
      expiryYear: ['', [Validators.required, Validators.min(new Date().getFullYear())]],
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadPaymentMethods();
  }

  loadUserProfile(): void {
    this.isLoadingProfile.set(true);
    this.profileError.set(null);
    this.profileSuccess.set(null);
    this.userService.getUserProfile().subscribe({
      next: (userData) => {
        this.originalUser = { ...userData }; // Store original data
        // Patch the form with loaded data
        this.profileFormGroup.patchValue({
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone_number: userData.phone_number,
          address_line1: userData.address_line1,
          address_line2: userData.address_line2,
          city: userData.city,
          state: userData.state,
          postal_code: userData.postal_code,
          country: userData.country,
          email: userData.email, // Set email value for display
        });
        this.isLoadingProfile.set(false);
        console.log('User profile loaded and form patched:', userData);
      },
      error: (err: HttpErrorResponse) => {
        this.profileError.set(err.message || 'Failed to load user profile.');
        this.isLoadingProfile.set(false);
        console.error('Error loading profile:', err);
      },
    });
  }

  updateProfile(): void {
    // No longer needs NgForm argument
    this.profileError.set(null);
    this.profileSuccess.set(null);

    if (!this.profileFormGroup.valid) {
      console.log('Profile form is invalid');
      this.profileError.set('Please correct the errors in the form.');
      this.profileFormGroup.markAllAsTouched(); // Mark fields to show errors
      return;
    }

    // Check if the form has actually been changed
    if (!this.profileFormGroup.dirty) {
      this.profileSuccess.set('No changes detected.');
      return;
    }

    // Get potentially updated values from the form
    const formValue = this.profileFormGroup.value;
    const profileUpdateData: Partial<User> = {
      first_name: formValue.first_name,
      last_name: formValue.last_name,
      phone_number: formValue.phone_number,
      address_line1: formValue.address_line1,
      address_line2: formValue.address_line2,
      city: formValue.city,
      state: formValue.state,
      postal_code: formValue.postal_code,
      country: formValue.country,
    };

    this.isLoadingProfile.set(true);
    console.log('Updating profile with:', profileUpdateData);

    this.userService.updateUserProfile(profileUpdateData).subscribe({
      next: (updatedUser) => {
        // Cast updatedUser to 'any' to access potential snake_case properties from API response
        const responseData = updatedUser as any;
        this.originalUser = { ...responseData }; // Update original data reference with the actual response

        // Re-patch form using the correct form control names (camelCase)
        // and mapping from the API response (snake_case)
        this.profileFormGroup.patchValue({
          first_name: responseData.first_name,
          last_name: responseData.last_name,
          phone_number: responseData.phone_number, // Map snake_case from response
          address_line1: responseData.address_line1, // Map snake_case from response
          address_line2: responseData.address_line2, // Map snake_case from response
          city: responseData.city,
          state: responseData.state,
          postal_code: responseData.postal_code, // Map snake_case from response
          country: responseData.country,
          email: responseData.email,
        });
        this.profileFormGroup.markAsPristine();
        this.isLoadingProfile.set(false);
        // Use NotificationService for success message
        this.notificationService.showSuccess('Profile updated successfully!');
        // Clear local success message signal if not needed elsewhere
        this.profileSuccess.set(null);
        console.log('Profile update successful:', updatedUser);
      },
      error: (err: HttpErrorResponse) => {
        const errorMsg = err.message || 'Failed to update profile.';
        this.profileError.set(errorMsg); // Keep local error for form display if needed
        // Use NotificationService for error message
        this.notificationService.showError(errorMsg);
        this.isLoadingProfile.set(false);
        console.error('Error updating profile:', err);
      },
    });
  }

  // Method to reset form to original values using FormGroup's reset
  resetForm(): void {
    if (this.originalUser) {
      // Reset form with original data
      this.profileFormGroup.reset({
        first_name: this.originalUser.first_name,
        last_name: this.originalUser.last_name,
        phone_number: this.originalUser.phone_number,
        address_line1: this.originalUser.address_line1,
        address_line2: this.originalUser.address_line2,
        city: this.originalUser.city,
        state: this.originalUser.state,
        postal_code: this.originalUser.postal_code,
        country: this.originalUser.country,
        email: this.originalUser.email,
      });
    }
    this.profileError.set(null);
    this.profileSuccess.set(null);
  }

  // --- Payment Method Methods (remain the same) ---

  loadPaymentMethods(): void {
    this.isLoadingPaymentMethods.set(true);
    this.paymentError.set(null);
    this.userService.getPaymentMethods().subscribe({
      next: (methods) => {
        this.paymentMethods.set(methods);
        this.isLoadingPaymentMethods.set(false);
        console.log('Payment methods loaded:', methods);
      },
      error: (err) => {
        this.paymentError.set(err.message || 'Failed to load payment methods.');
        this.isLoadingPaymentMethods.set(false);
        console.error('Error loading payment methods:', err);
      },
    });
  }

  addNewPaymentMethod(): void {
    if (!this.addPaymentMethodForm.valid) {
      this.paymentError.set('Please fill in all required payment fields correctly.');
      this.addPaymentMethodForm.markAllAsTouched();
      return;
    }
    this.paymentError.set(null);
    this.isLoadingPaymentMethods.set(true);

    const formData = this.addPaymentMethodForm.value;
    const newMethodData: Omit<PaymentMethod, 'id'> = {
      type: formData.type,
      last4: formData.cardNumber.slice(-4),
      expiryMonth: formData.expiryMonth,
      expiryYear: formData.expiryYear,
    };

    this.userService.addPaymentMethod(newMethodData).subscribe({
      next: (addedMethod) => {
        this.paymentMethods.update((currentMethods) => [...currentMethods, addedMethod]);
        this.isLoadingPaymentMethods.set(false);
        this.addPaymentMethodForm.reset({ type: 'Credit Card' });
        console.log('Payment method added:', addedMethod);
      },
      error: (err) => {
        this.paymentError.set(err.message || 'Failed to add payment method.');
        this.isLoadingPaymentMethods.set(false);
        console.error('Error adding payment method:', err);
      },
    });
  }

  removePaymentMethod(methodId: number | string): void {
    this.paymentError.set(null);
    this.isLoadingPaymentMethods.set(true);
    console.log('Attempting to remove payment method:', methodId);

    this.userService.deletePaymentMethod(methodId).subscribe({
      next: () => {
        this.paymentMethods.update((currentMethods) =>
          currentMethods.filter((pm) => pm.id !== methodId)
        );
        this.isLoadingPaymentMethods.set(false);
        console.log('Payment method removed:', methodId);
      },
      error: (err) => {
        this.paymentError.set(err.message || 'Failed to remove payment method.');
        this.isLoadingPaymentMethods.set(false);
        console.error('Error removing payment method:', err);
      },
    });
  }

  makeDefaultPaymentMethod(methodId: number | string): void {
    this.paymentError.set(null);
    this.isLoadingPaymentMethods.set(true);
    console.log('Attempting to set default payment method:', methodId);

    this.userService.setDefaultPaymentMethod(methodId).subscribe({
      next: () => {
        this.paymentMethods.update((currentMethods) =>
          currentMethods.map((pm) => ({ ...pm, isDefault: pm.id === methodId }))
        );
        this.isLoadingPaymentMethods.set(false);
        console.log('Default payment method set:', methodId);
      },
      error: (err) => {
        this.paymentError.set(err.message || 'Failed to set default payment method.');
        this.isLoadingPaymentMethods.set(false);
        console.error('Error setting default payment method:', err);
      },
    });
  }
}
