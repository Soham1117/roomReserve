-- Placeholder for Search Service Schema
-- This service primarily aggregates data from other services (Hotel, Review, Booking).
-- It might store cached/indexed data for performance in the future,
-- but does not require dedicated tables for core functionality at this stage.

-- Example (Future): Pre-aggregated hotel search data
/*
CREATE TABLE search_index_hotels (
    hotel_id INTEGER PRIMARY KEY REFERENCES hotels(id),
    searchable_text TSVECTOR, -- For full-text search
    average_rating DECIMAL(2, 1),
    min_price DECIMAL(10, 2),
    amenity_ids INTEGER[],
    -- other denormalized fields for fast searching
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_search_text ON search_index_hotels USING GIN(searchable_text);
*/

-- No tables needed for initial setup.
