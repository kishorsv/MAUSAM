-- ==============================================================================
-- MAUSAM WEATHER INTELLIGENCE — COMPREHENSIVE POSTGRESQL RELATIONAL SCHEMA
-- ==============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    avatar_url TEXT,
    bio TEXT,
    default_lat DOUBLE PRECISION DEFAULT 12.9716, -- Default Bengaluru
    default_lon DOUBLE PRECISION DEFAULT 77.5946,
    default_city VARCHAR(100) DEFAULT 'Bengaluru',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- 3. User Preferences (Multi-Persona Lifestyle Flags)
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    health_enabled BOOLEAN DEFAULT FALSE,
    fitness_enabled BOOLEAN DEFAULT TRUE,
    travel_enabled BOOLEAN DEFAULT FALSE,
    family_enabled BOOLEAN DEFAULT FALSE,
    agriculture_enabled BOOLEAN DEFAULT FALSE,
    commuter_enabled BOOLEAN DEFAULT FALSE,
    event_enabled BOOLEAN DEFAULT FALSE,
    beach_enabled BOOLEAN DEFAULT FALSE,
    language VARCHAR(10) DEFAULT 'en' CHECK (language IN ('en', 'kn', 'hi')),
    temperature_unit VARCHAR(20) DEFAULT 'celsius' CHECK (temperature_unit IN ('celsius', 'fahrenheit')),
    wind_unit VARCHAR(10) DEFAULT 'kmh' CHECK (wind_unit IN ('kmh', 'mph', 'ms')),
    notification_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);

-- 4. Saved Locations (Hyperlocal microclimates)
CREATE TABLE IF NOT EXISTS saved_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location_type VARCHAR(50) DEFAULT 'custom' CHECK (location_type IN ('home', 'office', 'school', 'gym', 'farm', 'event', 'custom')),
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_saved_locations_user ON saved_locations(user_id);

-- 5. Weather Cache
CREATE TABLE IF NOT EXISTS weather_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    provider VARCHAR(50) NOT NULL,
    weather_payload JSONB NOT NULL,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_weather_cache_coords ON weather_cache(latitude, longitude, provider);
CREATE INDEX IF NOT EXISTS idx_weather_cache_expiry ON weather_cache(expires_at);

-- 6. Weather Alerts
CREATE TABLE IF NOT EXISTS weather_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_key VARCHAR(150) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('minor', 'moderate', 'severe', 'extreme')),
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    instruction TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    effective TIMESTAMP WITH TIME ZONE NOT NULL,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_weather_alerts_time ON weather_alerts(effective, expires);

-- 7. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'moderate',
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- 8. Travel Plans
CREATE TABLE IF NOT EXISTS travel_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    destination_name VARCHAR(150) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    departure_date DATE NOT NULL,
    return_date DATE,
    notes TEXT,
    packing_advice JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_travel_plans_user ON travel_plans(user_id);

-- 9. Events
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    location_name VARCHAR(150) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    is_outdoor BOOLEAN DEFAULT TRUE,
    comfort_score INTEGER,
    weather_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_id, event_date);

-- 10. Activity Preferences
CREATE TABLE IF NOT EXISTS activity_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preferred_activity VARCHAR(50) DEFAULT 'running' CHECK (preferred_activity IN ('running', 'cycling', 'walking', 'sports')),
    ideal_min_temp INTEGER DEFAULT 18,
    ideal_max_temp INTEGER DEFAULT 28,
    max_acceptable_rain_probability INTEGER DEFAULT 30,
    preferred_time_window VARCHAR(50) DEFAULT 'morning',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. AI Recommendations
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    context_weather JSONB NOT NULL,
    query_prompt TEXT NOT NULL,
    recommendation_text TEXT NOT NULL,
    action_items JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Weather Sources & Health Telemetry
CREATE TABLE IF NOT EXISTS weather_sources (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    source_type VARCHAR(50) NOT NULL, -- weather, aqi, radar, satellite, marine
    status VARCHAR(20) DEFAULT 'operational' CHECK (status IN ('operational', 'degraded', 'unavailable')),
    latency_ms INTEGER DEFAULT 0,
    last_checked TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    error_count INTEGER DEFAULT 0
);

-- 13. IoT Sensor Devices (My Weather Station)
CREATE TABLE IF NOT EXISTS sensor_devices (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    device_model VARCHAR(80) NOT NULL, -- ESP32, LoRaWAN Gateway, Modbus Soil Probe
    mac_address VARCHAR(50),
    is_connected BOOLEAN DEFAULT FALSE,
    last_reading_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sensor_devices_user ON sensor_devices(user_id);

-- 14. IoT Sensor Readings
CREATE TABLE IF NOT EXISTS sensor_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(50) NOT NULL REFERENCES sensor_devices(id) ON DELETE CASCADE,
    temperature DOUBLE PRECISION,
    humidity DOUBLE PRECISION,
    rain_gauge DOUBLE PRECISION,
    soil_moisture DOUBLE PRECISION,
    barometric_pressure DOUBLE PRECISION,
    wind_speed DOUBLE PRECISION,
    battery_level INTEGER,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sensor_readings_device ON sensor_readings(device_id, recorded_at);

-- 15. Route Weather Trips
CREATE TABLE IF NOT EXISTS route_trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    start_location VARCHAR(120) NOT NULL,
    end_location VARCHAR(120) NOT NULL,
    waypoints JSONB NOT NULL, -- array of { name, lat, lon }
    travel_mode VARCHAR(30) DEFAULT 'car',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_route_trips_user ON route_trips(user_id);

-- 16. Group Weather Comparisons
CREATE TABLE IF NOT EXISTS group_weather (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    group_type VARCHAR(50) DEFAULT 'road_trip', -- road_trip, college_tour, family_outing
    locations JSONB NOT NULL, -- array of { name, lat, lon }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_group_weather_user ON group_weather(user_id);
