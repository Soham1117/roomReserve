-- Table for reviews
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    hotel_id INTEGER REFERENCES hotels(id) NOT NULL, -- The hotel being reviewed
    user_id INTEGER REFERENCES users(id) NOT NULL, -- The user who wrote the review
    booking_id INTEGER REFERENCES bookings(id) UNIQUE, -- Optional: Link to the specific booking/stay
    rating DECIMAL(2, 1) NOT NULL CHECK (rating >= 0 AND rating <= 5), -- e.g., 4.5
    title VARCHAR(255),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Table for review responses (e.g., from hotel management)
CREATE TABLE review_responses (
    id SERIAL PRIMARY KEY,
    review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
    responder_user_id INTEGER REFERENCES users(id), -- Could be a hotel manager user
    response_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Note: Assumes 'hotels', 'users', and 'bookings' tables exist. Dependency management needed.
