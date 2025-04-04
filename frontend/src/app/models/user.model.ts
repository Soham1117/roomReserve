export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string; // From user_profiles
  last_name?: string; // From user_profiles
  phone_number?: string; // From user_profiles, renamed from phone
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  roles?: string[]; // e.g., ['user', 'admin']
  createdAt?: Date | string; // Use Date object or ISO string
  updatedAt?: Date | string;
  // Preferences could be a separate interface if needed
  // preferredLanguage?: string;
  // newsletterSubscribed?: boolean;
}
