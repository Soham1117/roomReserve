-- Table for hotels
CREATE TABLE hotels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    latitude DECIMAL(9, 6),
    longitude DECIMAL(9, 6),
    star_rating DECIMAL(2, 1) CHECK (star_rating >= 0 AND star_rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for amenities
CREATE TABLE amenities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- Table for hotel amenities (many-to-many relationship)
CREATE TABLE hotel_amenities (
    hotel_id INTEGER REFERENCES hotels(id) ON DELETE CASCADE,
    amenity_id INTEGER REFERENCES amenities(id) ON DELETE CASCADE,
    PRIMARY KEY (hotel_id, amenity_id)
);

-- Table for room types
CREATE TABLE room_types (
    id SERIAL PRIMARY KEY,
    hotel_id INTEGER REFERENCES hotels(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g., Standard Queen, Deluxe King, Suite
    description TEXT,
    capacity INTEGER NOT NULL, -- Max number of guests
    base_price DECIMAL(10, 2) NOT NULL, -- Price per night
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for room inventory/availability (simplified)
-- A more complex system might track individual rooms and their status.
-- This simplified version tracks the number of available rooms of a certain type per day.
CREATE TABLE room_availability (
    id SERIAL PRIMARY KEY,
    room_type_id INTEGER REFERENCES room_types(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    available_count INTEGER NOT NULL CHECK (available_count >= 0),
    price_override DECIMAL(10, 2), -- Optional price for this specific date
    UNIQUE (room_type_id, date) -- Ensure only one entry per room type per day
);

-- Insert some sample amenities
INSERT INTO amenities (name, description) VALUES
('WiFi', 'Wireless internet access'),
('Pool', 'Swimming pool access'),
('Gym', 'Fitness center access'),
('Parking', 'On-site parking'),
('Breakfast Included', 'Complimentary breakfast');
