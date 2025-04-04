-- Table for notification types
CREATE TABLE notification_types (
    type_code VARCHAR(50) PRIMARY KEY,
    description TEXT
);

INSERT INTO notification_types (type_code, description) VALUES
('BOOKING_CONFIRMATION', 'Email confirmation for a successful booking'),
('BOOKING_CANCELLATION', 'Email confirmation for a cancelled booking'),
('PAYMENT_SUCCESS', 'Email notification for successful payment'),
('PAYMENT_FAILURE', 'Email notification for failed payment'),
('BOOKING_REMINDER', 'Reminder email before check-in');

-- Table for notification log
CREATE TABLE notification_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id), -- User who received the notification
    booking_id INTEGER REFERENCES bookings(id), -- Related booking (optional)
    notification_type VARCHAR(50) REFERENCES notification_types(type_code),
    channel VARCHAR(20) NOT NULL, -- e.g., 'EMAIL', 'SMS'
    recipient VARCHAR(255) NOT NULL, -- e.g., email address, phone number
    subject VARCHAR(255), -- For email notifications
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL, -- e.g., 'SENT', 'FAILED', 'PENDING'
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Note: Assumes 'users' and 'bookings' tables exist. Dependency management needed.
