// Represents a simulated payment method stored for a user

export interface PaymentMethod {
  id: number | string; // Use string if using temporary IDs before backend save
  type: 'Credit Card' | 'PayPal' | 'Debit Card'; // Example types
  last4: string; // Last 4 digits
  expiryMonth?: number; // Optional for cards
  expiryYear?: number; // Optional for cards
  isDefault?: boolean; // Optional flag
  // Add other relevant simulated fields if needed
  // e.g., cardholderName, billingAddressId etc.
}
