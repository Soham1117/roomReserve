-- Table for booking status enumeration (optional, but good practice)
CREATE TABLE booking_statuses (
    status_code VARCHAR(20) PRIMARY KEY,
    description TEXT
);

INSERT INTO booking_statuses (status_code, description) VALUES
('PENDING', 'Booking initiated, awaiting payment/confirmation'),
('CONFIRMED', 'Booking confirmed and paid'),
('CANCELLED', 'Booking cancelled by user or system'),
('COMPLETED', 'Stay completed'),
('NO_SHOW', 'Guest did not arrive');

-- Table for bookings
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL, -- The user who made the booking
    room_type_id INTEGER REFERENCES room_types(id) NOT NULL, -- The type of room booked
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    num_guests INTEGER NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    status VARCHAR(20) REFERENCES booking_statuses(status_code) DEFAULT 'PENDING',
    booking_reference VARCHAR(50) UNIQUE NOT NULL, -- Unique reference for the booking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_dates CHECK (check_out_date > check_in_date)
);

-- Table for guest details associated with a booking (optional, if storing more than just the primary booker)
-- This might be simplified depending on requirements.
CREATE TABLE booking_guests (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    -- Add other relevant guest details if needed
    is_primary BOOLEAN DEFAULT FALSE -- Indicates the main guest for the room
);

-- Note: Assumes 'users' and 'room_types' tables exist from auth.sql and hotel.sql.
-- Need to ensure these scripts are run in the correct order or handle dependencies.
