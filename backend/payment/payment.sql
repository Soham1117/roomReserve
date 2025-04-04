-- Table for payment status enumeration
CREATE TABLE payment_statuses (
    status_code VARCHAR(20) PRIMARY KEY,
    description TEXT
);

INSERT INTO payment_statuses (status_code, description) VALUES
('PENDING', 'Payment initiated'),
('SUCCESSFUL', 'Payment completed successfully'),
('FAILED', 'Payment failed'),
('REFUNDED', 'Payment refunded');

-- Table for payment transactions
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) NOT NULL, -- Link to the booking
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    payment_method VARCHAR(50), -- e.g., 'Credit Card', 'PayPal' (simulated)
    transaction_id VARCHAR(100) UNIQUE, -- Simulated transaction ID
    status VARCHAR(20) REFERENCES payment_statuses(status_code) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Note: Assumes 'bookings' table exists from booking.sql.
-- Dependency management is crucial.
