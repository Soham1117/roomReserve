-- Placeholder for Admin Service Schema
-- This service provides administrative functionalities.
-- It might require tables for specific admin configurations, audit logs, etc.
-- However, much of its functionality will involve interacting with data
-- managed by other microservices (Users, Hotels, Bookings).

-- Example (Future): Audit log for admin actions
/*
CREATE TABLE admin_action_log (
    id SERIAL PRIMARY KEY,
    admin_user_id INTEGER REFERENCES users(id), -- Assuming admins are also users with specific roles
    action_type VARCHAR(100) NOT NULL, -- e.g., 'UPDATE_HOTEL', 'CANCEL_BOOKING', 'DISABLE_USER'
    target_entity_type VARCHAR(50), -- e.g., 'Hotel', 'Booking', 'User'
    target_entity_id INTEGER,
    details JSONB, -- Details about the action performed
    action_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
*/

-- No tables needed for initial setup.
